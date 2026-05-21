import { answer } from "../rag/chain";

export const chatService = async (msg: string, env: any) => {
  try {
    return await answer(msg, env);
  } catch (err) {
    console.error(err);
    throw err;
  }
};
