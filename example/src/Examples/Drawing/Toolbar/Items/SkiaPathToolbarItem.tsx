import React, { useCallback, useMemo } from "react";
import type { SkPath } from "@shopify/react-native-skia";
import { Canvas, Group, Path } from "@shopify/react-native-skia";

import type { BaseToolbarItemProps } from "./BaseToolbarItem";
import { BaseToolbarItem } from "./BaseToolbarItem";
import { styles } from "./styles";

type Props = BaseToolbarItemProps & {
  path: SkPath;
};

export const PathToolbarItem: React.FC<Props> = ({
  path,
  disabled,
  selected,
  onPress,
}) => {
  const bounds = useMemo(() => path.computeTightBounds(), [path]);
  const getTransform = useCallback(
    (width: number, height: number) => {
      // Calculate the transform for the path as a function of
      // the canvas size and the path size.
      const offset = { x: bounds.x, y: bounds.y };
      const factor = Math.min(
        (width / (bounds.width + offset.x)) * 0.8,
        (height / (bounds.height + offset.y)) * 0.8
      );
      return [
        { translateX: width / 2 - ((bounds.width + offset.x) * factor) / 2 },
        {
          translateY: height / 2 - ((bounds.height + offset.y) * factor) / 2,
        },
        { scaleX: factor },
        { scaleY: factor },
      ];
    },
    [bounds.height, bounds.width, bounds.x, bounds.y]
  );

  return (
    <BaseToolbarItem onPress={onPress} disabled={disabled} selected={selected}>
      <Canvas style={styles.toolbarItem}>
        <Group transform={(ctx) => getTransform(ctx.width, ctx.height)}>
          <Path path={path} color="#000" style={"fill"} />
        </Group>
      </Canvas>
    </BaseToolbarItem>
  );
};
