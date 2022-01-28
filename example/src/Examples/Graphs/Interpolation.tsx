import {
  Canvas,
  Fill,
  LinearGradient,
  Paint,
  Path,
  Spring,
  useValue,
  vec,
} from "@shopify/react-native-skia";
import { runSpring } from "@shopify/react-native-skia/src/animation/Animation/functions";
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

  return (
    <View style={{ height }} onTouchEnd={onPress}>
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
          path={() => path.interpolate(path2, progress.value)}
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
