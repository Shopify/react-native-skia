import type { SkParagraph } from "../../skia/types/Paragraph";
import type { GroupProps } from "./Common";
export interface ParagraphProps extends GroupProps {
    paragraph: SkParagraph | null;
    x: number;
    y: number;
    width: number;
}
