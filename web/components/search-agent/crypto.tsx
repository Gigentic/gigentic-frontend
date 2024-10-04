'use client';

import { ChatList } from './chat-list';
import ChatScrollAnchor from './chat-scroll-anchor';
import { useEnterSubmit } from '@/lib/use-enter-submit';
import { Button } from '@solana/wallet-adapter-react-ui/lib/types/Button';
import { useForm } from 'react-hook-form';
import TextareaAutosize from 'react-textarea-autosize';
import { ArrowDownIcon } from 'lucide-react';

export default function CryptoTool() {
  const form = useForm();

  const { formRef, onKeyDown } = useEnterSubmit();

  const onSubmit = async (data: any) => {
    console.log(data);
  };

  return (
    <main>
      <div className="flex flex-col gap-4">
        <ChatList messages={[]} />
        <ChatScrollAnchor />
      </div>
      <div
        className="fixed inset-x-0 bottom-0 w-full bg-gradient-to-b
                from-muted/30 from-0% to-muted/30 to-50% peer-[[data-state=open]]:group-[]:lg:pl-[250px] peer-[[data-state=open]]:group-[]:xl:pr-[300px]"
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
              <button
                type="submit"
                //size="icon"
                disabled={form.watch('message') === ''}
              >
                <span className="sr-only">Send</span>
                <ArrowDownIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </form>

        <button
          //variant="outline"
          //size="lg"
          className="p-4 mt-4 rounded-full bg-background"
          onClick={(e) => {
            e.preventDefault();
            window.location.reload();
          }}
        >
          <div /*PlusIcon*/ className="w-5 h-5" />
          <span>New Chat</span>
        </button>
      </div>
      <h1>This is the anchored content</h1>
    </main>
  );
}
