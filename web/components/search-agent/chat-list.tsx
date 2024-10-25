import { UIState } from '@/app/actions';

interface MessagesProps {
  messages: UIState;
}

export function ChatList({ messages }: MessagesProps) {
  if (!messages.length) return null;
  return (
    <div className="flex flex-col gap-4">
      {messages.map((message) => (
        <div key={message.id}>{message.display}</div>
      ))}
    </div>
  );
}
