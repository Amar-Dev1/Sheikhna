export const stripTashkeel = (text: string): string => {
  return text
    .replace(/[\u064B-\u0652]/g, "")
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F]/g, "")

    .trim();
};

export const ApplyDualTrack = (src_docs: any[]) => {
  const processedData = [];
  for (const item of src_docs) {
    const originalContent = item.content;
    const cleanContent = stripTashkeel(originalContent);

    processedData.push({
      pageContent: cleanContent,
      metadata: {
        ...item.metadata,
        original_text: originalContent,
      },
    });
  }

  return processedData;
};
