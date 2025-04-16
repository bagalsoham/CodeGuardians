from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
from langchain_groq import ChatGroq
from langchain_community.document_loaders.pdf import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.prompts import MessagesPlaceholder, ChatPromptTemplate
from langchain_core.messages import AIMessage, HumanMessage
from dotenv import load_dotenv
from datetime import datetime
from langchain_community.embeddings import OllamaEmbeddings

load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

llm = ChatGroq(
    api_key=os.getenv("GROQ_API_KEY"),
    model="llama3-70b-8192",
    temperature=0,
)

embeddings = OllamaEmbeddings(
    model="nomic-embed-text",
    base_url="http://localhost:11434"
)

system_prompt = """
Answer the questions based ONLY on the provided context below.
If the information is not available in the context, state that you cannot find the answer.

<context>
{context}
</context>

Question: {input}
"""

contextualize_q_system_prompt = (
    "Given a chat history and the latest user question, "
    "formulate a standalone question which can be understood without the chat history. "
    "Do NOT answer the question, just reformulate it if needed."
)

qa_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)

contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("chat_history"),
        ("human", "{input}"),
    ]
)

evaluation_prompt = """
Evaluate the quality of this Indian government manifesto based on the Commitment for Results (CFR) framework.
Focus on these 8 key areas and provide a score for each (from 60-100):

1. Vision (Section 1A - 5%): Is it clear, forward-looking, inspiring? Does it focus on "what" not "how"?
2. Mission (Section 1B - 5%): Is it aligned with vision, focused on "how", and clearly articulated?
3. Objectives (Section 1C - 5%): Are they aligned with mission, results-driven, appropriate in number (ideally 8-10), and non-duplicative?
4. Inter se priorities (Section 2 - 40%): Do actions capture objectives, success indicators capture actions, are indicators outcome-oriented, is weight distribution appropriate, and are targets high quality?
5. Trend values (Section 3 - 15%): Is data provided for previous years and projections?
6. Description of Success Indicators (Section 4 - 5%): Are all acronyms explained, are necessary explanations given, and is the quality of explanations good?
7. Performance requirements from other departments (Section 5 - 5%): Are dependencies appropriately claimed and requirements specific?
8. Outcome/Impact of activities (Section 6 - 20%): What percentage of objectives are covered, are outcome statements results-driven, and are success indicators results-driven?

For each area, provide:
1. A score between 60-100
2. A 1-2 sentence justification for the score

Format your response as JSON with this structure:
{
  "sections": {
    "vision": {"score": X, "justification": "..."},
    "mission": {"score": X, "justification": "..."},
    "objectives": {"score": X, "justification": "..."},
    "inter_se_priorities": {"score": X, "justification": "..."},
    "trend_values": {"score": X, "justification": "..."},
    "success_indicators_description": {"score": X, "justification": "..."},
    "other_department_requirements": {"score": X, "justification": "..."},
    "outcome_impact": {"score": X, "justification": "..."}
  }
}
"""

vectorstore = None
retriever = None
rag_chain = None
chat_history = []
index_path = "./faiss_index"
current_document_info = {
    "filename": None,
    "document_type": None
}
uploaded_files = []

# CFR Evaluation Constants
SECTION_WEIGHTS = {
    'vision': 0.05,  # 5%
    'mission': 0.05,  # 5%
    'objectives': 0.05,  # 5%
    'inter_se_priorities': 0.40,  # 40%
    'trend_values': 0.15,  # 15%
    'success_indicators_description': 0.05,  # 5%
    'other_department_requirements': 0.05,  # 5%
    'outcome_impact': 0.20   # 20%
}

RATING_THRESHOLDS = {
    'excellent': 100,
    'very_good': 90,
    'good': 80,
    'fair': 70,
    'poor': 60
}

def validate_score(score):
    """Validate that score is between 60 and 100"""
    return max(60, min(100, score))

def calculate_section_score(section_data):
    """Calculate weighted score for a section (F2-F14)"""
    if not section_data or 'score' not in section_data:
        return 60  # Minimum score if data is missing
    
    return validate_score(section_data['score'])

def calculate_overall_score(section_scores):
    """Calculate overall quality rating (F1)"""
    weighted_sum = 0
    for section, weight in SECTION_WEIGHTS.items():
        if section in section_scores:
            section_score = calculate_section_score(section_scores[section])
            weighted_sum += section_score * weight
    
    return round(weighted_sum)

