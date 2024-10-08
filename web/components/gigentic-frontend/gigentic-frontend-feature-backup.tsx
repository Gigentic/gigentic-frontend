'use client';

// React
import { useState } from 'react';

// Solana
import {
  PublicKey,
  Keypair,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from '@solana/web3.js';

// Local Wallet Provider Setup
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';

// UI
import { AppHero, ellipsify, useTransactionToast } from '../ui/ui-layout';
import { ExplorerLink } from '../cluster/cluster-ui';
import {
  GigenticFrontendCreate,
  // GigenticFrontendList,
} from './gigentic-frontend-ui';

// Program Data Access
import {
  useGigenticProgram,
  // fundAndLogAccount,
  // SERVICE_REGISTRY_SPACE,
  // SERVICE_REGISTRY_DEPLOYER,
  // SERVICE_REGISTRY_KEYPAIR,
  // REGISTRY_KEYPAIR,
  // FEE_ACCOUNT,
  // FEE_PERCENTAGE,
  // MINT_AUTHORITY,
  // SERVICE_DEPLOYERS,
} from './gigentic-frontend-data-access';

export function InitializeServiceRegistry() {
  const { connection } = useConnection();
  const { program } = useGigenticProgram();

  const { publicKey, sendTransaction } = useWallet();

  const [feeAccount, setFeeAccount] = useState('');
  const [feePercentage, setFeePercentage] = useState('');
  const [feeAccountSecretKey, setFeeAccountSecretKey] = useState('');

  const transactionToast = useTransactionToast();

  const handleFundAccounts = async () => {
    console.log('Fund necessary accounts with SOL:');

    // await fundAndLogAccount(
    //   connection,
    //   SERVICE_REGISTRY_DEPLOYER,
    //   'SERVICE_REGISTRY_DEPLOYER',
    // );

    // await fundAndLogAccount(connection, MINT_AUTHORITY, 'MINT_AUTHORITY');

    // for (let i = 0; i < SERVICE_DEPLOYERS.length; i++) {
    //   await fundAndLogAccount(
    //     connection,
    //     SERVICE_DEPLOYERS[i],
    //     `SERVICE_DEPLOYER ${i}`
    //   );
    // }
  };

  const handleSetUpRegistryAccount = async () => {
    console.log('Set up accounts for the Service Registry');
    console.log(
      process.env.NEXT_PUBLIC_SERVICE_REGISTRY_KEYPAIR_SECRETKEY_BS58,
    );

    // // Calculate the minimum balance required for rent exemption for an account of a given size.
    // // This prevents the account from being deleted due to insufficient balance.
    // const rentExemptionAmount =
    //   await connection.getMinimumBalanceForRentExemption(
    //     SERVICE_REGISTRY_SPACE,
    //   );
    // console.log('rentExemptionAmount', rentExemptionAmount);

    // // Prepare the parameters needed to create a new account on the Solana blockchain.
    // const createAccountParams = {
    //   fromPubkey: SERVICE_REGISTRY_DEPLOYER.publicKey, // Account paying for the creation of the new account
    //   newAccountPubkey: SERVICE_REGISTRY_KEYPAIR.publicKey, // Public key of the new account to be created
    //   lamports: rentExemptionAmount, // Amount of SOL (in lamports) to transfer for rent exemption
    //   space: SERVICE_REGISTRY_SPACE, // Amount of space (in bytes) to allocate for the new account
    //   programId: program.programId, // The program that owns this account (in this case, the service registry program)
    // };
    // console.log(
    //   'SERVICE_REGISTRY_DEPLOYER',
    //   SERVICE_REGISTRY_DEPLOYER.publicKey.toBase58(),
    // );
    // console.log(
    //   'SERVICE_REGISTRY_KEYPAIR',
    //   SERVICE_REGISTRY_KEYPAIR.publicKey.toBase58(),
    // );

    // // Create a new transaction and add an instruction to create a new account.
    // const createAccountTransaction = new Transaction().add(
    //   SystemProgram.createAccount(createAccountParams),
    // );

    // try {
    //   // Send the transaction and wait for confirmation.
    //   // Both SERVICE_REGISTRY_DEPLOYER and SERVICE_REGISTRY_KEYPAIR need to sign the transaction.
    //   const tx = await sendAndConfirmTransaction(
    //     connection,
    //     createAccountTransaction,
    //     [SERVICE_REGISTRY_DEPLOYER, SERVICE_REGISTRY_KEYPAIR],
    //   );
    //   transactionToast(tx);
    //   console.log('Service Registry account setup with transaction:', tx);
    // } catch (error) {
    //   console.error('Error setting up Service Registry accounts:', error);
    // }
  };

  const handleInitializeRegistry = async () => {
    if (!publicKey) {
      console.error('Wallet not connected');
      return;
    }

    //   // Convert feePercentage to a number and validate
    //   const feePercentageNumber = parseInt(feePercentage);
    //   if (
    //     isNaN(feePercentageNumber) ||
    //     feePercentageNumber < 0 ||
    //     feePercentageNumber > 100
    //   ) {
    //     console.error('Invalid fee percentage');
    //     return;
    //   }

    //   console.log(
    //     'SERVICE_REGISTRY_DEPLOYER',
    //     SERVICE_REGISTRY_DEPLOYER.publicKey.toBase58(),
    //   );
    //   console.log('Wallet publicKey', publicKey.toBase58());

    //   console.log(
    //     'serviceRegistry',
    //     SERVICE_REGISTRY_KEYPAIR.publicKey.toBase58(),
    //   );

    //   try {
    //     const tx = await program.methods
    //       .initializeServiceRegistry(FEE_ACCOUNT.publicKey, feePercentageNumber) //  sets the fee_Account owner to the deployer, and for now sets the initial fee to 0
    //       .accounts({
    //         initializer: SERVICE_REGISTRY_DEPLOYER.publicKey, // Account that initializes the registry
    //         serviceRegistry: SERVICE_REGISTRY_KEYPAIR.publicKey, // The new service registry account being initialized
    //       })
    //       .transaction();

    //     const signature = await sendTransaction(tx, connection);
    //     transactionToast(signature);
    //     console.log('Transaction confirmed:', signature);
    //   } catch (error) {
    //     console.error('Error sending transaction:', error);
    //   }
    // };

    // const handleCheckRegistry = async () => {
    //   console.log(
    //     'serviceRegistry',
    //     SERVICE_REGISTRY_KEYPAIR.publicKey.toBase58(),
    //   );

    //   // Fetch the service registry account data
    //   const fetchedRegistryAccount = await program.account.serviceRegistry.fetch(
    //     SERVICE_REGISTRY_KEYPAIR.publicKey,
    //   );
    //   console.log(
    //     'Fetched Fee account from Registry:',
    //     fetchedRegistryAccount.feeAccount.toBase58(),
    //   );
    //   console.log(
    //     'Fetched Fee percentage from Registry:',
    //     fetchedRegistryAccount.feePercentage,
    //   );

    // // Additional checks if needed
    // console.log(
    //   'Service account addresses:',
    //   fetchedRegistryAccount.serviceAccountAddresses
    // );
  };

  return (
    <div className="bg-blue-100 p-6 rounded-lg shadow-md max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">
        Initialize Service Registry
      </h2>

      {/* <input
        type="text"
        placeholder="Fee Account Public Key"
        value={FEE_ACCOUNT.publicKey.toBase58()}
        onChange={(e) => setFeeAccount(e.target.value)}
        className="w-full p-2 mb-3 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      /> */}
      <input
        type="number"
        placeholder="Fee Percentage (0-100)"
        value={feePercentage}
        onChange={(e) => setFeePercentage(e.target.value)}
        className="w-full p-2 mb-4 border border-blue-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleFundAccounts}
          disabled={!publicKey}
          className="flex-1 bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Fund Accounts
        </button>{' '}
        <button
          onClick={handleSetUpRegistryAccount}
          disabled={!publicKey}
          className="flex-1 bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Setup Accounts
        </button>
      </div>
      <div className="flex space-x-4">
        <button
          onClick={handleInitializeRegistry}
          disabled={!publicKey}
          className="flex-1 bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Init Registry
        </button>
        {/* <button
          onClick={handleCheckRegistry}
          disabled={!publicKey}
          className="flex-1 bg-blue-800 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Check Registry
        </button> */}
      </div>
    </div>
  );
}

export default function GigenticFrontendFeature() {
  const { publicKey } = useWallet();
  const { programId } = useGigenticProgram();

  return publicKey ? (
    <div>
      <AppHero
        title="Gigentic"
        subtitle={
          'Gigentic is a decentralized platform to help humans and AI agents work together in a frictionless way with trust-minimized payment flows and verifiable ratings.'
        }
      >
        <p className="mb-6">
          <ExplorerLink
            path={`account/${programId}`}
            label={ellipsify(programId.toString())}
          />
        </p>
        <div className="flex items-center justify-center min-h-screen bg-neutral-100">
          <div className="w-full max-w-md">ServiceRequestForm</div>
        </div>

        <div className="flex items-center justify-center min-h-screen bg-neutral-100">
          <div className="w-full max-w-md">GigenticDemo</div>
        </div>

        <GigenticFrontendCreate />
      </AppHero>
      <InitializeServiceRegistry />
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
