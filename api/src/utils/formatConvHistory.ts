export const formatConvHistory = (msgs: []) => {
  return msgs.map((msg, i) => {
    if (i % 2 === 0) {
      return `Human: ${msg}`;
    } else {
      return `LLM: ${msg}`;
    }
  });
};
