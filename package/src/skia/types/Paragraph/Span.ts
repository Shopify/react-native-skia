import type { SkPaint } from "../Paint";

import type { TextStyle } from "./ParagraphStyle";

export interface SkSpan {
  text?: string;
  style?: TextStyle;
  fg?: SkPaint;
  bg?: SkPaint;
  children: SkSpan[];
}
