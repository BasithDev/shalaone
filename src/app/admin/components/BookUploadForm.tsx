"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Upload, RefreshCw, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/toast";

export function BookUploadForm({
  chapterId,
  chapterName,
  hasBook,
}: {
  chapterId: string;
  chapterName: string;
  hasBook: boolean;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const toast = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast("Only PDF files are allowed.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      toast("File size must be under 20MB for this MVP.", "error");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setIsUploading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("chapterId", chapterId);
    formData.append("title", `${chapterName} Book`);

    try {
      const res = await fetch("/api/admin/books/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast(`Processed ${data.chunkCount} chunks from ${data.pageCount} pages.`, "success");
        router.refresh();
      } else {
        toast(data.error || "Upload failed.", "error");
      }
    } catch {
      toast("An unexpected error occurred during upload or ingestion.", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        type="file"
        accept="application/pdf"
        className="hidden"
        ref={fileInputRef}
        onChange={handleUpload}
      />
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-[0.98] disabled:opacity-70",
          hasBook
            ? "border border-primary/40 text-primary hover:bg-primary-container/10"
            : "bg-primary-sheen text-on-primary shadow-soft hover:shadow-soft-lg hover:brightness-105"
        )}
      >
        {isUploading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Processing…
          </>
        ) : hasBook ? (
          <>
            <RefreshCw className="size-4" strokeWidth={2.25} />
            Replace PDF
          </>
        ) : (
          <>
            <Upload className="size-4" strokeWidth={2.25} />
            Upload PDF
          </>
        )}
      </button>
    </>
  );
}
