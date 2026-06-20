export type Chunk = {
  content: string;
  pageNumber: number;
  chunkIndex: number;
};

export function chunkPages(pages: string[], maxChunkLength = 700, overlap = 100): Chunk[] {
  const chunks: Chunk[] = [];
  let chunkIndex = 0;

  for (let p = 0; p < pages.length; p++) {
    const pageText = pages[p];
    let currentIndex = 0;
    const textLength = pageText.length;

    while (currentIndex < textLength) {
      let end = currentIndex + maxChunkLength;
      if (end > textLength) end = textLength;

      let breakPoint = end;
      if (end < textLength) {
        const nextPeriod = pageText.lastIndexOf('.', end);
        const nextNewline = pageText.lastIndexOf('\n', end);
        breakPoint = Math.max(nextPeriod, nextNewline);
        if (breakPoint <= currentIndex || breakPoint < currentIndex + maxChunkLength / 2) {
          breakPoint = end; // Fallback
        }
      }

      const content = pageText.slice(currentIndex, breakPoint).trim();
      if (content.length > 10) { // skip tiny chunks
        chunks.push({
          content,
          pageNumber: p + 1,
          chunkIndex: chunkIndex++,
        });
      }

      currentIndex = breakPoint - overlap;
      if (currentIndex < 0) currentIndex = 0;
      if (breakPoint === textLength) break;
    }
  }

  return chunks;
}
