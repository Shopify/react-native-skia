import React, { useEffect, useMemo, useState } from "react";
import type { ViewStyle } from "react-native";
import {
  Canvas,
  Path,
  Fill,
  Rect,
  Group,
  Paint,
  DashPathEffect,
  Image,
} from "@shopify/react-native-skia";
import type { IRect, SkiaView } from "@shopify/react-native-skia";

import type { DrawingElements } from "./Context/types";
import { SelectionFrame } from "./SelectionFrame";
import { getBounds } from "./Context/functions";
import { useTouchDrawing, useDrawContext } from "./Hooks";

type Props = {
  innerRef: React.RefObject<SkiaView>;
  style: ViewStyle;
};

export const DrawingCanvas: React.FC<Props> = ({ innerRef, style }) => {
  const drawContext = useDrawContext();
  const [elements, setElements] = useState<DrawingElements>([]);
  const [selectedElements, setSelectedElements] = useState<DrawingElements>();
  const [selectionRect, setSelectionRect] = useState<IRect>();

  // Draw context updated effect
  useEffect(
    () =>
      drawContext.addListener((state) => {
        setElements([...state.elements]);
        setSelectionRect(state.currentSelectionRect);
        setSelectedElements([...state.selectedElements]);
      }),
    [drawContext, innerRef]
  );

  const touchHandler = useTouchDrawing();

  const elementComponents = useMemo(() => {
    return elements.map((el, i) => {
      switch (el.type) {
        case "image":
          return (
            <Image
              fit="fill"
              key={i}
              source={el.image}
              rect={() => getBounds(el)}
            />
          );
        default:
          return (
            <Path
              key={i}
              path={el.path}
              color={el.color}
              style="stroke"
              strokeWidth={el.size}
              strokeCap="round"
            />
          );
      }
    });
  }, [elements]);

  return (
    <Canvas ref={innerRef} style={style} onTouch={touchHandler}>
      <Fill color="#FFF" />
      {/** Render elements */}
      {elementComponents}
      {/** Render selected elements */}
      {selectedElements ? (
        <SelectionFrame selectedElements={selectedElements} />
      ) : null}
      {/** Render selection rectangle */}
      {selectionRect ? (
        <Group>
          <Paint style="stroke" strokeWidth={2} color="rgba(0, 0, 0, 1)">
            <DashPathEffect intervals={[4, 4]} />
          </Paint>
          <Rect
            x={selectionRect.x}
            y={selectionRect.y}
            width={selectionRect.width}
            height={selectionRect.height}
          />
        </Group>
      ) : null}
    </Canvas>
  );
};
