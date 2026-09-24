"use client";

import dynamic from "next/dynamic";

import type { ExampleName } from "@/examples";

const Placeholder = ({ height }: { height: number }) => (
  <div
    className="flex items-center justify-center text-sm text-fd-muted-foreground"
    style={{ height }}
  >
    Loading Skia…
  </div>
);

// CanvasKit only runs in the browser: never render the examples on the server.
const LiveExampleInner = dynamic(
  () => import("./LiveExampleInner").then((m) => m.LiveExampleInner),
  {
    ssr: false,
    loading: () => <Placeholder height={256} />,
  }
);

interface LiveExampleProps {
  name: ExampleName;
  height?: number;
}

export function LiveExample({ name, height = 256 }: LiveExampleProps) {
  return (
    <div className="not-prose my-6 flex justify-center overflow-hidden rounded-xl border bg-fd-card">
      <LiveExampleInner
        name={name}
        height={height}
        fallback={<Placeholder height={height} />}
      />
    </div>
  );
}
