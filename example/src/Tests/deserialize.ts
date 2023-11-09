import {
  SkParagraphStyle,
  SkTextStyle,
  Skia,
} from "@shopify/react-native-skia";
import React from "react";

/* eslint-disable @typescript-eslint/no-explicit-any */
interface SerializedProps {
  [key: string]: any;
}

export interface SerializedNode {
  type: string;
  props: SerializedProps;
  children: SerializedNode[];
}

type Assets = { [name: string]: any };

export const parseNode = (
  serializedNode: SerializedNode,
  assets: Assets
): any => {
  const { type, props, children } = serializedNode;
  return React.createElement(
    type,
    { ...parseProps(props, assets), key: `${Math.random()}` },
    children.map((child) => parseNode(child, assets))
  );
};

export const parseProps = (props: SerializedProps, assets: Assets) => {
  const newProps: SerializedProps = {};
  Object.keys(props).forEach((key) => {
    const value = parseProp(props[key], assets);
    newProps[key] = value;
  });
  return newProps;
};

const parseProp = (value: any, assets: Assets) => {
  if (value && typeof value === "object" && "__typename__" in value) {
    if (value.__typename__ === "Paint") {
      const paint = Skia.Paint();
      paint.setColor(Float32Array.of(...value.color));
      return paint;
    }
    if (value.__typename__ === "Point") {
      return Skia.Point(value.x, value.y);
    } else if (value.__typename__ === "Rect") {
      return Skia.XYWHRect(value.x, value.y, value.width, value.height);
    } else if (value.__typename__ === "RRect") {
      return Skia.RRectXY(
        Skia.XYWHRect(value.x, value.y, value.width, value.height),
        value.rx,
        value.ry
      );
    } else if (value.__typename__ === "Path") {
      return Skia.Path.MakeFromCmds(value.cmds);
    } else if (value.__typename__ === "RawImage") {
      return Skia.Image.MakeImageFromEncoded(Skia.Data.fromBase64(value.data));
    } else if (value.__typename__ === "Image") {
      const asset = assets[value.name];
      if (!asset) {
        throw new Error(`Asset ${value.name} not found`);
      }
      return asset;
    } else if (value.__typename__ === "RuntimeEffect") {
      return Skia.RuntimeEffect.Make(value.source);
    } else if (value.__typename__ === "SVG") {
      return Skia.SVG.MakeFromString(value.source);
    } else if (value.__typename__ === "Font") {
      const asset = assets[value.name];
      if (!asset) {
        throw new Error(`Asset ${value.name} not found`);
      }
      return Skia.Font(asset, value.size);
    } else if (value.__typename__ === "Function") {
      // eslint-disable-next-line no-eval
      return eval(
        `(function Main(){ const {Skia} = this; return (${value.source}); })`
      ).call({
        Skia,
      });
    } else if (value.__typename__ === "Paragraph") {
      // Elements are the initial values passed to the paragaraph builder
      // in the order they were added from addText, addPlaceholder, pushStyle, popStyle
      const elements = JSON.parse(value.elements) as Array<any>;
      // Style is the SkParagraphStyle used to create the paragraph-builder
      const style = value.style
        ? (JSON.parse(value.style) as SkParagraphStyle)
        : undefined;

      // Now ensure all colors are converted to SkColor
      if (style) {
        style.textStyle = getTextStyleWithResolvedColors(style?.textStyle);
      }

      const builder = Skia.ParagraphBuilder.Make(style);
      elements.forEach((el) => {
        switch (el.type) {
          case "text":
            builder.addText(el.text);
            break;
          case "placeholder":
            builder.addPlaceholder(
              el.width,
              el.height,
              el.alignment,
              el.baseline,
              el.offset
            );
            break;
          case "push_style":
            builder.pushStyle(getTextStyleWithResolvedColors(el.style));
            break;
          case "pop_style":
            builder.pop();
            break;
        }
      });
      return builder.build();
    }
  }
  return value;
};

const getTextStyleWithResolvedColors = <T extends SkTextStyle | undefined>(
  textStyle: T
): T => {
  if (!textStyle) {
    return undefined as T;
  }
  const retVal = { ...textStyle };

  if (textStyle.color) {
    retVal.color = Skia.Color(
      parseEmscriptenColor(textStyle.color as any as EmScriptenColor)
    );
  }

  if (textStyle.foregroundColor) {
    retVal.foregroundColor = Skia.Color(
      parseEmscriptenColor(textStyle.foregroundColor as any as EmScriptenColor)
    );
  }

  if (textStyle.backgroundColor) {
    retVal.backgroundColor = Skia.Color(
      parseEmscriptenColor(textStyle.backgroundColor as any as EmScriptenColor)
    );
  }

  if (textStyle.decorationColor) {
    retVal.decorationColor = Skia.Color(
      parseEmscriptenColor(textStyle.decorationColor as any as EmScriptenColor)
    );
  }

  return retVal;
};

type EmScriptenColor = { "0": number; "1": number; "2": number; "3": number };
const parseEmscriptenColor = (v: EmScriptenColor) => {
  return new Float32Array([v["0"], v["1"], v["2"], v["3"]]);
};
