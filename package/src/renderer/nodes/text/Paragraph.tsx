import type {
  CanvasKit,
  FontMgr,
  Paragraph as IParagraph,
} from "canvaskit-wasm";
import { useMemo } from "react";

import { NodeType } from "../../Host";
import type { SkNode } from "../../Host";
import { useFontManager } from "../../../elements/AssetManager";
import { useCanvasKit } from "../../CanvasKitProvider";

import type { ParagraphStyle, TextStyle } from "./TextStyle";
import { textStyle, paragraphStyle } from "./TextStyle";

export interface ParagraphProps {
  x: number;
  y: number;
  paragraph: IParagraph;
}

export const Paragraph = (props: ParagraphProps) => <skParagraph {...props} />;

export const ParagraphNode = (
  props: ParagraphProps
): SkNode<NodeType.Paragraph> => ({
  type: NodeType.Paragraph,
  props,
  draw: ({ canvas }, { paragraph, x, y }) => {
    canvas.drawParagraph(paragraph, x, y);
  },
  children: [],
});

export const useParagraph = (
  text: string,
  width: number,
  style: TextStyle & ParagraphStyle
) => {
  const fontMgr = useFontManager();
  const CanvasKit = useCanvasKit();
  console.log(fontMgr.getFamilyName(fontMgr.countFamilies() - 1));
  const paragraph = useMemo(() => {
    return computeParagraph(CanvasKit, fontMgr, text, width, style);
  }, [CanvasKit, fontMgr, style, text, width]);
  return paragraph;
};

export const computeParagraph = (
  CanvasKit: CanvasKit,
  fontMgr: FontMgr,
  text: string,
  width: number,
  style: TextStyle & ParagraphStyle
) => {
  const pStyle = paragraphStyle(CanvasKit, textStyle(CanvasKit, style), style);
  const builder = CanvasKit.ParagraphBuilder.Make(pStyle, fontMgr);
  builder.addText(text);
  const p = builder.build();
  p.layout(width);
  return p;
};
