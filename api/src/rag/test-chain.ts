import { Context } from "hono";
import { answer } from "./chain";

let env;
export const testAnswer = async (c:Context) => {
  try {
    const result = await answer("ماهي أحكام الصلاة ؟", c.env);
    env = c.env;
    console.log(result);
  } catch (err) {
    console.error(err);
  }
};

testAnswer(env!);