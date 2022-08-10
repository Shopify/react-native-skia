/* global  HTMLDivElement, ExpoSnack */
import React, { useEffect, useRef } from "react";

interface SnackApi {
  append: (e: HTMLDivElement) => void;
}

declare global {
  var ExpoSnack: SnackApi;
}

interface SnackProps {
  id: string;
}

export const Snack = ({ id }: SnackProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    ExpoSnack.append(ref.current!);
  }, []);
  return (
    <div
      ref={ref}
      data-snack-id={id}
      data-snack-platform="web"
      data-snack-preview="true"
      data-snack-theme="automatic"
      style={{
        overflow: "hidden",
        background: "#f9f9f9",
        border: "1px solid var(--color-border)",
        borderRadius: 4,
        height: 505,
        width: "100%",
      }}
    />
  );
};
