import React, { useEffect, useState } from "react";

import {
  CircleToolPath,
  ImageToolPath,
  PenToolPath,
  RectToolPath,
} from "../assets";
import { useUxContext } from "../Context";

import type { BaseToolbarProps } from "./BaseToolbar";
import { BaseToolbar } from "./BaseToolbar";
import { PathToolbarItem } from "./Items";

export const DrawingToolMenu: React.FC<BaseToolbarProps> = ({
  style,
  mode,
}) => {
  const uxContext = useUxContext();
  const [visible, setVisible] = useState(uxContext.state.menu === "drawing");
  const [drawingTool, setDrawingTool] = useState(uxContext.state.drawingTool);

  useEffect(
    () =>
      uxContext.addListener((state) => {
        setVisible(state.menu === "drawing");
        setDrawingTool(state.drawingTool);
      }),
    [uxContext]
  );

  return visible ? (
    <BaseToolbar style={style} mode={mode}>
      <PathToolbarItem
        path={ImageToolPath!}
        selected={drawingTool === "image"}
        onPress={() => uxContext.commands.setDrawingTool("image")}
      />
      <PathToolbarItem
        path={RectToolPath!}
        selected={drawingTool === "rectangle"}
        onPress={() => uxContext.commands.setDrawingTool("rectangle")}
      />
      <PathToolbarItem
        path={CircleToolPath!}
        selected={drawingTool === "circle"}
        onPress={() => uxContext.commands.setDrawingTool("circle")}
      />
      <PathToolbarItem
        path={PenToolPath!}
        selected={drawingTool === "path"}
        onPress={() => uxContext.commands.setDrawingTool("path")}
      />
    </BaseToolbar>
  ) : null;
};
