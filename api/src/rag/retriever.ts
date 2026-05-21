import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { getEmbeddings } from "./embeddings";
import { createClient } from "@supabase/supabase-js";

export function getRetriever(env: any) {
  const sbUrl = env.SUPABASE_URL as string;
  const sbApiKey = env.SUPABASE_API_KEY as string;

  const client = createClient(sbUrl, sbApiKey);

  const vectorStore = new SupabaseVectorStore(getEmbeddings(env), {
    client,
    tableName: "documents",
    queryName: "match_documents",
  });

  return vectorStore.asRetriever({
    k: 10,
  });
}
