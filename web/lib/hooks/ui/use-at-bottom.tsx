import { useEffect, useState } from 'react';

export function useAtBottom(offset = 0) {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [isManuallyScrolling, setIsManuallyScrolling] = useState(false);
  let scrollTimeout: NodeJS.Timeout;

  useEffect(() => {
    const handleScroll = () => {
      const chatContainer = document.getElementById('chat-messages');
      if (!chatContainer) return;

      // Clear existing timeout
      if (scrollTimeout) clearTimeout(scrollTimeout);

      // Set manually scrolling flag
      setIsManuallyScrolling(true);

      // Calculate if we're at bottom
      const threshold = 100;
      const position =
        chatContainer.scrollHeight -
        chatContainer.scrollTop -
        chatContainer.clientHeight;
      setIsAtBottom(position <= threshold);

      // Reset manual scrolling flag after a delay
      scrollTimeout = setTimeout(() => {
        setIsManuallyScrolling(false);
      }, 150); // Adjust this delay as needed
    };

    const chatContainer = document.getElementById('chat-messages');
    if (chatContainer) {
      chatContainer.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
    }

    return () => {
      const chatContainer = document.getElementById('chat-messages');
      if (chatContainer) {
        chatContainer.removeEventListener('scroll', handleScroll);
      }
      if (scrollTimeout) clearTimeout(scrollTimeout);
    };
  }, [offset]);

  return { isAtBottom, isManuallyScrolling };
}
