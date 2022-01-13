import React, { useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import type { SkiaView } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";

import { DrawingCanvas } from "./DrawingCanvas";
import {
  ColorToolbar,
  DrawingToolbar,
  SizeToolbar,
  TypeToolbar,
} from "./Toolbar";
import { ColorPalette, SizeConstants } from "./constants";
import { useController } from "./useController";
import { ToolbarItemSize } from "./ToolbarItems";

const BackgroundPaint = Skia.Paint();
BackgroundPaint.setColor(Skia.Color("#FFF"));

export const DrawingExample: React.FC = () => {
  const skiaViewRef = useRef<SkiaView>(null);
  const {
    currentImage,
    currentPaint,
    currentType,
    currentColor,
    elements,
    handleAddElement,
    handleColorPressed,
    handleColorSelected,
    handleDeleteElement,
    handleImage,
    handleSelectElement,
    handleSizePressed,
    handleSizeSelected,
    handleTypePressed,
    handleTypeSelected,
    selectedElement,
    selectedToolbar,
  } = useController(skiaViewRef);

  return (
    <View style={styles.container}>
      <DrawingCanvas
        innerRef={skiaViewRef}
        elements={elements}
        selectedElement={selectedElement}
        background={BackgroundPaint}
        paint={currentPaint}
        type={currentType}
        style={styles.canvas}
        backgroundImage={currentImage}
        onSelecteElement={handleSelectElement}
        onAddElement={handleAddElement}
      />
      <DrawingToolbar
        size={currentPaint.getStrokeWidth()}
        color={currentColor}
        type={currentType}
        style={styles.toolbar}
        onColorPressed={handleColorPressed}
        onSizePressed={handleSizePressed}
        onDeletePressed={handleDeleteElement}
        onImagePressed={handleImage}
        onTypePressed={handleTypePressed}
      />
      {selectedToolbar === "type" ? (
        <TypeToolbar
          type={currentType}
          style={styles.typeToolbar}
          onSelectType={handleTypeSelected}
        />
      ) : null}
      {selectedToolbar === "color" ? (
        <ColorToolbar
          style={styles.colorToolbar}
          colors={ColorPalette}
          onSelectColor={handleColorSelected}
        />
      ) : null}
      {selectedToolbar === "size" ? (
        <SizeToolbar
          style={styles.sizeToolbar}
          sizes={SizeConstants}
          paint={currentPaint}
          onSelectSize={handleSizeSelected}
        />
      ) : null}
    </View>
  );
};

const { width, height } = Dimensions.get("window");
const toolbarWidth = ToolbarItemSize * 11;
const styles = StyleSheet.create({
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
  typeToolbar: {
    position: "absolute",
    bottom: height * 0.05 + 54,
    left: width / 2 - toolbarWidth / 2 + ToolbarItemSize / 2,
  },
  colorToolbar: {
    position: "absolute",
    bottom: height * 0.05 + 54,
    right: width / 2 - toolbarWidth / 2 + ToolbarItemSize / 2,
  },
  sizeToolbar: {
    position: "absolute",
    bottom: height * 0.05 + 54,
    right: width / 2 - toolbarWidth / 2 + ToolbarItemSize * 2.5,
  },
});
