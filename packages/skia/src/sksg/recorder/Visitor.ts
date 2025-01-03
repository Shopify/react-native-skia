/* eslint-disable @typescript-eslint/no-explicit-any */
"worklet";

import type { CTMProps, DrawingNodeProps } from "../../dom/types";
import { NodeType } from "../../dom/types";
import { sortNodes, type Node } from "../nodes";

import type { PaintProps } from "./Paint";
import { CommandType, type Recorder } from "./Recorder";

function processPaint(
  {
    opacity,
    color,
    strokeWidth,
    blendMode,
    style,
    strokeJoin,
    strokeCap,
    strokeMiter,
    antiAlias,
    dither,
  }: DrawingNodeProps,
  children: Node[]
) {
  const paint: PaintProps = {};
  if (opacity) {
    paint.opacity = opacity;
  }
  if (color) {
    paint.color = color;
  }
  if (strokeWidth) {
    paint.strokeWidth = strokeWidth;
  }
  if (blendMode) {
    paint.blendMode = blendMode;
  }
  if (style) {
    paint.style = style;
  }
  if (strokeJoin) {
    paint.strokeJoin = strokeJoin;
  }
  if (strokeCap) {
    paint.strokeCap = strokeCap;
  }
  if (strokeMiter) {
    paint.strokeMiter = strokeMiter;
  }
  if (antiAlias) {
    paint.antiAlias = antiAlias;
  }
  if (dither) {
    paint.dither = dither;
  }

  if (
    opacity !== undefined ||
    color !== undefined ||
    strokeWidth !== undefined ||
    blendMode !== undefined ||
    style !== undefined ||
    strokeJoin !== undefined ||
    strokeCap !== undefined ||
    strokeMiter !== undefined ||
    antiAlias !== undefined ||
    dither !== undefined ||
    children.length > 0
  ) {
    return paint;
  }
  return null;
}

function processCTM({
  clip,
  invertClip,
  transform,
  origin,
  matrix,
  layer,
}: CTMProps) {
  const ctm: CTMProps = {};
  if (clip) {
    ctm.clip = clip;
  }
  if (invertClip) {
    ctm.invertClip = invertClip;
  }
  if (transform) {
    ctm.transform = transform;
  }
  if (origin) {
    ctm.origin = origin;
  }
  if (matrix) {
    ctm.matrix = matrix;
  }
  if (layer) {
    ctm.layer = layer;
  }
  if (
    clip !== undefined ||
    invertClip !== undefined ||
    transform !== undefined ||
    origin !== undefined ||
    matrix !== undefined ||
    layer !== undefined
  ) {
    return ctm;
  }
  return null;
}

const recordDeclaration = (recorder: Recorder, decl: Node) => {
  switch (decl.type) {
    case NodeType.BlurMaskFilter:
      recorder.pushBlurMaskFilter(decl.props);
      break;
    case NodeType.LumaColorFilter:
    case NodeType.SRGBToLinearGammaColorFilter:
    case NodeType.LinearToSRGBGammaColorFilter:
    case NodeType.LerpColorFilter:
    case NodeType.BlendColorFilter:
    case NodeType.MatrixColorFilter:
      recorder.pushColorFilter();
      decl.children.forEach((child) => {
        if (child.isDeclaration) {
          recordDeclaration(recorder, child);
        }
      });
      recorder.popColorFilter(decl.type, decl.props);
      break;
  }
};

const extraPaints = (node: Node) => {
  const nodes: Node[] = [];
  node.children.forEach((child) => {
    if (child.type === NodeType.Paint) {
      const clone = {
        type: node.type,
        isDeclaration: node.isDeclaration,
        children: child.children,
        props: { ...node.props, ...child.props },
      };
      nodes.push(clone);
    }
  });
  if (nodes.length === 0) {
    return null;
  }
  return nodes;
};

