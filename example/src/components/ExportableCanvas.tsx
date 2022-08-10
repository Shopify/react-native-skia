import type { CanvasProps } from "@shopify/react-native-skia";
import {
  useTouchHandler,
  ImageFormat,
  Canvas,
  useCanvasRef,
} from "@shopify/react-native-skia";
import React, { useCallback } from "react";
import { Alert, Share } from "react-native";

export const ExportableCanvas = ({ children, style }: CanvasProps) => {
  const ref = useCanvasRef();
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
    <Canvas
      accessibilityHint="canvas"
      style={style}
      ref={ref}
      onTouch={onTouch}
    >
      {children}
    </Canvas>
  );
};
