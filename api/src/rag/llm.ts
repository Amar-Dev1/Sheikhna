import { ChatGroq } from "@langchain/groq";

export function getLLM(env: any) {
  return new ChatGroq({
    apiKey: env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
  });
}