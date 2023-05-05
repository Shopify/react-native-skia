import type { SkPaint } from "../Paint";

import type { TextStyle } from "./ParagraphStyle";

// TODO: this can be removed?
export interface SkSpan {
  text?: string;
  style?: TextStyle;
  fg?: SkPaint;
  bg?: SkPaint;
  children: SkSpan[];
}
