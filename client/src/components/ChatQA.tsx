import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SendHorizontal, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import botAvatar from '../assets/bot-avatar.png';

interface ChatQAProps {
  websocket: WebSocket | null;
  pdfUploaded: boolean;
}

const ChatQA: React.FC<ChatQAProps> = ({ websocket, pdfUploaded }) => {
  const [question, setQuestion] = useState('');
  const [chats, setChats] = useState<Array<{ type: string; message: string }>>([]);
  const [showDialog, setShowDialog] = useState(false);

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const handleQuestionSubmit = () => {
    if (!pdfUploaded) {
      setShowDialog(true);
      return;
    }

    if (question.trim()) {
      websocket?.send(question);
      setChats((prev) => [...prev, { type: 'user', message: question }]);
      setQuestion('');
    }
  };

  useEffect(() => {
    if (websocket) {
      websocket.onmessage = (event) => {
        setChats((prev) => [...prev, { type: 'bot', message: event.data }]);
      };
    }
  }, [websocket]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chats]);

  return (
    <>
      <AlertDialog open={showDialog} onOpenChange={setShowDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Upload Required</AlertDialogTitle>
            <AlertDialogDescription>
              Please upload a PDF file.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="relative h-[600px] w-full">
        <Card className="h-full border-0">
          <ScrollArea className="h-[calc(100%-70px)] p-4">
            {chats.map((chat, index) => (
              <div key={index} className="flex items-start gap-3 mb-12">
                <Avatar className="h-8 w-8">
                  {chat.type === 'user' ? (
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  ) : (
                    <AvatarImage src={botAvatar} alt="bot" className="h-6 w-6 rounded-full" />
                  )}
                </Avatar>
                <div
                  className={`max-w-[80%] p-3 rounded-lg ${
                    chat.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {chat.message}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </ScrollArea>
          
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white">
            <div className="relative">
              <Input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder={pdfUploaded ? "Type your question..." : "Upload a PDF to start chatting"}
                onKeyUp={(e) => e.key === 'Enter' && handleQuestionSubmit()}
                className=" border-gray-200 p-7"
                disabled={!pdfUploaded}
              />
              <Button 
                onClick={handleQuestionSubmit}
                className="absolute right-1 top-1/2 -translate-y-1/2 p-1.5 h-auto hover:bg-gray-100 bg-transparent"
              >
                <SendHorizontal className="h-5 w-5 text-black hover:text-black transition-colors" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
};

export default ChatQA;