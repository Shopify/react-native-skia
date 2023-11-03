import { SkTextStyle } from "../Paragraph";

export interface TextStyleFactory {
  Make(): SkTextStyle;
}
