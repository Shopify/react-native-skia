import React, { useCallback, useEffect, useState } from "react";
import type { ViewStyle } from "react-native";

import {
  CircleToolPath,
  DeleteToolPath,
  ImageToolPath,
  PenToolPath,
  RectToolPath,
  SelectToolPath,
} from "../assets";
import type { DrawingTool } from "../Context/types";
import { useDrawContext, useUxContext } from "../Hooks";

import { BaseToolbar } from "./BaseToolbar";
import { ColorToolbarItem, PathToolbarItem, SizeToolbarItem } from "./Items";

type Props = {
  style: ViewStyle;
};
export const MainToolbar: React.FC<Props> = ({ style }) => {
  const uxContext = useUxContext();
  const drawContext = useDrawContext();

  const [activeTool, setActiveTool] = useState(uxContext.state.activeTool);
  const [drawingTool, setDrawingTool] = useState(uxContext.state.drawingTool);
  const [color, setColor] = useState(drawContext.state.color);
  const [size, setSize] = useState(drawContext.state.size);
  const [hasSelection, setHasSelection] = useState(
    drawContext.state.selectedElements.length > 0
  );

  useEffect(() => {
    const unsubscribeUx = uxContext.addListener((state) => {
      setActiveTool(state.activeTool);
      setDrawingTool(state.drawingTool);
    });
    const unsubscribeDraw = drawContext.addListener((state) => {
      setColor(state.color);
      setSize(state.size);
      setHasSelection(state.selectedElements.length > 0);
    });
    return () => {
      unsubscribeDraw();
      unsubscribeUx();
    };
  }, [drawContext, uxContext]);

  const handleDrawingToolPressed = useCallback(() => {
    if (uxContext.state.activeTool === "draw") {
      uxContext.commands.toggleMenu("drawing");
    } else {
      uxContext.commands.setTool("draw");
    }
    drawContext.commands.setSelectedElements();
  }, [drawContext.commands, uxContext.commands, uxContext.state.activeTool]);

  const handleSelectionPressed = useCallback(
    () => uxContext.commands.setTool("selection"),
    [uxContext.commands]
  );

  const handleDelete = useCallback(() => {
    uxContext.commands.toggleMenu(undefined);
    drawContext.commands.deleteSelectedElements();
  }, [drawContext.commands, uxContext.commands]);

  const handleSizePressed = useCallback(
    () => uxContext.commands.toggleMenu("size"),
    [uxContext.commands]
  );

  const handleColorPressed = useCallback(
    () => uxContext.commands.toggleMenu("color"),
    [uxContext.commands]
  );

  return (
    <BaseToolbar style={style}>
      <PathToolbarItem
        path={getPathFordrawingMode(drawingTool)}
        selected={activeTool === "draw"}
        onPress={handleDrawingToolPressed}
      />
      <PathToolbarItem
        path={SelectToolPath!}
        selected={activeTool === "selection"}
        onPress={handleSelectionPressed}
      />
      <PathToolbarItem
        path={DeleteToolPath!}
        disabled={!hasSelection}
        onPress={handleDelete}
      />
      <SizeToolbarItem onPress={handleSizePressed} size={size} />
      <ColorToolbarItem color={color} onPress={handleColorPressed} />
    </BaseToolbar>
  );
};

const getPathFordrawingMode = (drawingMode: DrawingTool) => {
  switch (drawingMode) {
    case "path":
      return PenToolPath!;
    case "circle":
      return CircleToolPath!;
    case "rectangle":
      return RectToolPath!;
    case "image":
      return ImageToolPath!;
  }
};
