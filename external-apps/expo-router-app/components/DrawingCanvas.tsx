import { Canvas, Path, PathProps, Skia } from "@shopify/react-native-skia/src";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, Platform, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import {
  runOnJS,
  SharedValue,
  useDerivedValue,
  useSharedValue,
} from "react-native-reanimated";

type DrawingPath = {
  key: string;
  path: string;
  action: DrawingMode;
  width: number;
};

type DrawingMode = "erase" | "draw";

type Listener = () => Promise<void> | void;

export const DrawingCanvas = () => {
  const [drawingMode, setDrawingMode] = useState<DrawingMode>("draw");
  const resolver = useRef<{ [key: string]: Listener }>({});
  const pathSharedVal = useSharedValue(Skia.Path.Make());
  const derivedPathSharedVal = useDerivedValue(() =>
    pathSharedVal.value.toSVGString()
  );
  const [drawnPaths, setDrawnPaths] = useState<DrawingPath[]>([]);

  const getSharedValue = (val: any | SharedValue<any>) => {
    "worklet";
    return val && typeof val === "object" && "value" in val ? val.value : val;
  };

  const generateUniqueKey = (prefix?: string) => {
    "worklet";
    return `${prefix}-${Date.now()}`;
  };

  const stroke = useMemo(
    (): Partial<PathProps> => ({
      strokeWidth: drawingMode === "erase" ? 20 : 3,
      color: drawingMode === "erase" ? "transparent" : "black",
      blendMode: drawingMode === "erase" ? "clear" : undefined,
    }),
    [drawingMode]
  );

  useEffect(() => {
    const last = drawnPaths.at(-1);
    if (last && resolver.current[last.key]) {
      resolver.current[last.key]();
      delete resolver.current[last.key];
    }
  }, [drawnPaths]);

  const addDrawn = useCallback((path: DrawingPath) => {
    resolver.current[path.key] = () => {
      pathSharedVal.modify((v) => {
        "worklet";
        v.reset();
        return v;
      });
    };

    setDrawnPaths((paths) => paths.concat([path]));
  }, []);

  const gesture = useMemo(
    () =>
      Gesture.Pan()
        .maxPointers(1)
        .onBegin((e) => {
          "worklet";
          const touch = e;
          pathSharedVal.modify((v) => {
            v.reset();
            v.moveTo(touch.x || 0, touch.y || 0);
            v.lineTo(touch.x || 0, touch.y || 0);
            return v;
          });
        })
        .onUpdate((e) => {
          "worklet";
          if (pathSharedVal.value.isEmpty()) {
            return;
          }
          pathSharedVal.modify((v) => {
            v.lineTo(e.x || 0, e.y || 0);
            return v;
          });
        })
        .onFinalize(() => {
          "worklet";
          if (pathSharedVal.value.isEmpty()) {
            return;
          }
          runOnJS(addDrawn)({
            key: generateUniqueKey("path"),
            path: getSharedValue(derivedPathSharedVal),
            action: stroke.color === "transparent" ? "erase" : "draw",
            width: stroke.strokeWidth,
          } as DrawingPath);
        }),
    [stroke]
  );

  return (
    <View
      style={{
        flex: 1,
      }}
    >
      <GestureDetector gesture={gesture}>
        <Canvas
          style={{
            flex: 1,
            borderColor: "black",
            borderWidth: 1,
            width: "100%",
          }}
        >
          {drawnPaths.map((path) => (
            <Path
              style="stroke"
              strokeWidth={path.width}
              path={path.path}
              color={path.action === "draw" ? "black" : "transparent"}
              blendMode={path.action === "draw" ? undefined : "clear"}
              key={path.key}
            />
          ))}
          <Path path={derivedPathSharedVal} style="stroke" {...stroke} />
        </Canvas>
      </GestureDetector>
      <View style={{ flexDirection: "row" }}>
        <Button
          title="Draw"
          disabled={drawingMode == "draw"}
          onPress={() => setDrawingMode("draw")}
        ></Button>
        <Button
          title="Erase"
          disabled={drawingMode == "erase"}
          onPress={() => setDrawingMode("erase")}
        ></Button>
      </View>
    </View>
  );
};
