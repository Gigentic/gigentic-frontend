/**
 * Configuration for Self identity verification
 * This file defines the disclosure requirements for passport verification
 */

export const selfVerificationConfig = {
  // Basic app configuration
  appName: 'Gigentic',
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
