import {
  Canvas,
  Paint,
  Rect,
  Skia,
  SkiaView,
  PaintStyle,
  usePaintRef,
} from "@shopify/react-native-skia";
import type { SkCanvas } from "@shopify/react-native-skia";
import React, { useMemo, useCallback, useState } from "react";
import {
  Switch,
  StyleSheet,
  useWindowDimensions,
  View,
  Text,
  Button,
} from "react-native";

// Load font
const Size = 15;
const paint1 = Skia.Paint();
paint1.setAntiAlias(true);
paint1.setColor(Skia.Color("#A2AE6A"));

const paint2 = Skia.Paint();
paint2.setAntiAlias(true);
paint2.setColor(Skia.Color("#4060A3"));
paint2.setStyle(PaintStyle.Stroke);
paint2.setStrokeWidth(2);

export const PerformanceDrawingTest: React.FC = () => {
  const [isDeclarative, setIsDeclarative] = useState(false);
  const [numberOfBoxes, setNumberOfBoxes] = useState(300);

  const { width } = useWindowDimensions();

  const rects = useMemo(
    () =>
      new Array(numberOfBoxes)
        .fill(0)
        .map((_, i) =>
          Skia.XYWHRect(
            5 + ((i * Size) % width),
            25 + Math.floor(i / (width / Size)) * Size,
            Size * 0.8,
            Size * 0.25
          )
        ),
    [width, numberOfBoxes]
  );

  const draw = useCallback(
    (canvas: SkCanvas) => {
      for (let i = 0; i < rects.length; i++) {
        canvas.drawRect(rects[i], paint1);
        canvas.drawRect(rects[i], paint2);
      }
    },
    [rects]
  );
  const paint1Ref = usePaintRef();
  const paint2Ref = usePaintRef();

  return (
    <View style={styles.container}>
      <View style={styles.mode}>
        <View style={styles.panel}>
          <Button
            title="⬇️"
            onPress={() => setNumberOfBoxes((n) => Math.max(0, n - 50))}
          />
          <Text>&nbsp;Size&nbsp;</Text>
          <Text>{numberOfBoxes}</Text>
          <Text>&nbsp;</Text>
          <Button title="⬆️" onPress={() => setNumberOfBoxes((n) => n + 50)} />
        </View>
        <View style={styles.panel}>
          <Text>Use Declarative model&nbsp;</Text>
          <Switch
            value={isDeclarative}
            onValueChange={() => setIsDeclarative((p) => !p)}
          />
        </View>
      </View>
      {isDeclarative ? (
        <Canvas style={styles.container} debug mode="continuous">
          <Paint ref={paint1Ref} color="#A2AE6A" style={"fill"} />
          <Paint
            ref={paint2Ref}
            color="#4060A3"
            style="stroke"
            strokeWidth={2}
          />
          {rects.map((_, i) => (
            <React.Fragment key={i}>
              <Rect rect={rects[i]} paint={paint1Ref} />
              <Rect rect={rects[i]} paint={paint2Ref} />
            </React.Fragment>
          ))}
        </Canvas>
      ) : (
        <SkiaView
          style={styles.container}
          onDraw={draw}
          debug
          mode="continuous"
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mode: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  panel: {
    flexDirection: "row",
    alignItems: "center",
  },
});
