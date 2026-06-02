import { answer } from "./chain";


export const testAnswer = async (env:any) => {
  try {
    const result = await answer("اذا صمنا عرفة في العشر الأواخر من رمصان، هل يمكن جمع نية الصيام معا ام لا", env);
    
    console.log(result);
  } catch (err) {
    console.error(err);
  }
};

testAnswer(process.env);