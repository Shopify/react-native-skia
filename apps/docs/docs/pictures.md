---
id: pictures
title: Pictures
sidebar_label: Pictures
slug: /shapes/pictures
---

React Native Skia works in retained mode: every re-render, we create a display list with support for animation values.
This is great to animate property values. However, if you want to execute a variable number of drawing commands, this is where you need to use pictures.

A Picture contains a list of drawing operations to be drawn on a canvas.
The picture is immutable and cannot be edited or changed after it has been created. It can be used multiple times in any canvas.

| Name    | Type        | Description       |
| :------ | :---------- | :---------------- |
| picture | `SkPicture` | Picture to render |


## Hello World

In this example, we animate a trail of circles. The number of circles in the trail changes over time, which is why we need to use pictures: we can't animated on the number of circle components.

```tsx twoslash
import React, { useEffect } from "react";
import { Canvas, Picture, Skia } from "@shopify/react-native-skia";
import {
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const size = 256;
const n = 20;

const paint = Skia.Paint();

export const HelloWorld = () => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 3000 }), -1, true);
  }, [progress]);

  const picture = useDerivedValue(() => {
    "worklet";
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, size, size));
    const numberOfCircles = Math.floor(progress.value * n);
    for (let i = 0; i < numberOfCircles; i++) {
      const alpha = ((i + 1) / n) * 255;
      const r = ((i + 1) / n) * (size / 2);
      paint.setColor(Skia.Color(`rgba(0, 122, 255, ${alpha / 255})`));
      canvas.drawCircle(size / 2, size / 2, r, paint);
    }
    return recorder.finishRecordingAsPicture();
  });

  return (
    <Canvas style={{ flex: 1 }}>
      <Picture picture={picture} />
    </Canvas>
  );
};
```

## Applying Effects

The `Picture` component doesn't follow the same painting rules as other components.
However you can apply effects using the `layer` property.
For instance, in the example below, we apply a blur image filter.

```tsx twoslash
import React, { useMemo } from "react";
import { Canvas, Skia, Group, Paint, Blur, BlendMode, Picture } from "@shopify/react-native-skia";

export const Demo = () => {
  const picture = useMemo(() => {
    const recorder = Skia.PictureRecorder();
    const size = 256;
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, size, size));
    const r = 0.33 * size;
    const paint = Skia.Paint();
    paint.setBlendMode(BlendMode.Multiply);

    paint.setColor(Skia.Color("cyan"));
    canvas.drawCircle(r, r, r, paint);

    paint.setColor(Skia.Color("magenta"));
    canvas.drawCircle(size - r, r, r, paint);

    paint.setColor(Skia.Color("yellow"));
    canvas.drawCircle(size / 2, size - r, r, paint);

    return recorder.finishRecordingAsPicture();
  }, []);
  return (
    <Canvas style={{ flex: 1 }}>
      <Group layer={<Paint><Blur blur={10} /></Paint>}>
        <Picture picture={picture} />
      </Group>
    </Canvas>
  );
};
```

<img src={require("/static/img/blurred-picture.png").default} width="256" height="256" />

## Using Pictures with Reanimated

This is the most common use-case for pictures: drawing a variable number of elements based on gesture or animation state.
In the example below, we draw circles at touch positions using Reanimated and React Native Gesture Handler.
Because the number of touch points can vary, we use a picture to record and replay the drawing commands.

```tsx twoslash
import React from "react";
import { StyleSheet, View } from "react-native";
import type { SkPicture } from "@shopify/react-native-skia";
import {
  Canvas,
  Picture,
  Skia,
  PaintStyle,
  Fill,
} from "@shopify/react-native-skia";
import type { TouchData } from "react-native-gesture-handler";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";

const Colors = ["#2D4CD2", "#3CF2B5", "#A80DD8", "#36B6D9", "#37FF5E"];

// Create an empty picture to use as the initial value
const recorder = Skia.PictureRecorder();
recorder.beginRecording(Skia.XYWHRect(0, 0, 1, 1));
const emptyPicture = recorder.finishRecordingAsPicture();

// This paint object will be reused for all circles
const paint = Skia.Paint();
paint.setStyle(PaintStyle.Fill);

// This function runs on the UI thread
const drawTouches = (touches: TouchData[]) => {
  "worklet";
  const rec = Skia.PictureRecorder();
  const canvas = rec.beginRecording(Skia.XYWHRect(0, 0, 10000, 10000));
  touches.forEach((touch, index) => {
    const p = paint.copy();
    p.setColor(Skia.Color(Colors[index % Colors.length]));
    canvas.drawCircle(touch.x, touch.y, 50, p);
  });
  return rec.finishRecordingAsPicture();
};

export const TouchExample = () => {
  const picture = useSharedValue<SkPicture>(emptyPicture);

  const gesture = Gesture.Native()
    .onTouchesDown((event) => {
      picture.value = drawTouches(event.allTouches);
    })
    .onTouchesMove((event) => {
      picture.value = drawTouches(event.allTouches);
    })
    .onTouchesUp(() => {
      picture.value = emptyPicture;
    });

  return (
    <GestureDetector gesture={gesture}>
      <Canvas style={styles.container}>
        <Fill color="white" />
        <Picture picture={picture} />
      </Canvas>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
```

## Serialization

You can serialize a picture to a byte array.
Serialized pictures are only compatible with the version of Skia it was created with.
You can use serialized pictures with the [Skia debugger](https://skia.org/docs/dev/tools/debugger/).

```tsx twoslash
import React, { useMemo } from "react";
import {
  Canvas,
  Picture,
  Skia,
  Group,
} from "@shopify/react-native-skia";

export const PictureExample = () => {
  // Create picture
  const picture = useMemo(() => {
    const recorder = Skia.PictureRecorder();
    const canvas = recorder.beginRecording(Skia.XYWHRect(0, 0, 100, 100));

    const paint = Skia.Paint();
    paint.setColor(Skia.Color("pink"));
    canvas.drawRect({ x: 0, y: 0, width: 100, height: 100 }, paint);

    const circlePaint = Skia.Paint();
    circlePaint.setColor(Skia.Color("orange"));
    canvas.drawCircle(50, 50, 50, circlePaint);

    return recorder.finishRecordingAsPicture();
  }, []);

  // Serialize the picture
  const serialized = useMemo(() => picture.serialize(), [picture]);

  // Create a copy from serialized data
  const copyOfPicture = useMemo(
    () => (serialized ? Skia.Picture.MakePicture(serialized) : null),
    [serialized]
  );

  return (
    <Canvas style={{ flex: 1 }}>
      <Picture picture={picture} />
      <Group transform={[{ translateX: 200 }]}>
        {copyOfPicture && <Picture picture={copyOfPicture} />}
      </Group>
    </Canvas>
  );
};
```

## Instance Methods

| Name       | Description                                                                   |
| :--------- | :---------------------------------------------------------------------------- |
| makeShader | Returns a new shader that will draw with this picture.                        |
| serialize  | Returns a UInt8Array representing the drawing operations stored in the image. |
