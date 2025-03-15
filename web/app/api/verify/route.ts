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
