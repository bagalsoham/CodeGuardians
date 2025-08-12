# CodeGuardians 🛡️
*AI-powered Document Intelligence & Retrieval System*

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)]()
[![Python](https://img.shields.io/badge/python-3.10+-blue)]()
[![React](https://img.shields.io/badge/react-19.0.0-blue)]()

## Overview
CodeGuardians is a full-stack AI-driven document processing and retrieval system.
It allows users to **upload PDF documents**, automatically **parse and index** them using **LangChain** and **FAISS**, and then **query** their contents in natural language via an LLM (**Groq LLaMA 3**).

Built with:
- **Flask** backend for API services
- **LangChain** for document embedding and retrieval
- **FAISS** for vector search
- **React + Bootstrap** frontend for an intuitive user interface

---

## ✨ Features
- 📤 **PDF Upload & Storage** — Upload multiple PDF files to the system.
- 🧠 **AI-Powered Search** — Query documents in plain English and receive context-aware answers.
- ⚡ **Fast Vector Search** — Uses FAISS for low-latency semantic retrieval.
- 🔄 **Conversation Memory** — Maintains history for context-aware responses.
- 🔒 **Environment-based Config** — API keys & secrets stored in `.env`.
- 🌐 **Cross-Origin Support** — Fully CORS-enabled backend for flexible frontend integration.

---

## 🛠 Technology Stack

**Backend**
- Python 3.10+
- Flask, Flask-CORS
- LangChain, LangChain-Groq, LangChain-Community
- FAISS (CPU)
- HuggingFace Hub, Transformers, Sentence-Transformers
- PyPDF for document parsing

**Frontend**
- React 19.0.0
- React Router DOM 7.3.0
- Bootstrap 5.3.3 + React-Bootstrap
- React Icons

---

## 📂 Project Structure
```plaintext
CodeGuardians-master/
│
├── backend/                  # Flask + LangChain backend
│   ├── app.py                 # Main Flask API server
│   ├── requirements.txt       # Python dependencies
│   ├── .env                   # Environment variables (GROQ API key, etc.)
│   ├── SimpleRAG.ipynb        # Notebook for RAG experimentation
│   ├── faiss_index/           # FAISS vector store
│   ├── uploads/               # Uploaded PDF documents
│   └── test.py                # Test script
│
├── frontend/                  # React UI
│   ├── src/                   # React components
│   │   ├── App.js
│   │   ├── auth/SignUp.js
│   │   └── landingPage/Footer.js
│   ├── public/                # Static assets
│   └── package.json           # JS dependencies
│
└── README.md                  # Documentation (this file)
```

---

## ⚙️ Installation

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate   # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file
echo "GROQ_API_KEY=your_api_key_here" > .env

# Run server
python app.py
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

---

## 🚀 Usage

### Uploading a Document
```bash
curl -F "file=@document.pdf" http://localhost:5000/upload
```

### Querying the Document
```bash
curl -X POST http://localhost:5000/query      -H "Content-Type: application/json"      -d '{"question": "What is the main topic of the document?"}'
```

**Example Response:**
```json
{
  "answer": "The document primarily discusses software effort estimation techniques..."
}
```

---

## 🔧 Configuration
Create `.env` in the `backend/` directory:
```env
GROQ_API_KEY=your_groq_api_key
```

**Other configurable items:**
- `UPLOAD_FOLDER` in `app.py` — Default: `uploads`
- FAISS index path: `faiss_index/`

---

## 📡 API Documentation

| Method | Endpoint       | Description                  | Body / Params |
|--------|---------------|------------------------------|---------------|
| POST   | `/upload`     | Upload a PDF                  | Multipart `file` |
| POST   | `/query`      | Query indexed documents       | JSON: `{ "question": "..." }` |
| GET    | `/download/<filename>` | Download uploaded file | — |

---

## 📷 Screenshots / Demo
*Coming soon — include UI screenshots here.*

---

## 🤝 Contributing
1. Fork the repo
2. Create a new branch (`feature/your-feature`)
3. Commit changes
4. Push to your branch
5. Open a Pull Request

---

## 📜 License
This project is licensed under the [MIT License](LICENSE).

---

## 📬 Contact
**Author:** *Your Name*  
Email: *your.email@example.com*  
GitHub: [your-username](https://github.com/your-username)
