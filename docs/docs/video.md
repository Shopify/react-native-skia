---
id: video
title: Video
sidebar_label: Video
slug: /video
---

React Native Skia provides a way to load video frames as images, enabling rich multimedia experiences within your applications.
A video frame can be used anywhere a Skia image is accepted: `Image`, `ImageShader`, and `Atlas`.

## Requirements

- **Android:** API level 26 or higher.
- **Video URL:** Must be a local path. We recommend using it in combination with [expo-asset](https://docs.expo.dev/versions/latest/sdk/asset/) to download the video.
- **Animated Playback:** Available only via [Reanimated 3](/docs/animations/animations) and above.
- **Sound Playback:** Coming soon. In the meantime, audio can be played using [expo-av](https://docs.expo.dev/versions/latest/sdk/av/).

## Example

Here is an example of how to use the video support in React Native Skia. This example demonstrates how to load and display video frames within a canvas, applying a color matrix for visual effects. Tapping the screen will pause and play the video.

```tsx twoslash
import React from "react";
import {
  Canvas,
  ColorMatrix,
  Fill,
  ImageShader,
  useVideo
} from "@shopify/react-native-skia";
import { Pressable, useWindowDimensions } from "react-native";
import { useSharedValue } from "react-native-reanimated";

interface VideoExampleProps {
    localVideoFile: string;
}

// The URL needs to be a local path, we usually use expo-asset for that.
export const VideoExample = ({ localVideoFile }: VideoExampleProps) => {
  const paused = useSharedValue(false);
  const { width, height } = useWindowDimensions();
  const video = useVideo(
    require(localVideoFile),
    {
      paused,
    }
  );
  return (
    <Pressable
      style={{ flex: 1 }}
      onPress={() => (paused.value = !paused.value)}
    >
      <Canvas style={{ flex: 1 }}>
        <Fill>
          <ImageShader
            image={video}
            x={0}
            y={0}
            width={width}
            height={height}
            fit="cover"
          />
          <ColorMatrix
            matrix={[
              0.95, 0, 0, 0, 0.05, 0.65, 0, 0, 0, 0.15, 0.15, 0, 0, 0, 0.5, 0,
              0, 0, 1, 0,
            ]}
          />
        </Fill>
      </Canvas>
    </Pressable>
  );
};
```

## Using expo-asset

Below is an example where we use [expo-asset](https://docs.expo.dev/versions/latest/sdk/asset/) to load the video.

```tsx twoslash
import { useVideo } from "@shopify/react-native-skia";
import { useAssets } from "expo-asset";

// Example usage:
// const video = useVideoFromAsset(require("./BigBuckBunny.mp4"));
export const useVideoFromAsset = (
  mod: number,
  options?: Parameters<typeof useVideo>[1]
) => {
  const [assets, error] = useAssets([mod]);
  if (error) {
    throw error;
  }
  return useVideo(assets ? assets[0].localUri : null, options);
};
```