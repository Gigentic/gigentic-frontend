/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use server';

import { z } from 'zod';
import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

import type { CoreMessage, ToolInvocation } from 'ai';
import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';

import { AnchorProvider } from '@coral-xyz/anchor';
import { AnchorWallet } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

import { getGigenticProgram } from '@gigentic-frontend/anchor';

import {
  BotCard,
  AgentMessage,
  BotMessage,
} from '@/components/service-discovery/llm/message';
import FreelancerProfileCard from '@/components/service-discovery/freelancer-profile-card';

let content = ``;

// read the service registry from the blockchain
async function fetchServicesFromRegistry(endpoint: string) {
  const connection = new Connection(endpoint);
  const provider = new AnchorProvider(connection, {} as AnchorWallet, {
    commitment: 'confirmed',
  });
  const program = getGigenticProgram(provider);

  // Get registry address from environment directly
  const serviceRegistryPubKey = new PublicKey(
    process.env.NEXT_PUBLIC_SERVICE_REGISTRY_PUBKEY!,
  );
  if (!serviceRegistryPubKey) {
    throw new Error('Service registry address not configured');
  }

  const serviceRegistry = await program.account.serviceRegistry.fetch(
    serviceRegistryPubKey,
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

// First, define the message type interface
interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  name?: 'show_freelancer_profile' | 'meme_agent';
}

export type AIState = Array<AIMessage>;

export async function sendMessage(
  message: string,
  endpoint: string,
): Promise<{
  id: number;
  role: 'user' | 'assistant';
  display: ReactNode;
}> {
  const history = getMutableAIState<typeof AI>();
  const TIMEOUT_MS = 60000;
  const currentMessages = history.get();

  console.log('Current messages:', currentMessages);
  console.log('Incoming message:', message);

  // Check if this is the first message in meme agent chat
  const isMemeAgentChat = currentMessages.some(
    (msg) => msg.name === 'meme_agent',
  );
  console.log('Is meme agent chat?', isMemeAgentChat);

  // Only initialize meme agent if we're in meme agent mode
  if (!isMemeAgentChat && message === 'init meme agent') {
    console.log('Initializing meme agent...');
    history.update([
      ...currentMessages,
      {
        role: 'system',
        name: 'meme_agent',
        content:
          'You are a meme coin analysis agent specialized in Solana tokens.',
      },
    ]);

    return {
      id: Date.now(),
      role: 'assistant',
      display: (
        <AgentMessage>
          👋 Connected to Meme Coin Recommender. How can I help you analyze meme
          coins today?
        </AgentMessage>
      ),
    };
  }

  // Check if we're in meme agent mode
  const isMemeAgent = currentMessages.some((msg) => msg.name === 'meme_agent');
  console.log('Is meme agent mode?', isMemeAgent);

  if (isMemeAgent) {
    // Add the user message to history while preserving existing messages
    const updatedMessages = [
      ...currentMessages,
      {
        role: 'user',
        content: message,
        name: 'meme_agent',
      },
    ];
    history.update(updatedMessages as AIState);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

      const agentHandle = process.env.ASSISTERR_AGENT_HANDLE!;

      console.log('agentHandle', agentHandle);
      // Simple fetch and stream approach
      const response = await fetch(
        `https://api.assisterr.ai/api/v1/slm/${agentHandle}/chat/stream`,
        {
          method: 'POST',
          headers: {
            'X-Api-Key': process.env.ASSISTERR_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            query: message,
          }),
        },
      );

      console.log('response', response);
      if (!response.ok) {
        return {
          id: Date.now(),
          role: 'assistant' as const,
          display: (
            <BotMessage>
              Sorry, there was an error contacting the Meme Agent.
            </BotMessage>
          ),
        };
      }

      // Just stream the response directly
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let content = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Parse the JSON chunks and extract just the message
        const chunk = decoder.decode(value);
        try {
          const jsonChunk = JSON.parse(chunk);
          content += jsonChunk.message || '';
        } catch (e) {
          console.error('Error parsing chunk:', e);
        }
      }

      clearTimeout(timeoutId);
      return {
        id: Date.now(),
        role: 'assistant' as const,
        display: <AgentMessage>{content}</AgentMessage>,
      };
    } catch (error) {
      // ... error handling
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    // provide the service registry as context to the LLM
    content = await fetchServicesFromRegistry(endpoint);

    history.update([
      ...history.get(),
      {
        role: 'user',
        content: message,
      },
    ]);

    // call the LLM
    const reply = await streamUI({
      model: openai('gpt-4o', {
        // Disable parallel tool calls
        parallelToolCalls: false,
      }),
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
            serviceAccountAddress: z
              .string()
              .describe('The serviceAccountAddress of the freelancer'),
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
                  // rating={rating}
                  rating={4.6}
                  matchScore={matchScore}
                  serviceAccountAddress={serviceAccountAddress}
                />
              </BotCard>
            );
          },
        },
      },
    });

    clearTimeout(timeoutId);
    return {
      id: Date.now(),
      role: 'assistant' as const,
      display: reply.value,
    };
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(
        'Request timed out. Please try again with a shorter message.',
      );
    }
    if (
      error instanceof Error &&
      error.message?.includes('Connection closed')
    ) {
      throw new Error('Connection was interrupted. Please try again.');
    }
    throw error;
  }
}

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
