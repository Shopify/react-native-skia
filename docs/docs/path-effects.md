---
id: path-effects
title: Path Effects
sidebar_label: Path Effects
slug: /path-effects
---

## Discrete Path Effect

Creates an effect that breaks a path into segments of a certain length and randomly moves the endpoints away from the original path by a maximum deviation.

| Name      | Type         |  Description                                                  |
|:----------|:-------------|:--------------------------------------------------------------|
| length    | `number`     | length of the subsegments.                                    |
| deviation | `number`     | limit of the movement of the endpoints.                       |
| seed      | `number`     | modifies the randomness. See SkDiscretePathEffect.h for more. |
| children? | `PathEffect` | Optional path effect to apply.                                |


### Example

```tsx twoslash
import {Canvas, Paint, DiscretePathEffect, Path} from "@shopify/react-native-skia";

const logo = "M256 128.015C256 111.057 234.762...";

const Discrete = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Paint>
        <DiscretePathEffect length={10} deviation={2} />
      </Paint>
      <Path path={logo} color="#61DAFB" />
    </Canvas>
  );
};
```

### Result

![Discrete Path Effect](assets/path-effects/discrete.png)

## Dash Path Effect

Creates an effect that adds dashes to the path.


| Name      | Type         |  Description                                                  |
|:----------|:-------------|:--------------------------------------------------------------|
| intervals | `number[]`   | even number of entries with even indices specifying the length of the "on" intervals, and the odd indices specifying the length of "off". |
| phase     | `number`     | offset into the intervals array. Defaults to 0.        |
| children? | `PathEffect` | Optional path effect to apply.                                |

### Example

```tsx twoslash
import {Canvas, Paint, DashPathEffect, Path} from "@shopify/react-native-skia";

const logo = "M256 128.015C256 111.057 234.762...";

const Discrete = () => {
  return (
    <Canvas style={{ flex: 1 }}>
      <Paint style="stroke" strokeWidth={4}>
        <DashPathEffect intervals={[4, 4]} />
      </Paint>
      <Path path={logo} color="#61DAFB" />
    </Canvas>
  );
};
```

### Result

![Dash Path Effect](assets/path-effects/dash.png)

## Corner Path Effect

Creates a path effect that can turn sharp corners into rounded corners.

| Name      | Type         |  Description                                                  |
|:----------|:-------------|:--------------------------------------------------------------|
| r         | `number`     | Radius.                                                       |
| children? | `PathEffect` | Optional path effect to apply.                                |

### Example

```tsx twoslash
import {Canvas, Paint, CornerPathEffect, Rect} from "@shopify/react-native-skia";


const Discrete = () => {
  return (
    <Canvas style={{ flex: 1 }}>
       <Paint>
        <CornerPathEffect r={64} />
      </Paint>
      <Rect
        x={64}
        y={16}
        width={128}
        height={256 - 16}
        color="#61DAFB"
      />
    </Canvas>
  );
};
```

### Result

![Corner Path Effect](assets/path-effects/corner.png)

## Path 1D Path Effect

Dash by replicating the specified path.

| Name      | Type                |  Description                                                                    |
|:----------|:--------------------|:--------------------------------------------------------------------------------|
| path      | `PathDef`           | The path to replicate (dash)                                                    |
| advance   | `number`            |  The space between instances of path                                            |
| phase     | `number`            | distance (mod advance) along path for its initial position                      |
| style     | `Path1DEffectStyle` | how to transform path at each point (based on the current position and tangent) |
| children? | `PathEffect`        | Optional path effect to apply.                                                  |

### Example

```tsx twoslash
import {Canvas, Paint, Path1DPathEffect, Path} from "@shopify/react-native-skia";

const logo = "M256 128.015C256 111.057 234.762...";

const Path1D = () => {
  return (
      <Canvas style={{ flex: 1 }}>
        <Paint color="#61DAFB" style="stroke" strokeWidth={15}>
          <Path1DPathEffect
            path="M -10 0 L 0 -10, 10 0, 0 10 Z"
            advance={20}
            phase={0}
            style="rotate"
          />
        </Paint>
        <Path path={logo} color="#61DAFB" />
      </Canvas> 
  );
};
```

### Result

![Corner Path Effect](assets/path-effects/path1d.png)


## Path 2D Path Effect

Stamp the specified path to fill the shape, using the matrix to define the latice.

| Name      | Type         |  Description                  |
|:----------|:-------------|:------------------------------|
| path      | `PathDef`    | The path to use               |
| matrix    | `SkMatrix`    |  Matrix to be applied         |
| children? | `PathEffect` | Optional path effect to apply |

### Example

```tsx twoslash
import {Canvas, Paint, Path2DPathEffect, Path, processTransform2d} from "@shopify/react-native-skia";

const logo = "M256 128.015C256 111.057 234.762...";

const Path2D = () => {
  return (
      <Canvas style={{ flex: 1 }}>
        <Paint color="#61DAFB" style="stroke" strokeWidth={15}>
          <Path2DPathEffect
            path="M -10 0 L 0 -10, 10 0, 0 10 Z"
            matrix={processTransform2d([{ scale: 40 }])}
          />
        </Paint>
        <Path path={logo} color="#61DAFB" />
      </Canvas> 
  );
};
```

### Result

![Corner Path Effect](assets/path-effects/path2d.png)

## Line 2D Path Effect

Stamp the specified path to fill the shape, using the matrix to define the latice.

| Name      | Type         |  Description                  |
|:----------|:-------------|:------------------------------|
| width      | `PathDef`    | The path to use               |
| matrix    | `IMatrix`    |  Matrix to be applied         |
| children? | `PathEffect` | Optional path effect to apply |

### Example

```tsx twoslash
import {Canvas, Paint, Line2DPathEffect, Path, processTransform2d} from "@shopify/react-native-skia";

const logo = "M256 128.015C256 111.057 234.762...";

const Line2D = () => {
  return (
      <Canvas style={{ flex: 1 }}>
        <Paint color="#61DAFB" style="stroke" strokeWidth={15}>
          <Line2DPathEffect
            width={0}
            matrix={processTransform2d([{ scale: 8 }])}
          />
        </Paint>
        <Path path={logo} color="#61DAFB" />
      </Canvas> 
  );
};
```

### Result

![Corner Path Effect](assets/path-effects/line2d.png)