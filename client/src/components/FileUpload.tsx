import React, { useState } from 'react';

interface FileUploadProps {
  setWebSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>
}

const FileUpload: React.FC<FileUploadProps> = ({ setWebSocket }) => {
  const [error, setError] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('http://localhost:8000/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          console.log('File uploaded successfully');

          // Now, establish the WebSocket connection after the upload
          const ws = new WebSocket('ws://localhost:8000/ask');
          ws.onopen = () => {
            console.log('WebSocket connected');
          };

          ws.onerror = (error) => {
            console.log('WebSocket Error:', error);
          };
          ws.onclose = () => {
            console.log('WebSocket closed');
          };
          setWebSocket(ws); // Pass the WebSocket connection to the parent component
        } else {
          console.error('File upload failed');
          setError('Failed to upload the file.');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Error uploading file.');
      }
    } else {
      setError('Please upload a PDF file.');
    }
  };

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileUpload} />
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default FileUpload;