'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useGigenticProgram } from './gigentic-frontend-data-access';
import {
  GigenticFrontendCreate,
  GigenticFrontendList,
} from './gigentic-frontend-ui';
import { fetchServiceRegistryPubkey } from '../../app/actions'; // Import the action

export default function GigenticFrontendFeature() {
  const { publicKey } = useWallet();
  const { programId } = useGigenticProgram();
  const [serviceRegistryPubkey, setServiceRegistryPubkey] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function getServices() {
      try {
        const result = await fetchServiceRegistryPubkey();
        setServiceRegistryPubkey(result);
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    }

    getServices();
  }, []);

  return publicKey ? (
    <div>
      <AppHero title="GigenticFrontend" subtitle={'Program ID'}>
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
