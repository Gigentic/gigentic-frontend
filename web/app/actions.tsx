'use server';

import { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import type { CoreMessage, ToolInvocation } from "ai";
import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from "@ai-sdk/openai";
import { z } from "zod";
import { BotCard, BotMessage } from "../components/llm/message";
import Price from "../components/ui/price";
import PriceSkeleton from "../components/ui/price-skeleton";
import FreelancerProfileCard from "../components/ui/freelancer-profile-card";

import { Program, setProvider, AnchorProvider } from '@coral-xyz/anchor';// this is the system message we send to the LLM to instantiate it
import { Keypair, Connection, PublicKey, Cluster } from '@solana/web3.js';

// import { Gigentic } from '../../anchor/target/types/gigentic';
// import { IDL } from '@coral-xyz/anchor/dist/cjs/native/system';
// eslint-disable-next-line @nx/enforce-module-boundaries
import { loadKeypairBs58FromEnv } from '../../anchor/tests/utils';

// Program Data Access
// import {
//   useGigenticProgram,
// } from '../components/gigentic-frontend/gigentic-frontend-data-access';

import {
  getGigenticProgram,
  getGigenticProgramId,
} from '@gigentic-frontend/anchor';
// import { useAnchorProvider } from "@/components/solana/solana-provider";
// import { useCluster } from "@/components/cluster/cluster-data-access";


// Initialize connection and program
//const connection: Connection = PROVIDER.connection;
//const program: Program<Gigentic> = workspace.Gigentic as Program<Gigentic>;
//const { program } = useGigenticProgram();
// const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_GIGENTIC_PROGRAM_ID || '');
// const program = new Program<Gigentic>(IDL, PROGRAM_ID, provider);
let service_registry = ''


async function fetchServiceRegistry() {

  // Create a new AnchorProvider

  // Initialize connection
  const connection = new Connection('http://localhost:8899');
  const provider = new AnchorProvider(connection, {} as any, { commitment: 'confirmed' });
  const programId = getGigenticProgramId('devnet');
  const program = getGigenticProgram(provider);

    // Load service registry keypairs
  const serviceRegistryDeployer = loadKeypairBs58FromEnv(
    'SERVICE_REGISTRY_DEPLOYER',
  );
  const serviceRegistryKeypair = loadKeypairBs58FromEnv(
    'SERVICE_REGISTRY_KEYPAIR',
  );
  console.log(
    'serviceRegistryDeployer',
    serviceRegistryDeployer.publicKey.toString(),
  );
  console.log(
    'serviceRegistryKeypair',
    serviceRegistryKeypair.publicKey.toString(),
  );

  // const { connection } = useConnection();
  // const { program } = useGigenticProgram();


  console.log('========== Fetch service registry');
  const serviceRegistry = await program.account.serviceRegistry.fetch(
    serviceRegistryKeypair.publicKey,
  );

  for (const serviceAddress of serviceRegistry.serviceAccountAddresses) {
    console.log('Service Account Address:', serviceAddress.toString());

    const serviceAccount =
      await program.account.service.fetch(serviceAddress);
    // console.log('Service Account Unique ID:', serviceAccount.uniqueId);
    //console.log('Service Account Description:', serviceAccount.description);
    service_registry += `\n${serviceAccount.description}`;

    //console.log('Service Account Price:', serviceAccount.price.toString());
    // console.log('Service Account Mint:', serviceAccount.mint.toString());
  }

}


// gives it the context for tool callin
const prompt_instructions = `\
  You are a assistant helping users finding the right freelancer for their project/task.

    If the user is looking for help / a freelancer, look for the right freelancer or AI agent in the service registry and show a summary of the profile to the user by calling \`show_freelancer_profile\`, never return a profile summary in text format. Always give a only 1 option to the user to choose from.
    If the user wants the price of a cryptocurrency, call \`get_crypto_price\` to show the price of the cryptocurrency.
    If the user wants anything else unrelated to the functions calls \`get_crypto_price\` or \`show_freelancer_profile\`, you should chat with the user. Answer any
    questions they may have that are unrelated to cryptocurrencies or freelancers.

`;

/*
const service_registry = `
            You can choose between the freelancers/AI agents in the following service registry to help the user solve his task:
            - Backend Developer, Experience: Specialist in Node.js, rating: 2.9/5, price: 30, email: backend@gigentic.com, wallet: 0x12345678901234567890123456789012XXvf76
            - Frontend Developer, Experience: Specialist in React, rating: 4.2/5, price: 40, email: frontend@gigentic.com, wallet: 0x123456789012345678Xjaush45678901234567890
            - Full Stack Developer, Experience: Specialist in Next.js in combination with Postgres databases, rating: 4.1/5, price: 25, email: fullstack@gigentic.com, wallet: 0x1234567890asdgvd78901234567890123456789
            - DevOps Engineer, Experience: Specialist in Docker, rating: 3.8/5, price: 20, email: devops@gigentic.com, wallet: 0x12345678asdds56789012345678901234567890
            - Data Scientist, Experience: Specialist in Python, rating: 3.9/5, price: 25, email: datascience@gigentic.com, wallet: 0x12345678901234567890rbrb478901234567890
            - Machine Learning Engineer, Experience: Specialist in TensorFlow, rating: 3.7/5, price: 20, email: mlengineer@gigentic.com, wallet: 0x1234567890123ololuo45678901234567890
            - Smart Contract Auditor, Experience: 5 years of experience in auditing smart contracts, Chains: ADA, DOT, avg. rating 4.8/5, price: 25, email: smartcontractauditor@gigentic.com, wallet: 0x12345678ntununt789012345678901234567890
            - Smart Contract Audit AI Agent, Experience: 120 successful projects with excellent customer feedback, Chains: SOL, ETH, avg. rating 4.9/5, price: 30, email: smartcontractauditor@gigentic.com, wallet: 0x12345678ntununt789012345678901234567890
            - Smart Contract Developer, Experience: Specialist in Solidity, rating: 3.2/5, price: 30, email: smartcontractdeveloper@gigentic.com, wallet: 0x12345cwecwev89012345678901234567890
            - Blockchain Developer, Experience: Specialist in Rust, rating: 3.1/5, price: 25, email: blockchaindeveloper@gigentic.com, wallet: 0x12345678xbxvxhyuse6789012341234567890
            - Solana Developer, Experience: 3 years of experience in Solana. Worked with Rust on various L2 projects. Strong experience with Anchor and TypeScript. Participated in various Hackthons (Radar, WebZero, Colosseum). Located in Dublin and open to work remotely in any timezone, rating: 3.9/5, price: 20, email: solanadeveloper@gigentic.com, wallet: 0x1234567890123456rewrvdscn5678901234567890
            - Rust Developer, Experience: 2 years of experience in Rust, rating: 3.5/5, price: 15, email: rustdeveloper@gigentic.com, wallet: 0x1234567890123lvkoiwjwenxx4567890
            - Python Developer, Experience: 4 years of experience in Python, rating: 3.3/5, price: 10, email: pythondeveloper@gigentic.com, wallet: 0x12345xeojvp9jJSnlg2345678901234567890123456789
            - Javascript Developer, Experience: 3 years of experience in Javascript, rating: 3.7/5, price: 12, email: javascriptdeveloper@gigentic.com, wallet: 0x12345LSNJUNBkvnsv901234567890
            - React Developer, Experience: 2 years of experience in React, rating: 4.1/5, price: 15, email: reactdeveloper@gigentic.com, wallet: 0x123456789012xxbVXube901234567890
            - Next.js Developer, Experience: 1 year of experience in Next.js, rating: 4.0/5, price: 10, email: nextjsdeveloper@gigentic.com, wallet: 0x12345XBjevbeviX678901234567890
`;
*/

let content = `${prompt_instructions}\n${service_registry}`;

//export const sendMessage = async () => {};
export async function sendMessage(message: string): Promise<{
      id: number;
      role: 'user' | 'assistant';
      display: ReactNode;
}> {
  const history = getMutableAIState<typeof AI>();

  console.log('-> Fetch service registry');
  fetchServiceRegistry();
  content = `${prompt_instructions}\n${service_registry}`;


  history.update([
    ...history.get(),
    {
      role: 'user',
      content: message,
    }
  ]);

  const reply = await streamUI({
    model: openai('gpt-4o'),
    messages: [
      {
        role: "system",
        content,
        toolInvocations: []
      },
      ...history.get(),] as CoreMessage[],
    initial: (
      <BotMessage className="items-center flex shrink-0 select-none justify-center ">
        <Loader2 className="w-5 animate-spin stroke-zinc-500" />
      </BotMessage>
    ),
    text: ({content, done}) => {
      if (done) {
        history.done([...history.get(), {role: "assistant", content}]);
      }
      return (<BotMessage> {content} </BotMessage>)
    },
    temperature: 0.0,
    tools: {
      get_crypto_price: {
        description: "Get the price of a cryptocurrency",
        parameters: z.object({
          symbol: z.string().describe("The symbol of the cryptocurrency"),
        }),
        generate: async function* ({symbol}: {symbol: string}) {
          console.log({symbol});
          yield <BotCard> <PriceSkeleton /> </BotCard>;

          const price = 231.4;
          const name = "Solana";
          const priceChangePercentage = 2.5;

          history.done([
            ...history.get(),
            {
              role: "assistant",
              name: "get_crypto_price",
              content: `[The price of ${symbol} is ${price}]`
            }
          ]);

          return (
            <BotCard>
              <Price name={name} symbol={symbol} currentPrice={price} priceChangePercentage={priceChangePercentage} />
            </BotCard>
          );

        }
      },
      show_freelancer_profile: {
        description: "Show the summary profile of a freelancer or AI agent",
        parameters: z.object({
          title: z.string().describe("The title of the freelancer or AI agent"),
          pricePerHour: z.number().describe("The price per hour of the freelancer"),
          experience: z.string().describe("The experience of the freelancer"),
          matchScore: z.number().describe("Give a match score of the freelancer to the user's task"),
          rating: z.number().describe("The rating of the freelancer"),
          walletAddress: z.string().describe("The wallet address of the freelancer"),
        }),
        generate: async function* ({title, pricePerHour, experience, rating, matchScore, walletAddress}: {title: string, pricePerHour: number, experience: string, rating: number, matchScore: number, walletAddress: string}) {
          console.log({title, pricePerHour, experience, rating, matchScore, walletAddress});
          yield <BotCard> Loading... </BotCard>;


          history.done([
            ...history.get(),
            {
              role: "assistant",
              name: "show_freelancer_profile",
              content: "" //`[The profile of the freelancer with the following details is shown to the user - don't use this to suggest a freelancer, but use the service registry instead: title: ${title}, pricePerHour: ${pricePerHour}, experience: ${experience}, rating: ${rating}, matchScore: ${matchScore}, walletAddress: ${walletAddress} ]`
            }
          ]);

          return (
            <BotCard>
              <FreelancerProfileCard title={title} pricePerHour={pricePerHour} experience={experience} rating={rating} matchScore={matchScore} walletAddress={walletAddress} />
            </BotCard>
          );

        }
      },
    },
  });

  return {
    id: Date.now(),
    role: 'assistant' as const,
    display: reply.value,

  };
}


export type AIState = Array<{
  id?: number;
  name?: "get_crypto_price" | "get_crypto_stats" | "show_freelancer_profile";
  role?: "user" | "assistant" | "system";
  content?: string;
}>;

export type UIState = Array<{
  id?: number;
  role?: "user" | "assistant";
  display?: ReactNode;
  toolInvocations?: ToolInvocation[];
}>;


export const AI = createAI({
  initialAIState: [] as AIState,
  initialUIState: [] as UIState,
  actions: {
    sendMessage,
  }

});