def validate_objectives_count(count):
    """Validate number of objectives against CFR criteria"""
    if 8 <= count <= 10:
        return 100  # Excellent
    elif 7 <= count <= 11:
        return 90   # Very Good
    elif 5 <= count <= 13:
        return 80   # Good
    elif 4 <= count <= 14:
        return 70   # Fair
    else:
        return 60   # Poor

def validate_outcome_orientation(measurement_type):
    """Validate outcome orientation of success indicators"""
    outcome_ratings = {
        'outcome': 100,      # Excellent
        'external_output': 90,  # Very Good
        'internal_output': 80,  # Good
        'process': 70,       # Fair
        'input': 60         # Poor
    }
    return outcome_ratings.get(measurement_type.lower(), 60)

def validate_trend_values(data_points):
    """Validate trend values data population"""
    if not data_points:
        return 60
    
    populated_points = sum(1 for point in data_points if point is not None)
    total_points = len(data_points)
    
    if total_points == 0:
        return 60
        
    percentage_populated = (populated_points / total_points) * 100
    return validate_score(percentage_populated)

def get_rating_label(score):
    """Get rating label based on score"""
    if score >= RATING_THRESHOLDS['excellent']:
        return "Excellent"
    elif score >= RATING_THRESHOLDS['very_good']:
        return "Very Good"
    elif score >= RATING_THRESHOLDS['good']:
        return "Good"
    elif score >= RATING_THRESHOLDS['fair']:
        return "Fair"
    else:
        return "Poor"

def analyze_enhancement_suggestions(suggestions):
    """
    Analyze the enhancement suggestions and calculate their impact on the rating.
    More detailed suggestions will lower the rating.
    
    Args:
        suggestions (list): List of enhancement suggestions 
        
    Returns:
        float: A factor between 0.8 and 1.0 to adjust scores (lower with more suggestions)
    """
    if not suggestions:
        return 1.0  # No suggestions means no negative impact
    
    # Count suggestions (counting non-empty lines)
    suggestion_count = len([s for s in suggestions if s.strip()])
    
    # Analyze detail level of suggestions based on word count
    total_words = sum(len(s.split()) for s in suggestions if isinstance(s, str))
    avg_words_per_suggestion = total_words / max(1, suggestion_count)
    
    # Calculate detail factor (0.8 to 1.0)
    detail_factor = 1.0 - min(0.2, (avg_words_per_suggestion / 100))
    
    # Calculate quantity factor (0.8 to 1.0)
    quantity_factor = 1.0 - min(0.2, (suggestion_count / 10))
    
    # Combine factors (more weight to quantity)
    combined_factor = (detail_factor * 0.4) + (quantity_factor * 0.6)
    
    # Ensure factor is between 0.8 and 1.0
    return max(0.8, min(1.0, combined_factor))

def adjust_scores_by_suggestions(section_scores, suggestion_factor):
    """
    Adjust section scores based on the enhancement suggestions factor.
    
    Args:
        section_scores (dict): Dictionary of section scores
        suggestion_factor (float): Factor from analyze_enhancement_suggestions
        
    Returns:
        dict: Adjusted section scores
    """
    adjusted_scores = {}
    
    for section, data in section_scores.items():
        if not data or 'score' not in data:
            adjusted_scores[section] = data
            continue
            
        # Apply suggestion factor to score
        adjusted_score = max(60, min(100, data['score'] * suggestion_factor))
        
        adjusted_scores[section] = {
            'score': round(adjusted_score),
            'rating': get_rating_label(adjusted_score),
            'justification': data.get('justification', 'No justification provided')
        }
    
    return adjusted_scores

