import React, { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { IPaint, SkiaView } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
import { Alert, Share } from "react-native";

import { ShareToolPath } from "./assets";
import { ColorPalette, DefaultPaint } from "./constants";
import type { DrawingElements, ElementType, DrawingElement } from "./types";
import { PathToolbarItem } from "./ToolbarItems";

type SelectedToolbar = "size" | "color" | "type";
const BackgroundImage = require("../../assets/oslo.jpg");

export const useController = (skiaViewRef: React.RefObject<SkiaView>) => {
  const elements = useMemo(() => [] as DrawingElements, []);
  const [selectedElement, setSelectedElement] = useState<DrawingElement>();
  const [currentType, setCurrentType] = useState<ElementType | undefined>(
    "path"
  );
  const [currentColor, setCurrentColor] = useState<string>(ColorPalette[1]);
  const [currentPaint, setCurrentPaint] = useState<IPaint>(DefaultPaint);
  const [currentImage, setCurrentImage] = useState(undefined);
  const [selectedToolbar, setSelectedToolbar] = useState<
    SelectedToolbar | undefined
  >(undefined);

  const toggleToolbar = useCallback((next: SelectedToolbar | undefined) => {
    setSelectedToolbar((p) => (p === next ? undefined : next));
  }, []);

  const handleColorSelected = useCallback(
    (color: string) => {
      setCurrentPaint((p) => {
        const next = p.copy();
        next.setColor(Skia.Color(color));
        if (selectedElement) {
          selectedElement.p = next;
        }
        return next;
      });
      setCurrentColor(color);
      toggleToolbar(undefined);
    },
    [selectedElement, toggleToolbar]
  );

  const handleSizeSelected = useCallback(
    (size: number) => {
      setCurrentPaint((p) => {
        const next = p.copy();
        next.setStrokeWidth(size);
        if (selectedElement) {
          selectedElement.p = next;
        }
        return next;
      });
      toggleToolbar(undefined);
    },
    [selectedElement, toggleToolbar]
  );

  const handleTypeSelected = useCallback(
    (type: ElementType | undefined) => {
      setCurrentType(type);
      toggleToolbar(undefined);
    },
    [toggleToolbar]
  );

  const handleTypePressed = useCallback(
    () => toggleToolbar("type"),
    [toggleToolbar]
  );

  const handleColorPressed = useCallback(
    () => toggleToolbar("color"),
    [toggleToolbar]
  );

  const handleSizePressed = useCallback(
    () => toggleToolbar("size"),
    [toggleToolbar]
  );

  const handleSelectElement = useCallback(
    (element: DrawingElement | undefined) => setSelectedElement(element),
    []
  );

  const handleDeleteElement = useCallback(() => {
    toggleToolbar(undefined);
    if (selectedElement) {
      elements.splice(elements.indexOf(selectedElement), 1);
    }
    setSelectedElement(undefined);
    skiaViewRef.current?.redraw();
  }, [elements, selectedElement, skiaViewRef, toggleToolbar]);

  const handleImage = useCallback(() => {
    setCurrentImage((p) => (p ? undefined : BackgroundImage));
    toggleToolbar(undefined);
    setSelectedElement(undefined);
  }, [toggleToolbar]);

  const handleAddElement = useCallback(
    (element: DrawingElement) => {
      elements.push(element);
      setSelectedElement(undefined);
    },
    [elements]
  );

  const handleShare = useCallback(() => {
    const image = skiaViewRef.current?.makeImageSnapshot();
    if (image) {
      const data = image.toBase64();
      const url = `data:image/png;base64,${data}`;
      Share.share({
        url,
        title: "Drawing",
      }).catch(() => {
        Alert.alert("An error occurred when sharing the image.");
      });
    }
  }, [skiaViewRef]);

  const navigation = useNavigation();
  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <PathToolbarItem path={ShareToolPath} onPress={handleShare} />
      ),
    });
  }, [navigation, handleShare]);

  return useMemo(
    () => ({
      elements,
      handleAddElement,
      handleColorSelected,
      handleColorPressed,
      handleDeleteElement,
      handleImage,
      handleSelectElement,
      handleSizePressed,
      handleSizeSelected,
      handleTypePressed,
      handleTypeSelected,
      selectedElement,
      selectedToolbar,
      currentPaint,
      currentType,
      currentColor,
      currentImage,
    }),
    [
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
    ]
  );
};
