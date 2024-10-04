'use client';

import { useState } from 'react';
import { Message, continueConversation } from '@/app/actions3';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export default function WeatherTool() {
  const [conversation, setConversation] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');

  return (
    <div className=" p-4 rounded-lg shadow-md w-full max-w-4xl mx-auto flex flex-col max-h-[80vh]">
      <h2 className="text-2xl font-bold mb-4">Search Agent</h2>
      <div className="flex flex-col w-full flex-grow overflow-y-auto ">
        <div>
          <div>
            {conversation.map((message, index) => (
              <div key={index}>
                {message.role}: {message.content}
                {message.display}
              </div>
            ))}
          </div>

          <div>
            <input
              type="text"
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
              }}
              className="w-full p-2 mb-2 rounded-md focus:outline-none focus:ring-2"
              placeholder="Enter your weather query..."
            />
            <div>
              <button
                className="w-full font-bold py-2 px-4 rounded"
                onClick={async () => {
                  const { messages } = await continueConversation([
                    // exclude React components from being sent back to the server:
                    ...conversation.map(({ role, content }) => ({
                      role,
                      content,
                    })),
                    { role: 'user', content: input },
                  ]);

                  setConversation(messages);
                  setInput(''); // Clear the input field after submitting
                }}
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
