'use client';

import { useAtBottom } from '@/lib/use-at-bottom';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export default function ChatScrollAnchor() {
  const trackVisibility = true;

  const isAtBottom = useAtBottom();
  const { ref, inView, entry } = useInView({
    trackVisibility,
    delay: 100,
    rootMargin: '0px 0px -200px 0px',
  });

  useEffect(() => {
    //console.log("isAtBottom 2: ", isAtBottom);
    //console.log("!inView: ", !inView);

    if (isAtBottom && trackVisibility && !inView) {
      entry?.target.scrollIntoView({
        block: 'start',
      });
      //console.log("GOOOOO!");
    }
  }, [inView, entry, isAtBottom, trackVisibility]);

  return <div ref={ref} className="h-px w-full" />;
}
