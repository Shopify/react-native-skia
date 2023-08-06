---
id: path
title: Path
sidebar_label: Path
slug: /shapes/path
---

In Skia, paths are semantically identical to [SVG Paths](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths).

| Name      | Type      |  Description                                                  |
|:----------|:----------|:--------------------------------------------------------------|
| path      | `SkPath` or `string` | Path to draw. Can be a string using the [SVG Path notation](https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#line_commands) or an object created with `Skia.Path.Make()`. |
| start     | `number` | Trims the start of the path. Value is in the range `[0, 1]` (default is 0). |
| end       | `number` | Trims the end of the path. Value is in the range `[0, 1]` (default is 1). |
| stroke    | `StrokeOptions` | Turns this path into the filled equivalent of the stroked path. This will fail if the path is a hairline. `StrokeOptions` describes how the stroked path should look. It contains three properties: `width`, `strokeMiterLimit` and, `precision` |

### Using SVG Notation

```tsx twoslash
import {Canvas, Path} from "@shopify/react-native-skia";

const SVGNotation = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Path
        path="M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
        color="lightblue"
      />
    </Canvas>
  );
};
```

![SVG Notation](assets/path/svg.png)

### Using Path Object

```tsx twoslash
import {Canvas, Path, Skia} from "@shopify/react-native-skia";

const path = Skia.Path.Make();
path.moveTo(128, 0);
path.lineTo(168, 80);
path.lineTo(256, 93);
path.lineTo(192, 155);
path.lineTo(207, 244);
path.lineTo(128, 202);
path.lineTo(49, 244);
path.lineTo(64, 155);
path.lineTo(0, 93);
path.lineTo(88, 80);
path.lineTo(128, 0);
path.close();

const PathDemo = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Path
        path={path}
        color="lightblue"
      />
    </Canvas>
  );
};
```

![Path Object](assets/path/path-object.png)

### Trim

```tsx twoslash
import {Canvas, Path} from "@shopify/react-native-skia";

const SVGNotation = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Path
        path="M 128 0 L 168 80 L 256 93 L 192 155 L 207 244 L 128 202 L 49 244 L 64 155 L 0 93 L 88 80 L 128 0 Z"
        color="lightblue"
        style="stroke"
        strokeJoin="round"
        strokeWidth={5}
        // We trim the first and last quarter of the path
        start={0.25}
        end={0.75}
      />
    </Canvas>
  );
};
```

![Trim](assets/path/trim.png)


## Fill Type

The `fillType`` property defines the algorithm to use to determine the inside part of a shape.
Possible values are: `"winding`, `evenOdd`, `inverseWinding`, `inverseEvenOdd`. Default value is `winding`.

```tsx twoslash
import {Canvas, Group, TextPath, Skia, useFont, vec, Fill, Path} from "@shopify/react-native-skia";

const star = () => {
  const R = 115.2;
  const C = 128.0;
  const path = Skia.Path.Make();
  path.moveTo(C + R, C);
  for (let i = 1; i < 8; ++i) {
    const a = 2.6927937 * i;
    path.lineTo(C + R * Math.cos(a), C + R * Math.sin(a));
  }
  return path;
};

export const HelloWorld = () => {
  const path = star();
  return (
    <Canvas style={{ flex: 1 }}>  
      <Fill color="white" />
      <Path path={path} style="stroke" strokeWidth={4} color="#3EB489"/>
      <Path path={path} color="lightblue" fillType="evenOdd" />
    </Canvas>
  );
};
```

<img src={require("/static/img/paths/evenodd-filltype.png").default} width="256" height="256" />
