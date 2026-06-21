import { describe, it, expect } from "vitest";
import { chunkPages } from "./chunk";

describe("chunkPages", () => {
  it("returns no chunks for empty pages", () => {
    expect(chunkPages([])).toEqual([]);
    expect(chunkPages(["", "   "])).toEqual([]);
  });

  it("keeps a short page as a single chunk with page number 1", () => {
    const chunks = chunkPages(["The mitochondria is the powerhouse of the cell."]);
    expect(chunks).toHaveLength(1);
    expect(chunks[0].pageNumber).toBe(1);
    expect(chunks[0].chunkIndex).toBe(0);
    expect(chunks[0].content).toContain("mitochondria");
  });

  it("assigns the correct page number per page", () => {
    const chunks = chunkPages(["First page content here.", "Second page content here."]);
    expect(chunks.map((c) => c.pageNumber)).toEqual([1, 2]);
  });

  it("splits long pages into multiple overlapping chunks", () => {
    const longText = "sentence. ".repeat(400); // ~4000 chars
    const chunks = chunkPages([longText], 700, 100);
    expect(chunks.length).toBeGreaterThan(1);
    // chunkIndex is globally sequential
    expect(chunks.map((c) => c.chunkIndex)).toEqual(chunks.map((_, i) => i));
    // each chunk respects roughly the max length
    for (const c of chunks) expect(c.content.length).toBeLessThanOrEqual(720);
  });

  it("skips tiny fragments under 10 chars", () => {
    const chunks = chunkPages(["ok", "a"]);
    expect(chunks).toEqual([]);
  });
});
