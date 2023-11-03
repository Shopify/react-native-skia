import { SkParagraph } from "../../skia/types/Paragraph";
import { GroupProps } from "./Common";

export interface ParagraphProps extends GroupProps {
  paragraph: SkParagraph;
  x: number;
  y: number;
  width: number;
}
