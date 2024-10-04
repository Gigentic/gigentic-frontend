'use server';

import { createAI } from 'ai/rsc';
import { ToolInvocation } from "ai";
import { ReactNode } from "react";

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

export const sendMessage = async () => {};

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
  actions: {}
  
});