import {
  Canvas,
  Fill,
  LinearGradient,
  Paint,
  Path,
  runTiming,
  useDerivedValue,
  useValue,
  vec,
} from "@shopify/react-native-skia";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Easing, StyleSheet, Text, View } from "react-native";

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
    runTiming(progress, toggled ? 1 : 0, {
      duration: 500,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [progress, toggled]);

  const interpolatedPath = useDerivedValue(
    (p) => path.interpolate(path2, p),
    [progress]
  );

  return (
    <View style={{ height, marginBottom: 10 }} onTouchEnd={onPress}>
      <Canvas style={styles.graph}>
        <Fill color="black" />
        <Paint>
          <LinearGradient
            start={vec(0, height * 0.5)}
            end={vec(width * 0.5, height * 0.5)}
            colors={["black", "#cccc66"]}
          />
        </Paint>
        <Path
          path={interpolatedPath}
          strokeWidth={4}
          style="stroke"
          strokeJoin="round"
          strokeCap="round"
        />
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
