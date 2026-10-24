import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { Canvas, Fill } from "react-native-skia";

// Cyan above and red below, each the frame of a static canvas.
export const StaticCanvas = () => (
  <View style={{ flex: 1 }}>
    <Canvas style={{ flex: 1 }} static>
      <Fill color="cyan" />
    </Canvas>
    <Canvas style={{ flex: 1 }} static>
      <Fill color="red" />
    </Canvas>
  </View>
);

const CHURNED_CANVASES = 60;
const CHURN_CYCLES = 24;

// Static canvases mounted and dropped on the next frame, over and over, so
// that the worker is still presenting some of them as React drops them; then
// one cyan static canvas that stays.
export const StaticCanvasChurn = () => {
  const [step, setStep] = useState(0);
  const churning = step < 2 * CHURN_CYCLES;
  useEffect(() => {
    if (!churning) {
      return;
    }
    const frame = requestAnimationFrame(() => setStep((value) => value + 1));
    return () => cancelAnimationFrame(frame);
  }, [churning, step]);
  if (!churning) {
    return (
      <Canvas style={{ flex: 1 }} static>
        <Fill color="cyan" />
      </Canvas>
    );
  }
  return (
    <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
      {step % 2 === 0
        ? Array.from({ length: CHURNED_CANVASES }, (_, index) => (
            <Canvas key={index} style={{ width: 8, height: 8 }} static>
              <Fill color="red" />
            </Canvas>
          ))
        : null}
    </View>
  );
};
