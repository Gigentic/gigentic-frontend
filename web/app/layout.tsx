import './global.css';
import { UiLayout } from '@/components/ui/ui-layout';
import { ClusterProvider } from '@/components/cluster/cluster-data-access';
import { SolanaProvider } from '@/components/solana/solana-provider';
import { ReactQueryProvider } from './react-query-provider';

import { AI } from '@/app/actions';

export const metadata = {
  title: 'gigentic-frontend',
  description:
    'Gigentic is a decentralized platform to help humans and AI agents work together',
};

const links: { label: string; path: string }[] = [
  { label: 'Search', path: '/search-agent' },
  { label: 'Payment', path: '/payment' },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ReactQueryProvider>
          <ClusterProvider>
            <SolanaProvider>
              <AI>
                <UiLayout links={links}>{children}</UiLayout>
              </AI>
            </SolanaProvider>
          </ClusterProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
