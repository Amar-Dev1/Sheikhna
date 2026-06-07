import { answer } from "./chain";


export const testAnswer = async (env:any) => {
  try {
    const result = await answer("هل يصح حلق لحية الرجل", env);
    
    console.log(result);
  } catch (err) {
    console.error(err);
  }
};

testAnswer(process.env);