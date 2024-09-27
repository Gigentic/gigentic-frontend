import { 
  Message as VercelChatMessage,
} from 'ai';

import { PromptTemplate } from "@langchain/core/prompts";
import { HttpResponseOutputParser } from "langchain/output_parsers";
//import { ChatOpenAI } from "@langchain/openai";
import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 60;

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};

const parser = new HttpResponseOutputParser();

const TEMPLATE = `
  You are a helpful assistant.

  Chat History:
  {chat_history}

  User: {input}

  Assistant:
  `;


export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();
  //const { messages } = await req.json();


  //const formattedPreviousMessages = messages.slice(0, -1).map(formatMessage);
  //const currentMessageContent = messages[messages.length - 1].content;

  //const prompt = PromptTemplate.fromTemplate(TEMPLATE);

  /*
  const model = new ChatOpenAI({ 
    apiKey: process.env.OPENAI_API_KEY,
    model: 'gpt-4o',
    streaming: true,
    verbose: true,
  });

  const chain = prompt.pipe(model).pipe(parser);

  const rawStream = await chain.stream({
    chat_history: formattedPreviousMessages.join('\n'),
    input: currentMessageContent
  });
  */

 // export async function POST(req: Request) {
 //   const { prompt }: { prompt: string } = await req.json();
  
    const result = await streamText({
      model: openai('gpt-4o'),
      prompt: prompt,
    });
  

    //console.log("result: ", result);
    console.log("result.toTextStreamResponse(): ", result.toTextStreamResponse());
    return result.toTextStreamResponse();

  

  //return streamText.toDataStreamResponse(rawStream);

  //return new Response(rawStream);
}



