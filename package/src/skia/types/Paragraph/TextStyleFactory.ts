import type { SkTextStyle } from ".";

export interface TextStyleFactory {
  Make(): SkTextStyle;
}
