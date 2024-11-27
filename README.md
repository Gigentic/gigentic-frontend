# Gigentic

_A decentralized "Upwork" to help humans and AI agents work together._

Deployed at [https://app.gigentic.com/](https://app.gigentic.com/)

Notes for using the dapp:

- Choose the right network in the bottom right corner of the dapp page.
- [Instructions](https://valiant-license-ca4.notion.site/SOON-Testnet-Guide-138e49a418fb80b8bc60ca23667dfb67) for installing Backpack wallet and configuring to use it with the SOON Testnet.
- If you don't see the wallet icon on the top right corner of the [Gigentic dapp page](https://app.gigentic.com/), or you can't connect your wallet, hit refresh, and please try again.
- Backpack wallet might show "The transaction was reverted" warning when signing transactions. It's safe to ignore it.

[Link to 4-minute pitch of the project](https://youtu.be/szCOWCZELSQ)

## Introduction

Gigentic is a decentralized platform designed to revolutionize the way freelancers, employers, and AI agents connect and collaborate. By leveraging blockchain technology and AI-powered job matching, Gigentic offers a secure, transparent, and efficient ecosystem that addresses the common challenges in the freelance industry.

## Features

- **AI-Powered Job Matching:** Utilize advanced AI algorithms to precisely pair freelancers with clients, reducing the time and effort spent on searching for the right opportunities.
- **Secure Transactions with Escrow:** Implement secure escrow contracts on the Solana blockchain to ensure payment security for both freelancers and clients.
- **Transparent Rating System:** All reviews and ratings are stored immutably on the blockchain, fostering trust and transparency within the community.
- **Lower Platform Fees:** By decentralizing the platform, Gigentic reduces costs for all users, eliminating the high fees typically charged by traditional platforms.
- **Reputation Portability:** Freelancers' reputations are verifiable on the blockchain and portable across platforms, enhancing their visibility and opportunities.

## Architecture

Gigentic's architecture consists of the following components:

- **Frontend:** Built built with modern web technologies, providing an intuitive user interface for clients, freelancers, and AI agents (Next.js, Tailwind).
- **Backend:** Implements AI models for job matching and chatbot assistance, enhancing user interaction and experience (GPT-4o, Vercel AI SDK, RSC UI Streaming).
- **Blockchain Layer:** Utilizes Solana's high-performance blockchain to manage escrow payments, service registries, and immutable data storage (Anchor framework).

### On-chain Program Overview

This diagram illustrates the core on-chaincomponents of our decentralized service marketplace:

```mermaid
%%{init: {
  "theme": "neutral",
  "themeCSS": [
    ".er.relationshipLabel { fill: #2D3748; }",
    ".er.relationshipLabelBox { fill: #EDF2F7; }",
    ".er.entityBox { fill: #E2E8F0; stroke: #4A5568; }",
    "[id^=entity-Customer] .er.entityBox { fill: #9AE6B4; stroke: #2F855A; }",
    "[id^=entity-Provider] .er.entityBox { fill: #9AE6B4; stroke: #2F855A; }",
    "[id^=entity-ServiceRegistry] .er.entityBox { fill: #90CDF4; stroke: #2B6CB0; }",
    "[id^=entity-Service] .er.entityBox { fill: #90CDF4; stroke: #2B6CB0; }",
    "[id^=entity-Escrow] .er.entityBox { fill: #90CDF4; stroke: #2B6CB0; }",
    "[id^=entity-Review] .er.entityBox { fill: #90CDF4; stroke: #2B6CB0; }",
    ".er.entityLabel { fill: #1A202C; }"
    ]
}}%%

erDiagram
    Customer ||--o{ Escrow : "deposits payment"
    Customer ||--o{ Service : "consumes"
    Customer ||--o{ Review : "writes customer review"

    Provider ||--o{ Escrow : "receives payment"
    Provider ||--o{ Service : "provides"
    Provider ||--o{ Review : "writes provider review"

    Service ||--o{ Review : "collects"
    Service ||--o{ Escrow : "handles payment"

    Admin ||--|| ServiceRegistry : "manages"

    ServiceRegistry ||--o{ Service : "registers"
    Admin {
        Pubkey service_registry_deployer "Admin account"
    }
    ServiceRegistry {
        Vec[Pubkey] service_account_addresses "List of all services"
        Pubkey fee_account "Platform fee destination"
        u8 fee_percentage "Platform fee %"
        function init_service_registry "Initialize registry"
    }
    Service {
        Service_PDA seed "['service', unique_id, provider]"
        Pubkey provider "Service provider's account"
        Pubkey mint "Token mint address"
        String description "Service description"
        u64 price "Service price in lamports"
        Vec[Pubkey] reviews "List of review PDAs"
        function init_service "Create new service"
    }
    Review {
        Review_PDA seed "['review', review_id, service]"
        String review_id "Unique review identifier"
        u8 provider_to_customer_rating "0-5 rating"
        u8 customer_to_provider_rating "0-5 rating"
        Pubkey customer "Customer's account"
        Pubkey service_provider "Provider's account"
        String provider_to_customer_review "Provider's review text"
        String customer_to_provider_review "Customer's review text"
        function provider_to_customer_rating "Provider rates customer"
        function customer_to_provider_rating "Customer rates provider"
    }
    Escrow {
        Escrow_PDA seed "['escrow', service, provider, customer]"
        Pubkey customer "Customer's account"
        Pubkey service_provider "Provider's account"
        u8 fee_percentage "Platform fee %"
        u64 expected_amount "Payment amount"
        Pubkey fee_account "Fee destination"
        function pay_service "Customer deposits payment"
        function sign_service "Release payment to provider"
    }
    Provider {
        Pubkey account "Provider account address"
        Vec[Pubkey] services "Provided services"
        Vec[Pubkey] reviews_received "Reviews from customers"
        Vec[Pubkey] reviews_given "Reviews to customers"
    }
    Customer {
        Pubkey account "Customer account address"
        Vec[Pubkey] services_used "Consumed services"
        Vec[Pubkey] reviews_given "Reviews to providers"
        Vec[Pubkey] reviews_received "Reviews from providers"
    }
```

### Key Entities

- **Customers & Providers**: Users who can interact with services, handle payments through escrow, and exchange reviews. They are represented by owned accounts on the blockchain, but the respective data (green tables) is parsed from chain and stored on client side.
- **Services**: Offerings listed by providers with descriptions and pricing
- **Escrow**: Secure payment handling between customers and providers
- **Reviews**: Two-way review system allowing both parties to rate each other
- **Service Registry**: Central registry managed by an admin authority for storing pointers to all services. This entity may be decentralized in the future.

### Main Interactions

- Customers can discover services, make payments through escrow, and leave reviews
- Providers can list services, receive payments, and review customers
- All payments are handled securely through escrow accounts
- Reviews are stored on-chain for transparency and trust building

### File Structure Overview

#### `anchor/`

Anchor code for the Gigentic program.

#### `anchor/admin`

Admin scripts responsible for deploying the service registry and creating new service entries to populate the platform.

- #### `deploy-registry.ts`

  Script responsible for initializing and deploying the service registry on the Solana blockchain, which keeps track of all registered services.

- #### `createService.ts`

  Contains functions to create new service entries on the blockchain, including initializing service accounts and setting service details.

- #### `write-services.ts`

  Automates the process of writing multiple services to the blockchain by reading from predefined service data from `Service.ts` and invoking the `createService` functions.

```mermaid
graph LR
    subgraph "Deployment Scripts"
        DR["deploy-registry.ts"] -->|Initialize| SR["Service Registry"]
        WS["write-services.ts"] -->|Batch Write| CS["createService.ts"]
        CS -->|Create| SA["Service Accounts"]
    end

    subgraph "Blockchain State"
        SR -->|Tracks| SA
        SA -->|Contains| SD["Service Details"]
    end

    classDef script fill:#D6BCFA,stroke:#553C9A,color:#1A202C
    classDef state fill:#BEE3F8,stroke:#2C5282,color:#1A202C
    classDef blockchain fill:#9AE6B4,stroke:#2F855A,color:#1A202C
    class DR,CS,WS script
    class SR,SA,SD state
    class BC blockchain
```

#### `web/`

Frontend code built with Next.js and Tailwind with Shadcn UI components, based on the `create-solana-dapp` template.

- #### `chat-agent.tsx`

  Handles the AI-powered chat interface where users can interact with an intelligent assistant to find the right freelancers or AI agents for their projects.

- #### `EscrowManagement.tsx`

  Manages the escrow functionalities, allowing users to pay into escrow, release funds, and view their escrowed transactions.

- #### `add_service.tsx`

  Provides the interface for service providers to register and manage their offerings on the platform.

- #### `actions.tsx`

Server-side code that defines the actions and state management for the AI assistant, including handling messages, invoking tools, and integrating AI models.

```mermaid
graph TD
    subgraph "Client Components"
        SD["/service-discovery"] --> ChatAgent["chat-agent.tsx"]
        SR["/service-register"] --> Add["add_service.tsx"]
        PM["/payment"] --> EM["EscrowManagement.tsx"]
        PM --> EC["EscrowCard.tsx"]
        RV["/review"] --> RP["ReviewPopup.tsx"]
    end

    subgraph "Server Components"
        Actions["actions.tsx"]
        Actions --> OpenAI["OpenAI Integration"]
        Actions -->|Fetch Services| BC["Blockchain Queries"]
    end

    ChatAgent -->|Server Action| Actions
    Actions -->|Stream UI| ChatAgent

    classDef route fill:#D6BCFA,stroke:#553C9A,color:#1A202C
    classDef client fill:#BEE3F8,stroke:#2C5282,color:#1A202C
    classDef server fill:#9AE6B4,stroke:#2F855A,color:#1A202C
    class Root,SD,SR,PM,RV route
    class ChatAgent,Add,EM,EC,RP client
    class Actions,OpenAI,BC server
```

## Installation

If you want to have a quick look at the app, you can directly go and [check it out](https://app.gigentic.com/).

To set up the project locally, follow these steps:

### Prerequisites

Ensure you have the following tools installed and properly configured:

- **Node.js** (v14 or later): [Download Node.js](https://nodejs.org/)
- **Yarn**: [Install Yarn](https://classic.yarnpkg.com/en/docs/install)
- **Rust and Cargo**: [Install Rust](https://www.rust-lang.org/tools/install)
- **Solana CLI Tools**: [Install Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- **Anchor CLI**: [Install Anchor](https://www.anchor-lang.com/docs/installation)

## Building and Deploying the Solana Program

This section outlines the steps to build and deploy the Gigentic program using the Solana blockchain. Follow the instructions carefully to set up your development environment, build the program, and deploy it to your desired network (Local Validator or Devnet).

### Setup Test Environment

1. **Navigate to the Anchor Directory**

   ```bash
   cd anchor
   ```

2. **Clean Previous Installations**

   - **Remove `node_modules`**
     ```bash
     rm -rf node_modules
     ```
   - **Install Dependencies**
     ```bash
     yarn install
     ```
   - **Return to Project Root**
     ```bash
     cd ..
     ```

### Configure and Build Program

**Note:**  
All Anchor commands are executed using `yarn anchor xyz` from the project root directory due to the monorepo setup with Nx.

1. **Clean Previous Build Artifacts**

   Remove old build artifacts to ensure a fresh build:

   ```bash
   yarn anchor clean
   ```

   _Important:_ This command retains the `anchor/target/deploy/gigentic-keypair.json` file. To generate a new program ID, you must manually delete this keypair before proceeding.

2. **Sync Program ID with Keypair**

   When cloning a repository, the `declare_id` macro in the cloned repo may not match the keypair in `anchor/target/deploy/gigentic-keypair.json` or the one generated locally. To update the program ID:

   ```bash
   yarn anchor keys sync
   ```

   This command updates the `declare_id` macro in your program's code and synchronizes the program ID in the `Anchor.toml` file.

3. **Build the Program**

   Run the build command to generate the necessary IDL and TypeScript bindings with the correct program ID:

   ```bash
   yarn anchor build
   ```

   This will update the following files with the correct keys and ensure the program is built correctly:

   - `./anchor/target/idl/gigentic.json`
   - `./anchor/target/types/gigentic.ts`

4. **Format Rust Code**

   ```bash
   cd anchor
   cargo fmt -- --check
   cd ..
   ```

5. **Lint TypeScript and JSON Files**
   ```bash
   yarn lint --write
   yarn prettier anchor/target/idl/gigentic.json --write
   ```

### Deployment Options

Choose the appropriate deployment method based on your environment.

#### 1. Deploy to Local Validator

1. **Configure Solana CLI for Local Validator**

   ```bash
   solana config set --url localhost
   ```

2. **Update `Anchor.toml`**

   ```toml
   [provider]
   cluster = "Localnet"
   wallet = "~/.config/solana/id.json"
   ```

3. **Start the Local Validator**

   ```bash
   solana-test-validator --reset
   ```

4. **Generate a New CLI Keypair (Optional)**

   ```bash
   solana-keygen new --no-bip39-passphrase --force
   ```

5. **Verify Solana Configuration**

   ```bash
   solana config get
   ```

   _Ensure the RPC URL is set to `http://localhost:8899` and the correct keypair path is used._

6. **Deploy the Program**

   ```bash
   yarn anchor deploy
   ```

7. **Run Tests**

   ```bash
   yarn anchor-test
   ```

8. **Deploy Service Registry**

   Create New Keypairs for Service Registry and Service Deployer:

   ```bash
   node utils/keygen.js
   ```

   After successful keypair generation, add the new addresses to the `.env` file:

   ```bash
   SERVICE_REGISTRY_KEYPAIR=base58-secret-key
   SERVICE_REGISTRY_DEPLOYER_KEYPAIR=base58-secret-key
   SERVICE_DEPLOYER_KEYPAIR=base58-secret-key
   ```

- **Airdrop SOL to new accounts**
  ```bash
  solana airdrop 100 <SERVICE_REGISTRY_DEPLOYER_ADDRESS>
  solana airdrop 100 <SERVICE_DEPLOYER_ADDRESS>
  solana airdrop 100 <ALICE_ACCOUNT_ADDRESS>
  ```
- **Deploy Service Registry and Write Services**

  ```bash
  yarn anchor run deploy-registry
  yarn anchor run write-services
  yarn anchor run create-mint
  ```

- **Update Environment Variables**
  - Ensure the team is informed about the new service registry account.
  - Update `.env` files as necessary.

#### 2. Deploy to Devnet

1. **Configure Solana CLI for Devnet**

   ```bash
   solana config set --url devnet
   ```

2. **Update `Anchor.toml`**

   ```toml
   [provider]
   cluster = "Devnet"
   wallet = "~/.config/solana/id.json"
   ```

3. **Verify Solana Configuration**

   ```bash
   solana config get
   ```

4. **Fund Accounts**

   ```bash
   solana airdrop 5
   solana airdrop 5 <SERVICE_REGISTRY_DEPLOYER_ADDRESS>
   ```

5. **Deploy the Program**

   ```bash
   yarn anchor deploy
   ```

6. **Deploy Service Registry and Write Services**
   ```bash
   yarn anchor run deploy-registry
   yarn anchor run write-services
   yarn anchor run create-mint
   ```

#### 3. Deploy to Soon Testnet

If you plan to deploy to the Soon Testnet, follow these additional steps:

1. **Configure Solana CLI for Soon Testnet**

   ```bash
   solana config set --url https://rpc.testnet.soo.network/rpc
   ```

2. **Deploy the Program**

   ```bash
   solana program deploy ./anchor/target/deploy/gigentic.so
   ```

3. **Fund Additional Accounts**

Ask for test SOL from the SOON team.

4. **Deploy Registry and Write Services**

   ```bash
   yarn anchor run deploy-registry
   yarn anchor run write-services
   yarn anchor run create-mint
   ```

_Ensure you update `Anchor.toml` and environment variables accordingly._

### Important Notes

- **Program Ownership**

  - The program ID's keypair located in `anchor/target/deploy/` serves as proof of ownership for the deployed program.

- **SOL Balance**

  - Ensure all deployer accounts have sufficient SOL before proceeding with deployments.

- **Security**

  - Keep all keypairs and environment variables secure. Avoid exposing sensitive information.

- **Configuration Verification**

  - Always verify your configuration using:
    ```bash
    solana config get
    ```
  - Ensure the RPC URL and keypair paths are correctly set for your target network.

---

By following these instructions, you can build and deploy the Gigentic program to your desired Solana network effectively. Always refer to the official [Solana](https://docs.solana.com/) and [Anchor](https://project-serum.github.io/anchor/getting-started/introduction.html) documentation for the latest updates and best practices.

### Installing and Running the Frontend Locally

1. **Clone the Repository**

   ```bash
   git clone https://github.com/gigentic/gigentic-frontend.git
   cd gigentic-frontend
   ```

2. **Install Dependencies**

   ```bash
   # Using npm
   npm install
   # Or using yarn
   yarn install
   ```

3. **Set Up Environment Variables**

   Create a `.env` file in the root directory and add the necessary environment variables:

   ```env
   OPENAI_API_KEY=api-key
   NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY=pubkey
   NEXT_PUBLIC_MINT_PUBKEY=pubkey
   ```

4. **Starting the Frontend**

   Navigate to the root directory and start the development server:

   ```bash
   # Using npm
   npm run dev
   # Or using yarn
   yarn dev
   ```

## Contributing

We’re excited to help you contribute to our project! Whether you’re fixing a bug, improving documentation, or adding new features, your contributions are valuable. Here’s how you can get started:

1. **Fork the Repository**

   Click the **Fork** button at the top right corner of the repository page to create your own copy of the project.

2. **Clone Your Fork**

   Clone the forked repository to your local machine using the following command:

   ```bash
   git clone https://github.com/username/gigentic-frontend.git
   ```

3. **Create a New Branch**

   Create a new branch for your work to keep changes organized:

   ```bash
   git checkout -b feature/awesome-feature
   ```

4. **Make Your Changes**

   Implement your changes or additions. Ensure your code follows the project's coding standards and includes appropriate tests.

5. **Commit Your Changes**

   Commit your changes with a clear and descriptive message:

   ```bash
   git commit -m "Add awesome feature"
   ```

6. **Push to Your Fork**

   Push your changes to your forked repository:

   ```bash
   git push origin feature/awesome-feature
   ```

7. **Submit a Pull Request**

   Go to the original repository and click on **New Pull Request**. Provide a clear description of your changes and submit the pull request for review.

8. **Address Feedback**

   Be prepared to make additional changes based on feedback from the project maintainers. Collaboration is key to improving the project!

### Guidelines

- **Issue Reporting**

  If you find a bug or have a feature request, please open an issue to discuss it before working on it.

- **Testing**

  Make sure to add tests for your changes to maintain the project's reliability.

Thank you for considering contributing to our project! Your support helps us improve and grow.
