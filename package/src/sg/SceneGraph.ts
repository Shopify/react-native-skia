/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeType } from "../dom/types";
import type { AnimatedProps } from "../renderer";
import Rea from "../external/reanimated/ReanimatedProxy";

import { processContext, type DrawingContext } from "./Context";
import {
  renderAtlas,
  renderCircle,
  renderDiffRect,
  renderFill,
  renderImageSVG,
  renderLine,
  renderOval,
  renderPatch,
  renderPath,
  renderPicture,
  renderPoints,
  renderRRect,
  renderRect,
  renderVertices,
} from "./Drawing";

const materialize = <P>(props: AnimatedProps<P>) => {
  "worklet";
  const materializedProps: Record<string, unknown> = {};
  for (const key in props) {
    const value = props[key];
    if (Rea.isSharedValue(value)) {
      materializedProps[key] = value.value;
    } else {
      materializedProps[key] = value;
    }
  }
  return materializedProps as any;
};

export const renderNode = (ctx: DrawingContext, node: SGNode) => {
  "worklet";
  const materializedProps = materialize(node.props);
  const { restore, restorePaint } = processContext(ctx, materializedProps);
  //const { invertClip, layer, matrix, transform } = materializedProps;

  switch (node.type) {
    case NodeType.Circle:
      renderCircle(ctx, materializedProps);
      break;
    case NodeType.Fill:
      renderFill(ctx);
      break;
    case NodeType.Points:
      renderPoints(ctx, materializedProps);
      break;
    case NodeType.Path:
      renderPath(ctx, materializedProps);
      break;
    case NodeType.Rect:
      renderRect(ctx, materializedProps);
      break;
    case NodeType.RRect:
      renderRRect(ctx, materializedProps);
      break;
    case NodeType.Oval:
      renderOval(ctx, materializedProps);
      break;
    // case NodeType.Group:
    //   return renderGroup(ctx, materializedProps);
    // case NodeType.Paint:
    //   return renderPaint(ctx, materializedProps);
    // case NodeType.Image:
    //   return renderImage(ctx, materializedProps);
    case NodeType.Line:
      renderLine(ctx, materializedProps);
      break;
    case NodeType.Patch:
      renderPatch(ctx, materializedProps);
      break;
    case NodeType.Vertices:
      renderVertices(ctx, materializedProps);
      break;
    case NodeType.DiffRect:
      renderDiffRect(ctx, materializedProps);
      break;
    // case NodeType.Text:
    //   return renderText(ctx, materializedProps);
    // case NodeType.TextPath:
    //   return renderTextPath(ctx, materializedProps);
    // case NodeType.TextBlob:
    //   return renderTextBlob(ctx, materializedProps);
    // case NodeType.Glyphs:
    //   return renderGlyphs(ctx, materializedProps);
    case NodeType.Picture:
      renderPicture(ctx, materializedProps);
      break;
    case NodeType.ImageSVG:
      renderImageSVG(ctx, materializedProps);
      break;
    case NodeType.Atlas:
      renderAtlas(ctx, materializedProps);
      break;
    default:
      throw new Error(`Unsupported node type: ${node.type}`);
    //return exhaustiveCheck(node.type);
  }
  if (restore) {
    ctx.canvas.restore();
  }
  if (restorePaint) {
    //ctx.paint.restore();
  }
};
