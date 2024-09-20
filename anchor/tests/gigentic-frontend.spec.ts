import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import { Keypair } from '@solana/web3.js';
import { GigenticFrontend } from '../target/types/gigentic_frontend';

describe('gigentic-frontend', () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);
  const payer = provider.wallet as anchor.Wallet;

  const program = anchor.workspace
    .GigenticFrontend as Program<GigenticFrontend>;

  const gigenticFrontendKeypair = Keypair.generate();

  it('Initialize GigenticFrontend', async () => {
    await program.methods
      .initialize()
      .accounts({
        gigenticFrontend: gigenticFrontendKeypair.publicKey,
        payer: payer.publicKey,
      })
      .signers([gigenticFrontendKeypair])
      .rpc();

    const currentCount = await program.account.gigenticFrontend.fetch(
      gigenticFrontendKeypair.publicKey
    );

    expect(currentCount.count).toEqual(0);
  });

  it('Increment GigenticFrontend', async () => {
    await program.methods
      .increment()
      .accounts({ gigenticFrontend: gigenticFrontendKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.gigenticFrontend.fetch(
      gigenticFrontendKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Increment GigenticFrontend Again', async () => {
    await program.methods
      .increment()
      .accounts({ gigenticFrontend: gigenticFrontendKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.gigenticFrontend.fetch(
      gigenticFrontendKeypair.publicKey
    );

    expect(currentCount.count).toEqual(2);
  });

  it('Decrement GigenticFrontend', async () => {
    await program.methods
      .decrement()
      .accounts({ gigenticFrontend: gigenticFrontendKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.gigenticFrontend.fetch(
      gigenticFrontendKeypair.publicKey
    );

    expect(currentCount.count).toEqual(1);
  });

  it('Set gigenticFrontend value', async () => {
    await program.methods
      .set(42)
      .accounts({ gigenticFrontend: gigenticFrontendKeypair.publicKey })
      .rpc();

    const currentCount = await program.account.gigenticFrontend.fetch(
      gigenticFrontendKeypair.publicKey
    );

    expect(currentCount.count).toEqual(42);
  });

  it('Set close the gigenticFrontend account', async () => {
    await program.methods
      .close()
      .accounts({
        payer: payer.publicKey,
        gigenticFrontend: gigenticFrontendKeypair.publicKey,
      })
      .rpc();

    // The account should no longer exist, returning null.
    const userAccount = await program.account.gigenticFrontend.fetchNullable(
      gigenticFrontendKeypair.publicKey
    );
    expect(userAccount).toBeNull();
  });
});
