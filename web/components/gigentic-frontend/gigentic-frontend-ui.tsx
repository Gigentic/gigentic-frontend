'use client';

import { PublicKey } from '@solana/web3.js';
import { useGigenticProgram } from '@/hooks/blockchain/use-gigentic-program';
import { ServiceCard } from './service-card';

export function GigenticFrontendList() {
  const { accounts, getProgramAccount } = useGigenticProgram();

  if (getProgramAccount.isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!getProgramAccount.data?.value) {
    return (
      <div className="alert alert-info flex justify-center">
        <span>
          Program account not found. Make sure you have deployed the program and
          are on the correct cluster.
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {accounts.isLoading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : accounts.data?.length ? (
        <div>
          <h2 className="text-2xl font-bold mb-6">Available Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.data?.map((account) => (
              <ServiceCard
                key={account.publicKey.toString()}
                account={account.publicKey}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold mb-2">No Services Found</h2>
          <p className="text-muted-foreground">
            No service accounts found. Create one to get started.
          </p>
        </div>
      )}
    </div>
  );
}
