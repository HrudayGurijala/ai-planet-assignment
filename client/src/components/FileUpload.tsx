import React, { useState, useEffect } from 'react';
import { Upload } from "lucide-react";

interface FileUploadProps {
  setWebSocket: React.Dispatch<React.SetStateAction<WebSocket | null>>;
  setPdfUploaded: React.Dispatch<React.SetStateAction<boolean>>;
}

const FileUpload: React.FC<FileUploadProps> = ({ setWebSocket, setPdfUploaded }) => {
  const [error, setError] = useState('');
  const [fileName, setFileName] = useState('');
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Clean up WebSocket connection on component unmount
  useEffect(() => {
    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [wsConnection]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setFileName(file.name);
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('https://ai-planet-backend-mv31.onrender.com/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          // If WebSocket is already open, skip creating a new one
          if (!wsConnection || wsConnection.readyState === WebSocket.CLOSED) {
            const ws = new WebSocket('wss://ai-planet-backend-mv31.onrender.com/ask');
            ws.onopen = () => {
              console.log('WebSocket connected');
            };
            ws.onerror = (error) => {
              console.log('WebSocket Error:', error);
              setError('WebSocket connection failed.');
            };
            ws.onclose = () => console.log('WebSocket closed');
            setWebSocket(ws);
            setWsConnection(ws); // Store the WebSocket reference
          }

          setError('');
          setPdfUploaded(true);
        } else {
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
    <div className="flex items-center gap-4">
      {fileName && (
        <span className="text-green-600 text-sm">
          {fileName}
        </span>
      )}
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileUpload}
        id="file-upload"
        className="hidden"
      />
      <label 
        htmlFor="file-upload" 
        className="flex items-center gap-2 cursor-pointer bg-white text-black px-4 py-2 rounded-md border border-black hover:bg-gray-50"
      >
        <Upload size={16} />
        <span className="hidden md:inline">Upload PDF</span>
      </label>
      {error && (
        <p className="text-sm text-red-500 absolute top-16 right-4">
          {error}
        </p>
      )}
    </div>
  );
};

export default FileUpload;
