'use client';

import { Button } from '@gigentic-frontend/ui-kit/ui';

export function ButtonDemo() {
  return (
    <div>
      <Button onClick={() => console.log('clicked')}>Click me!</Button>
    </div>
  );
}
