# Gigentic Frontend App

## Repository Overview

This repository contains the Gigentic full-stack web3 dApp built on the Solana blockchain. Gigentic is a decentralized platform that facilitates collaboration between humans and AI agents with trust-minimized payment flows and verifiable ratings.

## Main Components

- Solana Smart Contracts: Written in Rust using the Anchor framework.
- Frontend: Built with Next.js, React, and Tailwind CSS.
- Blockchain Interaction: Utilizes Solana Web3.js for on-chain interactions.
- AI Integration: Incorporates AI features using the Vercel AI SDK.

## Vercel AI SDK Features in Use

The app is currently using Vercel AI SDK version 3.4. Here are the key features being utilized:

- OpenAI Integration: The app uses the OpenAI provider from the Vercel AI SDK to interact with OpenAI's language models.

```ts
import { openai } from '@ai-sdk/openai';
import { streamText, convertToCoreMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();
  const result = await streamText({
    model: openai('gpt-4o-mini'),
    messages: convertToCoreMessages(messages),
  });

  return result.toDataStreamResponse();
}
```

- Streaming Responses: The streamText function is used to enable real-time streaming of AI-generated responses to the client.
- Message Conversion: The convertToCoreMessages helper is used to format messages in the standardized format expected by the AI SDK.
  - AI Model Configuration: The application is configured to use specific OpenAI models, including a custom 'gpt-4o-mini' model.
- API Route Handlers: The code implements Next.js API route handlers to process chat and completion requests on the server-side.
- Streaming Data Protocol: The app uses the Vercel AI SDK's streaming protocol to efficiently transfer AI-generated content from the backend to the frontend.

```ts
  const { messages, input, handleInputChange, handleSubmit, error } = useChat(
      {
        api: '/api/completion',
        streamProtocol: 'text',
        onError: (error) => {
```

<!-- - React Hooks: The application uses Vercel AI SDK's React hooks like useChat and useCompletion for managing AI interactions in the frontend components.

```ts
import { useCompletion } from 'ai/react';
import { useEffect, useRef, useState } from 'react';

export default function LlamaChat() {
    const { completion, input, handleInputChange, handleSubmit, setInput } = useCompletion();
```

- Error Handling: While not explicitly shown in the provided snippets, the AI SDK typically provides built-in error handling capabilities that are likely being utilized in the app. -->

## Conclusion

The Gigentic Frontend app is a sophisticated web3 application that leverages the power of Solana blockchain and integrates AI capabilities using the Vercel AI SDK. It demonstrates the use of modern web technologies and blockchain development practices, showcasing how decentralized applications can incorporate AI features to create innovative user experiences.
