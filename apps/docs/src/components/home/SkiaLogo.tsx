"use client";

import dynamic from "next/dynamic";

// Redraw needs WebGPU: never render the scene on the server.
const SkiaLogoInner = dynamic(
  () => import("./SkiaLogoInner").then((m) => m.SkiaLogoInner),
  { ssr: false }
);

export function SkiaLogo() {
  return (
    <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl border bg-[#080808]">
      <SkiaLogoInner />
    </div>
  );
}
