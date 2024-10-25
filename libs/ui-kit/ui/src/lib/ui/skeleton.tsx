import { cn } from '@gigentic-frontend/ui-kit/util';

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-stone-900/10 dark:bg-stone-50/10',
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
