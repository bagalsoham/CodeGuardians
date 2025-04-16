import requests
import os
import time
import json
import argparse

# URL of your Flask application
BASE_URL = "http://localhost:5000"

def upload_pdf(pdf_path):
    """Upload a PDF file to the RAG application"""
    print(f"\n=== Uploading PDF: {pdf_path} ===")
    
    if not os.path.exists(pdf_path):
        print(f"Error: PDF file '{pdf_path}' not found.")
        return False
    
    # Create a file dictionary for the request
    files = {'file': (os.path.basename(pdf_path), open(pdf_path, 'rb'), 'application/pdf')}
    
    # Make the request
    response = requests.post(f"{BASE_URL}/upload", files=files)
    
    # Check if upload was successful
    if response.status_code == 200:
        result = response.json()
        print(f"Upload successful! Filename: {result.get('filename')}, Chunks created: {result.get('chunks')}")
        return result.get('filename')
    else:
        print(f"Upload failed with status code {response.status_code}: {response.text}")
        return None

def analyze_document():
    """Get complete document analysis using the analyze_document endpoint"""
    print("\n=== Analyzing Document ===")
    
    # Make the request to the analyze_document endpoint
    response = requests.post(f"{BASE_URL}/analyze_document")
    
    # Check if analysis was successful
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Analysis failed with status code {response.status_code}: {response.text}")
        return {
            "heading": "Analysis Failed",
            "summary": ["Could not analyze document"],
            "enhancement_suggestions": ["Try uploading the document again"]
        }

def get_document_list():
    """Get the list of uploaded documents"""
    response = requests.get(f"{BASE_URL}/files")
    if response.status_code == 200:
        return response.json()
    else:
        print(f"Failed to get document list: {response.status_code}")
        return []

def reset_system():
    """Reset the database"""
    response = requests.post(f"{BASE_URL}/reset")
    return response.status_code == 200

def main():
    parser = argparse.ArgumentParser(description="PDF Analysis Tool")
    parser.add_argument("--file", "-f", help="Path to the PDF file to analyze")
    parser.add_argument("--analyze", "-a", action="store_true", help="Analyze the most recently uploaded document")
    parser.add_argument("--list", "-l", action="store_true", help="List all uploaded documents")
    parser.add_argument("--reset", "-r", action="store_true", help="Reset the system")
    args = parser.parse_args()
    
    # List documents if requested
    if args.list:
        docs = get_document_list()
        if docs:
            print("\n=== Uploaded Documents ===")
            for i, doc in enumerate(docs):
                print(f"{i+1}. {doc['filename']} (Uploaded: {doc['uploadDate']})")
        else:
            print("No documents found.")
        return
    
    # Reset if requested
    if args.reset:
        if reset_system():
            print("System reset successfully.")
        else:
            print("Failed to reset the system.")
        return
    
    # Upload file if provided
    file_uploaded = None
    if args.file:
        file_uploaded = upload_pdf(args.file)
        if not file_uploaded:
            print("Failed to upload or process the document. Exiting.")
            return
        
        # Allow some time for processing
        print("Processing document...")
        time.sleep(2)
    
    # Analyze document if requested or if a file was just uploaded
    if args.analyze or file_uploaded:
        # Get document analysis
        result = analyze_document()
        
        # Display the results
        print("\n=== Document Analysis Results ===")
        print(f"Document Type: {result.get('document_type', 'Unknown')}")
        print(f"Heading: {result.get('heading', 'Unknown')}")
        print("\nSummary:")
        for point in result.get('summary', []):
            print(f"• {point}")
        
        print("\nEnhancement Suggestions:")
        for suggestion in result.get('enhancement_suggestions', []):
            print(f"• {suggestion}")
        
        # Output the result as JSON
        print("\n=== Structured Output ===")
        print(json.dumps(result, indent=2))
        
        # Save the result to a file
        if file_uploaded:
            output_file = f"{os.path.splitext(os.path.basename(file_uploaded))[0]}_analysis.json"
        else:
            output_file = "document_analysis.json"
            
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)
        
        print(f"\nResults saved to {output_file}")
    
    # If no arguments provided, run in interactive mode
    if not any([args.file, args.analyze, args.list, args.reset]):
        # Path to the PDF file
        pdf_path = input("Enter the path to the PDF file: ").strip()
        if not pdf_path:
            pdf_path = "IA2-OOSE.pdf"  # Default test file
            print(f"Using default file: {pdf_path}")
        
        # Upload the PDF
        filename = upload_pdf(pdf_path)
        if