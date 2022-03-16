import type { CanvasProps, SkiaView } from "@shopify/react-native-skia";
import {
  useTouchHandler,
  ImageFormat,
  Canvas,
} from "@shopify/react-native-skia";
import React, { useCallback, useRef } from "react";
import { Alert, Share } from "react-native";

export const ExportableCanvas = ({ children, style }: CanvasProps) => {
  const ref = useRef<SkiaView>(null);
  const onTouch = useTouchHandler({
    onEnd: () => {
      handleShare();
    },
  });
  const handleShare = useCallback(() => {
    const image = ref.current?.makeImageSnapshot();
    if (image) {
      const data = image.encodeToBase64(ImageFormat.PNG, 100);
      const url = `data:image/png;base64,${data}`;
      Share.share({
        url,
        title: "Drawing",
      }).catch(() => {
        Alert.alert("An error occurred when sharing the image.");
      });
    } else {
      Alert.alert(
        "An error occurred when creating a snapshot of your drawing."
      );
    }
  }, [ref]);
  return (
    <Canvas style={style} ref={ref} onTouch={onTouch}>
      {children}
    </Canvas>
  );
};