@app.route('/upload', methods=['POST'])
def upload_file():
    global vectorstore, retriever, rag_chain, current_document_info, uploaded_files

    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(file_path)

    try:
        loader = PyPDFLoader(file_path=file_path)
        data = loader.load()

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=250,
            separators=["\n\n", "\n", " ", ""],
            length_function=len
        )
        splits = text_splitter.split_documents(data)
        batch_size = 100
        all_splits = []

        if os.path.exists(index_path) and os.path.isdir(index_path) and len(os.listdir(index_path)) > 0:
            try:
                # Loading local FAISS index
                vectorstore = FAISS.load_local(
                    index_path,
                    embeddings
                )
            except Exception as e:
                print(f"Error loading FAISS index: {str(e)}")
                # If loading fails, create a new vectorstore
                vectorstore = FAISS.from_documents(documents=splits[:min(batch_size, len(splits))], embedding=embeddings)
                all_splits.extend(splits[:min(batch_size, len(splits))])
        else:
            os.makedirs(index_path, exist_ok=True)
            first_batch = splits[:min(batch_size, len(splits))]
            vectorstore = FAISS.from_documents(documents=first_batch, embedding=embeddings)
            all_splits.extend(first_batch)
            for i in range(batch_size, len(splits), batch_size):
                batch = splits[i:i + batch_size]
                vectorstore.add_documents(documents=batch)
                all_splits.extend(batch)

        try:
            # Saving FAISS index
            vectorstore.save_local(index_path)
        except Exception as e:
            print(f"Error saving FAISS index: {str(e)}")
            return jsonify({'error': 'Failed to save document index'}), 500

        retriever = vectorstore.as_retriever(
            search_kwargs={
                "k": 6,
                "fetch_k": 10,
                "score_threshold": 0.5
            },
            search_type="mmr"
        )

        history_aware_retriever = create_history_aware_retriever(llm, retriever, contextualize_q_prompt)
        question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)
        rag_chain = create_retrieval_chain(history_aware_retriever, question_answer_chain)
        chat_history.clear()

        file_stat = os.stat(file_path)
        file_info = {
            '_id': str(hash(file.filename + str(file_stat.st_mtime))),
            'filename': file.filename,
            'filePath': f'/uploads/{file.filename}',
            'uploadDate': datetime.fromtimestamp(file_stat.st_mtime).isoformat(),
            'size': file_stat.st_size
        }

        if not any(f['filename'] == file.filename for f in uploaded_files):
            uploaded_files.append(file_info)

        current_document_info = {
            "filename": file.filename,
            "document_type": None
        }

        return jsonify({
            'message': 'File processed successfully',
            'filename': file.filename,
            'chunks': len(all_splits)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/query', methods=['POST'])
def query():
    global chat_history, rag_chain

    if not rag_chain:
        return jsonify({'error': 'Please upload a document first.'}), 400

    data = request.json
    if not data or 'question' not in data:
        return jsonify({'error': 'No question provided'}), 400

    question = data['question']

    try:
        ai_response = rag_chain.invoke({
            "input": question,
            "chat_history": chat_history
        })

        chat_history.extend([
            HumanMessage(content=question),
            AIMessage(content=ai_response["answer"])
        ])

        return jsonify({
            'question': question,
            'answer': ai_response["answer"]
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/clear', methods=['POST'])
def clear_history():
    global chat_history
    chat_history = []
    return jsonify({'message': 'Chat history cleared successfully'})


@app.route('/reset', methods=['POST'])
def reset_db():
    global vectorstore, retriever, rag_chain, chat_history, current_document_info, uploaded_files

    try:
        if os.path.exists(index_path):
            for file in os.listdir(index_path):
                file_path = os.path.join(index_path, file)
                if os.path.isfile(file_path):
                    os.unlink(file_path)

        vectorstore = None
        retriever = None
        rag_chain = None
        chat_history = []
        current_document_info = {
            "filename": None,
            "document_type": None
        }
        uploaded_files = []

        return jsonify({'message': 'Database reset successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/detect_type', methods=['POST'])
def detect_document_type():
    global chat_history, rag_chain, current_document_info

    if not rag_chain:
        return jsonify({'error': 'Please upload a document first.'}), 400

    try:
        old_chat_history = chat_history.copy()
        chat_history = []

        detection_question = "What type of document is this? Is it a resume, CV, research paper, report, brochure, technical manual, or something else?"
        ai_response = rag_chain.invoke({
            "input": detection_question,
            "chat_history": []
        })

        document_type = ai_response["answer"].strip()
        current_document_info["document_type"] = document_type
        chat_history = old_chat_history

        return jsonify({'document_type': document_type})

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/analyze_document', methods=['POST'])
def analyze_document():
    global rag_chain, current_document_info
    
    if not rag_chain:
        return jsonify({'error': 'Please upload a document first.'}), 400

    try:
        # Get document heading
        heading_question = """Analyze this Indian government manifesto and identify the most relevant ministry or department.
        Format the heading as: "Ministry of <Department Name> Department".
        Choose the department based on dominant themes and context in the content.
        Be precise and specific in identifying the ministry."""
        heading_response = rag_chain.invoke({
            "input": heading_question,
            "chat_history": []
        })
        heading = heading_response["answer"].strip()

        # Get document summary
        summary_question = """Provide a concise summary (4-6 sentences) of this Indian government manifesto that captures:
        1. Main themes and goals
        2. Key policy initiatives
        3. Significant commitments or plans
        4. Overall vision for the department
        Use formal, factual language suitable for government documentation.
        Focus on clarity and ease of understanding."""
        summary_response = rag_chain.invoke({
            "input": summary_question,
            "chat_history": []
        })
        summary = summary_response["answer"].strip().split('\   n')

        # Get enhancement suggestions FIRST - important for calculating the adjustment factor
        suggestions_question = """Based on the manifesto content, provide 3-5 constructive suggestions focusing on:
        1. Policy gaps or areas needing clarification
        2. Potential improvements in governance approach
        3. Areas where public welfare could be enhanced
        4. Implementation considerations specific to Indian context
        Ensure suggestions are:
        - Actionable and practical
        - Grounded in Indian governance context
        - Focused on public welfare
        - Based on policy analysis"""
        suggestions_response = rag_chain.invoke({
            "input": suggestions_question,
            "chat_history": []
        })
        suggestions = suggestions_response["answer"].strip().split('\n')
        
        # Calculate the suggestion impact factor
        suggestion_factor = analyze_enhancement_suggestions(suggestions)

        # Evaluate document based on CFR criteria
        evaluation_response = rag_chain.invoke({
            "input": evaluation_prompt,
            "chat_history": []
        })
        
        try:
            # Parse evaluation response
            import json
            from json import JSONDecodeError
            
            answer_text = evaluation_response["answer"].strip()
            try:
                evaluation_data = json.loads(answer_text)
            except JSONDecodeError:
                import re
                json_match = re.search(r'({[\s\S]*})', answer_text)
                if json_match:
                    evaluation_data = json.loads(json_match.group(1))
                else:
                    evaluation_data = {"sections": {
                        section: {"score": 70, "justification": "Default evaluation"}
                        for section in SECTION_WEIGHTS.keys()
                    }}
            
            # Process section scores (before adjustment)
            base_sections = {}
            for section, data in evaluation_data.get("sections", {}).items():
                score = validate_score(data.get("score", 70))
                base_sections[section] = {
                    "score": score,
                    "justification": data.get("justification", "No justification provided")
                }
            
            # Apply suggestion factor to adjust scores
            adjusted_sections = adjust_scores_by_suggestions(base_sections, suggestion_factor)
            
            # Calculate overall score based on adjusted sections
            overall_score = calculate_overall_score(adjusted_sections)
            
            # Prepare evaluation details with both original and adjusted scores
            evaluation_details = {
                "overall_score": overall_score,
                "overall_rating": get_rating_label(overall_score),
                "suggestion_impact_factor": round(suggestion_factor, 2),
                "section_scores": adjusted_sections,
                "original_scores": {
                    section: data["score"] for section, data in base_sections.items()
                }
            }
            
        except Exception as e:
            print(f"Error processing evaluation: {str(e)}")
            evaluation_details = {
                "overall_score": 70,
                "overall_rating": "Fair",
                "suggestion_impact_factor": 1.0,
                "section_scores": {
                    section: {
                        "score": 70,
                        "rating": "Fair",
                        "justification": "Automatic evaluation"
                    }
                    for section in SECTION_WEIGHTS.keys()
                }
            }

        return jsonify({
            'heading': heading,
            'summary': summary,
            'enhancement_suggestions': suggestions,
            'evaluation': evaluation_details
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/uploads/<filename>')
def serve_uploaded_file(filename):
    try:
        # Ensure the filename is safe and exists
        if not os.path.exists(os.path.join(UPLOAD_FOLDER, filename)):
            return jsonify({'error': 'File not found'}), 404
        
        # Set the correct MIME type for PDF
        response = send_from_directory(UPLOAD_FOLDER, filename)
        response.headers['Content-Type'] = 'application/pdf'
        return response
    except Exception as e:
        print(f"Error serving file {filename}: {str(e)}")
        return jsonify({'error': 'Failed to serve file'}), 500


if __name__ == '__main__':
    app.run(debug=True)