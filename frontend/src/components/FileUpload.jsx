import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function FileUpload({ onUploadSuccess }) {
  const [uploadMessage, setUploadMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    setUploadMessage('');

    try {
      const response = await axios.post('http://127.0.0.1:8000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setUploadMessage(`✓ File uploaded successfully! ${response.data.chunks_created} chunks created.`);
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      setUploadMessage(`✗ Error uploading file: ${error.message}`);
    } finally {
      setUploading(false);
    }
  }, [onUploadSuccess]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx']
    }
  });

  return (
    <div>
      <div
        {...getRootProps()}
        style={{
          border: '2px dashed #ccc',
          borderRadius: '8px',
          padding: '40px',
          textAlign: 'center',
          cursor: uploading ? 'not-allowed' : 'pointer',
          backgroundColor: isDragActive ? '#e3f2fd' : '#fff',
          borderColor: isDragActive ? '#2196f3' : '#ccc',
          opacity: uploading ? 0.6 : 1
        }}
      >
        <input {...getInputProps()} disabled={uploading} />
        <p style={{ fontSize: '18px', marginBottom: '10px' }}>
          {uploading ? 'Uploading...' : isDragActive ? 'Drop the file here...' : 'Drag & drop a file here, or click to select'}
        </p>
        <p style={{ fontSize: '14px', color: '#666' }}>
          Supported: PDF, DOCX, PPTX
        </p>
      </div>

      {uploadMessage && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          borderRadius: '6px',
          backgroundColor: uploadMessage.startsWith('✓') ? '#c8e6c9' : '#ffcdd2',
          border: `1px solid ${uploadMessage.startsWith('✓') ? '#4caf50' : '#f44336'}`,
          color: uploadMessage.startsWith('✓') ? '#2e7d32' : '#c62828',
          fontWeight: '500',
          textAlign: 'center'
        }}>
          {uploadMessage}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
