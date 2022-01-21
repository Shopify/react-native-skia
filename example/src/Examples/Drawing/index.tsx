/* eslint-disable react-native/no-unused-styles */
import React, { useMemo, useRef } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";
import type { SkiaView } from "@shopify/react-native-skia";

import { DrawingCanvas } from "./DrawingCanvas";
import { ColorPalette, SizeConstants } from "./constants";
import { ColorMenu, DrawingToolMenu, MainToolbar, SizeMenu } from "./Toolbar";
import { ToolbarItemSize } from "./Toolbar/Items/styles";
import { useUxProvider, useDrawProvider } from "./Context";
import { useShareNavButton } from "./Hooks";

export const DrawingExample: React.FC = () => {
  const skiaViewRef = useRef<SkiaView>(null);

  useShareNavButton(skiaViewRef);

  const UxProvider = useUxProvider();
  const DrawProvider = useDrawProvider();

  const { width, height } = useWindowDimensions();
  const styles = useMemo(() => createStyle(width, height), [width, height]);

  return (
    <View style={styles.container}>
      <UxProvider>
        <DrawProvider>
          <DrawingCanvas innerRef={skiaViewRef} style={styles.canvas} />
          <MainToolbar style={styles.toolbar} />
          <DrawingToolMenu vertical style={styles.drawingModeMenu} />
          <ColorMenu vertical style={styles.colorMenu} colors={ColorPalette} />
          <SizeMenu vertical style={styles.sizeMenu} sizes={SizeConstants} />
        </DrawProvider>
      </UxProvider>
    </View>
  );
};

const toolbarWidth = ToolbarItemSize * 11;
const createStyle = (width: number, height: number) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    canvas: {
      flex: 1,
    },
    toolbar: {
      position: "absolute",
      left: width / 2 - toolbarWidth / 2,
      right: width / 2 - toolbarWidth / 2,
      bottom: height * 0.05,
    },
    drawingModeMenu: {
      position: "absolute",
      bottom: height * 0.05 + 54,
      left: width / 2 - toolbarWidth / 2 + ToolbarItemSize / 2.25,
    },
    colorMenu: {
      position: "absolute",
      bottom: height * 0.05 + 54,
      right: width / 2 - toolbarWidth / 2 + ToolbarItemSize / 2,
    },
    sizeMenu: {
      position: "absolute",
      bottom: height * 0.05 + 54,
      right: width / 2 - toolbarWidth / 2 + ToolbarItemSize * 2.45,
    },
  });
