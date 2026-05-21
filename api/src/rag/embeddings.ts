import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";

export function getEmbeddings(env: any) {
  return new HuggingFaceInferenceEmbeddings({
    apiKey: env.HUGGINGFACE_API_KEY,
    model: "Omartificial-Intelligence-Space/GATE-AraBert-v1",
    provider: "hf-inference",
  });
}
