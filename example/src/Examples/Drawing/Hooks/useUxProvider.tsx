import React, { useMemo } from "react";

import type {
  UxContextType,
  Menu,
  Tool,
  UxState,
  DrawingTool,
} from "../Context";

export const UxContext = React.createContext<UxContextType | undefined>(
  undefined
);

const createUxProviderValue = (): UxContextType => {
  const state: UxState = {
    menu: undefined,
    drawingTool: "path",
    activeTool: "draw",
  };

  const listeners = [] as ((state: UxState) => void)[];
  const notifyListeners = (s: UxState) => listeners.forEach((l) => l(s));

  const commands = {
    toggleMenu: (menu: Menu | undefined) => {
      state.menu = state.menu === menu ? undefined : menu;
      notifyListeners(state);
    },
    setTool: (tool: Tool) => {
      state.activeTool = tool;
      state.menu = undefined;
      notifyListeners(state);
    },
    setDrawingTool: (drawingTool: DrawingTool) => {
      state.drawingTool = drawingTool;
      state.menu = undefined;
      notifyListeners(state);
    },
  };

  return {
    state,
    commands,
    addListener: (cb: (state: UxState) => void) => {
      listeners.push(cb);
      return () => listeners.splice(listeners.indexOf(cb), 1);
    },
  };
};

export const useUxProvider = () => {
  const uxContext = useMemo(() => createUxProviderValue(), []);
  const retVal: React.FC = ({ children }) => (
    <UxContext.Provider value={uxContext}>{children}</UxContext.Provider>
  );
  return retVal;
};