export function record(recorder: Recorder, root: Node<any>) {
  if (root.type === NodeType.Layer) {
    const [layer, ...remainingChildren] = root.children;
    if (layer.isDeclaration && layer.type === NodeType.Paint) {
      recorder.pushLayer(layer);
      remainingChildren.forEach((child) => {
        record(recorder, child);
      });
      recorder.popLayer();
    }
    return;
  }

  const { type, props, children } = root;
  if (props.paint) {
    recorder.pushStaticPaint(props.paint);
    const clone = {
      type: root.type,
      isDeclaration: root.isDeclaration,
      props: {
        ...root.props,
      },
      children: root.children,
    };
    delete clone.props.paint;
    delete clone.props.color;
    delete clone.props.strokeWidth;
    delete clone.props.blendMode;
    delete clone.props.style;
    delete clone.props.strokeJoin;
    delete clone.props.strokeCap;
    delete clone.props.strokeMiter;
    delete clone.props.opacity;
    delete clone.props.antiAlias;
    delete clone.props.dither;
    record(recorder, clone);
    recorder.popPaint();
    return;
  }
  const { drawings, declarations } = sortNodes(children);
  const paint = processPaint(props, declarations);
  const ctm = processCTM(props);
  let skipChildren = false;
  if (paint) {
    recorder.pushPaint(paint);
  }
  if (ctm) {
    recorder.pushCTM(ctm);
  }

  declarations.forEach((decl) => {
    recordDeclaration(recorder, decl);
  });
  if (paint) {
    recorder.finishDeclaration();
  }

  switch (type) {
    case NodeType.Box:
      recorder.drawBox(props, children);
      skipChildren = true;
      break;
    case NodeType.BackdropFilter:
      recorder.draw(CommandType.BackdropFilter, declarations[0]);
      skipChildren = true;
      break;
    case NodeType.Glyphs:
      recorder.draw(CommandType.DrawGlyphs, props);
      break;
    case NodeType.Circle:
      recorder.draw(CommandType.DrawCircle, props);
      break;
    case NodeType.Image:
      recorder.draw(CommandType.DrawImage, props);
      break;
    case NodeType.Points:
      recorder.draw(CommandType.DrawPoints, props);
      break;
    case NodeType.Path:
      recorder.draw(CommandType.DrawPath, props);
      break;
    case NodeType.Rect:
      recorder.draw(CommandType.DrawRect, props);
      break;
    case NodeType.RRect:
      recorder.draw(CommandType.DrawRRect, props);
      break;
    case NodeType.Oval:
      recorder.draw(CommandType.DrawOval, props);
      break;
    case NodeType.Line:
      recorder.draw(CommandType.DrawLine, props);
      break;
    case NodeType.Patch:
      recorder.draw(CommandType.DrawPatch, props);
      break;
    case NodeType.Vertices:
      recorder.draw(CommandType.DrawVertices, props);
      break;
    case NodeType.DiffRect:
      recorder.draw(CommandType.DrawDiffRect, props);
      break;
    case NodeType.Text:
      recorder.draw(CommandType.DrawText, props);
      break;
    case NodeType.TextPath:
      recorder.draw(CommandType.DrawTextPath, props);
      break;
    case NodeType.TextBlob:
      recorder.draw(CommandType.DrawTextBlob, props);
      break;
    case NodeType.Glyphs:
      recorder.draw(CommandType.DrawGlyphs, props);
      break;
    case NodeType.Picture:
      recorder.draw(CommandType.DrawPicture, props);
      break;
    case NodeType.ImageSVG:
      recorder.draw(CommandType.DrawImageSVG, props);
      break;
    case NodeType.Paragraph:
      recorder.draw(CommandType.DrawParagraph, props);
      break;
    case NodeType.Atlas:
      recorder.draw(CommandType.DrawAtlas, props);
      break;
    case NodeType.Circle:
      recorder.draw(CommandType.DrawCircle, props);
      break;
    case NodeType.Fill:
      recorder.draw(CommandType.DrawPaint, null);
      break;
  }
  const nodes = extraPaints(root);
  if (nodes) {
    nodes.forEach((node) => {
      record(recorder, node);
    });
    return;
  }
  if (!skipChildren) {
    drawings.forEach((child) => {
      record(recorder, child);
    });
  }
  if (paint) {
    recorder.popPaint();
  }
  if (ctm) {
    recorder.popCTM();
  }
}
