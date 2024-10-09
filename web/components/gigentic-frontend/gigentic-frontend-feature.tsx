'use client';

import { useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';
import { AppHero, ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import { useGigenticProgram } from './gigentic-frontend-data-access';
import { GigenticFrontendList } from './gigentic-frontend-ui';
import { fetchServiceRegistryPubkey } from '../../app/actions'; // Import the action
import { PublicKey } from '@solana/web3.js';

export default function GigenticFrontendFeature() {
  const { publicKey } = useWallet();
  const { program, programId } = useGigenticProgram();
  const [serviceRegistryPubkey, setServiceRegistryPubkey] = useState<
    string | null
  >(null);

  useEffect(() => {
    async function getServiceRegistryPubkey() {
      try {
        const result = await fetchServiceRegistryPubkey();
        setServiceRegistryPubkey(result);
        const serviceRegistryPubkey = new PublicKey(result);
        const serviceRegistry = await program.account.serviceRegistry.fetch(
          serviceRegistryPubkey,
        );
      } catch (error) {
        console.error('Error fetching services:', error);
      }
    }

    getServiceRegistryPubkey();
  }, [program]);

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
