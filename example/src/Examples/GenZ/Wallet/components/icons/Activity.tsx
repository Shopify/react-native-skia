import React from "react";
import { Group, Points, vec } from "@shopify/react-native-skia";

export const Activity = () => {
  return (
    <Group style="stroke" strokeWidth={2} strokeCap="round" strokeJoin="round">
      <Points
        mode="polygon"
        points={[
          vec(22, 12),
          vec(18, 12),
          vec(15, 21),
          vec(9, 3),
          vec(6, 12),
          vec(2, 12),
        ]}
      />
    </Group>
  );
};
