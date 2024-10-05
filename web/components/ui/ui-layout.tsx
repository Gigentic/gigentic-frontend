'use client';

import { WalletButton } from '../solana/solana-provider';
import * as React from 'react';
import { ReactNode, Suspense, useEffect, useRef } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { AccountChecker } from '../account/account-ui';
import {
  ClusterChecker,
  ClusterUiSelect,
  ExplorerLink,
} from '../cluster/cluster-ui';
import toast, { Toaster } from 'react-hot-toast';

import GigenticDemo from '@/components/gigentic-frontend/gigentic-demo';
import SearchAgent from '../search-agent/search-agent';
import GigenticInterface from '../gigentic-frontend/gigentic-interface';
import { ThemeProvider } from '@/components/theme-provider';

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

import { Mail, X } from 'lucide-react';
import Image from 'next/image';

export function UiLayout({
  children,
  links,
}: {
  children: ReactNode;
  links: { label: string; path: string }[];
}) {
  const pathname = usePathname();

  return (
    <div>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        // defaultTheme="dark"
        // defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <div className="flex flex-col min-h-screen">
          <header className="flex items-center justify-between p-4 border-b shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="relative w-10 h-10">
                <Image
                  src="/logo-g.png"
                  alt="Gigentic Logo"
                  width={332}
                  height={341}
                  priority
                />
              </div>
              <nav className="flex items-center">
                <ul className="flex space-x-4">
                  {links.map(({ label, path }) => (
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
            <div className="">
              <WalletButton />
            </div>
          </header>
          <main className="flex-1 p-4">
            <div className="flex items-center justify-center w-full h-full  rounded-lg">
              <div className="flex-grow mx-4 lg:mx-auto">
                <Suspense
                  fallback={
                    <div className="text-center my-32">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  }
                >
                  {children}
                </Suspense>
                <Toaster position="bottom-right" />
              </div>
            </div>
          </main>
          <footer className="fixed bottom-0 left-0 right-0 flex items-center justify-between p-4 border-t bg-background">
            <div className="flex space-x-4">
              <Link href="https://x.com/GigenticAI" className="">
                <X className="w-6 h-6" />
                <span className="sr-only">Twitter</span>
              </Link>
              <Link href="mailto:info@gigentic.com" className="">
                <Mail className="w-6 h-6" />
                <span className="sr-only">Email</span>
              </Link>
            </div>
            <p className="text-sm ">© 2024 Gigentic</p>
          </footer>
        </div>
      </ThemeProvider>
    </div>

    // <div>
    //   <div className="flex-1">
    //     <Link className="" href="/">
    //       <img className="md:h-40" alt="Logo" src="/logo.png" />
    //     </Link>
    //   </div>
    //   <div className="flex-1">
    //     <ul className="">
    //       {links.map(({ label, path }) => (
    //         <li key={path}>
    //           <Link
    //             className={pathname.startsWith(path) ? 'active' : ''}
    //             href={path}
    //           >
    //             {label}
    //           </Link>
    //         </li>
    //       ))}
    //     </ul>
    //   </div>

    //   <div className="flex-none space-x-2">
    //     <WalletButton />
    //     <ClusterUiSelect />
    //   </div>

    //   {/* <div className="flex-1">
    //     <SearchAgent />
    //   </div> */}
    //   {/* <GigenticFrontendFeature /> */}
    //   {/* <GigenticDemoBlue /> */}
    //   {/* <GigenticDemo /> */}
    //   <div className="flex-grow w-full mx-4 lg:mx-auto">
    //     <Suspense
    //       fallback={
    //         <div className="text-center my-32">
    //           <span className="loading loading-spinner loading-lg">
    //             Loading...
    //           </span>
    //         </div>
    //       }
    //     >
    //       {children}
    //     </Suspense>
    //     <Toaster position="bottom-right" />
    //   </div>

    //   <footer className="">
    //     <aside>
    //       <p>
    //         Generated by{' '}
    //         <a
    //           className="link"
    //           href=""
    //           target="_blank"
    //           rel="noopener noreferrer"
    //         >
    //           Gigentic
    //         </a>
    //       </p>
    //     </aside>
    //   </footer>
    // </div>
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
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!dialogRef.current) return;
    if (show) {
      dialogRef.current.showModal();
    } else {
      dialogRef.current.close();
    }
  }, [show, dialogRef]);

  return (
    <dialog className="modal" ref={dialogRef}>
      <div className="modal-box space-y-5">
        <h3 className="font-bold text-lg">{title}</h3>
        {children}
        <div className="modal-action">
          <div className="join space-x-2">
            {submit ? (
              <button
                className="btn btn-xs lg:btn-md btn-primary"
                onClick={submit}
                disabled={submitDisabled}
              >
                {submitLabel || 'Save'}
              </button>
            ) : null}
            <button onClick={hide} className="btn">
              Close
            </button>
          </div>
        </div>
      </div>
    </dialog>
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
