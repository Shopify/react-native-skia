import type { DependencyList } from "react";
import { useMemo } from "react";

import type { IPath } from "../skia/Path";
import { Api } from "../skia/Api";
import type { IFont } from "../skia/Font";

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
    const p = Api.Path();
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
export const useSvgPath = (svgpath: string) =>
  usePath(
    (p) => {
      p.fromSvgPath(svgpath);
    },
    [svgpath]
  );

/**
 * Initializes a Skia Path from a text string
 * @param svgpath
 * @returns
 */
export const useTextPath = (text: string, x: number, y: number, font: IFont) =>
  usePath(
    (p) => {
      p.fromText(text, x, y, font);
    },
    [text, x, y, font]
  );
