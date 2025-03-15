'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SelfAppBuilder } from '@selfxyz/qrcode';
import SelfQRcodeWrapper from '@selfxyz/qrcode';
import { selfVerificationConfig } from '@/lib/self-verification-config';
import { Button } from '@gigentic-frontend/ui-kit/ui';
import { CheckCircle, Loader2 } from 'lucide-react';

interface SelfVerificationProps {
  onVerificationSuccess: () => void;
}

export function SelfVerification({
  onVerificationSuccess,
}: SelfVerificationProps) {
  const [userId, setUserId] = useState<string>('');
  const [selfApp, setSelfApp] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<
    'idle' | 'pending' | 'success' | 'error'
  >('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [showQRCode, setShowQRCode] = useState(false);

  useEffect(() => {
    if (showQRCode) {
      // Generate a unique user ID when QR code is shown
      const generatedUserId = uuidv4();
      setUserId(generatedUserId);

      // Create a Self app instance
      const app = new SelfAppBuilder({
        appName: selfVerificationConfig.appName,
        scope: selfVerificationConfig.scope,
        endpoint: `${window.location.origin}/api/verify`,
        userId: generatedUserId,
        disclosures: selfVerificationConfig.disclosures,
      }).build();

      setSelfApp(app);
    }
  }, [showQRCode]);

  const handleSuccess = () => {
    console.log('Verification successful!');
    setVerificationStatus('success');
    onVerificationSuccess();
  };

  const handleVerifyClick = () => {
    setShowQRCode(true);
    setVerificationStatus('pending');
  };

  return (
    <div className="space-y-4">
      {!showQRCode ? (
        <Button
          onClick={handleVerifyClick}
          variant="outline"
          className="w-full"
        >
          Verify with Self
        </Button>
      ) : (
        <div className="bg-card p-6 rounded-lg shadow-md">
          <div className="text-center space-y-2 mb-4">
            <h3 className="text-lg font-semibold">Identity Verification</h3>
            <p className="text-sm text-muted-foreground">
              Scan the QR code with your Self app to verify your identity
            </p>
          </div>

          <div className="flex justify-center">
            {selfApp ? (
              <SelfQRcodeWrapper
                selfApp={selfApp}
                onSuccess={handleSuccess}
                size={250}
                darkMode={false}
              />
            ) : (
              <div className="flex justify-center items-center h-[250px] w-[250px]">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}
          </div>

          {verificationStatus === 'success' && (
            <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md flex items-center">
              <CheckCircle className="h-5 w-5 mr-2" />
              <div>
                <p className="font-medium">Verification successful!</p>
                <p className="text-sm">Your identity has been verified.</p>
              </div>
            </div>
          )}

          {verificationStatus === 'error' && (
            <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
              <p className="font-medium">Verification failed</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {verificationStatus === 'pending' &&
            !verificationStatus.includes('success') && (
              <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                <p className="font-medium">Verification in progress</p>
                <p className="text-sm">
                  Please scan the QR code with your Self app
                </p>
              </div>
            )}

          <div className="mt-4 text-sm text-muted-foreground">
            <p className="font-medium">This verification requires:</p>
            <ul className="list-disc list-inside mt-2">
              <li>Proof that you are at least 18 years old</li>
            </ul>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> To test this demo, you&apos;ll need to
              download the Self app and create an identity. Visit{' '}
              <a
                href="https://www.self.xyz"
                className="text-primary hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                self.xyz
              </a>{' '}
              for more information.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
