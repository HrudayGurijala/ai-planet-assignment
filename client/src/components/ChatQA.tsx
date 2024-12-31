import React, { useState } from 'react';

interface ChatQAProps {
  websocket: WebSocket | null;
}

const ChatQA: React.FC<ChatQAProps> = ({ websocket }) => {
  const [question, setQuestion] = useState('');
  const [chats, setChats] = useState<string[]>([]);

  const handleQuestionSubmit = () => {
    if (websocket && question.trim()) {
      websocket.send(question);
      setChats((prevChats) => [...prevChats, `You: ${question}`]); // Add user's question to chat history
      setQuestion(''); // Reset question input field
    } else {
      alert('Please upload the PDF first.');
    }
  };

  // Listen for messages from the WebSocket
  React.useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        setChats((prevChats) => [...prevChats, `Bot: ${event.data}`]); // Add bot's response to chat history
      };
    }
  }, [websocket]);

  return (
    <div>
      <div>
        <h2>Chat History</h2>
        <div>
          {chats.map((chat, index) => (
            <p key={index}>{chat}</p>
          ))}
        </div>
      </div>

      <input
        type="text"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Ask a question"
      />
      <button onClick={handleQuestionSubmit}>Ask Question</button>


    </div>
  );
};

export default ChatQA;
