// 'use client';

// import { useCompletion } from 'ai/react';
// import { useEffect, useRef, useState } from 'react';

// export default function LlamaChat() {
//     const { completion, input, handleInputChange, handleSubmit, setInput } = useCompletion();
//     const [messages, setMessages] = useState<{ id: number, role: string, content: string }[]>([]);
//     const [streamingMessage, setStreamingMessage] = useState<string>('');
//     const messagesEndRef = useRef<HTMLDivElement>(null);

//     const scrollToBottom = () => {
//         if (messagesEndRef.current) {
//             messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
//         }
//     };

//     useEffect(() => {
//         if (completion) {
//             console.log('Completion:', completion);
//             setStreamingMessage(completion);
//         }
//     }, [completion]);

//     useEffect(() => {
//         if (streamingMessage) {
//             setMessages(prevMessages => {
//                 const lastMessage = prevMessages[prevMessages.length - 1];
//                 if (lastMessage && lastMessage.role === 'AI') {
//                     return [
//                         ...prevMessages.slice(0, -1),
//                         { ...lastMessage, content: streamingMessage }
//                     ];
//                 } else {
//                     return [
//                         ...prevMessages,
//                         { id: prevMessages.length, role: 'AI', content: streamingMessage }
//                     ];
//                 }
//             });
//         }
//     }, [streamingMessage]);

//     const handleUserSubmit = async (e: React.FormEvent) => {
//         e.preventDefault();
//         const newMessage = { id: messages.length, role: 'user', content: input };
//         setMessages(prevMessages => [...prevMessages, newMessage]);
//         setStreamingMessage(''); // Reset streaming message

//         // Ensure handleSubmit can accept the full prompt
//         await handleSubmit(e);
//         setInput(''); // Clear the input field
//     };

//     useEffect(() => {
//         scrollToBottom();
//     }, [messages]);

//     return (
//         <div className="bg-blue-100 p-4 rounded-lg shadow-md w-full max-w-4xl mx-auto flex flex-col max-h-[80vh]">
//             <h2 className="text-2xl font-bold mb-4 text-blue-900">
//                 Search Agent
//             </h2>
//             <div className="flex flex-col w-full flex-grow overflow-y-auto text-gray-900">
//                 {messages.map(m => (
//                     <div key={m.id} className="whitespace-pre-wrap">
//                         {m.role === 'user' ? 'User: ' : 'AI: '}
//                         {m.content}
//                     </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//             </div>
//             <form onSubmit={handleUserSubmit} className="mt-4 w-full">
//                 <input
//                     className="w-full p-2 border border-gray-300 rounded shadow-xl"
//                     value={input}
//                     placeholder="Say something..."
//                     onChange={handleInputChange}
//                 />
//             </form>
//         </div>
//     );
// }
