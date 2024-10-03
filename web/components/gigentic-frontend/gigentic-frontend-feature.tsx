'use client';

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

// Components
import ServiceRequestForm from './ServiceRequestForm';
import GigenticDemo from './gigentic-demo';

export default function GigenticFrontendFeature() {
  const { publicKey } = useWallet();

  return publicKey ? (
    <div>
      <p>Gigentic Frontend Feature Hello</p>
      {/* <ResizablePanelGroup direction="horizontal">
        <ResizablePanel>
          <Card className="mt-6"> */}
      <ServiceRequestForm />
      {/* </Card>
        </ResizablePanel>
      </ResizablePanelGroup> */}
      {/*  </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel>
          <Card>
            <CardContent className="p-6"> */}
      <GigenticDemo />
      {/* </CardContent>
          </Card>
        </ResizablePanel>
      </ResizablePanelGroup> */}
    </div>
  ) : (
    <div className="py-16">
      <div className="text-center">
        <WalletButton />
      </div>
    </div>
  );
}
