import type { ReactNode } from "react";
import React, { useEffect, useState } from "react";
import type { SkPaint, SkRect } from "@shopify/react-native-skia";
import {
  useFont,
  FilterMode,
  Canvas,
  Group,
  Rect,
  Text,
  useClockValue,
  useComputedValue,
  rect,
  createDrawing,
  Skia,
  TileMode,
} from "@shopify/react-native-skia";

const size = 200;
const n = 99;

export const FreezeExample = () => {
  const font = useFont(require("../../assets/SF-Mono-Semibold.otf"), 32);
  const [color, setColor] = useState("black");
  const clock = useClockValue();
  const transform = useComputedValue(
    () => [{ translateY: 100 }, { rotate: (Math.PI * clock.current) / 4000 }],
    [clock]
  );
  useEffect(() => {
    const h = setInterval(() => {
      setColor("#" + (Math.random().toString(16) + "00000").slice(2, 8));
    }, 10000);
    return () => clearInterval(h);
  }, []);
  if (font === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1, margin: 50 }} debug>
      <Group origin={{ x: size / 2, y: size / 2 }} transform={transform}>
        <Freeze key={color} rect={rect(0, 0, 200, 200)}>
          <Checkerboard color={color} />
        </Freeze>
      </Group>
      {font && <Text x={20} y={size + 100} text={`n = ${n}`} font={font} />}
    </Canvas>
  );
};

const Checkerboard = ({ color }: { color: string }) => {
  // draw a n * n checkerboard
  return (
    <>
      {[...Array(n * n)].map((_, i) => (
        <Rect
          key={i}
          x={((i % n) * size) / n}
          y={(Math.floor(i / n) * size) / n}
          width={size / n}
          height={size / n}
          color={i % 2 ? color : "#ddd"}
        />
      ))}
    </>
  );
};

interface FreezeProps {
  rect: SkRect;
  children?: ReactNode | ReactNode[];
}

const onDraw = createDrawing<FreezeProps>(
  (ctx, { rect: boundingRect }, node) => {
    if (node.memoized === null) {
      const recorder = Skia.PictureRecorder();
      const canvas = recorder.beginRecording(boundingRect);
      node.visit({
        ...ctx,
        canvas,
      });
      const pic = recorder.finishRecordingAsPicture();
      const shaderPaint = Skia.Paint();
      shaderPaint.setShader(
        pic.makeShader(TileMode.Decal, TileMode.Decal, FilterMode.Nearest)
      );
      node.memoized = shaderPaint;
    }
    ctx.canvas.drawRect(boundingRect, node.memoized as SkPaint);
  }
);

export const Freeze = (props: FreezeProps) => {
  return <skDrawing onDraw={onDraw} skipProcessing {...props} />;
};
