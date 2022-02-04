import React from "react";
import {
  Group,
  Canvas,
  Circle,
  Text,
  useAnimationValue,
  useDerivedValue,
} from "@shopify/react-native-skia";
import { StyleSheet, View } from "react-native";

export const PlaygroundScreen: React.FC = () => {
  const timestamp = useAnimationValue();

  // Convert timestamp milliseconds to seconds
  const seconds = useDerivedValue((t) => t / 1000, [timestamp]);

  // Back and forth between 0..1
  const normalized = useDerivedValue(
    (s) => (s % 2.0 > 1 ? 1 - (s % 1) : s % 1),
    [seconds]
  );

  // Ease the value between 0..1
  const eased = useDerivedValue(
    (t) => 1 - Math.cos((t * Math.PI) / 2),
    [normalized]
  );

  // Interpolate point based on eased value between 0..1
  const xy = useDerivedValue(
    (t) => ({ x: 50 + Math.round(t * 100), y: 50 + Math.round(t * 100) }),
    [eased]
  );

  // Interpolate radius
  const radius = useDerivedValue((t) => t * 50 + 20, [eased]);

  // Interpolate color over normalized value
  const color = useDerivedValue(
    (t) => `rgba(${Math.round(t * 100 + 50)}, 45, 0, 1)`,
    [normalized]
  );

  // Info / Text value
  const info = useDerivedValue((t) => `eased: ${t.toFixed(2)}`, [eased]);

  // Transform
  const transform = useDerivedValue((pt) => [{ translateX: pt.x }], [xy]);

  return (
    <View style={styles.container}>
      <Canvas style={styles.container} debug>
        <Group transform={transform}>
          <Circle c={xy} r={radius} color={color} />
          <Text
            familyName="Courier New"
            size={14}
            x={10}
            y={300}
            value={info}
          />
        </Group>
      </Canvas>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
