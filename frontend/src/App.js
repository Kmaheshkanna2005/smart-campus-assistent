import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Login from './components/Login';
import Register from './components/Register';
import FileUpload from './components/FileUpload';
import QuestionAnswer from './components/QuestionAnswer';
import DocumentList from './components/DocumentList';
import Summarize from './components/Summarize';
import Quiz from './components/Quiz';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [activeTab, setActiveTab] = useState('upload');
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in on page load
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('session_token');
      const savedUsername = localStorage.getItem('username');

      if (token && savedUsername) {
        try {
          // Verify session is still valid
          await axios.get('http://127.0.0.1:8000/api/me', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setUsername(savedUsername);
          setIsAuthenticated(true);
        } catch (error) {
          // Session expired or invalid
          localStorage.removeItem('session_token');
          localStorage.removeItem('username');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const fetchDocuments = async () => {
    const token = localStorage.getItem('session_token');
    try {
      const response = await fetch('http://127.0.0.1:8000/api/documents', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setDocuments(data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments();
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = (user) => {
    setUsername(user);
    setIsAuthenticated(true);
  };

  const handleRegisterSuccess = () => {
    setShowRegister(false);
    alert('Registration successful! Please login.');
  };

  const handleLogout = async () => {
    const token = localStorage.getItem('session_token');
    
    try {
      await axios.post('http://127.0.0.1:8000/api/logout', {}, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    }

    localStorage.removeItem('session_token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
    setUsername('');
    setDocuments([]);
  };

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            fontSize: '48px', 
            marginBottom: '16px',
            animation: 'spin 1s linear infinite'
          }}>
            🎓
          </div>
          <p style={{ color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }

  // Show login/register if not authenticated
  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register
          onRegisterSuccess={handleRegisterSuccess}
          onSwitchToLogin={() => setShowRegister(false)}
        />
      );
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onSwitchToRegister={() => setShowRegister(true)}
      />
    );
  }

  // Show main app if authenticated
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Header with Logout */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#2196f3', margin: 0 }}>
              🎓 Smart Campus Assistant
            </h1>
            <p style={{ color: '#666', marginTop: '8px', margin: 0 }}>
              Welcome back, <strong>{username}</strong>! Upload your course materials and get instant answers.
            </p>
          </div>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
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
