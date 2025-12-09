import React, { useState } from 'react';
import axios from 'axios';

function QuestionAnswer() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [useWikipedia, setUseWikipedia] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      setErrorMessage('Please enter a question.');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    setAnswer('');
    setSources([]);

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/query', {
        question: question,
        use_wikipedia: useWikipedia
      });
      setAnswer(response.data.answer);
      setSources(response.data.sources || []);
    } catch (error) {
      setErrorMessage(error.response?.data?.detail || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '12px' }}>
        <label
          style={{
            display: 'block',
            fontSize: '14px',
            fontWeight: 500,
            marginBottom: '6px'
          }}
        >
          Ask a Question
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="What would you like to know from your notes?"
          style={{
            width: '100%',
            padding: '12px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            fontSize: '14px',
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '70px'
          }}
        />
      </div>

      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center' }}>
        <input
          type="checkbox"
          id="wikipedia"
          checked={useWikipedia}
          onChange={(e) => setUseWikipedia(e.target.checked)}
          style={{ marginRight: '8px' }}
        />
        <label htmlFor="wikipedia" style={{ fontSize: '14px', cursor: 'pointer' }}>
          Include Wikipedia for general knowledge
        </label>
      </div>

      {errorMessage && (
        <div
          style={{
            marginBottom: '12px',
            padding: '10px 12px',
            borderRadius: '6px',
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            color: '#c62828',
            fontSize: '13px'
          }}
        >
          {errorMessage}
        </div>
      )}

      <button
        onClick={handleAskQuestion}
        disabled={loading}
        style={{
          width: '100%',
          backgroundColor: loading ? '#ccc' : '#2196f3',
          color: 'white',
          padding: '12px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: 500,
          cursor: loading ? 'not-allowed' : 'pointer',
          marginBottom: '16px'
        }}
      >
        {loading ? 'Searching...' : 'Get Answer'}
      </button>

      {answer && (
        <div
          style={{
            marginTop: '4px',
            backgroundColor: '#e8f5e9',
            border: '1px solid #4caf50',
            borderRadius: '8px',
            padding: '18px 20px'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '8px'
            }}
          >
            <h3
              style={{
                fontWeight: 600,
                fontSize: '18px',
                margin: 0,
                color: '#1b5e20'
              }}
            >
              Answer
            </h3>
          </div>

          <p
            style={{
              color: '#2e7d32',
              lineHeight: 1.7,
              fontSize: '15px',
              marginTop: '4px',
              marginBottom: '12px',
              whiteSpace: 'pre-wrap'
            }}
          >
            {answer}
          </p>

          {sources.length > 0 && (
            <div style={{ borderTop: '1px solid #c8e6c9', paddingTop: '10px', marginTop: '4px' }}>
              <p
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  margin: 0,
                  marginBottom: '6px',
                  color: '#1b5e20'
                }}
              >
                Sources
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {sources.map((source, idx) => (
                  <span
                    key={idx}
                    style={{
                      display: 'inline-block',
                      padding: '4px 10px',
                      borderRadius: '999px',
                      backgroundColor: '#c8e6c9',
                      color: '#2e7d32',
                      fontSize: '13px'
                    }}
                  >
                    {source}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestionAnswer;
