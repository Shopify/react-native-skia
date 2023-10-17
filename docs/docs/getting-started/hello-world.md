---
id: hello-world
title: Hello World
sidebar_label: Hello World
slug: /getting-started/hello-world
---

React Native Skia provides a declarative API using its own React Renderer.

```tsx twoslash
import React from "react";
import { Canvas, Circle, Group } from "@shopify/react-native-skia";

const App = () => {
  const size = 256;
  const r = size * 0.33;
  return (
    <Canvas style={{ flex: 1 }}>
      <Group blendMode="multiply">
        <Circle cx={r} cy={r} r={r} color="cyan" />
        <Circle cx={size - r} cy={r} r={r} color="magenta" />
        <Circle cx={size / 2} cy={size - r} r={r} color="yellow" />
      </Group>
    </Canvas>
  );
};

export default App;
```

### Result

<img src={require("/static/img/getting-started/hello-world/blend-modes.png").default} width="256" height="256" alt="Hello World" />
