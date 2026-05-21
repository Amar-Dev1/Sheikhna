/// <reference types="@cloudflare/workers-types" />
import { Hono } from "hono";
import { cors } from "hono/cors";
import { chatController } from "./controllers/chatController";

type Bindings = {
  CHAT_SUMMARY_KV: KVNamespace;
  GROQ_API_KEY: string;
  HUGGINGFACE_API_KEY: string;
  SUPABASE_API_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("*", cors());

app.get("/z", (c) => {
  return c.text("Server is healthy !");
});

app.post("/api/v1/chat", chatController);

export default app;
