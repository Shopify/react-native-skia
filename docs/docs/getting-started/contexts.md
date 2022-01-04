---
id: contexts
title: Contexts
sidebar_label: Contexts
slug: /getting-started/contexts
---

React Native Skia is using its own React renderer.
Currently, it is not possible to automatically share a React context between two renderers.
This means that a React Native context won't be available from your drawing directly.
We recommend that you prepare the data needed for your drawing outside the `<Canvas>` element.
However, if you need to use a React context within your drawing, you will need to re-inject it.
This module provides the `useContextBridge` hook from [pmndrs/drei](https://github.com/pmndrs/drei#usecontextbridge) to help you bridge between contexts.

## Manual Context Injection

```tsx twoslash
import React from "react";
import { Canvas, Fill } from "@shopify/react-native-skia";
import {useTheme, ThemeProvider} from "./docs/getting-started/Theme";

const MyDrawing = () => {
  const { primary } = useTheme();
  return <Fill color={primary} />;
};

export const Layer = () => {
  const theme = useTheme();
  return (
    <Canvas style={{ flex: 1 }}>
      {/* We need to re-inject the context provider here.  */}
      <ThemeProvider primary={theme.primary}>
        <MyDrawing />
      </ThemeProvider>
    </Canvas>
  );
};

export const App = () => {
  return (
    <ThemeProvider primary="red">
      <Layer />
    </ThemeProvider>
  );
};
```

## Using `useContextBridge()`

```tsx twoslash
import React from "react";
import { useContextBridge, Canvas, Fill } from "@shopify/react-native-skia";
import {useTheme, ThemeProvider, ThemeContext} from "./docs/getting-started/Theme";

const MyDrawing = () => {
  const { primary } = useTheme();
  return <Fill color={primary} />;
};

export const Layer = () => {
  const ContextBridge = useContextBridge(ThemeContext);
  return (
    <Canvas style={{ flex: 1 }}>
      <ContextBridge>
        <Fill color="black" />
        <MyDrawing />
      </ContextBridge>
    </Canvas>
  );
};

export const App = () => {
  return (
    <ThemeProvider primary="red">
      <Layer />
    </ThemeProvider>
  );
};
```

Below is the context definition that was used in this example:

```tsx twoslash
import type { ReactNode } from "react";
import React, { useContext, createContext } from "react";

interface Theme {
  primary: string;
}

export const ThemeContext = createContext<Theme | null>(null);

export const ThemeProvider = ({
  primary,
  children,
}: {
  primary: string;
  children: ReactNode;
}) => (
  <ThemeContext.Provider value={{ primary }}>
    {children}
  </ThemeContext.Provider>
);

export const useTheme = () => {
  const theme = useContext(ThemeContext);
  if (theme === null) {
    throw new Error("Theme provider not found");
  }
  return theme;
};
```
