import React from "react";
import { Canvas, Line } from "@shopify/react-native-skia";

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
        <Line
          p1={(ctx) => ({ x: ctx.width / 2, y: 0 })}
          p2={(ctx) => ({ x: ctx.width / 2, y: ctx.height })}
          strokeWidth={size}
          color={"#000"}
        />
      </Canvas>
    </BaseToolbarItem>
  );
};
