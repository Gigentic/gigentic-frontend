'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/providers/solana-provider';
import { AppHero, ellipsify } from '@/ui/ui-layout';
import { ExplorerLink } from '@/cluster/cluster-ui';
import { useGigenticProgram } from '@/hooks/blockchain/use-gigentic-program';
import { GigenticFrontendList } from './gigentic-frontend-ui';

export default function GigenticFrontendFeature() {
  const { publicKey } = useWallet();
  const { programId } = useGigenticProgram();

  // Direct access to environment variable
  const serviceRegistryPubkey = process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY;

  return publicKey ? (
    <div>
      <AppHero title="Gigentic Program" subtitle={'Program ID'}>
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        {serviceRegistryPubkey && (
          <p className="mb-6">
            Service Registry: {ellipsify(serviceRegistryPubkey)}
          </p>
        )}
      </AppHero>
      <GigenticFrontendList />
    </div>
  ) : (
    <div className="max-w-4xl mx-auto">
      <div className="hero py-[64px]">
        <div className="hero-content text-center">
          <WalletButton />
        </div>
      </div>
    </div>
  );
}
