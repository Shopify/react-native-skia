import { useRef } from "react";
import type { SkPoint } from "@shopify/react-native-skia";
import { useImage, useTouchHandler } from "@shopify/react-native-skia";

import {
  findClosestElementToPoint,
  findElementsInRect,
  findResizeMode,
  pointInRect,
  resizeElementsBy,
  createPath,
  createRect,
  createOval,
  createImage,
  getBoundingBox,
} from "../Context";

import { useDrawContext } from "./useDrawContext";
import { useUxContext } from "./useUxContext";

const osloImg = require("../../../assets/card.png");

export const useTouchDrawing = () => {
  const prevPointRef = useRef<SkPoint>();
  const drawContext = useDrawContext();
  const uxContext = useUxContext();
  const oslo = useImage(osloImg);

  return useTouchHandler({
    onStart: ({ x, y }) => {
      // Close any menus
      uxContext.commands.toggleMenu(undefined);
      switch (uxContext.state.activeTool) {
        case "draw": {
          const { color, size } = drawContext.state;
          switch (uxContext.state.drawingTool) {
            case "path":
              drawContext.commands.addElement(createPath(x, y, color, size));
              break;
            case "rectangle":
              drawContext.commands.addElement(createRect(x, y, color, size));
              break;
            case "circle":
              drawContext.commands.addElement(createOval(x, y, color, size));
              break;
            case "image":
              drawContext.commands.addElement(
                createImage(x, y, oslo!, color, size)
              );
              break;
          }
          break;
        }
        case "selection": {
          // Find the element closest to the point
          const el = findClosestElementToPoint(
            { x, y },
            drawContext.state.elements
          );

          // Check if we have clicked an element that is not part
          // of the current selection
          if (el && drawContext.state.selectedElements.length === 0) {
            // Not part of selection - we'll select it
            drawContext.commands.setSelectedElements(el);
            // Reset the selection rectangle
            drawContext.commands.setSelectionRect(undefined);
            break;
          }

          const bounds = getBoundingBox(drawContext.state.selectedElements);

          // Lets test to see if we have clicked inside the selection boundary
          if (bounds && pointInRect({ x, y }, bounds)) {
            // We have a selection and we have clicked it - let us calculate the
            // selection mode - ie. which corner we are resizing from
            drawContext.commands.setResizeMode(
              findResizeMode({ x, y }, drawContext.state.selectedElements)
            );
          } else {
            // We didn't find an element at x/y, so we'll deselect existing
            // elements and start a new selection - clear existing
            if (el) {
              drawContext.commands.setSelectedElements(el);
            } else {
              drawContext.commands.setSelectedElements();
              // Reset the selection rectangle
              drawContext.commands.setSelectionRect({
                x,
                y,
                width: 0,
                height: 0,
              });
            }
          }
        }
      }
      prevPointRef.current = { x, y };
    },
    onActive: ({ x, y }) => {
      switch (uxContext.state.activeTool) {
        case "draw": {
          if (drawContext.state.elements.length > 0) {
            // Get current drawing object
            const element =
              drawContext.state.elements[drawContext.state.elements.length - 1];

            switch (element.type) {
              case "path":
                // Calculate and add a smooth curve to the current path
                const xMid = (prevPointRef.current!.x + x) / 2;
                const yMid = (prevPointRef.current!.y + y) / 2;
                element.path.quadTo(
                  prevPointRef.current!.x,
                  prevPointRef.current!.y,
                  xMid,
                  yMid
                );
                break;
              default:
                resizeElementsBy(
                  x - prevPointRef.current!.x,
                  y - prevPointRef.current!.y,
                  "bottomRight",
                  [element]
                );
                break;
            }
          }
          break;
        }
        case "selection": {
          if (drawContext.state.selectedElements.length > 0) {
            // Resizing or translate selected elements (if any)
            resizeElementsBy(
              x - prevPointRef.current!.x,
              y - prevPointRef.current!.y,
              drawContext.state.resizeMode,
              drawContext.state.selectedElements
            );
          } else {
            // No selection made - let us update the selection rect instead.
            if (drawContext.state.currentSelectionRect) {
              drawContext.commands.setSelectionRect({
                x: drawContext.state.currentSelectionRect!.x,
                y: drawContext.state.currentSelectionRect!.y,
                width: x - drawContext.state.currentSelectionRect!.x,
                height: y - drawContext.state.currentSelectionRect!.y,
              });
            }
          }
        }
      }
      prevPointRef.current = { x, y };
    },
    onEnd: () => {
      switch (uxContext.state.activeTool) {
        case "draw": {
          // Do nothing on touch end when drawing
          break;
        }
        case "selection": {
          if (drawContext.state.currentSelectionRect) {
            // Select elements in the rect
            const elements = findElementsInRect(
              drawContext.state.currentSelectionRect,
              drawContext.state.elements
            );
            // Set selected elements
            if (elements) {
              drawContext.commands.setSelectedElements(...elements);
            }
            // Clear selection rect
            drawContext.commands.setSelectionRect(undefined);
          }
        }
      }
    },
  });
};
