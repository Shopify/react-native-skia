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

import { createGraphPath, createZeroPath } from "./createGraphPath";
import type { GraphProps } from "./types";

export const MountAnimation: React.FC<GraphProps> = ({ height, width }) => {
  const zeroPath = useMemo(
    () => createZeroPath(width, height, 60),
    [height, width]
  );
  const path = useMemo(
    () => createGraphPath(width, height, 60, false),
    [height, width]
  );

  const progress = useValue(0);
  const [toggled, setToggled] = useState(false);
  const onPress = useCallback(() => setToggled((p) => !p), []);

  useEffect(() => {
    runSpring(progress, toggled ? 1 : 0, Spring.Config.Gentle);
  }, [progress, toggled]);

  const interpolatedPath = useDerivedValue(
    () => path.interpolate(zeroPath, progress.current),
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
            colors={["black", "#3B8EA5"]}
          />
        </Path>
      </Canvas>
      <Text>Touch to toggle between "unmounted" and "mounted"</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  graph: {
    flex: 1,
  },
});
