/* eslint-disable @typescript-eslint/no-explicit-any */
import { NodeType } from "../dom/types";
import type { AnimatedProps } from "../renderer";
import Rea from "../external/reanimated/ReanimatedProxy";
import { exhaustiveCheck } from "../renderer/typeddash";

import type { DrawingContext } from "./Common";
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

type UnknownProps = Record<string, any>;

interface SGNode<P = UnknownProps> {
  type: NodeType;
  props: AnimatedProps<P>;
  children: SGNode[];
}

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
  switch (node.type) {
    case NodeType.Circle:
      return renderCircle(ctx, materializedProps);
    case NodeType.Fill:
      return renderFill(ctx);
    case NodeType.Points:
      return renderPoints(ctx, materializedProps);
    case NodeType.Path:
      return renderPath(ctx, materializedProps);
    case NodeType.Rect:
      return renderRect(ctx, materializedProps);
    case NodeType.RRect:
      return renderRRect(ctx, materializedProps);
    case NodeType.Oval:
      return renderOval(ctx, materializedProps);
    // case NodeType.Group:
    //   return renderGroup(ctx, materializedProps);
    // case NodeType.Paint:
    //   return renderPaint(ctx, materializedProps);
    // case NodeType.Image:
    //   return renderImage(ctx, materializedProps);
    case NodeType.Line:
      return renderLine(ctx, materializedProps);
    case NodeType.Patch:
      return renderPatch(ctx, materializedProps);
    case NodeType.Vertices:
      return renderVertices(ctx, materializedProps);
    case NodeType.DiffRect:
      return renderDiffRect(ctx, materializedProps);
    // case NodeType.Text:
    //   return renderText(ctx, materializedProps);
    // case NodeType.TextPath:
    //   return renderTextPath(ctx, materializedProps);
    // case NodeType.TextBlob:
    //   return renderTextBlob(ctx, materializedProps);
    // case NodeType.Glyphs:
    //   return renderGlyphs(ctx, materializedProps);
    case NodeType.Picture:
      return renderPicture(ctx, materializedProps);
    case NodeType.ImageSVG:
      return renderImageSVG(ctx, materializedProps);
    case NodeType.Atlas:
      return renderAtlas(ctx, materializedProps);
    default:
      return exhaustiveCheck(node.type);
  }
};
