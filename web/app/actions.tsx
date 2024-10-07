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
import FreelancerProfile3Cards from "../components/ui/freelancer-profile-3-cards";

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
let content = ``;

// gives it the context for tool callin
const prompt_instructions = `\
  You are a assistant helping users finding the right freelancer for their project/task.

    If the user is looking for help / a freelancer, look for the right freelancer or AI agent in the service registry and show a summary of the profile to the user by calling \`show_freelancer_profile\`, never return a profile summary in text format. Always give a only 1 option to the user to choose from.
    If the user wants the price of a cryptocurrency, call \`get_crypto_price\` to show the price of the cryptocurrency.
    If the user wants anything else unrelated to the functions calls \`get_crypto_price\` or \`show_freelancer_profile\`, you should chat with the user. Answer any
    questions they may have that are unrelated to cryptocurrencies or freelancers.

`;


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

    const paymentAddress = serviceAddress.toString()
    console.log('Service Account Address:', paymentAddress);

    const serviceAccount =
      await program.account.service.fetch(serviceAddress);
    // console.log('Service Account Unique ID:', serviceAccount.uniqueId);
    //console.log('Service Account Description:', serviceAccount.description);
    service_registry += `\n${serviceAccount.description} | paymentWalletAddress: ${paymentAddress}`;
    //console.log('\nService Registry:', service_registry);

    //console.log('Service Account Price:', serviceAccount.price.toString());
    // console.log('Service Account Mint:', serviceAccount.mint.toString());
  }
  //console.log('\nService Registry:', service_registry);
  return service_registry
}


//export const sendMessage = async () => {};
export async function sendMessage(message: string): Promise<{
      id: number;
      role: 'user' | 'assistant';
      display: ReactNode;
}> {
  const history = getMutableAIState<typeof AI>();

  console.log('-> Fetch service registry');
  content = await fetchServiceRegistry();
  //content = `${prompt_instructions}\n${service_registry}`;

  console.log('--> Content:', content);

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
          paymentWalletAddress: z.string().describe("The paymentWalletAddress of the freelancer, not the chatWalletAddress."),
        }),
        generate: async function* ({title, pricePerHour, experience, rating, matchScore, paymentWalletAddress}: {title: string, pricePerHour: number, experience: string, rating: number, matchScore: number, paymentWalletAddress: string}) {
          console.log({title, pricePerHour, experience, rating, matchScore, paymentWalletAddress});
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
              <FreelancerProfileCard title={title} pricePerHour={pricePerHour} experience={experience} rating={rating} matchScore={matchScore} paymentWalletAddress={paymentWalletAddress} />
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
