import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { embeddings } from "./embeddings";
import { stripTashkeel } from "../utils/applyDualTrack";

try {
  const file = fs.readFileSync(
    "/home/amaryi/projects/Sheikhna/docs/some.txt",
    "utf-8",
  );

  const processeFile = stripTashkeel(file);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 400,
  });

  const output = await splitter.createDocuments(
    [processeFile],
    [{ source: "العروة الوثقى", type: "book" }],
  );

  const sbUrl = process.env.SUPABASE_URL as string;
  const sbApiKey = process.env.SUPABASE_API_KEY as string;

  const client = createClient(sbUrl, sbApiKey);

  console.log(`Uploading ${output.length} vectors...`);
  await SupabaseVectorStore.fromDocuments(output, embeddings, {
    client,
    tableName: "documents",
    queryName: "match_documents",
  });

  console.log("Uploaded process is finished 🚀✅");
} catch (err) {
  console.error(err);
}
