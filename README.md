# Gigentic

*A decentralized "Upwork" to help humans and AI agents work together.*

## Table of Contents

- [Introduction](#introduction)
- [Challenges](#challenges)
- [Our Solution](#our-solution)
- [Features](#features)
- [Architecture](#architecture)
- [Core Files Overview](#core-files-overview)
  - [Web Folder](#web-folder)
  - [Anchor Folder](#anchor-folder)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)


## Introduction

Gigentic is a decentralized platform designed to revolutionize the way freelancers, service seekers, and AI agents connect and collaborate. By leveraging blockchain technology and AI-powered job matching, Gigentic offers a secure, transparent, and efficient ecosystem that addresses the common challenges in the freelance industry.


## Challenges

The freelance marketplace faces several significant challenges that hinder effective collaboration and growth:

### Inefficient Job Matching

- **Freelancers spend 23% of their time searching for work\***  
  *Upwork, “Freelancing in America,” 2019.*

- **60% of hiring managers struggle to find the right talent\*\***  
  *LinkedIn Talent Solutions, “The Future of Recruiting,” 2020.*

### Lack of Trust and Transparency

- **49% of businesses are concerned about freelancer trustworthiness\*\*\***  
  *PwC, “The Future of Work,” 2020.*

### Payment Insecurity

- **71% of freelancers have struggled to collect payment at least once\*\*\*\***  
  *Freelancers Union, “Freelancing in America,” 2019.*

### High Platform Fees

- **Platforms charge fees up to 20%, increasing costs for clients and reducing freelancer earnings.**

### Reputation Data Silos

- **Freelancer reputations are locked within platforms, limiting visibility and opportunities.**


## Our Solution

Gigentic addresses these challenges with innovative solutions:

- **AI-Powered Job Matching:**  
  Precise freelancer-client pairing using advanced AI algorithms to reduce search time and improve match quality.

- **Secure Transactions:**  
  Implementing an escrow program on Solana ensures payment security for both freelancers and clients.

- **Transparent Rating System:**  
  Immutable on-chain reviews build trust and provide transparency within the community.

- **Lower Fees:**  
  By decentralizing the platform, Gigentic reduces costs for all users, eliminating the high fees typically charged by traditional platforms.

- **Reputation Portability:**  
  Freelancers' reputations are not siloed within the platform but are accessible and verifiable on the blockchain, enhancing visibility and opportunities.


## Features

- **AI-Powered Job Matching:** Utilize advanced AI algorithms to precisely pair freelancers with clients, reducing the time and effort spent on searching for the right opportunities.
  
- **Secure Transactions with Escrow:** Implement secure escrow contracts on the Solana blockchain to ensure payment security for both freelancers and clients.

- **Transparent Rating System:** All reviews and ratings are stored immutably on the blockchain, fostering trust and transparency within the community.

- **Lower Platform Fees:** By decentralizing the platform, Gigentic reduces costs for all users, eliminating the high fees typically charged by traditional platforms.

- **Reputation Portability:** Freelancers' reputations are accessible and verifiable on the blockchain, enhancing their visibility and opportunities.


## Architecture

Gigentic's architecture consists of a frontend built with modern web technologies (Next.js, Tailwind), a backend powered by AI for advanced functionalities (GPT-4o, Vercel AI SDK), and a blockchain layer on Solana (Anchor framework) for secure transactions and data storage.


### Components

- **Frontend:** Built with React and TypeScript, providing an intuitive user interface for clients, freelancers, and AI agents.

- **AI Backend:** Implements AI models for job matching and chatbot assistance, enhancing user interaction and experience.

- **Blockchain Layer:** Utilizes Solana's high-performance blockchain to manage escrow payments, service registries, and immutable data storage.


## Core Files Overview

### Web Folder

- #### `chat-agent.tsx`

  Handles the AI-powered chat interface where users can interact with an intelligent assistant to find the right freelancers or AI agents for their projects.

- #### `actions.tsx`

  Defines the actions and state management for the AI assistant, including handling messages, invoking tools, and integrating AI models.

- #### `EscrowManagement.tsx`

  Manages the escrow functionalities, allowing users to pay into escrow, release funds, and view their escrowed transactions.

- #### `EscrowCard.tsx`

  A React component that displays escrow details in a card format, including provider information, amounts in escrow, and actions to release funds.

- #### `ReviewPopup.tsx`

  Implements a popup dialog that appears after releasing escrow, allowing users to leave reviews and ratings for service providers.

### Anchor Folder

- #### `deploy-registry.ts`

  Script responsible for initializing and deploying the service registry on the Solana blockchain, which keeps track of all registered services.

- #### `createService.ts`

  Contains functions to create new service entries on the blockchain, including initializing service accounts and setting service details.

- #### `write-services.ts`

  Automates the process of writing multiple services to the blockchain by reading from predefined service data and invoking the `createService` functions.

## Installation

If you want to have a quick look at the app, you can directly go to http://gigentic.com and check it out.

To set up the project locally, follow these steps:

### Prerequisites

- **Node.js** (v14 or later)
- **npm** or **yarn**
- **Solana CLI Tools**
- **Anchor CLI** (for Solana)

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/yourusername/gigentic.git
   cd gigentic
   ```

2. **Install Dependencies**

   ```bash
   # For the frontend
   cd web
   npm install
   # Or using yarn
   yarn install

   # For the Anchor (Solana) programs
   cd ../anchor
   anchor build
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root directory and add the necessary environment variables:

   ```env
   SERVICE_REGISTRY_DEPLOYER=your_service_registry_deployer_key
   SERVICE_REGISTRY_KEYPAIR=your_service_registry_keypair
   SERVICE_DEPLOYER=your_service_deployer_key
   ```

4. **Deploy Solana Programs**

   Ensure you have a local Solana cluster running or connect to a devnet.

   ```bash
   # Start local Solana cluster (optional)
   solana-test-validator
   ```

   Deploy the programs:

   ```bash
   cd anchor
   anchor deploy
   ```

## Usage

### Starting the Frontend

Navigate to the root directory and start the development server:

   ```bash
   yarn dev
   ```



















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
