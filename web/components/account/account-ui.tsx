'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { IconRefresh } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { AppModal, ellipsify } from '../ui/ui-layout';
import { useCluster } from '../cluster/cluster-data-access';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  useGetBalance,
  useGetSignatures,
  useGetTokenAccounts,
  useRequestAirdrop,
  useTransferSol,
} from './account-data-access';
import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Input,
} from '@gigentic-frontend/ui-kit/ui';
import { Loader2 } from 'lucide-react';

export function AccountBalance({ address }: { address: PublicKey }) {
  const query = useGetBalance({ address });

  return (
    <div className="text-center">
      <h1 className="text-5xl font-bold">
        {query.data ? <BalanceSol balance={query.data} /> : '...'} SOL
      </h1>
    </div>
  );
}
export function AccountChecker() {
  const { publicKey } = useWallet();
  if (!publicKey) {
    return null;
  }
  return <AccountBalanceCheck address={publicKey} />;
}
export function AccountBalanceCheck({ address }: { address: PublicKey }) {
  const { cluster } = useCluster();
  const mutation = useRequestAirdrop({ address });
  const query = useGetBalance({ address });

  if (query.isLoading) {
    return null;
  }
  if (query.isError || !query.data) {
    return (
      <div className="alert alert-warning text-warning-content/80 rounded-none flex justify-center">
        <span>
          You are connected to <strong>{cluster.name}</strong> but your account
          is not found on this cluster.
        </span>
        <button
          className="btn btn-xs btn-neutral"
          onClick={() =>
            mutation.mutateAsync(1).catch((err) => console.log(err))
          }
        >
          Request Airdrop
        </button>
      </div>
    );
  }
  return null;
}

export function AccountButtons({ address }: { address: PublicKey }) {
  const wallet = useWallet();
  const { cluster } = useCluster();
  const [showAirdropModal, setShowAirdropModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);

  return (
    <div>
      <ModalAirdrop
        hide={() => setShowAirdropModal(false)}
        address={address}
        show={showAirdropModal}
      />
      <ModalReceive
        address={address}
        show={showReceiveModal}
        hide={() => setShowReceiveModal(false)}
      />
      <ModalSend
        address={address}
        show={showSendModal}
        hide={() => setShowSendModal(false)}
      />
      <div className="flex flex-wrap gap-3">
        <Button
          variant="default"
          className="bg-primary text-primary-foreground hover:bg-primary"
          disabled={cluster.network?.includes('mainnet')}
          onClick={() => setShowAirdropModal(true)}
        >
          Airdrop
        </Button>
        <Button
          variant="default"
          className="bg-primary text-primary-foreground hover:bg-primary"
          disabled={wallet.publicKey?.toString() !== address.toString()}
          onClick={() => setShowSendModal(true)}
        >
          Send
        </Button>
        <Button
          variant="default"
          className="bg-primary text-primary-foreground hover:bg-primary"
          onClick={() => setShowReceiveModal(true)}
        >
          Receive
        </Button>
      </div>
    </div>
  );
}

export function AccountTokens({ address }: { address: PublicKey }) {
  const [showAll, setShowAll] = useState(false);
  const query = useGetTokenAccounts({ address });
  const client = useQueryClient();
  const items = useMemo(() => {
    if (showAll) return query.data;
    return query.data?.slice(0, 5);
  }, [query.data, showAll]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Token Accounts</h2>
        <div>
          {query.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await query.refetch();
                await client.invalidateQueries({
                  queryKey: ['getTokenAccountBalance'],
                });
              }}
            >
              <IconRefresh className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {query.isError && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          Error: {query.error?.message.toString()}
        </div>
      )}

      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div className="text-muted-foreground">
              No token accounts found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Public Key</TableHead>
                  <TableHead>Mint</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map(({ account, pubkey }) => (
                  <TableRow key={pubkey.toString()}>
                    <TableCell>
                      <span className="font-mono">
                        <ExplorerLink
                          label={ellipsify(pubkey.toString())}
                          path={`account/${pubkey.toString()}`}
                        />
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono">
                        <ExplorerLink
                          label={ellipsify(account.data.parsed.info.mint)}
                          path={`account/${account.data.parsed.info.mint.toString()}`}
                        />
                      </span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {account.data.parsed.info.tokenAmount.uiAmount}
                    </TableCell>
                  </TableRow>
                ))}

                {(query.data?.length ?? 0) > 5 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAll(!showAll)}
                      >
                        {showAll ? 'Show Less' : 'Show All'}
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}

