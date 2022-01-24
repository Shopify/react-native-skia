import type { IRect } from "@shopify/react-native-skia";
import { PaintStyle, Skia, StrokeCap } from "@shopify/react-native-skia";
import React, { useMemo } from "react";

import * as constants from "../constants";

import type {
  DrawState,
  DrawContextType,
  DrawingElement,
  DrawingElements,
  ResizeMode,
} from "./types";

export const DrawContext = React.createContext<DrawContextType | undefined>(
  undefined
);

const createDrawProviderValue = (): DrawContextType => {
  const state: DrawState = {
    size: constants.SizeConstants[1],
    color: constants.ColorPalette[0],
    paint: createPaint(constants.ColorPalette[0], constants.SizeConstants[1]),
    elements: [],
    selectedElements: [],
    currentSelectionRect: undefined,
    resizeMode: undefined,
  };

  const listeners = [] as ((state: DrawState) => void)[];
  const notifyListeners = (s: DrawState) => listeners.forEach((l) => l(s));

  const commands = {
    setColor: (color: string) => {
      state.color = color;
      state.paint = state.paint.copy();
      state.paint.setColor(Skia.Color(color));
      // Update the selected elements
      state.selectedElements.forEach((e) => {
        e.p = e.p.copy();
        e.p.setColor(Skia.Color(color));
      });
      notifyListeners(state);
    },
    setSize: (size: number) => {
      state.size = size;
      state.paint = state.paint.copy();
      state.paint.setStrokeWidth(size);
      // Update the selected elements
      state.selectedElements.forEach((e) => {
        e.p = e.p.copy();
        e.p.setStrokeWidth(size);
      });
      notifyListeners(state);
    },
    addElement: (element: DrawingElement) => {
      state.elements.push(element);
      notifyListeners(state);
    },
    setSelectedElements: (...elements: DrawingElements) => {
      state.selectedElements = elements;
      notifyListeners(state);
    },
    setSelectionRect: (rect: IRect | undefined) => {
      state.currentSelectionRect = rect;
      notifyListeners(state);
    },
    deleteSelectedElements: () => {
      state.elements = state.elements.filter(
        (el) => !state.selectedElements.includes(el)
      );
      state.selectedElements = [];
      notifyListeners(state);
    },
    setResizeMode: (resizeMode: ResizeMode | undefined) => {
      state.resizeMode = resizeMode;
      notifyListeners(state);
    },
  };

  return {
    state,
    commands,
    addListener: (cb: (state: DrawState) => void) => {
      listeners.push(cb);
      return () => listeners.splice(listeners.indexOf(cb), 1);
    },
  };
};

export const useDrawProvider = () => {
  const uxContext = useMemo(() => createDrawProviderValue(), []);
  const retVal: React.FC = ({ children }) => (
    <DrawContext.Provider value={uxContext}>{children}</DrawContext.Provider>
  );
  return retVal;
};

const createPaint = (color: string, size: number) => {
  const paint = Skia.Paint();
  paint.setAntiAlias(true);
  paint.setStrokeCap(StrokeCap.Round);
  paint.setStrokeWidth(size);
  paint.setStyle(PaintStyle.Stroke);
  paint.setColor(Skia.Color(color));
  return paint;
};
