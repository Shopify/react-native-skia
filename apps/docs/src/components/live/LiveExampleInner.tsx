"use client";

import type { ComponentType, ReactNode } from "react";
import { useEffect, useState } from "react";

import type { ExampleName } from "@/examples";
import { examples } from "@/examples";
import { basePath } from "@/lib/base-path";
import { LoadSkiaWeb } from "@/lib/react-native-skia-web";

interface LiveExampleInnerProps {
  name: ExampleName;
  height: number;
  fallback: ReactNode;
}

export function LiveExampleInner({
  name,
  height,
  fallback,
}: LiveExampleInnerProps) {
  const [Example, setExample] = useState<ComponentType | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let cancelled = false;
    // canvaskit.wasm is copied to public/ by scripts/copy-canvaskit.mjs.
    // The example (and therefore Skia) must be imported once CanvasKit is
    // loaded, like <WithSkiaWeb /> does.
    LoadSkiaWeb({ locateFile: (file) => `${basePath}/${file}` })
      .then(() => examples[name]())
      .then((mod) => {
        if (!cancelled) {
          setExample(() => mod.default);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : String(e));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [name]);
  if (error) {
    return (
      <div className="p-4 text-sm text-fd-error" style={{ height }}>
        Failed to load the example: {error}
      </div>
    );
  }
  if (!Example) {
    return <>{fallback}</>;
  }
  return (
    <div style={{ height }}>
      <Example />
    </div>
  );
}
