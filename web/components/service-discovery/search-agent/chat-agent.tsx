'use client';

import { ChatList } from './chat-list';
import ChatScrollAnchor from './chat-scroll-anchor';
import { useEnterSubmit } from '@/hooks/ui/use-enter-submit';
import { SubmitHandler, useForm } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import { ArrowDownIcon } from 'lucide-react';
import { useUIState, useActions } from 'ai/rsc';
import type { AI } from '@/app/actions';
import { UserMessage } from '@/components/service-discovery/llm/message';
import { Button } from '@gigentic-frontend/ui-kit/ui';
import { z } from 'zod';
import { useCluster } from '@/cluster/cluster-data-access';

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

  // handle the form submission
  const onSubmit: SubmitHandler<ChatInput> = async (data) => {
    const value = data.message.trim();
    formRef.current?.reset();
    if (!value) return;

    // Add user message
    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        role: 'user',
        display: <UserMessage>{value}</UserMessage>,
      },
    ]);

    // Send message to LLM
    try {
      const responseMessage = await sendMessage(value, cluster.endpoint);
      setMessages((currentMessages) => [...currentMessages, responseMessage]);
    } catch (error) {
      console.error(error);
    }
  };

  // render the chat UI
  return (
    <div className="container max-w-3xl mx-auto px-4 h-[calc(100vh-8rem)]">
      <div className="flex flex-col h-full">
        {/* Chat messages container with proper overflow handling */}
        <div className="flex-1 overflow-y-auto" id="chat-messages">
          <div className="py-4 space-y-6">
            <ChatList messages={messages} />
            <ChatScrollAnchor />
          </div>
        </div>

        {/* Input section */}
        <div className="py-4 border-t bg-background">
          <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)}>
            <div className="relative flex flex-col w-full overflow-hidden bg-white rounded-lg border shadow-sm">
              <TextareaAutosize
                tabIndex={0}
                onKeyDown={onKeyDown}
                placeholder="Find backend developer..."
                className="min-h-[60px] w-full resize-none bg-transparent px-4 py-[1.3rem] focus-within:outline-none sm:text-sm"
                autoFocus
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
                rows={1}
                {...form.register('message')}
              />
              <div className="absolute right-0 top-4 sm:right-4">
                <Button
                  type="submit"
                  size="icon"
                  disabled={form.watch('message') === ''}
                >
                  <span className="sr-only">Send</span>
                  <ArrowDownIcon className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
