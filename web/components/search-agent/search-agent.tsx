'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';

export default function SearchAgent() {
  // const { messages, input, handleInputChange, handleSubmit, error } = useChat({
  //   api: '/api/completion',
  //   streamProtocol: 'text',
  //   onError: (error) => {
  //     console.error('Chat error:', error);
  //   },
  // });
  const { messages, input, setInput, append, error } = useChat({
    api: '/api/completion',
    //streamProtocol: 'text',
    onError: (error) => {
      console.error('Chat error:', error);
    },
    maxSteps: 2,
  });

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
      <h2 className="text-2xl font-bold mb-4 text-blue-900">Search Agent</h2>
      <div className="flex flex-col w-full flex-grow overflow-y-auto text-gray-900">
        {messages
          .filter((m) => m.content.trim() !== '') // Filter out empty messages
          .map((m, index) => (
            <div key={index} className="whitespace-pre-wrap">
              <strong>{m.role}:</strong> {m.content}
            </div>
          ))}
        {error && <div className="text-red-500">Error: {error.message}</div>}
        <div ref={messagesEndRef} />
      </div>
      <input
        value={input}
        onChange={(event) => {
          setInput(event.target.value);
        }}
        onKeyDown={async (event) => {
          if (event.key === 'Enter') {
            append({ content: input, role: 'user' });
            setInput('');
          }
        }}
      />
    </div>
  );
}