export function AccountTransactions({ address }: { address: PublicKey }) {
  const query = useGetSignatures({ address });
  const [showAll, setShowAll] = useState(false);

  const items = useMemo(() => {
    if (showAll) return query.data;
    return query.data?.slice(0, 5);
  }, [query.data, showAll]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div>
          {query.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Button variant="outline" size="sm" onClick={() => query.refetch()}>
              <IconRefresh className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {query.isError && (
        <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
          Error: {query.error?.message.toString()}
        </div>
      )}

      {query.isSuccess && (
        <div>
          {query.data.length === 0 ? (
            <div className="text-muted-foreground">No transactions found.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Signature</TableHead>
                  <TableHead className="text-right">Slot</TableHead>
                  <TableHead>Block Time</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items?.map((item) => (
                  <TableRow key={item.signature}>
                    <TableCell className="font-mono">
                      <ExplorerLink
                        path={`tx/${item.signature}`}
                        label={ellipsify(item.signature, 8)}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-right">
                      <ExplorerLink
                        path={`block/${item.slot}`}
                        label={item.slot.toString()}
                      />
                    </TableCell>
                    <TableCell>
                      {new Date((item.blockTime ?? 0) * 1000).toISOString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold ${
                          item.err
                            ? 'bg-destructive/15 text-destructive'
                            : 'bg-success/15 text-success'
                        }`}
                        title={item.err ? JSON.stringify(item.err) : undefined}
                      >
                        {item.err ? 'Failed' : 'Success'}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}

                {(query.data?.length ?? 0) > 5 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAll(!showAll)}
                      >
                        {showAll ? 'Show Less' : 'Show All'}
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      )}
    </div>
  );
}

function BalanceSol({ balance }: { balance: number }) {
  return (
    <span>{Math.round((balance / LAMPORTS_PER_SOL) * 100000) / 100000}</span>
  );
}

function ModalReceive({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  return (
    <AppModal title="Receive" hide={hide} show={show}>
      <p className="mb-2">Receive assets by sending them to your public key:</p>
      <code className="block w-full rounded-md bg-muted p-3 font-mono text-sm">
        {address.toString()}
      </code>
    </AppModal>
  );
}

function ModalAirdrop({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const mutation = useRequestAirdrop({ address });
  const [amount, setAmount] = useState('2');

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Airdrop"
      submitDisabled={!amount || mutation.isPending}
      submitLabel="Request Airdrop"
      submit={() => mutation.mutateAsync(parseFloat(amount)).then(() => hide())}
    >
      <Input
        disabled={mutation.isPending}
        type="number"
        step="any"
        min="1"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
    </AppModal>
  );
}

function ModalSend({
  hide,
  show,
  address,
}: {
  hide: () => void;
  show: boolean;
  address: PublicKey;
}) {
  const wallet = useWallet();
  const mutation = useTransferSol({ address });
  const [destination, setDestination] = useState('');
  const [amount, setAmount] = useState('1');

  if (!address || !wallet.sendTransaction) {
    return <div>Wallet not connected</div>;
  }

  return (
    <AppModal
      hide={hide}
      show={show}
      title="Send"
      submitDisabled={!destination || !amount || mutation.isPending}
      submitLabel="Send"
      submit={() => {
        mutation
          .mutateAsync({
            destination: new PublicKey(destination),
            amount: parseFloat(amount),
          })
          .then(() => hide());
      }}
    >
      <div className="space-y-4">
        <Input
          disabled={mutation.isPending}
          type="text"
          placeholder="Destination"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
        />
        <Input
          disabled={mutation.isPending}
          type="number"
          step="any"
          min="1"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
      </div>
    </AppModal>
  );
}
