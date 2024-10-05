'use client';

import { ChatList } from './chat-list';
import ChatScrollAnchor from './chat-scroll-anchor';
import { useEnterSubmit } from '@/lib/use-enter-submit';
//import { Button } from '@solana/wallet-adapter-react-ui/lib/types/Button';
import { SubmitHandler, useForm } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import { ArrowDownIcon, PlusIcon } from 'lucide-react';
import { useUIState, useActions } from 'ai/rsc';
import type { AI } from '../../app/actions';
import { sendMessage } from '../../app/actions';
import { UserMessage, BotMessage } from '../llm/message';


import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@gigentic-frontend/ui-kit/ui';
import { z } from 'zod';

const chatSchema = z.object({
  message: z.string().min(1, 'Message is required'),
});

export type ChatInput = z.infer<typeof chatSchema>;

export default function CryptoTool() {
  const form = useForm<ChatInput>();
  const { formRef, onKeyDown } = useEnterSubmit();
  const [messages, setMessages] = useUIState<typeof AI>();
  const { sendMessage } = useActions<typeof AI>();


  const onSubmit: SubmitHandler<ChatInput> = async (data) => {
    const value = data.message.trim();
    formRef.current?.reset();
    if (!value) return;

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        id: Date.now(),
        role: 'user',
        display: <UserMessage>{value}</UserMessage>,
      },
    ]);

    try {
      const responseMessage = await sendMessage(value);
      setMessages((currentMessages) => [...currentMessages, responseMessage]);
    } catch (error) {
      console.error(error);
    }
    //console.log("window.innerHeight: ", window.innerHeight);
    //console.log("window.scrollY: ", window.scrollY);
    //console.log("document.body.offsetHeight: ", document.body.offsetHeight);
    console.log("window.innerHeight - window.scrollY 2: ", window.innerHeight - window.scrollY);
  };

  return (
    <div>
      <div className="pb-[200px] pt-4 md:pt-10">
        <ChatList messages={messages} />
        <ChatScrollAnchor />
      </div>
      <div
          className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b
                    from-muted/30 from-0% to-muted/30 to-50% peer-[[data-state=open]]:group-[]:lg:pl-[250px]
                    peer-[[data-state=open]]:group-[]:xl:pr-[300px]"
      >
        <div className="mx-auto sm:max-w-2xl sm:px-4">
          <div
            className="px-3 flex justify-center flex-col py-2 space-y-4 border-t
              shadow-lg bg-background sm:rounded-t-xl sm:border md:py-4 bg-white"
          >
            <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} action="">
              <div className="relative flex flex-col w-full overflow-hidden max-h-60 grow bg-background sm:rounded-md sm:border">
                <TextareaAutosize
                  tabIndex={0}
                  onKeyDown={onKeyDown}
                  placeholder="Ask me anything..."
                  className="min-h-[60px] w-full resize-none bg-transparent pl-4 pr-16 py-[1.375rem] focus-within:outline-none sm:text-sm"
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

            <Button
              variant="outline"
              size="lg"
              className="p-4 mt-4 rounded-full bg-background"
              onClick={(e) => {
                e.preventDefault();
                window.location.reload();
              }}
            >
              <PlusIcon className="w-5 h-5" />
              <span>New Chat</span>
            </Button>
          </div>
        </div>
      </div>
      <h1>This is the anchored content</h1>
    </div>
  );
}
