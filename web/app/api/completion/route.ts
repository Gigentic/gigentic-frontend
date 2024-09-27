import { 
  convertToCoreMessages,
  Message as VercelChatMessage,
} from 'ai';


import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export const maxDuration = 60;

const formatMessage = (message: VercelChatMessage) => {
  return `${message.role}: ${message.content}`;
};




export async function POST(req: Request) {
  const { messages }: { messages: VercelChatMessage[] } = await req.json();

  
    const result = await streamText({
      model: openai('gpt-4o'),
      messages: convertToCoreMessages(messages),
    });
  
    return result.toTextStreamResponse();

}



