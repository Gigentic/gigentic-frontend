'use server';

import { z } from 'zod';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

import type { CoreMessage, ToolInvocation } from 'ai';
import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';

import { AnchorProvider } from '@coral-xyz/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Connection } from '@solana/web3.js';

import { getGigenticProgram } from '@gigentic-frontend/anchor';

import {
  BotCard,
  BotMessage,
} from '@/components/service-discovery/llm/message';
import FreelancerProfileCard from '@/components/service-discovery/freelancer-profile-card';
import FreelancerProfile3Cards from '@/components/service-discovery/freelancer-profile-3-cards';

let service_registry = '';
let content = ``;

export async function fetchServiceRegistryPubkey() {
  // Load service registry public key from environment variable
  const serviceRegistryPubkey = process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY;
  if (!serviceRegistryPubkey) {
    throw new Error(
      'NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY is not set in environment variables',
    );
  }

  console.log('serviceRegistryPubkey', serviceRegistryPubkey.toString());

  return serviceRegistryPubkey.toString();
}

// read the service registry from the blockchain
async function fetchServiceRegistry(endpoint: string) {
  const connection = new Connection(endpoint);
  const provider = new AnchorProvider(connection, {} as AnchorWallet, {
    commitment: 'confirmed',
  });
  const program = getGigenticProgram(provider);

  console.log('========== Fetch service registry');
  const serviceRegistry = await program.account.serviceRegistry.fetch(
    await fetchServiceRegistryPubkey(),
  );

  for (const serviceAddress of serviceRegistry.serviceAccountAddresses) {
    const paymentAddress = serviceAddress.toString();
    console.log('Service Account Address:', paymentAddress);

    const serviceAccount = await program.account.service.fetch(serviceAddress);

    service_registry += `\n${serviceAccount.description} | paymentWalletAddress: ${paymentAddress}`;
  }

  return service_registry;
}

