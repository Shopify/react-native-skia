import React from "react";
import { Canvas, Circle, useCanvas } from "@shopify/react-native-skia";

import type { BaseToolbarItemProps } from "./BaseToolbarItem";
import { BaseToolbarItem } from "./BaseToolbarItem";
import { styles } from "./styles";

type Props = BaseToolbarItemProps & {
  color: number;
};

export const ColorToolbarItem: React.FC<Props> = ({
  color,
  selected,
  onPress,
}) => {
  return (
    <BaseToolbarItem onPress={onPress} selected={selected}>
      <Canvas style={styles.toolbarItem}>
        <Item color={color} />
      </Canvas>
    </BaseToolbarItem>
  );
};

interface ItemProps {
  color: number;
}

const Item = ({ color }: ItemProps) => {
  const canvas = useCanvas();
  return (
    <Circle
      cx={canvas.width / 2}
      cy={canvas.height / 2}
      r={canvas.width / 2}
      color={color}
      style="fill"
    />
  );
};
