---
id: hello-world
title: Hello World
sidebar_label: Hello World
slug: /getting-started/hello-world
---

React Native Skia provides a declarative API using its own React Renderer.

```tsx twoslash
import { StatusBar } from 'expo-status-bar';
import {  View } from 'react-native';

import React from "react";
import {  useWindowDimensions } from "react-native";
import {
  Canvas,
  Circle,
  Group,
} from "@shopify/react-native-skia";

export default function App() {
  return (
    <View style={{
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      {/* <Text>Open up App.tsx to start working on your app!</Text> */}
      {/* <Breathe /> */}
      <HelloWorld />
      <StatusBar style="auto" />
    </View>
  );
}



export const HelloWorld = () => {
  const size = 256;
  const { width, height } = useWindowDimensions();
  const r = size * 0.33;

  return (
    <Canvas style={{ width: size , height: size }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={size - r} cy={r} r={r} color="magenta" />
        <Circle
          cx={size/2}
          cy={size - r}
          r={r}
          color="yellow"
        />
      </Group>
    </Canvas>
  );
};
```

### Result

<img src={require("/static/img/getting-started/hello-world/blend-modes.png").default} width="256" height="256" alt="Hello World" />