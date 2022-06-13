import type { DependencyList } from "react";
import { useMemo } from "react";

import { Skia } from "../Skia";
import type { SkFont, SkPath } from "../types";

/**
 * Memoizes and returns a Skia Path object with optional initializer
 * @param initializer
 * @param deps
 * @returns
 */
export const usePath = (
  initializer?: (path: SkPath) => void,
  deps?: DependencyList
) =>
  useMemo(() => {
    const p = Skia.Path.Make();
    if (initializer) {
      initializer(p);
    }
    return p;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initializer, deps]);

/**
 * Initializes a Skia Path from an svg path string
 * @param svgpath
 * @returns
 */
// MakeFromSVGString
export const useSvgPath = (svgpath: string) =>
  useMemo(() => {
    const p = Skia.Path.MakeFromSVGString(svgpath);
    if (p === null) {
      throw new Error(`Invalid SVG path: ${svgpath}`);
    }
    return p;
  }, [svgpath]);

/**
 * Initializes a Skia Path from a text string
 * @param svgpath
 * @returns
 */
export const useTextPath = (text: string, x: number, y: number, font: SkFont) =>
  useMemo(() => {
    const p = Skia.Path.MakeFromText(text, x, y, font);
    if (p === null) {
      throw new Error("Text path creation failed.");
    }
    return p;
  }, [text, x, y, font]);
