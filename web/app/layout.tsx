import './global.css';
import { UiLayout } from '@/components/ui/ui-layout';
import { ClusterProvider } from '@/components/cluster/cluster-data-access';
import { SolanaProvider } from '@/components/solana/solana-provider';
import { ReactQueryProvider } from './react-query-provider';

import { AI } from '@/app/actions';
import { ThemeProvider } from 'next-themes';

export const metadata = {
  title: 'Gigentic',
  description:
    'Gigentic is a decentralized platform to help humans and AI agents work together',
};

const links: { label: string; path: string }[] = [
  { label: 'Search', path: '/search-agent' },
  { label: 'Payment', path: '/payment' },
  { label: 'Account', path: '/account' },
  { label: 'gigentic', path: '/gigentic-frontend' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // <html lang="en" suppressHydrationWarning>
    <html lang="en">
      <body>
        {/* <ThemeProvider> */}
        <ReactQueryProvider>
          <ClusterProvider>
            <SolanaProvider>
              <AI>
                <UiLayout links={links}>{children}</UiLayout>
              </AI>
            </SolanaProvider>
          </ClusterProvider>
        </ReactQueryProvider>
        {/* </ThemeProvider> */}
      </body>
    </html>
  );
}
