'use server';

import { z } from 'zod';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

import type { CoreMessage, ToolInvocation } from 'ai';
import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';

import { AnchorProvider } from '@coral-xyz/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL } from '@solana/web3.js';

import { getGigenticProgram } from '@gigentic-frontend/anchor';

import {
  BotCard,
  BotMessage,
} from '@/components/service-discovery/llm/message';
import FreelancerProfileCard from '@/components/service-discovery/freelancer-profile-card';

// read the service registry from the blockchain
async function fetchServicesFromRegistry(endpoint: string) {
  const connection = new Connection(endpoint);
  const provider = new AnchorProvider(connection, {} as AnchorWallet, {
    commitment: 'confirmed',
  });
  const program = getGigenticProgram(provider);

  // Get registry address from environment directly
  const serviceRegistryPubkey = process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY;
  if (!serviceRegistryPubkey) {
    throw new Error('Service registry address not configured');
  }

  const serviceRegistry = await program.account.serviceRegistry.fetch(
    serviceRegistryPubkey,
  );

  // Fetch all services in one RPC call using getMultiple
  const services = await program.account.service.fetchMultiple(
    serviceRegistry.serviceAccountAddresses,
  );

  // Add helper function to convert Lamports to SOL
  function lamportsToSol(lamports: number): string {
    return (lamports / LAMPORTS_PER_SOL).toFixed(2);
  }

  // Modify the service registry string building
  return services.reduce(
    (acc, service, i) =>
      acc +
      `\n${service?.description} | serviceAccountAddress: ${serviceRegistry.serviceAccountAddresses[i]} | pricePerHour: ${service?.price ? lamportsToSol(service.price.toNumber()) : 0} SOL`,
    '',
  );
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
    const servicesContent = await fetchServicesFromRegistry(endpoint);

    history.update([
      ...history.get(),
      {
        role: 'user',
        content: message,
      },
    ]);

    // call the LLM
    const reply = await streamUI({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'system',
          content: servicesContent,
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
          history.done([...history.get(), { role: 'assistant', content }]);
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
            serviceAccountAddress: z
              .string()
              .describe('The serviceAccountAddress of the freelancer.'),
          }),
          generate: async function* ({
            title,
            pricePerHour,
            experience,
            rating,
            matchScore,
            serviceAccountAddress,
          }: {
            title: string;
            pricePerHour: number;
            experience: string;
            rating: number;
            matchScore: number;
            serviceAccountAddress: string;
          }) {
            console.log({
              title,
              pricePerHour,
              experience,
              rating,
              matchScore,
              serviceAccountAddress,
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
                  serviceAccountAddress={serviceAccountAddress}
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
  name?: 'show_freelancer_profile';
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
