'use client';

// Local Wallet Provider Setup
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';

// Components

export default function GigenticFrontendFeature() {
  const { publicKey } = useWallet();

  return publicKey ? (
    <div>
      <p>Gigentic Frontend Feature Hello</p>
    </div>
  ) : (
    <div className="py-16">
      <div className="text-center">
        <WalletButton />
      </div>
    </div>
  );
}