//export const sendMessage = async () => {};
export async function sendMessage(
  message: string,
  endpoint: string,
): Promise<{
  id: number;
  role: 'user' | 'assistant';
  display: ReactNode;
}> {
  const history = getMutableAIState<typeof AI>();

  try {
    // provide the service registry as context to the LLM
    content = await fetchServiceRegistry(endpoint);

    history.update([
      ...history.get(),
      {
        role: 'user',
        content: message,
      },
    ]);

    // call the LLM
    const reply = await streamUI({
      model: openai('gpt-4o-mini'),
      messages: [
        {
          role: 'system',
          content,
          toolInvocations: [],
        },
        ...history.get(),
      ] as CoreMessage[],
      initial: (
        <BotMessage className="items-center flex shrink-0 select-none justify-center">
          <Loader2 className="w-5 animate-spin stroke-zinc-500" />
        </BotMessage>
      ),
      text: ({ content, done }) => {
        if (done) {
          history.done([
            ...history.get(),
            { role: 'assistant', content: content },
          ]);
        }

        // Format the content for display
        const formattedContent = content
          .replace(
            /(\d+\.\s\*\*(.*?)\*\*:)/g,
            (match, p1, p2) => `<strong>${p2}:</strong>`,
          )
          .replace(
            /(\*\*(.*?)\*\*)/g,
            (match, p1, p2) => `<strong>${p2}</strong>`,
          )
          .replace(/\n/g, '<br />');

        return (
          <BotMessage>
            <span dangerouslySetInnerHTML={{ __html: formattedContent }} />
          </BotMessage>
        );
      },
      temperature: 0.0,
      tools: {
        // tool to show the summary profile of exactly one freelancer or the profile of one AI agent
        show_freelancer_profile: {
          description:
            'Show the summary profile of exactly one freelancer or the profile of one AI agent',
          parameters: z.object({
            title: z
              .string()
              .describe('The title of the freelancer or AI agent'),
            pricePerHour: z
              .number()
              .describe('The price per hour of the freelancer'),
            experience: z.string().describe('The experience of the freelancer'),
            matchScore: z
              .number()
              .describe(
                "Give a match score of the freelancer to the user's task",
              ),
            rating: z.number().describe('The rating of the freelancer'),
            paymentWalletAddress: z
              .string()
              .describe(
                'The paymentWalletAddress of the freelancer, not the chatWalletAddress.',
              ),
          }),
          generate: async function* ({
            title,
            pricePerHour,
            experience,
            rating,
            matchScore,
            paymentWalletAddress,
          }: {
            title: string;
            pricePerHour: number;
            experience: string;
            rating: number;
            matchScore: number;
            paymentWalletAddress: string;
          }) {
            console.log({
              title,
              pricePerHour,
              experience,
              rating,
              matchScore,
              paymentWalletAddress,
            });
            yield <BotCard> Loading... </BotCard>;

            history.done([
              ...history.get(),
              {
                role: 'assistant',
                name: 'show_freelancer_profile',
                content: '',
              },
            ]);

            return (
              <BotCard>
                <FreelancerProfileCard
                  title={title}
                  pricePerHour={pricePerHour}
                  experience={experience}
                  rating={rating}
                  matchScore={matchScore}
                  paymentWalletAddress={paymentWalletAddress}
                />
              </BotCard>
            );
          },
        },
        // tool to show the summary profiles of three freelancers next to each other
        show_three_freelancer_profiles: {
          description:
            'Show the summary profiles of exactly three freelancers or the profile of three AI agent',
          parameters: z.object({
            freelancer1_title: z
              .string()
              .describe('The title of the first freelancer'),
            freelancer1_pricePerHour: z
              .number()
              .describe('The price per hour of first freelancer'),
            freelancer1_experience: z
              .string()
              .describe('The experience of the first freelancer'),
            freelancer1_matchScore: z
              .number()
              .describe(
                "Give a match score of the first freelancer to the user's task",
              ),
            freelancer1_rating: z
              .number()
              .describe('The rating of the first freelancer'),
            freelancer1_paymentWalletAddress: z
              .string()
              .describe(
                'The paymentWalletAddress of the first freelancer, not the chatWalletAddress.',
              ),

            freelancer2_title: z
              .string()
              .describe('The title of the second freelancer'),
            freelancer2_pricePerHour: z
              .number()
              .describe('The price per hour of second freelancer'),
            freelancer2_experience: z
              .string()
              .describe('The experience of the second freelancer'),
            freelancer2_matchScore: z
              .number()
              .describe(
                "Give a match score of the second freelancer to the user's task",
              ),
            freelancer2_rating: z
              .number()
              .describe('The rating of the second freelancer'),
            freelancer2_paymentWalletAddress: z
              .string()
              .describe(
                'The paymentWalletAddress of the second freelancer, not the chatWalletAddress.',
              ),

            freelancer3_title: z
              .string()
              .describe('The title of the third freelancer'),
            freelancer3_pricePerHour: z
              .number()
              .describe('The price per hour of third freelancer'),
            freelancer3_experience: z
              .string()
              .describe('The experience of the third freelancer'),
            freelancer3_matchScore: z
              .number()
              .describe(
                "Give a match score of the third freelancer to the user's task",
              ),
            freelancer3_rating: z
              .number()
              .describe('The rating of the third freelancer'),
            freelancer3_paymentWalletAddress: z
              .string()
              .describe(
                'The paymentWalletAddress of the third freelancer, not the chatWalletAddress.',
              ),
          }),
          generate: async function* ({
            freelancer1_title,
            freelancer1_pricePerHour,
            freelancer1_experience,
            freelancer1_matchScore,
            freelancer1_rating,
            freelancer1_paymentWalletAddress,
            freelancer2_title,
            freelancer2_pricePerHour,
            freelancer2_experience,
            freelancer2_matchScore,
            freelancer2_rating,
            freelancer2_paymentWalletAddress,
            freelancer3_title,
            freelancer3_pricePerHour,
            freelancer3_experience,
            freelancer3_matchScore,
            freelancer3_rating,
            freelancer3_paymentWalletAddress,
          }: {
            freelancer1_title: string;
            freelancer1_pricePerHour: number;
            freelancer1_experience: string;
            freelancer1_matchScore: number;
            freelancer1_rating: number;
            freelancer1_paymentWalletAddress: string;
            freelancer2_title: string;
            freelancer2_pricePerHour: number;
            freelancer2_experience: string;
            freelancer2_matchScore: number;
            freelancer2_rating: number;
            freelancer2_paymentWalletAddress: string;
            freelancer3_title: string;
            freelancer3_pricePerHour: number;
            freelancer3_experience: string;
            freelancer3_matchScore: number;
            freelancer3_rating: number;
            freelancer3_paymentWalletAddress: string;
          }) {
            console.log({
              freelancer1_title,
              freelancer1_pricePerHour,
              freelancer1_experience,
              freelancer1_matchScore,
              freelancer1_rating,
              freelancer1_paymentWalletAddress,
              freelancer2_title,
              freelancer2_pricePerHour,
              freelancer2_experience,
              freelancer2_matchScore,
              freelancer2_rating,
              freelancer2_paymentWalletAddress,
              freelancer3_title,
              freelancer3_pricePerHour,
              freelancer3_experience,
              freelancer3_matchScore,
              freelancer3_rating,
              freelancer3_paymentWalletAddress,
            });
            yield <BotCard> Loading... </BotCard>;

            history.done([
              ...history.get(),
              {
                role: 'assistant',
                name: 'show_freelancer_profile',
                content: '',
              },
            ]);

            return (
              <BotCard>
                <FreelancerProfile3Cards
                  freelancer1_title={freelancer1_title}
                  freelancer1_pricePerHour={freelancer1_pricePerHour}
                  freelancer1_experience={freelancer1_experience}
                  freelancer1_matchScore={freelancer1_matchScore}
                  freelancer1_rating={freelancer1_rating}
                  freelancer1_paymentWalletAddress={
                    freelancer1_paymentWalletAddress
                  }
                  freelancer2_title={freelancer2_title}
                  freelancer2_pricePerHour={freelancer2_pricePerHour}
                  freelancer2_experience={freelancer2_experience}
                  freelancer2_matchScore={freelancer2_matchScore}
                  freelancer2_rating={freelancer2_rating}
                  freelancer2_paymentWalletAddress={
                    freelancer2_paymentWalletAddress
                  }
                  freelancer3_title={freelancer3_title}
                  freelancer3_pricePerHour={freelancer3_pricePerHour}
                  freelancer3_experience={freelancer3_experience}
                  freelancer3_matchScore={freelancer3_matchScore}
                  freelancer3_rating={freelancer3_rating}
                  freelancer3_paymentWalletAddress={
                    freelancer3_paymentWalletAddress
                  }
                />
              </BotCard>
            );
          },
        },
      },
    });

    return {
      id: Date.now(),
      role: 'assistant' as const,
      display: reply.value,
    };
  } catch (error) {
    console.error('Error in sendMessage:', error);
    throw error;
  }
}

export type AIState = Array<{
  id?: number;
  name?: 'get_crypto_price' | 'get_crypto_stats' | 'show_freelancer_profile';
  role?: 'user' | 'assistant' | 'system';
  content?: string;
}>;

export type UIState = Array<{
  id?: number;
  role?: 'user' | 'assistant';
  display?: ReactNode;
  toolInvocations?: ToolInvocation[];
}>;

export const AI = createAI({
  initialAIState: [] as AIState,
  initialUIState: [] as UIState,
  actions: {
    sendMessage,
  },
});
