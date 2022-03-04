import {
  Canvas,
  canvas2Polar,
  Group,
  Image,
  Path,
  runDecay,
  useDerivedValue,
  useImage,
  usePath,
  useTouchHandler,
  useValue,
} from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";

const Size = 50;

export const FidgetSpinnerExample: React.FC = () => {
  const { width, height } = useWindowDimensions();
  const img = useImage(require("../../assets/fidget-spinner.png"));
  const center = useMemo(
    () => ({ x: width / 2 + 3, y: height / 2 + 32 }),
    [width, height]
  );
  const circles = usePath((p) => {
    p.addCircle(center.x, center.y, Size);
    p.addCircle(center.x, center.y - 136, Size);
    p.addCircle(center.x + 120, center.y + 70, Size);
    p.addCircle(center.x - 120, center.y + 70, Size);
  });
  const outer = usePath((p) => {
    p.addArc(
      {
        x: 0,
        y: 0,
        width: center.x - 120,
        height: center.y + 70,
      },
      Math.PI * 2,
      Math.PI * 4
    );
  });
  const theta = useValue(0);
  const offset = useValue(0);
  const transform = useDerivedValue((t) => [{ rotate: t }], [theta]);
  const handleTouches = useTouchHandler({
    onStart: () => {
      offset.current = theta.current;
    },
    onActive: ({ x, y }) => {
      const newVal = canvas2Polar({ x, y }, center).theta;
      theta.current = -newVal;
      offset.current = theta.current;
    },
    onEnd: ({ velocityX, velocityY }) => {
      runDecay(theta, { velocity: (velocityX + velocityY) * 0.5 });
    },
  });
  return img === null ? null : (
    <Canvas style={styles.container} onTouch={handleTouches}>
      <Group origin={center} transform={transform}>
        <Image
          image={img}
          fit="fitWidth"
          rect={() => ({
            x: 0,
            y: 0,
            width: width,
            height: height,
          })}
        />
        <Path path={circles} color="#000" />
        <Path path={outer} color="#00ff00" style="stroke" strokeWidth={8} />
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    height: "100%",
  },
});
