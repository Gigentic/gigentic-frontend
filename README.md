# new notes to deploy to localnet:

restart program:
solana-keygen new --no-bip39-passphrase --force; rm -rf test-ledger; solana-test-validator

yarn anchor deploy

yarn anchor run deploy-registry
yarn anchor run write-services
---

solana-keygen new --no-bip39-passphrase --force
solana config set --url localhost

in new tab:
rm -rf test-ledger; solana-test-validator

yarn anchor build
yarn anchor-keys
yarn anchor deploy
yarn anchor-test

---

from here we can re-run scripts:

yarn anchor run deploy-registry

# new notes to deploy to devnet:

solana-keygen new

solana address
solana balance

solana airdrop 100
solana balance

connect to local validator:

`solana config set --url localhost`
`solana config set --url http://127.0.0.1:8899`

connect to devnet:

`solana config set --url https://api.devnet.solana.com`

default keypair location on Mac OS:
`/Users/marci/.config/solana/id.json`

deploy program to devnet:

`anchor deploy --provider.cluster devnet`

run service registry deployer script:

`yarn anchor run deploy-registry`

initialize script pointed at devnet:

# Gigentic Frontend

Solana anchor + Next.js full stack setup generated with the [create-solana-dapp](https://github.com/solana-developers/create-solana-dapp) generator.

Notes:

- Make sure to downgrade rust to version rustc 1.79.0 to avoid problems running anchor

- Next.js
- Tailwind
- Counter Anchor template program

Install dependencies in main gigentic-frontend folder:
`yarn`

### Run frontend

In main gigentic-frontend folder:
`yarn dev`

#### Local validator setup

Clear validator state:
`rm -rf test-ledger`

Start local validator:
`solana-test-validator`

### Chain code test and typescript setup

Set up libs in main anchor folder as well

`cd anchor`

`yarn`

#### build

`anchor build`
`anchor keys sync`

#### test

`anchor test --skip-local-validator`

### .env file setup

Set up .env file. (See Google folder for sample keys for a reproducible local-dev setup.)

==============================================================================

# Docs from the solana-starter-dapp

This project was originally generated with the [create-solana-dapp](https://github.com/solana-developers/create-solana-dapp) generator.

## Getting Started

### Prerequisites

- Node v18.18.0 or higher

- Rust v1.77.2 or higher
- Anchor CLI 0.30.1 or higher
- Solana CLI 1.18.17 or higher

### Installation

#### Clone the repo

```shell
git clone <repo-url>
cd <repo-name>
```

#### Install Dependencies

```shell
npm install
```

#### Start the web app

```
npm run dev
```

## Apps

### anchor

This is a Solana program written in Rust using the Anchor framework.

#### Commands

You can use any normal anchor commands. Either move to the `anchor` directory and run the `anchor` command or prefix the command with `npm run`, eg: `npm run anchor`.

#### Sync the program id:

Running this command will create a new keypair in the `anchor/target/deploy` directory and save the address to the Anchor config file and update the `declare_id!` macro in the `./src/lib.rs` file of the program.

You will manually need to update the constant in `anchor/lib/counter-exports.ts` to match the new program id.

```shell
npm run anchor keys sync
```

#### Build the program:

```shell
npm run anchor-build
```

#### Start the test validator with the program deployed:

```shell
npm run anchor-localnet
```

#### Run the tests

```shell
npm run anchor-test
```

#### Deploy to Devnet

```shell
npm run anchor deploy --provider.cluster devnet
```

### web

This is a React app that uses the Anchor generated client to interact with the Solana program.

#### Commands

Start the web app

```shell
npm run dev
```

Build the web app

```shell
npm run build
```
