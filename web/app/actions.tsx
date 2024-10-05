'use server';

import { createAI, getMutableAIState, streamUI } from 'ai/rsc';
import type { CoreMessage, ToolInvocation } from "ai";
import { ReactNode } from "react";
import { openai } from "@ai-sdk/openai";
import { BotCard, BotMessage } from "../components/llm/message";
import { Loader2 } from "lucide-react";
import { z } from "zod";

// this is the system message we send to the LLM to instantiate it
// gives it the context for tool callin

const content = `\
  You are a crypto bot and you can help users get the price of cryptocurrencies, besides that you can also chat with users.
  
  Messages inside [] means that it's a UI element of a user event. For example:
    - "[Price of BTC] = 69696" means that the interface of the cryptocurrency price of BTC is shown to the user
    - "[Stats of BTC]" means that the interface of the cryptocurrency stats of BTC is shown to the user

    If the user wants the price, call \`get_crypto_price\` to show the price of the cryptocurrency.
    If the user wants the market cap or stats of a given cryptocurrency, call \`get_crypto_stats\` to show the stats of the cryptocurrency.
    If the user wants a stock price, it is an impossible task, so you should respond that you cannot do it.
    If the user wants anything else unrelated to the functions calls \`get_crypto_price\` or \`get_crypto_stats\`, you should chat with the user. Answer any 
    questions they may have that are unrelated to cryptocurrency.
`;

//export const sendMessage = async () => {};
export async function sendMessage(message: string): Promise<{
      id: number;
      role: 'user' | 'assistant';
      display: ReactNode;
}> {
  const history = getMutableAIState<typeof AI>();
  
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
          yield 
            <BotCard> Loading..</BotCard>;

            return null;
          
        }
      },
      get_crypto_stats: {
        description: "Get the market cap and other stats of a cryptocurrency",
        parameters: z.object({
          slug: z.string().describe("The name of the cryptocurrency in lower case"),
        }),
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
  name?: "get_crypto_price" | "get_crypto_stats";
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