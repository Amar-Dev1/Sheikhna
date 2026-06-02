import { ChatGroq } from "@langchain/groq";

export function getLLM(env: any) {
  const primaryLLM = new ChatGroq({
    apiKey: env.GROQ_API_KEY,
    model: "openai/gpt-oss-120b",
    temperature: 0.1,
    maxRetries: 0,
    callbacks: [
      {
        handleLLMError: (err: any) => {
          console.error(
            `Error on Primary LLM : gpt-oss-120b`,
            JSON.stringify(err, null, 2),
          );
        },
      },
      {
        handleLLMStart : ()=>{
          console.log('Starting with the primary llm : openai/gpt-oss-120b');
          
        }

      }
    ],
  });

  const fallbackLLM = new ChatGroq({
    apiKey: env.GROQ_API_KEY,
    model: "llama-3.1-8b-instant",
    temperature: 0.1,
    maxRetries: 0,
    callbacks: [
      {
        handleLLMError: (err: any) => {
          console.error(
            `Error on Primary LLM : llama-3.1-8b-instant`,
            JSON.stringify(err, null, 2),
          );
        },
      },
      {
        handleLLMStart: ()=>{
          console.log('starting fallback LLM with : llama-3.1-8b-instant');         
        }
      }
    ],
  });

  return primaryLLM.withFallbacks({
    fallbacks: [fallbackLLM]
  })
}
