import * as anchor from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import { expect } from 'chai';
import { program, connection } from './init';
import {
  TEST_SERVICE_REGISTRY_KEYPAIR,
  TEST_SERVICE_DEPLOYERS,
  TEST_SERVICE_USERS,
} from './constants';
import {
  feeTokenAccount,
  serviceProviderTokenAccount,
} from './init_service_registry';

import { SendTransactionError } from '@solana/web3.js';
import { getAccount } from '@solana/spl-token';
import { tokenMint } from './init_service_registry';
describe('SignService: Transfers SPL to the service provider and sends fees to the fee account', () => {
  it('Transfers money to the service provider and sends fees', async () => {
    const signer = TEST_SERVICE_USERS[0];

    // Fetch the service registry account
    const serviceRegistry = await program.account.serviceRegistry.fetch(
      TEST_SERVICE_REGISTRY_KEYPAIR.publicKey,
    );

    // Get the public key of the service account from the registry
    const serviceAccountPubKey = serviceRegistry.serviceAccountAddresses[0];

    const serviceAccount =
      await program.account.service.fetch(serviceAccountPubKey);

    // Find the program address for the escrow account
    const [escrowPubKey, escrowBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('escrow'),
        serviceAccountPubKey.toBuffer(),
        serviceAccount.provider.toBuffer(),
        signer.publicKey.toBuffer(),
      ],
      program.programId,
    );

    // Fetch the escrow account details
    const escrowAccount = await program.account.escrow.fetch(escrowPubKey);

    const [escrow_token_pkey, escrow_token_bump] =
      anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from('escrow-token-account'), escrowPubKey.toBuffer()],
        program.programId,
      );

    const EscrowTokenAccount = await getAccount(
      connection,
      escrow_token_pkey,
      'confirmed',
    );

    const feeTokenAccountInfo = await getAccount(connection, feeTokenAccount);

    const serviceProviderTokenAccountInfo = await getAccount(
      connection,
      serviceProviderTokenAccount,
    );

    const serviceProviderTokenAccountBefore = Number(
      serviceProviderTokenAccountInfo.amount,
    );
    const feeTokenAccountBefore = Number(feeTokenAccountInfo.amount);

    // Construct the transaction to sign the service
    const transaction = new anchor.web3.Transaction().add(
      await program.methods
        .signServiceSpl()
        .accounts({
          signer: signer.publicKey,
          service: serviceAccountPubKey,
          serviceProvider: TEST_SERVICE_DEPLOYERS[0].publicKey,
          serviceProviderTokenAccount: serviceProviderTokenAccount,
          feeTokenAccount: feeTokenAccount,
          mint: tokenMint,
        })
        .signers([signer])
        .instruction(),
    );
    transaction.feePayer = signer.publicKey;
    try {
      const txSignature = await anchor.web3.sendAndConfirmTransaction(
        connection,
        transaction,
        [signer],
      );
    } catch (err) {
      if (err instanceof SendTransactionError) {
      }
      throw err;
    }

    const feeTokenAccountInfoAfter = await getAccount(
      connection,
      feeTokenAccount,
    );

    const serviceProviderTokenAccountInfoAfter = await getAccount(
      connection,
      serviceProviderTokenAccount,
    );

    if (escrowAccount.feePercentage == 0) {
      expect(Number(feeTokenAccountInfoAfter.amount)).to.equal(0);
      expect(Number(serviceProviderTokenAccountInfoAfter.amount)).to.equal(
        Number(escrowAccount.expectedAmount),
      );
    } else {
      expect(Number(feeTokenAccountInfoAfter.amount)).to.be.greaterThan(
        Number(0),
      );
      expect(
        Number(serviceProviderTokenAccountInfoAfter.amount),
      ).to.be.greaterThan(Number(serviceProviderTokenAccountBefore));
    }
  });
});
