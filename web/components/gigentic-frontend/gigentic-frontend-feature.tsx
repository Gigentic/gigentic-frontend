'use client';

// React
import { useState } from 'react';

// Local Wallet Provider Setup
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from '../solana/solana-provider';

// UI
import {
  Card,
  CardContent,
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@gigentic-frontend/ui-kit/ui';

// Program Data Access
import { useGigenticProgram } from './gigentic-frontend-data-access';

// Components
import ServiceRequestForm from './ServiceRequestForm';
import GigenticDemo from './gigentic-demo';

export function InitializeServiceRegistry() {
  const { publicKey } = useWallet();

  const [feePercentage, setFeePercentage] = useState('');

  const handleFundAccounts = async () => {
    console.log('Fund necessary accounts with SOL:');
  };

  const handleSetUpRegistryAccount = async () => {
    console.log('Set up accounts for the Service Registry');
    console.log(
      process.env.NEXT_PUBLIC_SERVICE_REGISTRY_KEYPAIR_SECRETKEY_BS58,
    );
  };

  const handleInitializeRegistry = async () => {
    if (!publicKey) {
      console.error('Wallet not connected');
      return;
    }
  };

  return (
    <div className="bg-blue-100 p-6 rounded-lg shadow-md max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">
        Initialize Service Registry
      </h2>

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
      </div>
    </div>
  );
}

// ... other imports ...

export default function GigenticFrontendFeature() {
  const { publicKey } = useWallet();
  const { programId } = useGigenticProgram();

  return publicKey ? (
    <ResizablePanelGroup direction="vertical">
      <ResizablePanel>
        <Card className="bg-neutral-100">
          <CardContent className="p-6">
            <GigenticDemo />
          </CardContent>
        </Card>
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel>
        <Card className="mt-6 bg-neutral-100">
          <CardContent className="p-6">
            <ServiceRequestForm />
          </CardContent>
        </Card>
      </ResizablePanel>
    </ResizablePanelGroup>
  ) : (
    <div className="py-16">
      <div className="text-center">
        <WalletButton />
      </div>
    </div>
  );
}

// export default function GigenticFrontendFeatureOLD() {
//   const { publicKey } = useWallet();
//   const { programId } = useGigenticProgram();

//   return publicKey ? (
//     <div>
//       <div className="flex items-center justify-center bg-neutral-100">
//         <div className="w-full max-w-md">
//           <GigenticDemo />
//         </div>
//       </div>
//       <div className="flex items-center justify-center bg-neutral-100">
//         <div className="w-full max-w-md">
//           <ServiceRequestForm />
//         </div>
//       </div>
//     </div>
//   ) : (
//     <div className="max-w-4xl mx-auto">
//       <div className="hero py-[64px]">
//         <div className="hero-content text-center">
//           <WalletButton />
//         </div>
//       </div>
//     </div>
//   );
// }
