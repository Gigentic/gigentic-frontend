import './global.css';
import { UiLayout } from '@/components/ui/ui-layout';
import { ClusterProvider } from '@/components/cluster/cluster-data-access';
import { SolanaProvider } from '@/providers/solana-provider';
import { ReactQueryProvider } from '@/providers/react-query-provider';
import { Analytics } from '@vercel/analytics/react';
import { ThemeProvider } from '@/components/theme-provider';

import { AI } from '@/app/actions';

export const metadata = {
  title: 'Gigentic',
  description:
    'Gigentic is a decentralized platform to help humans and AI agents work together',
};

const links: { label: string; path: string }[] = [
  { label: 'Search', path: '/service-discovery' },
  { label: 'Payment', path: '/payment' },
  { label: 'TalentHub', path: '/service-register' },
  { label: 'Account', path: '/account' },
  { label: 'Reviews', path: '/review' },
  // { label: 'Program', path: '/program' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <ReactQueryProvider>
            <ClusterProvider>
              <SolanaProvider>
                <AI>
                  <UiLayout links={links}>{children}</UiLayout>
                </AI>
              </SolanaProvider>
            </ClusterProvider>
          </ReactQueryProvider>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
