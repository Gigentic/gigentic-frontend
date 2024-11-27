'use client';

import { WalletButton } from '@/providers/solana-provider';
import { ReactNode, Suspense, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Mail, Twitter, User, Github } from 'lucide-react';
import { useWallet } from '@solana/wallet-adapter-react';
import { Avatar, AvatarFallback } from '@gigentic-frontend/ui-kit/ui';
import { ClusterUiSelect, ExplorerLink } from '@/cluster/cluster-ui';
import toast, { Toaster } from 'react-hot-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  Button,
} from '@gigentic-frontend/ui-kit/ui';
import { ThemeToggle } from '@/components/theme-toggle';

export function UiLayout({
  children,
  links,
}: {
  children: ReactNode;
  links: { label: string; path: string }[];
}) {
  const pathname = usePathname();
  const { publicKey } = useWallet();

  const filteredLinks = links.filter(
    (link) => !link.path.startsWith('/account'),
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4 border-b shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="relative w-10 h-10">
              <Link href="/">
                <Image
                  src="/gigentic-logo.png"
                  alt="Gigentic Logo"
                  width={332}
                  height={341}
                  priority
                />
              </Link>
            </div>
            <nav className="flex items-center">
              <ul className="flex space-x-4">
                {filteredLinks.map(({ label, path }) => (
                  <li key={path}>
                    <Link
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors
                          ${pathname.startsWith(path) ? 'border-2 border-primary' : 'hover:underline'}
                        `}
                      href={path}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="flex items-center space-x-4">
            {publicKey && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href={`/account/${publicKey.toString()}`}>
                      <Avatar className="cursor-pointer hover:opacity-80">
                        <AvatarFallback>
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View Account Details</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <ThemeToggle />
            <div className="hidden sm:block">
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <Toaster position="bottom-right" />

      <footer className="border-t bg-background">
        <div className="mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex space-x-4">
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://github.com/Gigentic/gigentic-frontend"
            >
              <Github className="w-6 h-6" />
              <span className="sr-only">GitHub</span>
            </Link>
            <Link
              target="_blank"
              rel="noopener noreferrer"
              href="https://x.com/GigenticAI"
            >
              <Twitter className="w-6 h-6" />
              <span className="sr-only">Twitter</span>
            </Link>
            <Link href="mailto:info@gigentic.com">
              <Mail className="w-6 h-6" />
              <span className="sr-only">Email</span>
            </Link>
          </div>
          <p className="text-sm">© 2024 Gigentic</p>
          <ClusterUiSelect />
        </div>
      </footer>
    </div>
  );
}

export function AppModal({
  children,
  title,
  hide,
  show,
  submit,
  submitDisabled,
  submitLabel,
}: {
  children: ReactNode;
  title: string;
  hide: () => void;
  show: boolean;
  submit?: () => void;
  submitDisabled?: boolean;
  submitLabel?: string;
}) {
  return (
    <Dialog open={show} onOpenChange={(open) => !open && hide()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="py-4">{children}</div>
        <DialogFooter>
          <div className="flex space-x-2">
            {submit && (
              <Button
                variant="default"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || 'Save'}
              </Button>
            )}
            <Button variant="outline" onClick={hide}>
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function AppHero({
  children,
  title,
  subtitle,
}: {
  children?: ReactNode;
  title: ReactNode;
  subtitle: ReactNode;
}) {
  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <div className="max-w-2xl">
          {typeof title === 'string' ? (
            <h1 className="text-5xl font-bold">{title}</h1>
          ) : (
            title
          )}
          {typeof subtitle === 'string' ? (
            <p className="py-6">{subtitle}</p>
          ) : (
            subtitle
          )}
          {children}
        </div>
      </div>
    </div>
  );
}

export function ellipsify(str = '', len = 4) {
  if (str.length > 30) {
    return (
      str.substring(0, len) + '..' + str.substring(str.length - len, str.length)
    );
  }
  return str;
}

export function useTransactionToast() {
  return (signature: string) => {
    toast.success(
      <div className={'text-center'}>
        <div className="text-lg">Transaction sent</div>
        <ExplorerLink
          path={`tx/${signature}`}
          label={'View Transaction'}
          className="btn btn-xs btn-primary"
        />
      </div>,
    );
  };
}
