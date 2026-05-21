import { getEmbeddings } from "./embeddings";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ApplyDualTrack } from "../utils/applyDualTrack";
import { Context } from "hono";

const run = async (c: Context) => {
  const supabaseClient = createClient(
    c.env.SUPABASE_URL as string,
    c.env.SUPABASE_API_KEY as string,
  );

  const embeddings = getEmbeddings(c.env);

  // 1. Reading the json
  const rawData = fs.readFileSync("./docs/some.json", "utf-8");
  const jsonData = JSON.parse(rawData);

  // 2. cleaning the text from Tashkeel
  const cleanDocs = ApplyDualTrack(jsonData);

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await splitter.splitDocuments(cleanDocs);

  console.log(`Uploading ${docs.length} vectors to DB...`);

  const batchSize = 100; // batch size
  const totalDocs = docs.length;

  for (let i = 0; i < totalDocs; i += batchSize) {
    // 1. uploaded in batches
    const batch = docs.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(totalDocs / batchSize);

    console.log(`Uploading ${batchNumber} form ${totalBatches}`);

    // 2. upload the current batch
    await SupabaseVectorStore.fromDocuments(batch, embeddings, {
      client: supabaseClient,
      tableName: "documents",
      queryName: "match_documents",
    });

    console.log(`Sucessfuly uploaded Batch no.${batchNumber}`);

    // 3. delay
    if (i + batchSize < totalDocs) {
      console.log("Waiting 2 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  console.log("Successfully upload the whole json file 🚀");
};

run();
