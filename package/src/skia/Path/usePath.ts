import type { DependencyList } from "react";
import { useMemo } from "react";

import type { Font } from "../Font";
import { Skia } from "../Skia";

import type { IPath } from "./Path";

/**
 * Memoizes and returns a Skia Path object with optional initializer
 * @param initializer
 * @param deps
 * @returns
 */
export const usePath = (
  initializer?: (path: IPath) => void,
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
export const useTextPath = (text: string, x: number, y: number, font: Font) =>
  usePath(
    (p) => {
      p.fromText(text, x, y, font);
    },
    [text, x, y, font]
  );
