'use client';

import { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { useAtBottom } from '@/hooks/ui/use-at-bottom';

export default function ChatScrollAnchor() {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '0px 0px -150px 0px',
  });

  const { isAtBottom, isManuallyScrolling } = useAtBottom();
  const prevInViewRef = useRef(inView);

  useEffect(() => {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    const shouldScroll =
      !inView && (isAtBottom || prevInViewRef.current) && !isManuallyScrolling;

    prevInViewRef.current = inView;

    if (shouldScroll) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [inView, isAtBottom, isManuallyScrolling]);

  return <div ref={ref} className="h-1 w-full" />;
}
