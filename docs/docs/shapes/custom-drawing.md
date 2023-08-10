---
id: custom-drawing
title: Custom Drawing
sidebar_label: Custom Drawing
slug: /shapes/custom-drawing
---

The `Drawing` component that allows you to use the imperative API within the declarative API.

:::info

Please note that because this component relies on the JavaScript thread to be available, this component is expected to be slower than its declarative counterpart. Use with caution.

:::

### Example

```tsx twoslash
import {Canvas, Group, Drawing, Skia} from "@shopify/react-native-skia";

export const HelloWorld = () => {
  const size = 256;
  const r = size * 0.33;
  return (
    <Canvas style={{ flex: 1 }}>
      <Group blendMode="multiply">
        <Drawing
          drawing={({ canvas, paint }) => {
            paint.setColor(Skia.Color("cyan"));
            canvas.drawCircle(r, r, r, paint);
            paint.setColor(Skia.Color("magenta"));
            canvas.drawCircle(size - r, r, r, paint);
            paint.setColor(Skia.Color("yellow"));
            canvas.drawCircle(size / 2, size - r, r, paint);
          }}
        />
      </Group>
    </Canvas>
  );
};
```

### Result

<img src={require("/static/img/getting-started/hello-world/blend-modes.png").default} width="256" height="256" alt="Hello World" />
