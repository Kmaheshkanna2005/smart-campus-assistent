import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config';

function Quiz({ documents }) {
  const [selectedDocId, setSelectedDocId] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [quiz, setQuiz] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submittedAnswers, setSubmittedAnswers] = useState({});

  const handleGenerateQuiz = async () => {
    if (!selectedDocId) {
      alert('Please select a document');
      return;
    }

    setLoading(true);
    setQuiz('');
    setSelectedAnswers({});
    setSubmittedAnswers({});
    
    const token = localStorage.getItem('session_token');
    
    try {
      const response = await axios.post(`${API_BASE_URL}/api/generate-quiz`, {
        document_id: parseInt(selectedDocId),
        num_questions: numQuestions
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setQuiz(response.data.quiz);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionIndex, option) => {
    if (submittedAnswers[questionIndex]) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [questionIndex]: option
    }));
  };

  const handleCheckAnswer = (questionIndex) => {
    if (!selectedAnswers[questionIndex]) {
      alert('Please select an answer first');
      return;
    }

    setSubmittedAnswers(prev => ({
      ...prev,
      [questionIndex]: true
    }));
  };

  const parseQuiz = (quizText) => {
    const questions = [];
    const lines = quizText.split('\n');
    let currentQuestion = null;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line.match(/^Question \d+:/)) {
        if (currentQuestion) {
          questions.push(currentQuestion);
        }
        currentQuestion = {
          question: line,
          options: [],
          answer: ''
        };
      } else if (currentQuestion && line.match(/^[A-D]\)/)) {
        currentQuestion.options.push(line);
      } else if (currentQuestion && line.includes('Correct Answer:')) {
        const match = line.match(/Correct Answer:\s*([A-D])/);
        currentQuestion.answer = match ? match[1] : '';
      }
    }
    
    if (currentQuestion) {
      questions.push(currentQuestion);
    }

    return questions;
  };

  const getOptionLetter = (option) => {
    const match = option.match(/^([A-D])\)/);
    return match ? match[1] : '';
  };

  if (!documents || documents.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>No documents available. Please upload documents first.</p>
      </div>
    );
  }

  const parsedQuestions = quiz ? parseQuiz(quiz) : [];

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          Select Document for Quiz
        </label>
        <select
          value={selectedDocId}
          onChange={(e) => setSelectedDocId(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
        >
          <option value="">-- Select a document --</option>
          {documents.map((doc) => (
            <option key={doc.id} value={doc.id}>
              {doc.filename}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          Number of Questions
        </label>
        <select
          value={numQuestions}
          onChange={(e) => setNumQuestions(parseInt(e.target.value))}
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
        >
          <option value={3}>3 Questions</option>
          <option value={5}>5 Questions</option>
          <option value={10}>10 Questions</option>
        </select>
      </div>

      <button
        onClick={handleGenerateQuiz}
        disabled={loading || !selectedDocId}
        style={{
          width: '100%',
          backgroundColor: loading || !selectedDocId ? '#ccc' : '#4caf50',
          color: 'white',
          padding: '12px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: loading || !selectedDocId ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Generating Quiz...' : '🎯 Generate Quiz'}
      </button>

      {parsedQuestions.length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3 style={{ fontWeight: '600', marginBottom: '16px', color: '#6a1b9a' }}>
            Practice Quiz:
          </h3>
          {parsedQuestions.map((q, qIndex) => {
            const isSubmitted = submittedAnswers[qIndex];
            const selectedOption = selectedAnswers[qIndex];
            const selectedLetter = selectedOption ? getOptionLetter(selectedOption) : '';
            const correctLetter = q.answer;
            const isCorrect = isSubmitted && selectedLetter === correctLetter;
            const isWrong = isSubmitted && selectedLetter !== correctLetter;

            return (
              <div
                key={qIndex}
                style={{
                  backgroundColor: '#f3e5f5',
                  border: '1px solid #9c27b0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}
              >
                <div style={{ fontWeight: '600', fontSize: '15px', marginBottom: '12px', color: '#4a148c' }}>
                  {q.question}
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  {q.options.map((option, oIndex) => {
                    const optionLetter = getOptionLetter(option);
                    const isSelected = selectedOption === option;
                    const isCorrectOption = optionLetter === correctLetter;
                    
                    let backgroundColor = '#fff';
                    let borderColor = '#ddd';
                    let textColor = '#333';
                    
                    if (isSubmitted) {
                      if (isCorrectOption) {
                        backgroundColor = '#c8e6c9';
                        borderColor = '#4caf50';
                        textColor = '#2e7d32';
                      } else if (isSelected && isWrong) {
                        backgroundColor = '#ffcdd2';
                        borderColor = '#f44336';
                        textColor = '#c62828';
                      }
                    } else if (isSelected) {
                      backgroundColor = '#e3f2fd';
                      borderColor = '#2196f3';
                    }

                    return (
                      <div
                        key={oIndex}
                        onClick={() => handleSelectAnswer(qIndex, option)}
                        style={{
                          padding: '12px',
                          marginBottom: '8px',
                          backgroundColor: backgroundColor,
                          border: `2px solid ${borderColor}`,
                          borderRadius: '6px',
                          cursor: isSubmitted ? 'default' : 'pointer',
                          fontSize: '14px',
                          color: textColor,
                          fontWeight: (isSubmitted && isCorrectOption) ? '600' : 'normal',
                          transition: 'all 0.2s'
                        }}
                      >
                        {option}
                        {isSubmitted && isCorrectOption && ' ✓'}
                        {isSubmitted && isSelected && isWrong && ' ✗'}
                      </div>
                    );
                  })}
                </div>

                {!isSubmitted && (
                  <button
                    onClick={() => handleCheckAnswer(qIndex)}
                    style={{
                      backgroundColor: '#2196f3',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: '500',
                      cursor: 'pointer'
                    }}
                  >
                    Check Answer
                  </button>
                )}

                {isSubmitted && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    backgroundColor: isCorrect ? '#c8e6c9' : '#ffcdd2',
                    borderRadius: '6px',
                    border: `2px solid ${isCorrect ? '#4caf50' : '#f44336'}`,
                    fontWeight: '600',
                    color: isCorrect ? '#2e7d32' : '#c62828'
                  }}>
                    {isCorrect ? '✓ Correct!' : `✗ Wrong! Correct answer is ${correctLetter}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Quiz;
