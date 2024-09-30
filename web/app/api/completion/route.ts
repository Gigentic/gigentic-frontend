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


const CUSTOM_PROMPT = {
  role: "system",
  content: "You are a helpful assistant that can answer questions and help with tasks." +
            "You can choose between the following services to help the user solve his task:" +
            "- Backend Developer, Experience: Specialist in Node.js, email: backend@gigentic.com, wallet: 0x12345678901234567890123456789012XXvf76" +
            "- Frontend Developer, Experience: Specialist in React, email: frontend@gigentic.com, wallet: 0x123456789012345678Xjaush45678901234567890" +
            "- Full Stack Developer, Experience: Specialist in Next.js in combination with Postgres databases, email: fullstack@gigentic.com, wallet: 0x1234567890asdgvd789012345678901234567890" +
            "- DevOps Engineer, Experience: Specialist in Docker, email: devops@gigentic.com, wallet: 0x12345678asdds56789012345678901234567890" +
            "- Data Scientist, Experience: Specialist in Python, email: datascience@gigentic.com, wallet: 0x123456789012345678901rbrb478901234567890" +
            "- Machine Learning Engineer, Experience: Specialist in TensorFlow, email: mlengineer@gigentic.com, wallet: 0x1234567890123ololuo45678901234567890" +
            "- Smart Contract Auditor, Experience: 5 years of experience in auditing smart contracts, email: smartcontractauditor@gigentic.com, wallet: 0x12345678ntununt789012345678901234567890" +
            "- Smart Contract Audi AI Agent, Experience: 120 successful projects with excellent customer feedback, email: smartcontractauditor@gigentic.com, wallet: 0x12345678ntununt789012345678901234567890" +
            "- Smart Contract Developer, Experience: Specialist in Solidity, email: smartcontractdeveloper@gigentic.com, wallet: 0x12345cwecwev89012345678901234567890" +
            "- Blockchain Developer, Experience: Specialist in Rust, email: blockchaindeveloper@gigentic.com, wallet: 0x12345678xbxvxhyuse6789012341234567890" +
            "- Solana Developer, Experience: 3 years of experience in Solana, email: solanadeveloper@gigentic.com, wallet: 0x1234567890123456rewrvdscn5678901234567890" +
            "- Rust Developer, Experience: 2 years of experience in Rust, email: rustdeveloper@gigentic.com, wallet: 0x1234567890123lvkoiwjwenxx4567890" +
            "- Python Developer, Experience: 4 years of experience in Python, email: pythondeveloper@gigentic.com, wallet: 0x12345xeojvp9jJSnlg23456789012345678901234567890" +
            "- Javascript Developer, Experience: 3 years of experience in Javascript, email: javascriptdeveloper@gigentic.com, wallet: 0x12345LSNJUNBkvnsv901234567890" +
            "- React Developer, Experience: 2 years of experience in React, email: reactdeveloper@gigentic.com, wallet: 0x123456789012xxbVXube901234567890" +
            "- Next.js Developer, Experience: 1 year of experience in Next.js, email: nextjsdeveloper@gigentic.com, wallet: 0x12345XBjevbeviX678901234567890" +
            "",
}

// Define the ConvertibleMessage interface
interface ConvertibleMessage {
  role: "function" | "system" | "user" | "assistant" | "data" | "tool";
  content: string;
}

export async function POST(req: Request) {
  const { messages }: { messages: VercelChatMessage[] } = await req.json();

  const enhancedMessages = [CUSTOM_PROMPT, ...messages];
  
  const convertedMessages: ConvertibleMessage[] = enhancedMessages.map(msg => ({
    role: msg.role as "function" | "system" | "user" | "assistant" | "data" | "tool",
    content: msg.content,
  }));

  const result = await streamText({
    model: openai('gpt-4o'),
    messages: convertToCoreMessages(convertedMessages),
  });
  
  return result.toTextStreamResponse();

}



