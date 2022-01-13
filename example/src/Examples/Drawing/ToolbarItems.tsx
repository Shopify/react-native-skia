import React, { useMemo } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import type { IPath, RNSkiaDrawCallback } from "@shopify/react-native-skia";
import {
  StrokeCap,
  PaintStyle,
  usePaint,
  Skia,
  SkiaView,
  useDrawCallback,
} from "@shopify/react-native-skia";

type BaseToolbarItemProps = {
  selected?: boolean;
  onPress?: () => void;
};

export const ToolbarItemSize = 22;

const BaseToolbarItem: React.FC<BaseToolbarItemProps> = ({
  selected,
  onPress,
  children,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, selected ? styles.selected : {}]}
      onPress={onPress}
    >
      {children}
    </TouchableOpacity>
  );
};

type BaseSkiaToolbarItemProps = BaseToolbarItemProps & {
  innerRef?: React.RefObject<SkiaView>;
  selected?: boolean;
  onDraw: RNSkiaDrawCallback;
};

const BaseSkiaToolbarItem: React.FC<BaseSkiaToolbarItemProps> = ({
  innerRef,
  selected,
  onDraw,
  onPress,
}) => {
  return (
    <BaseToolbarItem onPress={onPress} selected={selected}>
      <SkiaView ref={innerRef} style={styles.toolbarItem} onDraw={onDraw} />
    </BaseToolbarItem>
  );
};

type ToolbarItemProps = {
  selected?: boolean;
  onPress?: () => void;
};

type ColorToolbarItemProps = ToolbarItemProps & { color: string };
export const ColorToolbarItem: React.FC<ColorToolbarItemProps> = ({
  color,
  selected,
  onPress,
}) => {
  return (
    <BaseToolbarItem onPress={onPress} selected={selected}>
      <View style={[styles.colorItem, { backgroundColor: color }]} />
    </BaseToolbarItem>
  );
};

type SizeToolbarItemProps = ToolbarItemProps & { size: number };
export const SizeToolbarItem: React.FC<SizeToolbarItemProps> = ({
  size,
  selected,
  onPress,
}) => {
  const p = useMemo(() => {
    const retVal = Skia.Paint();
    retVal.setStyle(PaintStyle.Stroke);
    retVal.setStrokeWidth(size);
    retVal.setStrokeCap(StrokeCap.Round);
    retVal.setAntiAlias(true);
    return retVal;
  }, [size]);

  const onDraw = useDrawCallback((canvas, info) => {
    canvas.drawLine(info.width / 2, 2, info.width / 2, info.height - 2, p);
  }, []);
  return (
    <BaseSkiaToolbarItem
      onPress={onPress}
      onDraw={onDraw}
      selected={selected}
    />
  );
};

type PathToolbarItemProps = ToolbarItemProps & { path: IPath | null };
export const PathToolbarItem: React.FC<PathToolbarItemProps> = ({
  path,
  selected,
  onPress,
}) => {
  const paint = usePaint((p) => {
    p.setColor(Skia.Color("#000"));
    p.setStyle(PaintStyle.Fill);
  });

  const bounds = useMemo(() => path?.computeTightBounds(), [path]);

  const onDraw = useDrawCallback(
    (canvas, info) => {
      if (path && bounds) {
        canvas.save();
        const offset = { x: bounds.x, y: bounds.y };
        const factor = {
          x: (info.width / (bounds.width + offset.x)) * 0.8,
          y: (info.height / (bounds.height + offset.y)) * 0.8,
        };
        canvas.translate(
          info.width / 2 - ((bounds.width + offset.x) * factor.x) / 2,
          info.height / 2 - ((bounds.height + offset.y) * factor.y) / 2
        );
        canvas.scale(factor.x, factor.y);
        canvas.drawPath(path, paint);
        canvas.restore();
      } else {
        console.log("***** Path empty");
      }
    },
    [path, bounds]
  );
  return (
    <BaseSkiaToolbarItem
      onDraw={onDraw}
      onPress={onPress}
      selected={selected}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  toolbarItem: {
    width: ToolbarItemSize,
    height: ToolbarItemSize,
  },
  colorItem: {
    width: ToolbarItemSize,
    height: ToolbarItemSize,
    borderRadius: ToolbarItemSize / 2,
  },
  selected: {
    backgroundColor: "#CCC",
    borderRadius: 4,
  },
});
