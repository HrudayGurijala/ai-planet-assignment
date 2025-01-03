import { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChatQA from './components/ChatQA';

const App = () => {
  const [websocket, setWebSocket] = useState<WebSocket | null>(null);
  const [pdfUploaded, setPdfUploaded] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-white overscroll-none">
      <nav className="h-16 bg-white border-b flex items-center justify-between px-4 fixed w-full top-0 z-10">
        <img 
          src="/image.png" 
          alt="ai-planet"
          className="h-10 ml-5"
        />
        <FileUpload setWebSocket={setWebSocket} setPdfUploaded={setPdfUploaded}/>
      </nav>
      
      <main className="pt-20 px-4 max-w-4xl mx-auto">
        <ChatQA websocket={websocket} pdfUploaded={pdfUploaded} />
      </main>
    </div>
  );
};

export default App;