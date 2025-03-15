# Self Integration Reference

## Client Component

```tsx
'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { SelfAppBuilder } from '@selfxyz/qrcode';
import SelfQRcodeWrapper from '@selfxyz/qrcode';
import { selfVerificationConfig } from '@/lib/self-verification-config';

export default function VerificationPage() {
  const [userId, setUserId] = useState<string>('');
  const [selfApp, setSelfApp] = useState<any>(null);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    // Generate a unique user ID on mount
    const generatedUserId = uuidv4();
    setUserId(generatedUserId);

    // Create a Self app instance
    const app = new SelfAppBuilder({
      appName: selfVerificationConfig.appName,
      scope: selfVerificationConfig.scope,
      endpoint: 'https://eb90-2a02-3100-2f6b-200-cd7c-59ec-57e-4477.ngrok-free.app/api/verify',
      userId: generatedUserId,
      disclosures: selfVerificationConfig.disclosures,
    }).build();

    setSelfApp(app);
  }, []);

  const handleSuccess = () => {
    console.log('Verification successful!');
    setVerificationStatus('success');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Identity Verification</h1>
          <p className="text-muted-foreground">Scan the QR code with your Self app to verify your identity</p>
        </div>

        {selfApp ? (
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="flex justify-center">
              <SelfQRcodeWrapper selfApp={selfApp} onSuccess={handleSuccess} size={250} darkMode={false} />
            </div>

            {verificationStatus === 'success' && (
              <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-md">
                <p className="font-medium">Verification successful!</p>
                <p className="text-sm">Your identity has been verified.</p>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-100 text-red-800 rounded-md">
                <p className="font-medium">Verification failed</p>
                <p className="text-sm">{errorMessage}</p>
              </div>
            )}

            {verificationStatus === 'pending' && (
              <div className="mt-4 p-3 bg-yellow-100 text-yellow-800 rounded-md">
                <p className="font-medium">Verification in progress</p>
                <p className="text-sm">Please wait while we verify your identity...</p>
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
                <strong>Note:</strong> To test this demo, you&apos;ll need to download the Self app and create an identity. Visit <a href="https://www.self.xyz" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">
                  self.xyz
                </a> for more information.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center p-6">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}
      </div>
    </div>
  );
}
```

## Server component

