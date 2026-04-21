"use client";

import { useState } from "react";

export function useClipboard() {
  const [copied, setCopied] = useState(false);

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Clipboard error";
      throw new Error(message);
    }
  };

  return { copied, copy };
}
