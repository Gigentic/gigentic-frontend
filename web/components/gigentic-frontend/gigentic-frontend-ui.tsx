'use client';

import { Keypair, PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';
import { ellipsify } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useGigenticProgram,
  // useGigenticProgramAccount,
} from './gigentic-frontend-data-access';
import { useQuery } from '@tanstack/react-query';

export function GigenticFrontendList() {
  const { accounts, getProgramAccount } = useGigenticProgram();

  if (getProgramAccount.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
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
    <div className={'space-y-6'}>
      {accounts.isLoading ? (
        <span className="loading loading-spinner loading-lg"></span>
      ) : accounts.data?.length ? (
        <div className="grid md:grid-cols-2 gap-4">
          {accounts.data?.map((account) => (
            // <ServiceAccountCard
            //   key={account.publicKey.toString()}
            //   account={account.publicKey}
            // />
            <p key={account.publicKey.toString()}>
              {account.publicKey.toString()}
            </p>

            // <GigenticFrontendCard
            //     key={account.publicKey.toString()}
            //     account={account.publicKey}
            //   />
          ))}
        </div>
      ) : (
        <div className="text-center">
          <h2 className={'text-2xl'}>No accounts</h2>
          No accounts found. Create one above to get started.
        </div>
      )}
    </div>
  );
}

function ServiceAccountCard({ account }: { account: PublicKey }) {
  const { program } = useGigenticProgram();
  const { data: serviceAccount, isLoading } = useQuery({
    queryKey: ['service', account.toString()],
    queryFn: () => program.account.service.fetch(account),
  });

  if (isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>;
  }

  if (!serviceAccount) {
    return <div>No service account found</div>;
  }

  return (
    <div className="card card-bordered border-base-300 border-4 text-neutral-content">
      <div className="card-body items-center text-center">
        <div className="space-y-6">
          <h2 className="card-title justify-center text-3xl">
            {serviceAccount.description}
          </h2>
          <div className="text-center space-y-4">
            <p>Provider: {serviceAccount.provider.toString()}</p>
            <p>Price: {serviceAccount.price.toString()} lamports</p>
            <p>
              <ExplorerLink
                path={`account/${account}`}
                label={ellipsify(account.toString())}
              />
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
