import type React from "react";
import { useRef } from "react";
import type { Point, SkiaView } from "@shopify/react-native-skia";
import { useImage, useTouchHandler } from "@shopify/react-native-skia";

import { useDrawContext } from "./useDrawContext";
import { useUxContext } from "./useUxContext";
import {
  findClosestElementToPoint,
  findElementsInRect,
  findResizeMode,
  pointInRect,
  resizeElementsBy,
} from "./functions";
import { getBoundingBox } from "./functions/getBoundingBox";
import { createPath, createRect, createOval, createImage } from "./shapes";

const osloImg = require("../../../assets/card.png");

export const useTouchDrawing = (skiaViewRef: React.RefObject<SkiaView>) => {
  const prevPointRef = useRef<Point>();
  const drawContext = useDrawContext();
  const uxContext = useUxContext();
  const oslo = useImage(osloImg);

  return useTouchHandler({
    onStart: ({ x, y }) => {
      switch (uxContext.state.activeTool) {
        case "draw": {
          switch (uxContext.state.drawingTool) {
            case "path": {
              drawContext.commands.addElement(
                createPath(x, y, drawContext.state.paint)
              );
              break;
            }
            case "rectangle": {
              drawContext.commands.addElement(
                createRect(x, y, drawContext.state.paint)
              );
              break;
            }
            case "circle": {
              drawContext.commands.addElement(
                createOval(x, y, drawContext.state.paint)
              );
              break;
            }
            case "image": {
              drawContext.commands.addElement(
                createImage(x, y, oslo!, drawContext.state.paint)
              );
              break;
            }
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
          if (el && !drawContext.state.selectedElements.includes(el)) {
            // Not part of selection - we'll select it
            drawContext.commands.setSelectedElements(el);
            // Reset the selection rectangle
            drawContext.commands.setSelectionRect(undefined);
            break;
          }

          // Lets test to see if we have clicked inside the selection boundary
          const bounds = getBoundingBox(drawContext.state.selectedElements);
          if (bounds && pointInRect({ x, y }, bounds)) {
            // We have a selection and we have clicked it - let us calculate the
            // selection mode - ie. which corner we are resizing from
            drawContext.commands.setResizeMode(
              findResizeMode({ x, y }, drawContext.state.selectedElements)
            );
          } else {
            // We didn't find an element at x/y, so we'll deselect existing
            // elements and start a new selection - clear existing
            drawContext.commands.setSelectedElements();
            // Reset the selection rectangle
            drawContext.commands.setSelectionRect({
              x,
              y,
              width: 0,
              height: 0,
            });
          }

          // Redraw
          skiaViewRef.current?.redraw();
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
              case "path": {
                // Calculate and add a smooth curve to the current path
                const xMid = (prevPointRef.current!.x + x) / 2;
                const yMid = (prevPointRef.current!.y + y) / 2;
                element.primitive.quadTo(
                  prevPointRef.current!.x,
                  prevPointRef.current!.y,
                  xMid,
                  yMid
                );
                break;
              }
              default: {
                resizeElementsBy(
                  x - prevPointRef.current!.x,
                  y - prevPointRef.current!.y,
                  "bottomRight",
                  [element]
                );

                break;
              }
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
          // Change to selection mode when we have added an image, rect or cirle
          if (drawContext.state.elements.length > 0) {
            // Get current drawing object
            const element =
              drawContext.state.elements[drawContext.state.elements.length - 1];
            if (element.type !== "path") {
              uxContext.commands.setTool("selection");
            }
          }
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
