import React from "react";
import { Canvas, Circle } from "@shopify/react-native-skia";

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
        <Circle
          cx={(ctx) => ctx.width / 2}
          cy={(ctx) => ctx.height / 2}
          r={(ctx) => ctx.width / 2}
          color={color}
          style="fill"
        />
      </Canvas>
    </BaseToolbarItem>
  );
};
