import React, { useState } from 'react';
import axios from 'axios';

function DocumentList({ documents, onRefresh }) {
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');

  const handleDeleteClick = (docId, filename) => {
    setDeleteConfirm({ docId, filename });
    setDeleteMessage('');
  };

  const confirmDelete = async () => {
    const { docId } = deleteConfirm;

    try {
      await axios.delete(`http://127.0.0.1:8000/api/documents/${docId}`);
      setDeleteMessage('✓ Document deleted successfully');
      setTimeout(() => {
        setDeleteConfirm(null);
        setDeleteMessage('');
        onRefresh();
      }, 1500);
    } catch (error) {
      setDeleteMessage('✗ Error: ' + (error.response?.data?.detail || error.message));
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm(null);
    setDeleteMessage('');
  };

  if (!documents || documents.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
        <p style={{ fontSize: '18px' }}>No documents uploaded yet.</p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>
          Go to the Upload tab to add your course materials.
        </p>
      </div>
    );
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
        <button
          onClick={onRefresh}
          style={{
            padding: '8px 16px',
            backgroundColor: '#2196f3',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      <div style={{ display: 'grid', gap: '12px' }}>
        {documents.map((doc) => (
          <div
            key={doc.id}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: '#fafafa',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '16px', marginBottom: '8px' }}>
                📄 {doc.filename}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <span style={{ marginRight: '16px' }}>
                  Type: {doc.file_type.toUpperCase()}
                </span>
                <span style={{ marginRight: '16px' }}>
                  Size: {formatFileSize(doc.file_size)}
                </span>
                <span>
                  Uploaded: {formatDate(doc.upload_date)}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDeleteClick(doc.id, doc.filename)}
              style={{
                backgroundColor: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Delete document"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Custom Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', fontWeight: '600', color: '#333' }}>
              Delete Document
            </h3>
            <p style={{ margin: '0 0 20px 0', color: '#666', fontSize: '14px' }}>
              Are you sure you want to delete <strong>"{deleteConfirm.filename}"</strong>?
              <br />
              This action cannot be undone.
            </p>

            {deleteMessage && (
              <div style={{
                marginBottom: '16px',
                padding: '10px',
                borderRadius: '6px',
                backgroundColor: deleteMessage.startsWith('✓') ? '#c8e6c9' : '#ffcdd2',
                color: deleteMessage.startsWith('✓') ? '#2e7d32' : '#c62828',
                fontSize: '14px',
                fontWeight: '500',
                textAlign: 'center'
              }}>
                {deleteMessage}
              </div>
            )}

            {!deleteMessage && (
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={cancelDelete}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#e0e0e0',
                    color: '#333',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentList;
