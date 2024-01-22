import { BlurMask, Canvas, Path } from "@shopify/react-native-skia";
import React, { useEffect, useState } from "react";
import { useSharedValue, withTiming } from "react-native-reanimated";

export const CrashingBlur = () => {
  const [crasher, setCrasher] = useState(false);

  const blur = useSharedValue(4);

  const switchCrasher = () => {
    setTimeout(() => {
      setCrasher((prev) => !prev);
      switchCrasher();
    }, 2000);
  };

  useEffect(() => {
    blur.value = withTiming(12, { duration: 10000 });

    switchCrasher();
  }, []);

  return (
    <Canvas
      style={{
        height: "100%",
        width: "100%",
      }}
    >
      {crasher && (
        <Path path="M 100 100 L 300 100 L 200 300 z">
          <BlurMask blur={blur} />
        </Path>
      )}
    </Canvas>
  );
};
