'use client';

import { useCompletion } from 'ai/react';
import { useEffect, useRef } from 'react';

export default function LlamaChat() {
    const { completion, input, handleInputChange, handleSubmit } = useCompletion();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      };
      
      useEffect(() => {
        scrollToBottom();
      }, [completion]);

    return (
        <div className="bg-blue-100 p-4 rounded-lg shadow-md w-full max-w-4xl mx-auto flex flex-col max-h-[80vh]">
          <h2 className="text-2xl font-bold mb-4 text-blue-900">
            Search Agent
          </h2>
          <div className="flex flex-col w-full flex-grow overflow-y-auto text-gray-900">
                {completion}
                <form onSubmit={handleSubmit} className="mt-4 w-full">
                    <input 
                        className="w-full p-2 border border-gray-300 rounded shadow-xl text-gray-100"
                        value={input} 
                        onChange={handleInputChange} 
                    />
                </form>
          </div>
        </div>
    );
}