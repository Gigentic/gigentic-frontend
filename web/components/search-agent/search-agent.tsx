'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import { useCompletion } from 'ai/react';


export default function SearchAgent() {
  const { messages, input, handleInputChange, handleSubmit, error } = useChat(
      {
        api: '/api/completion',
        streamProtocol: 'text',
        onError: (error) => {
          console.error("Chat error:", error);
        }
      }
  );

  console.log("messages: ", messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    
    <div className="bg-blue-100 p-4 rounded-lg shadow-md w-full max-w-4xl mx-auto flex flex-col max-h-[80vh]">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">
        Search Agent
      </h2>
      <div className="flex flex-col w-full flex-grow overflow-y-auto text-gray-900">
        
        {messages.map((m, index) => (
          <div key={index} className="whitespace-pre-wrap">
            {m.content}
          </div>
        ))}
        {error && <div className="text-red-500">Error: {error.message}</div>}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="mt-4 w-full">
        <input
          className="w-full p-2 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Search Agent - Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
    
    
  );
}







