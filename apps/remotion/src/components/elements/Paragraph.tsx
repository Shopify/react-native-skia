import type {
  SkParagraph,
  SkParagraphBuilder,
} from "@shopify/react-native-skia";

export const buildParagraph = (
  maxWidth: number,
  build: () => SkParagraphBuilder,
  onLayout: (width: number, height: number, paragraph: SkParagraph) => void
) => {
  let builder = build();
  let paragraph = builder.build();
  paragraph.layout(maxWidth);
  onLayout(paragraph.getLongestLine(), paragraph.getHeight(), paragraph);
  builder = build();
  paragraph = builder.build();
  paragraph.layout(maxWidth);
  return paragraph;
};
