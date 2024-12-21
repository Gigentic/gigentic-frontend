'use client';

import { ChatList } from './chat-list';
import ChatScrollAnchor from './chat-scroll-anchor';
import { useEnterSubmit } from '@/hooks/ui/use-enter-submit';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Textarea } from '@gigentic-frontend/ui-kit/ui';
import { ArrowUpIcon } from 'lucide-react';
import { useUIState, useActions } from 'ai/rsc';
import type { AI } from '@/app/actions';
import { UserMessage } from '@/components/service-discovery/llm/message';
import { Button } from '@gigentic-frontend/ui-kit/ui';
import { z } from 'zod';
import { useCluster } from '@/cluster/cluster-data-access';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export type ChatInput = z.infer<typeof chatSchema>;

export default function ChatAgent() {
  const form = useForm<ChatInput>();
  const { formRef, onKeyDown } = useEnterSubmit();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { sendMessage } = useActions<typeof AI>();
  const { cluster } = useCluster();
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const isMemeAgent = searchParams.get('agent') === 'meme';
    if (isMemeAgent) {
      // Initialize with a dummy message to trigger meme agent mode
      sendMessage('init meme agent', cluster.endpoint);
    }
  }, [searchParams, sendMessage]);

  // handle the form submission
  const onSubmit: SubmitHandler<ChatInput> = async (data) => {
    setError(null); // Reset error state
    const value = data.message.trim();
    formRef.current?.reset();
    if (!value) return;

    try {
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now(),
          role: 'user',
          display: <UserMessage>{value}</UserMessage>,
        },
      ]);

      const responseMessage = await sendMessage(value, cluster.endpoint);
      setMessages((currentMessages) => [...currentMessages, responseMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      setError(
        error instanceof Error
          ? error.message
          : 'An error occurred during the conversation',
      );

      // Optionally add an error message to the chat
      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: Date.now(),
          role: 'assistant',
          display: (
            <div className="text-red-500">
              Sorry, there was an error processing your request. Please try
              again.
            </div>
          ),
        },
      ]);
    }
  };

  // render the chat UI
  return (
    <div className="container max-w-3xl mx-auto px-4 h-[calc(100dvh-theme(spacing.32)-theme(spacing.16))]">
      <div className="flex flex-col h-full">
        {/* Chat messages container with proper overflow handling */}
        <div className="flex-1 overflow-y-auto" id="chat-messages">
          <div className="py-4 space-y-6">
            <ChatList messages={messages} />
            <ChatScrollAnchor />
          </div>
        </div>

        {/* Input section */}
        <div className="py-4">
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
            <div className="relative flex flex-col w-full">
              <Textarea
                {...form.register('message')}
                onKeyDown={onKeyDown}
                placeholder="Find backend developer..."
                className="min-h-[60px] w-full resize-y px-4 py-[1.3rem] pr-12 sm:text-sm max-h-[200px] overflow-y-auto"
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                rows={1}
              />
              <div className="absolute right-4 top-4">
                <Button
                  type="submit"
                  size="icon"
                  variant="ghost"
                  disabled={form.watch('message') === ''}
                >
                  <ArrowUpIcon className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
