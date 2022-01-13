import React, { useCallback, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import type { IPaint, SkiaView } from "@shopify/react-native-skia";
import { Skia } from "@shopify/react-native-skia";
import { Alert, Share } from "react-native";
import { fitRects } from "@shopify/react-native-skia/src/renderer/components/image/BoxFit";

import { ShareToolPath } from "./assets";
import { ColorPalette, DefaultPaint } from "./constants";
import type {
  DrawingElements,
  ElementType,
  DrawingElement,
  ToolType,
} from "./types";
import { PathToolbarItem } from "./ToolbarItems";

type VisibleToolbar = "size" | "color" | "type";

const BackgroundImage = require("../../assets/oslo.jpg");

export const useController = (skiaViewRef: React.RefObject<SkiaView>) => {
  const elements = useMemo(() => [] as DrawingElements, []);
  const [selectedElement, setSelectedElement] = useState<DrawingElement>();
  const [currentType, setCurrentType] = useState<ElementType>("path");
  const [currentTool, setCurrentTool] = useState<ToolType>("draw");
  const [currentColor, setCurrentColor] = useState<string>(ColorPalette[1]);
  const [currentPaint, setCurrentPaint] = useState<IPaint>(DefaultPaint);
  const [currentImage, setCurrentImage] = useState(undefined);
  const [selectedToolbar, setSelectedToolbar] = useState<
    VisibleToolbar | undefined
  >(undefined);

  const toggleToolbar = useCallback((next: VisibleToolbar | undefined) => {
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
    (type: ElementType) => {
      setCurrentType(type);
      toggleToolbar(undefined);
    },
    [toggleToolbar]
  );

  const handleSelectPressed = useCallback(() => {
    setCurrentTool("select");
    toggleToolbar(undefined);
  }, [toggleToolbar]);

  const handleTypePressed = useCallback(() => {
    setCurrentTool((p) => {
      if (p === "draw") {
        toggleToolbar("type");
      } else {
        toggleToolbar(undefined);
      }
      return "draw";
    });
  }, [toggleToolbar]);

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
    let image = skiaViewRef.current?.makeImageSnapshot();
    if (image) {
      if (image.width() > 1000 || image.height() > 1000) {
        console.log("Resizing");
        // Resize image based on width and height
        const ratio = image.width() / image.height();
        const newWidth = 1000;
        const newHeight = 1000 / ratio;
        const rect = Skia.XYWHRect(0, 0, newWidth, newHeight);
        const surface = Skia.Surface.Make(newWidth, newHeight);
        const { src, dst } = fitRects("cover", image, rect);
        surface.getCanvas().drawImageRect(image, src, dst, Skia.Paint());
        image = surface.makeImageSnapshot();
      }
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
      handleSelectPressed,
      handleTypeSelected,
      selectedElement,
      selectedToolbar,
      currentPaint,
      currentType,
      currentTool,
      currentColor,
      currentImage,
    }),
    [
      currentImage,
      currentPaint,
      currentType,
      currentTool,
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
      handleSelectPressed,
      selectedElement,
      selectedToolbar,
    ]
  );
};
