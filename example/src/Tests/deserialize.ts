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
    newProps[key] = parseProp(props[key], assets);
  });
  return newProps;
};

const parseProp = (value: any, assets: Assets) => {
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
      const asset = assets[value.name];
      if (!asset) {
        throw new Error(`Asset ${value.name} not found`);
      }
      return asset;
    } else if (value.__typename__ === "RuntimeEffect") {
      return Skia.RuntimeEffect.Make(value.source);
    } else if (value.__typename__ === "Font") {
      const asset = assets[value.name];
      if (!asset) {
        throw new Error(`Asset ${value.name} not found`);
      }
      return Skia.Font(asset, value.size);
    }
  }
  return value;
};
