import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { getRetriever } from "./retriever";
import { getLLM } from "./llm";

export async function answer(userQ: string, env: any) {
  try {
    const llm = getLLM(env);
    const retriever = getRetriever(env);
    // ==> STEP: 1, Handle the user question (translate | make standalone question | answer general qustions) <==

    const orchestratorPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `أنت شيخ خبير. وظيفتك هي تحليل سؤال المستخدم وتحديد الخطوة القادمة بدقة.
        يجب أن يكون ردك عبارة عن كائن JSON فقط وحصراً بالهيكل التالي دون أي نص خارجي:
        {{
          "requiresSearch": true أو false,
          "processedQuery": "السؤال المترجم والمختصر باللغة العربية إذا كان يحتاج بحث، وإلا اتركه فارغاً",
          "generalResponse": "الرد العام إذا كان السؤال لا يحتاج بحث (مثل التحيات)، وإلا اتركه فارغاً"
        }}

      القواعد:
        1. إذا كان السؤال عاماً (تحية، سؤال عن الحال، من أنت.. إلخ)، اجعل "requiresSearch" تساوي false واكتب الرد في "generalResponse".
        2. إذا كان السؤال شرعياً يتطلب بحثاً في الكتب، اجعل "requiresSearch" تساوي true، وقم بترجمته واختصاره في "processedQuery".`,
      ],
      [
        "human",
        `
         سؤال المستخدم : {userQ}
        `,
      ],
    ]);

    // @ts-ignore
    const orchestratorChain = orchestratorPrompt.pipe(llm);

    const result = await orchestratorChain.invoke({ userQ });
    const response = JSON.parse(result.content as string);
    console.log(response);

    if (!response.requiresSearch) {
      console.log(
        "Skipped searching over vDB. user question doesn`t require that ⚡",
      );
      return response.generalResponse;
    }

    // ==> STEP: 2, Handling retriever (In case we need to query the vDB) <==
    // @ts-ignore
    const docs = await retriever.invoke(response.processedQuery);
    const context = docs.map((item: any) => item.pageContent).join("\n\n");

    // ==> STEP: 3, Handling answer <==
    const answerPrompt = ChatPromptTemplate.fromMessages([
      [
        "system",

        `أنت مساعد دقيق و لطيف. أجب على سؤال المستخدم بناءً على السياق المرفق  .
         شريطة أن تلتزم بالصياغة اللفظية والترتيب المذكور في النصوص المسترجعة قدر الإمكان ، خاصة في المتون والعناوين الرئيسية.
         أجعل الإجابة في فقرات يسهل قراءتها..

         القواعد : 
         - أهم شئ عندك هو التوحيد، بغض النظر عن حالة سؤال المستخدم، فمهمتك أن ترشد الناس لتوحيد اللع تعالى و هذه هي الغاية الكبرى منك. كن منتبهاً للأجوبة التي تصدرها هل هي مواقفة لتوحيد الله تعالى أم لا
         - تأكد دائماً و أبداً أن إجابتك توافق الحكم الشرعي في الكتاب و السنة
`,
      ],
      [
        "human",
        `
        سؤال المستخدم : {userQ}.
        السياق : {context}
        `,
      ],
    ]);

    // @ts-ignore 
     const answerChain = await answerPrompt.pipe(llm).pipe(new StringOutputParser());

    const finalAnswer = await answerChain.invoke({
      userQ,
      context,
    });

    return finalAnswer;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
