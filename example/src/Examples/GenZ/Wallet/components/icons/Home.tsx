import React from "react";
import { Group, Path, Points, vec } from "@shopify/react-native-skia";

export const Home = () => {
  return (
    <Group style="stroke" strokeWidth={2} strokeCap="round" strokeJoin="round">
      <Path path="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <Points
        points={[vec(9, 22), vec(9, 12), vec(15, 12), vec(15, 22)]}
        mode="polygon"
      />
    </Group>
  );
};
