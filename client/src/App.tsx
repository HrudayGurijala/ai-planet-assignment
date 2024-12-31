import  { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChatQA from './components/ChatQA';

const App = () => {
  const [websocket, setWebSocket] = useState<WebSocket | null>(null);

  return (
    <div>
      <h1>Chat with Document</h1>

      {/* File upload component */}
      <FileUpload setWebSocket={setWebSocket}  />

      {/* Chat component, only visible if PDF is uploaded */}
       <ChatQA websocket={websocket} />
    </div>
  );
};

export default App;
