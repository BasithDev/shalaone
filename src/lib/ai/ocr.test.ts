import { describe, it, expect } from "vitest";
import { splitPages } from "./ocr";

describe("splitPages (OCR output parsing)", () => {
  it("splits on ===PAGE n=== markers, preserving order", () => {
    const out = "===PAGE 1===\nAlpha content\n===PAGE 2===\nBeta content";
    expect(splitPages(out)).toEqual(["Alpha content", "Beta content"]);
  });

  it("treats marker-less output as a single page", () => {
    expect(splitPages("Just some transcribed text.")).toEqual(["Just some transcribed text."]);
  });

  it("returns an empty array for empty output", () => {
    expect(splitPages("")).toEqual([]);
    expect(splitPages("   \n  ")).toEqual([]);
  });

  it("ignores empty pages between markers", () => {
    const out = "===PAGE 1===\nReal\n===PAGE 2===\n   \n===PAGE 3===\nMore";
    expect(splitPages(out)).toEqual(["Real", "More"]);
  });
});
