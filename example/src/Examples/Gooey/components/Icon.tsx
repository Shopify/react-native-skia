import type { IPath } from "@shopify/react-native-skia";
import { Group, Path, Circle, vec } from "@shopify/react-native-skia";
import React from "react";

const R = 50;

interface IconProps {
  path: IPath;
}

export const Icon = ({ path }: IconProps) => {
  return (
    <>
      <Circle c={vec()} r={R} color="#ade6e6" />
      <Group
        origin={vec(12)}
        transform={[{ translateX: -12 }, { translateY: -12 }, { scale: 2 }]}
      >
        <Path path={path} color="white" />
      </Group>
    </>
  );
};