```tsx:route.tsx
import { NextRequest, NextResponse } from 'next/server';
import {
  countryCodes,
  getUserIdentifier,
  SelfBackendVerifier,
} from '@selfxyz/core';
import { selfVerificationConfig } from '@/lib/self-verification-config';

/**
 * POST /api/verify
 *
 * Endpoint to verify proofs from Self. This route receives proof and publicSignals
 * from the Self app after a user completes the verification process.
 */
export async function POST(request: NextRequest) {
  console.log('Verification request received');

  try {
    // Parse the request body
    const body = await request.json();
    const { proof, publicSignals } = body;

    // Validate the request has required fields
    if (!proof || !publicSignals) {
      console.error('Missing proof or publicSignals in request');
      return NextResponse.json(
        { success: false, message: 'Missing proof or publicSignals' },
        { status: 400 },
      );
    }

    console.log('Verifying proof with Self backend verifier');

    // Create a Self backend verifier instance with our verification settings
    const selfBackendVerifier = new SelfBackendVerifier(
      'https://forno.celo.org',
      selfVerificationConfig.scope,
      'uuid',
      true,
    );

    // Apply verification settings from config
    const { disclosures } = selfVerificationConfig;

    // Set minimum age if specified
    if (disclosures.minimumAge > 0) {
      selfBackendVerifier.setMinimumAge(disclosures.minimumAge);
    }

    // Set excluded countries if any
    if (
      disclosures.excludedCountries &&
      disclosures.excludedCountries.length > 0
    ) {
      selfBackendVerifier.excludeCountries(...disclosures.excludedCountries);
    }

    // Enable OFAC check if requested
    if (disclosures.ofac) {
      selfBackendVerifier.enableNameAndDobOfacCheck();
    }

    // Verify the proof using Self's verification service
    const verificationResult = await selfBackendVerifier.verify(
      proof,
      publicSignals,
    );
    console.log('Verification result', verificationResult);

    // Extract userId for reference
    const userId = await getUserIdentifier(publicSignals);

    // Check the verification result
    if (verificationResult && verificationResult.isValid) {
      // Safely access credential subject data
      const credentialSubject = verificationResult.credentialSubject || {};

      // Filter credential subject data based on disclosure settings
      const filteredSubject = { ...credentialSubject };

      // Only include fields that were explicitly requested for disclosure
      if (!disclosures.issuing_state && filteredSubject.issuing_state)
        filteredSubject.issuing_state = 'Not disclosed';

      if (!disclosures.name && filteredSubject.name)
        filteredSubject.name = 'Not disclosed';

      if (!disclosures.nationality && filteredSubject.nationality)
        filteredSubject.nationality = 'Not disclosed';

      if (!disclosures.date_of_birth && filteredSubject.date_of_birth)
        filteredSubject.date_of_birth = 'Not disclosed';

      if (!disclosures.passport_number && filteredSubject.passport_number)
        filteredSubject.passport_number = 'Not disclosed';

      if (!disclosures.gender && filteredSubject.gender)
        filteredSubject.gender = 'Not disclosed';

      if (!disclosures.expiry_date && filteredSubject.expiry_date)
        filteredSubject.expiry_date = 'Not disclosed';

      console.log('Verification successful', {
        userId,
        filteredSubject,
      });

      // Return success response with user data
      return NextResponse.json({
        status: 'success',
        result: verificationResult.isValid,
        credentialSubject: filteredSubject,
        verificationOptions: {
          minimumAge: disclosures.minimumAge,
          ofac: disclosures.ofac,
          excludedCountries: disclosures.excludedCountries.map(
            (countryName) => {
              const entry = Object.entries(countryCodes).find(
                ([_, name]) => name === countryName,
              );
              return entry ? entry[0] : countryName;
            },
          ),
        },

        // success: true,
        // message: 'Verification successful',
        // data: {
        //   userId,
        //   isVerified: true,
        //   verificationSettings: {
        //     minimumAge: disclosures.minimumAge,
        //     ofac: disclosures.ofac,
        //     excludedCountries: disclosures.excludedCountries,
        //   },
        // },
      });
    } else {
      const errorMessage =
        verificationResult && 'error' in verificationResult
          ? verificationResult.error
          : 'Verification failed';

      // Include validation details if available
      const validationDetails =
        verificationResult && 'isValidDetails' in verificationResult
          ? verificationResult.isValidDetails
          : null;

      console.error('Verification failed', {
        error: errorMessage,
        details: validationDetails,
      });

      // Return failure response with error details
      return NextResponse.json(
        {
          success: false,
          message: 'Verification failed',
          error: errorMessage,
          details: validationDetails,
        },
        { status: 400 },
      );
    }
  } catch (error: any) {
    // Log detailed error
    console.error('Error in Self verification process:', {
      message: error.message,
      stack: error.stack,
    });

    // Return sanitized error to client
    return NextResponse.json(
      {
        success: false,
        message: 'Internal server error during verification',
        error: error.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}

```

## Configuration

```tsx
/**
 * Configuration for Self identity verification
 * This file defines the disclosure requirements for passport verification
 */

export const selfVerificationConfig = {
  // Basic app configuration
  appName: 'Gigentic Identity Verification',
  scope: 'gigentic',

  // Disclosure requirements
  disclosures: {
    // DG1 disclosures
    issuing_state: false,
    name: false,
    nationality: false,
    date_of_birth: false,
    passport_number: false,
    gender: false,
    expiry_date: false,

    // Custom checks
    minimumAge: 18,
    excludedCountries: ['IRN', 'IRQ', 'PRK', 'RUS', 'SYR', 'VEN'],
    ofac: false,
  },
};
```
