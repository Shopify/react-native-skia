import React, { useEffect, useRef, useState } from "react";
import type { ImageSourcePropType, ViewStyle } from "react-native";
import type {
  IPath,
  Point,
  IPaint,
  IRect,
  IImage,
} from "@shopify/react-native-skia";
import {
  ImageCtor,
  SkiaView,
  useTouchHandler,
  Skia,
  useDrawCallback,
} from "@shopify/react-native-skia";
import { fitRects } from "@shopify/react-native-skia/src/renderer/components/image/BoxFit";

import type {
  DrawingElement,
  DrawingElements,
  ToolType,
  ElementType,
} from "./types";
import { drawFocus, findElement, getBounds } from "./functions";

type Props = {
  elements: DrawingElements;
  selectedElement: DrawingElement | undefined;
  paint: IPaint;
  background: IPaint;
  elementType: ElementType;
  toolType: ToolType;
  innerRef: React.RefObject<SkiaView>;
  style: ViewStyle;
  backgroundImage: ImageSourcePropType | undefined;
  onAddElement: (element: DrawingElement) => void;
  onSelecteElement: (element: DrawingElement | undefined) => void;
};

export const DrawingCanvas: React.FC<Props> = ({
  elements,
  selectedElement,
  paint,
  background,
  innerRef,
  style,
  elementType,
  toolType,
  backgroundImage,
  onAddElement,
  onSelecteElement,
}) => {
  const prevPointRef = useRef<Point>();
  const [image, setImage] = useState<IImage>();

  useEffect(() => {
    if (backgroundImage) {
      ImageCtor(backgroundImage).then((value) => {
        setImage(value);
      });
    } else {
      setImage(undefined);
    }
  }, [backgroundImage]);

  const touchHandler = useTouchHandler({
    onStart: ({ x, y }) => {
      switch (toolType) {
        case "draw": {
          switch (elementType) {
            case "path": {
              const path = Skia.Path.Make();
              onAddElement({ type: elementType, primitive: path, p: paint });
              path.moveTo(x, y);
              break;
            }
            case "rect":
            case "circle": {
              const rect = Skia.XYWHRect(x, y, 0, 0);
              onAddElement({ type: elementType, primitive: rect, p: paint });
              break;
            }
          }
          break;
        }
        case "select": {
          const el = findElement(x, y, elements);
          onSelecteElement(el);
          innerRef.current?.redraw();
        }
      }
      prevPointRef.current = { x, y };
    },
    onActive: ({ x, y }) => {
      if (elements.length > 0 && toolType === "draw") {
        // Get current drawing object
        const element = elements[elements.length - 1];
        switch (element.type) {
          case "path": {
            // Calculate and draw a smooth curve
            const xMid = (prevPointRef.current!.x + x) / 2;
            const yMid = (prevPointRef.current!.y + y) / 2;

            (element.primitive as IPath).quadTo(
              prevPointRef.current!.x,
              prevPointRef.current!.y,
              xMid,
              yMid
            );
            break;
          }
          case "rect":
          case "circle": {
            element.primitive = Skia.XYWHRect(
              element.primitive.x,
              element.primitive.y,
              x - element.primitive.x,
              y - element.primitive.y
            );
            break;
          }
        }
      } else if (selectedElement) {
        selectedElement.translate = {
          x: (selectedElement.translate?.x ?? 0) + x - prevPointRef.current!.x,
          y: (selectedElement.translate?.y ?? 0) + y - prevPointRef.current!.y,
        };
      }

      prevPointRef.current = { x, y };
    },
  });

  const onDraw = useDrawCallback(
    (canvas, info) => {
      // Update from pending touches
      touchHandler(info.touches);

      // Clear screen
      canvas.drawPaint(background);

      // Draw background image (if available)
      if (image) {
        const rect = Skia.XYWHRect(0, 0, info.width, info.height);
        const { src, dst } = fitRects("cover", image, rect);
        canvas.drawImageRect(image, src, dst, paint);
      }

      // Draw paths
      if (elements.length > 0) {
        for (let i = 0; i < elements.length; i++) {
          const element = elements[i];
          const isSelected = element === selectedElement;
          canvas.save();
          if (element.translate) {
            canvas.translate(element.translate.x, element.translate.y);
          }

          drawFocus(
            isSelected,
            canvas,
            getBounds(element, false),
            element.p.getStrokeWidth()
          );

          switch (element.type) {
            case "path": {
              canvas.drawPath(element.primitive as IPath, element.p);
              break;
            }
            case "rect": {
              canvas.drawRect(element.primitive as IRect, element.p);
              break;
            }
            case "circle": {
              canvas.drawOval(element.primitive as IRect, element.p);
              break;
            }
          }
          canvas.restore();
        }
      }
    },
    [paint, elements, image, selectedElement]
  );
  return <SkiaView ref={innerRef} style={style} onDraw={onDraw} />;
};
