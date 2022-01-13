import React, { useCallback, useMemo } from "react";
import type { ViewStyle } from "react-native";
import { View, StyleSheet } from "react-native";
import type { IPaint } from "@shopify/react-native-skia";
import { PaintStyle } from "@shopify/react-native-skia";

import type { ElementType } from "./types";
import {
  CircleToolPath,
  ImageToolPath,
  PenToolPath,
  RectToolPath,
  SelectToolPath,
  DeleteToolPath,
} from "./assets";
import {
  PathToolbarItem,
  ColorToolbarItem,
  SizeToolbarItem,
} from "./ToolbarItems";

type DrawingToolbarProps = {
  type: ElementType | undefined;
  style: ViewStyle;
  size: number;
  color: string;
  onColorPressed: () => void;
  onTypePressed: () => void;
  onDeletePressed: () => void;
  onSizePressed: () => void;
  onImagePressed: () => void;
};

export const DrawingToolbar: React.FC<DrawingToolbarProps> = ({
  style,
  type,
  size,
  color,
  onColorPressed,
  onDeletePressed,
  onSizePressed,
  onTypePressed,
  onImagePressed,
}) => {
  const typeIcon = useMemo(() => {
    switch (type) {
      case "path":
        return PenToolPath;
      case "circle":
        return CircleToolPath;
      case "rect":
        return RectToolPath;
      default:
        return SelectToolPath;
    }
  }, [type]);
  return (
    <View style={[style, styles.container]}>
      <PathToolbarItem path={typeIcon} onPress={onTypePressed} />
      <PathToolbarItem path={DeleteToolPath} onPress={onDeletePressed} />
      <PathToolbarItem path={ImageToolPath} onPress={onImagePressed} />
      <SizeToolbarItem onPress={onSizePressed} size={size} />
      <ColorToolbarItem color={color} onPress={onColorPressed} />
    </View>
  );
};

type ColorToolbarProps = {
  style: ViewStyle;
  colors: string[];
  onSelectColor: (color: string) => void;
};

export const ColorToolbar: React.FC<ColorToolbarProps> = ({
  colors,
  style,
  onSelectColor,
}) => {
  const handlePress = useCallback(
    (i: number) => onSelectColor(colors[i]),
    [colors, onSelectColor]
  );
  return (
    <View style={[style, styles.container, styles.verticalContainer]}>
      {colors.map((color, i) => (
        <ColorToolbarItem
          key={i}
          color={color}
          onPress={() => handlePress(i)}
        />
      ))}
    </View>
  );
};

type SizeToolbarProps = {
  style: ViewStyle;
  sizes: number[];
  paint: IPaint;
  onSelectSize: (size: number) => void;
};

export const SizeToolbar: React.FC<SizeToolbarProps> = ({
  sizes,
  paint,
  style,
  onSelectSize,
}) => {
  const paints = useMemo(
    () =>
      sizes.map((c) => {
        const p = paint.copy();
        p.setStyle(PaintStyle.Stroke);
        p.setStrokeWidth(c);
        return p;
      }),
    [sizes, paint]
  );
  const handlePress = useCallback(
    (i: number) => onSelectSize(sizes[i]),
    [sizes, onSelectSize]
  );
  return (
    <View style={[style, styles.container, styles.verticalContainer]}>
      {paints.map((p, i) => (
        <SizeToolbarItem
          key={i}
          size={p.getStrokeWidth()}
          onPress={() => handlePress(i)}
        />
      ))}
    </View>
  );
};

type TypeToolbarProps = {
  type: ElementType | undefined;
  style: ViewStyle;
  onSelectType: (type: ElementType | undefined) => void;
};

export const TypeToolbar: React.FC<TypeToolbarProps> = ({
  style,
  onSelectType,
}) => {
  const handlePress = useCallback(
    (type: ElementType | undefined) => onSelectType(type),
    [onSelectType]
  );
  return (
    <View style={[style, styles.container, styles.verticalContainer]}>
      <PathToolbarItem
        path={SelectToolPath}
        onPress={() => handlePress(undefined)}
      />
      <PathToolbarItem path={PenToolPath} onPress={() => handlePress("path")} />
      <PathToolbarItem
        path={RectToolPath}
        onPress={() => handlePress("rect")}
      />
      <PathToolbarItem
        path={CircleToolPath}
        onPress={() => handlePress("circle")}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#DDD",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },
  verticalContainer: {
    flexDirection: "column",
    paddingHorizontal: 4,
    paddingVertical: 14,
  },
});
