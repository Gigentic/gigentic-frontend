import { UserIcon, SparkleIcon } from 'lucide-react';
import Image from 'next/image';

export function UserMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="group relative flex items-start">
      <div
        className="flex h-8 w-8 shrink-0 select-none items-center justify-center
            rounded-md border shadow-sm bg-background"
      >
        <UserIcon />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        {children}
      </div>
    </div>
  );
}

export function BotMessage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="group relative flex items-start">
      <div
        className="flex h-8 w-8 shrink-0 select-none items-center justify-center
            rounded-md border shadow-sm bg-background"
      >
        <SparkleIcon />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        {children}
      </div>
    </div>
  );
}

export function BotCard({
  children,
  showAvatar = true,
}: {
  children: React.ReactNode;
  showAvatar?: boolean;
}) {
  return (
    <div className="group relative flex items-start">
      <div
        className="flex h-8 w-8 select-none items-center justify-center
            rounded-md border shadow-sm bg-primary text-primary-foreground"
      >
        <SparkleIcon className="text-primary-foreground" />
      </div>
      <div className="ml-4 flex-1 px-1">{children}</div>
    </div>
  );
}

export function AssistantMessage({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="mt-2 flex items-center justify-center
            gap-2 text-xs text-gray-500"
    >
      <div className="max-w-[600px] flex-initial p-2">{children}</div>
    </div>
  );
}

export function AgentMessage({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="group relative flex items-start">
      <div
        className="flex h-8 w-8 shrink-0 select-none items-center justify-center
            rounded-md border shadow-sm bg-background overflow-hidden"
      >
        <Image
          src="/images/doge-agent.png"
          alt="Doge Agent"
          width={32}
          height={32}
          className="object-cover"
        />
      </div>
      <div className="ml-4 flex-1 space-y-2 overflow-hidden px-1">
        {children}
      </div>
    </div>
  );
}
