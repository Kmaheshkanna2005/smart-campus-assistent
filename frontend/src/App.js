import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import QuestionAnswer from './components/QuestionAnswer';
import DocumentList from './components/DocumentList';
import Summarize from './components/Summarize';
import Quiz from './components/Quiz';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [documents, setDocuments] = useState([]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/documents');
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Header */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '24px'
        }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3', margin: 0 }}>
            🎓 Smart Campus Assistant
          </h1>
          <p style={{ color: '#666', marginTop: '8px', margin: 0 }}>
            Upload your course materials and get instant answers, summaries, and quizzes
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', borderBottom: '1px solid #e0e0e0', overflowX: 'auto' }}>
            <button
              onClick={() => setActiveTab('upload')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                color: activeTab === 'upload' ? '#2196f3' : '#666',
                borderBottom: activeTab === 'upload' ? '2px solid #2196f3' : 'none',
                minWidth: '120px'
              }}
            >
              📤 Upload
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                color: activeTab === 'documents' ? '#2196f3' : '#666',
                borderBottom: activeTab === 'documents' ? '2px solid #2196f3' : 'none',
                minWidth: '120px'
              }}
            >
              📚 Documents
            </button>
            <button
              onClick={() => setActiveTab('qa')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                color: activeTab === 'qa' ? '#2196f3' : '#666',
                borderBottom: activeTab === 'qa' ? '2px solid #2196f3' : 'none',
                minWidth: '120px'
              }}
            >
              💬 Q&A
            </button>
            <button
              onClick={() => setActiveTab('summarize')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                color: activeTab === 'summarize' ? '#2196f3' : '#666',
                borderBottom: activeTab === 'summarize' ? '2px solid #2196f3' : 'none',
                minWidth: '120px'
              }}
            >
              📝 Summarize
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              style={{
                flex: 1,
                padding: '16px',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                color: activeTab === 'quiz' ? '#2196f3' : '#666',
                borderBottom: activeTab === 'quiz' ? '2px solid #2196f3' : 'none',
                minWidth: '120px'
              }}
            >
              🎯 Quiz
            </button>
          </div>

          <div style={{ padding: '24px' }}>
            {activeTab === 'upload' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                  Upload Course Materials
                </h2>
                <FileUpload onUploadSuccess={() => { fetchDocuments(); setActiveTab('documents'); }} />
              </div>
            )}

            {activeTab === 'documents' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                  Your Documents
                </h2>
                <DocumentList documents={documents} onRefresh={fetchDocuments} />
              </div>
            )}

            {activeTab === 'qa' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                  Ask Questions
                </h2>
                <QuestionAnswer />
              </div>
            )}

            {activeTab === 'summarize' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                  Summarize Documents
                </h2>
                <Summarize documents={documents} />
              </div>
            )}

            {activeTab === 'quiz' && (
              <div>
                <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px' }}>
                  Generate Practice Quiz
                </h2>
                <Quiz documents={documents} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: '32px', color: '#666' }}>
          <p>Powered by Groq AI, ChromaDB & Wikipedia</p>
        </div>
      </div>
    </div>
  );
}

export default App;
