'use client';

import { PublicKey } from '@solana/web3.js';
import { useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ExplorerLink } from '../cluster/cluster-ui';
import { AppHero, ellipsify } from '../ui/ui-layout';
import {
  AccountBalance,
  AccountButtons,
  AccountTokens,
  AccountTransactions,
} from './account-ui';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@gigentic-frontend/ui-kit/ui';

export default function AccountDetailFeature() {
  const params = useParams();
  const address = useMemo(() => {
    if (!params.address) return;
    try {
      return new PublicKey(params.address);
    } catch (e) {
      console.log(`Invalid public key`, e);
    }
  }, [params]);

  if (!address) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-lg text-muted-foreground">
              Error loading account
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="bg-muted/50 rounded-lg p-8 mb-8">
        <div className="flex flex-col items-center justify-center space-y-4">
          <AccountBalance address={address} />
          <ExplorerLink
            path={`account/${address}`}
            label={ellipsify(address.toString())}
            className="text-muted-foreground hover:text-primary transition-colors"
          />
          <AccountButtons address={address} />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle>Token Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountTokens address={address} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            <AccountTransactions address={address} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
