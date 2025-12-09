import React, { useState } from 'react';
import axios from 'axios';

function Summarize({ documents }) {
  const [selectedDocId, setSelectedDocId] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!selectedDocId) {
      alert('Please select a document');
      return;
    }

    setLoading(true);
    setSummary('');
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/summarize', {
        document_id: parseInt(selectedDocId)
      });
      setSummary(response.data.summary);
    } catch (error) {
      alert('Error: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  if (!documents || documents.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p>No documents available. Please upload documents first.</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
          Select Document to Summarize
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

      <button
        onClick={handleSummarize}
        disabled={loading || !selectedDocId}
        style={{
          width: '100%',
          backgroundColor: loading || !selectedDocId ? '#ccc' : '#2196f3',
          color: 'white',
          padding: '12px',
          border: 'none',
          borderRadius: '8px',
          fontSize: '16px',
          fontWeight: '500',
          cursor: loading || !selectedDocId ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Generating Summary...' : '📝 Generate Summary'}
      </button>

      {summary && (
        <div style={{
          marginTop: '20px',
          backgroundColor: '#fff3e0',
          border: '1px solid #ff9800',
          borderRadius: '8px',
          padding: '16px'
        }}>
          <h3 style={{ fontWeight: '600', marginBottom: '10px', color: '#e65100' }}>
            Summary:
          </h3>
          <p style={{ color: '#333', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}

export default Summarize;
