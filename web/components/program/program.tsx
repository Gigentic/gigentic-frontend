'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '@/providers/solana-provider';
import { AppHero, ellipsify } from '@/ui/ui-layout';
import { ExplorerLink } from '@/cluster/cluster-ui';
import { useGigenticProgram } from '@/hooks/blockchain/use-gigentic-program';
import { serviceRegistryPubKey } from '@/hooks/blockchain/use-service-registry';

export default function GigenticProgramFeature() {
  const { publicKey } = useWallet();
  const { programId } = useGigenticProgram();

  return publicKey ? (
    <div>
      <AppHero title="" subtitle="Reviews">
        <p className="mb-6">
          Program ID:
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        {serviceRegistryPubKey && (
          <p className="mb-6">
            Service Registry: {ellipsify(serviceRegistryPubKey.toString())}
          </p>
        )}
      </AppHero>
    </div>
  ) : (
    <WalletButton />
  );
}
