import {
  Canvas,
  Fill,
  LinearGradient,
  Path,
  runSpring,
  Spring,
  useDerivedValue,
  useValue,
  vec,
} from "@shopify/react-native-skia";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

import { createGraphPath } from "./createGraphPath";
import type { GraphProps } from "./types";

export const Interpolation: React.FC<GraphProps> = ({ height, width }) => {
  const path = useMemo(
    () => createGraphPath(width, height, 60),
    [height, width]
  );

  const path2 = useMemo(
    () => createGraphPath(width, height, 60),
    [height, width]
  );

  const progress = useValue(0);
  const [toggled, setToggled] = useState(false);
  const onPress = useCallback(() => setToggled((p) => !p), []);
  useEffect(() => {
    runSpring(progress, toggled ? 1 : 0, Spring.Config.Gentle);
  }, [progress, toggled]);

  const interpolatedPath = useDerivedValue(
    () => path.interpolate(path2, progress.current),
    [progress]
  );

  return (
    <View style={{ height, marginBottom: 10 }} onTouchEnd={onPress}>
      <Canvas style={styles.graph}>
        <Fill color="black" />
        <Path
          path={interpolatedPath}
          strokeWidth={4}
          style="stroke"
          strokeJoin="round"
          strokeCap="round"
        >
          <LinearGradient
            start={vec(0, height * 0.5)}
            end={vec(width * 0.5, height * 0.5)}
            colors={["black", "#cccc66"]}
          />
        </Path>
      </Canvas>
      <Text>Touch graph to interpolate</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  graph: {
    flex: 1,
  },
});
