'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useGigenticProgram } from './gigentic-frontend-data-access';
import {
  GigenticFrontendCreate,
  GigenticFrontendList,
} from './gigentic-frontend-ui';

export default function GigenticFrontendFeature() {
  const { publicKey } = useWallet();
  const { programId } = useGigenticProgram();

  return publicKey ? (
    <div>
      <AppHero title="GigenticFrontend" subtitle={'Program ID'}>
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <GigenticFrontendCreate />
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
