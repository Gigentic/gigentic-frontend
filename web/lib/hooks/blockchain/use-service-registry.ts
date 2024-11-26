// /* eslint-disable @typescript-eslint/no-non-null-assertion */
// import { Connection } from '@solana/web3.js';
// import { useConnection } from '@solana/wallet-adapter-react';
// import { AnchorProvider } from '@coral-xyz/anchor';
// import { AnchorWallet } from '@solana/wallet-adapter-react';
// import { useQuery } from '@tanstack/react-query';
// import { getGigenticProgram } from '@gigentic-frontend/anchor';

// // Direct access to environment variable
// export const serviceRegistryPubkey =
//   process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY!;

// // Shared fetcher function
// const fetchServiceData = async (
//   connection: Connection,
//   serviceAccountIndex = 0,
// ) => {
//   const provider = new AnchorProvider(connection, {} as AnchorWallet, {
//     commitment: 'confirmed',
//   });
//   const program = getGigenticProgram(provider);

//   const serviceRegistry = await program.account.serviceRegistry.fetch(
//     serviceRegistryPubkey,
//   );

//   const serviceAccountPubKey =
//     serviceRegistry.serviceAccountAddresses[serviceAccountIndex];
//   const serviceAccount =
//     await program.account.service.fetch(serviceAccountPubKey);

//   return {
//     serviceRegistry,
//     serviceAccount,
//     serviceAccountPubKey,
//   };
// };

// // Client-side hook for EscrowManagement
// export function useServiceAccount(serviceAccountIndex = 0) {
//   const { connection } = useConnection();

//   return useQuery({
//     queryKey: ['service-account', serviceAccountIndex],
//     queryFn: () => fetchServiceData(connection, serviceAccountIndex),
//     staleTime: 1000 * 60 * 5, // Cache for 5 minutes
//   });
// }
