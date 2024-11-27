// Usage (in project root folder): node keys/keygen.js

const { Keypair } = require('@solana/web3.js');
const bs58 = require('bs58');

// Generate a new keypair
const keypair = Keypair.generate();

// Get the public key as a base58 string
const publicKey = keypair.publicKey.toBase58();

// Get the secret key as a base58 string
const secretKey = bs58.encode(keypair.secretKey);

// Generate a random key name (you can modify this as needed)
const keyName = `key_${Math.random().toString(36).substring(2, 10)}`;

// Output in the requested format
console.log(`${keyName},${publicKey},${secretKey},`);

// const fs = require('fs');
// // Read the keypair JSON file
// const keypairJson = JSON.parse(
//   fs.readFileSync(
//     '../keys/2VNZXRJymLUfFcnnivx9LDjuFxmGtLgxLEbkw6KWg2mC.json',
//     'utf8',
//   ),
// );
// // Extract the secret key bytes
// const secretKeyBytes = Uint8Array.from(keypairJson);
// // Encode the secret key to base58
// const base58SecretKey = bs58.encode(secretKeyBytes);
// console.log('Base58-encoded secret key:', base58SecretKey);
