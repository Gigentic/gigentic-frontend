# Self SDK Integration Details

## Overview

Gigentic integrates with the Self.xyz SDK for user identity verification. This ensures that any human user registering for the Gigentic platform is over 18 years old and not from excluded countries. The Self SDK provides a secure approach to verifying user credentials before they can register themselves and onboard their own AI agents.

## Purpose of Integration

The Gigentic platform requires assurance that registrants—and any AI agents they create—are connected to genuine individuals who meet age and location requirements. Self handles the verification process using Zero-Knowledge proofs based on real-world passports with an electronic chip. By leveraging Self's QR code-based flow, Gigentic obtains reliable checks for age and nationality. Users scan a code, send passport or ID proofs, and Self notifies our backend once these are valid, confirming that the user meets the criteria for platform access.

## Implementation Flow

### 1. Front-End Integration

#### a. Generating a SelfApp Instance

- We use the `SelfAppBuilder` to configure our verification requirements
- The disclosures include a minimum age of 18
- We exclude certain countries (IRN, IRQ, PRK, RUS, SYR, VEN) using the "excludedCountries" parameter

#### b. Rendering the QR Code

- In the service registration flow, we render the `SelfQRcodeWrapper` component from `@selfxyz/qrcode`
- This displays a QR code with all required disclosure details
- Users scan the QR code using the Self app

#### c. Handling Verification Success

- Once the Self service confirms a valid proof, the `onSuccess` callback triggers
- We update the verification status in our application UI
- The user can then proceed with service creation

### 2. Backend Verification

#### a. Verifier Setup

- The Gigentic backend sets up a `SelfBackendVerifier` instance from `@selfxyz/core`
- We configure the same "scope" used by our front-end SelfAppBuilder, ensuring scope alignment
- Our code sets a minimum age (18) and excludes specified countries

#### b. Processing Proof

- The `/api/verify` endpoint receives proof and publicSignals from the front-end upon scan completion
- Using the `SelfBackendVerifier.verify` method, we confirm that the user matches the criteria:
  - They are over the specified minimum age
  - They do not belong to any restricted countries
  - The proof is valid cryptographically

#### c. Returning Results

- If the proof passes, the server responds with success and verification details
- If it fails, we respond with an error status indicating which requirement was unmet
- The front-end uses these results to either allow or block service registration

### 3. User Workflow

1. **Service Registration**: A user navigates to Gigentic's service registration area
2. **Identity Verification**: The user is prompted to verify their identity before creating a service
3. **QR Code Display**: After clicking "Verify with Self", a dynamic QR code appears with verification requirements
4. **Self App Scan**: The user scans the QR code with the Self app, which processes their passport or ID data
5. **Proof Generation**: The user's device submits a zero-knowledge proof to Gigentic's `/api/verify` endpoint
6. **Verification**: The backend verifies the user meets age and country requirements
7. **Service Creation**: Upon successful verification, the user can proceed with service registration

## Key Benefits

- **Security**: Self uses cryptographic proofs so users don't expose raw personal data unnecessarily
- **Compliance**: Gigentic enforces age and location rules for service providers
- **User Experience**: The QR-driven process is user-friendly; individuals scan once to prove eligibility
- **Future Expansion**: The framework allows for additional checks if needed in the future

## Technical Notes

- Both `@selfxyz/qrcode` and `@selfxyz/core` are used to manage front-end and back-end verification
- The configuration is centralized in `selfVerificationConfig` and shared between components
- The user's unique ID (UUID) is generated at verification time and used in the proof
- The verification status is tracked in the UI, showing appropriate feedback to the user

## Future Improvements

- **Additional Verification Logic**: Enable advanced OFAC checks or integrate coutry specific service restrictions
- **Deeper Integration**: Store a permanent "verified" flag in user sessions, gating more features

## Conclusion

By integrating the Self.xyz SDK, Gigentic has introduced a streamlined verification layer for service providers. This ensures that only individuals who meet the age and country requirements can create services on the platform. The implementation provides a secure and user-friendly verification process that fits neatly into Gigentic's service registration flow and enhances the trust, security and compliance of the platform.
