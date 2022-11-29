import { Skia } from "@shopify/react-native-skia";
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

export const parseNode = (serializedNode: SerializedNode): any => {
  const { type, props, children } = serializedNode;
  return React.createElement(
    type,
    { ...parseProps(props), key: `${Math.random()}` },
    children.map(parseNode)
  );
};

const parseProps = (props: SerializedProps) => {
  const newProps: SerializedProps = {};
  Object.keys(props).forEach((key) => {
    newProps[key] = parseProp(props[key]);
  });
  return newProps;
};

const parseProp = (value: any) => {
  if (value && typeof value === "object" && "__typename__" in value) {
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
    } else if (value.__typename__ === "Image") {
      const raw = new Uint8Array(value.bytes);
      const data = Skia.Data.fromBytes(raw);
      return Skia.Image.MakeImageFromEncoded(data);
    } else if (value.__typename__ === "Font") {
      const raw = new Uint8Array(value.typeface);
      const data = Skia.Data.fromBytes(raw);
      const typeface = Skia.Typeface.MakeFreeTypeFaceFromData(data)!;
      return Skia.Font(typeface, value.size);
    }
  }
  return value;
};
