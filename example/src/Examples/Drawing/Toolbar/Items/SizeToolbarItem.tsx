import React from "react";
import { Canvas, Line, useCanvas } from "@shopify/react-native-skia";

import type { BaseToolbarItemProps } from "./BaseToolbarItem";
import { BaseToolbarItem } from "./BaseToolbarItem";
import { styles } from "./styles";

type Props = BaseToolbarItemProps & {
  size: number;
};

export const SizeToolbarItem: React.FC<Props> = ({
  size,
  selected,
  onPress,
}) => {
  return (
    <BaseToolbarItem onPress={onPress} selected={selected}>
      <Canvas style={styles.toolbarItem}>
        <Item size={size} />
      </Canvas>
    </BaseToolbarItem>
  );
};

interface ItemProps {
  size: number;
}

const Item = ({ size }: ItemProps) => {
  const canvas = useCanvas();
  return (
    <Line
      p1={{ x: canvas.width / 2, y: 0 }}
      p2={{ x: canvas.width / 2, y: canvas.height }}
      strokeWidth={size}
      color={"#000"}
    />
  );
};
