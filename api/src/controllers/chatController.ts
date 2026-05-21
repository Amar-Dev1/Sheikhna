import { Context } from "hono";
import { chatService } from "../services/chatService";

export const chatController = async (c: Context) => {
  try {
    const { msg }: any = await c.req.json();
    const answer = await chatService(msg, c.env);
    
    return c.json({ answer });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
};
