---
id: skottie
title: Skottie
sidebar_label: Skottie
slug: /skottie
---

Skottie is a Lottie animation renderer built on Skia. It allows you to load and render After Effects animations exported via Bodymovin/Lottie in React Native Skia.

## Rendering Animations

### Using the Skottie Component

React Native Skia provides a `Skottie` component for easy integration:

```tsx twoslash
import React from "react";
import { Canvas, Group, Skottie, Skia } from "@shopify/react-native-skia";

const legoAnimationJSON = require("./assets/lego_loader.json");
const animation = Skia.Skottie.Make(JSON.stringify(legoAnimationJSON));

const SkottieExample = () => {
  return (
    <Canvas style={{ width: 400, height: 300 }}>
      <Group transform={[{ scale: 0.5 }]}>
        <Skottie animation={animation} frame={41} />
      </Group>
    </Canvas>
  );
};
```

### Animated Playback with Reanimated

For smooth animation playback, combine Skottie with React Native Reanimated:

```tsx twoslash
import React from "react";
import {
  Skia,
  Canvas,
  useClock,
  Group,
  Skottie,
} from "@shopify/react-native-skia";
import { useDerivedValue } from "react-native-reanimated";

const legoAnimationJSON = require("./assets/lego_loader.json");
const animation = Skia.Skottie.Make(JSON.stringify(legoAnimationJSON));

const AnimatedSkottieExample = () => {
  const clock = useClock();
  const frame = useDerivedValue(() => {
    const fps = animation.fps();
    const duration = animation.duration();
    const currentFrame =
      Math.floor((clock.value / 1000) * fps) % (duration * fps);
    return currentFrame;
  });

  return (
    <Canvas style={{ flex: 1 }}>
      <Group transform={[{ scale: 0.5 }]}>
        <Skottie animation={animation} frame={frame} />
      </Group>
    </Canvas>
  );
};
```

### Basic Rendering

```tsx twoslash
import { Skia, Canvas } from "@shopify/react-native-skia";
const animation = {} as any;
// ---cut---
const surface = Skia.Surface.MakeOffscreen(800, 600);
const canvas = surface.getCanvas();

// Seek to a specific frame
animation.seekFrame(41);

// Render the animation
animation.render(canvas);

surface.flush();
const image = surface.makeImageSnapshot();
```

## Creating a Skottie Animation

To create a Skottie animation, use `Skia.Skottie.Make()` with your Lottie JSON data:

```tsx twoslash
import { Skia } from "@shopify/react-native-skia";

const legoAnimationJSON = require("./assets/lego_loader.json");

const animation = Skia.Skottie.Make(JSON.stringify(legoAnimationJSON));
```

### With Assets

Many Lottie animations include external assets like fonts and images. You can provide these when creating the animation:

```tsx twoslash
import { Skia, Data } from "@shopify/react-native-skia";

const basicSlotsJSON = require("./assets/basic_slots.json");
const notoSerifFont = require("./assets/NotoSerif.ttf");
const image = require("./assets/img_0.png");

const assets = {
  NotoSerif: Data.fromURI(notoSerifFont),
  "img_0.png": Data.fromURI(image),
};

const animation = Skia.Skottie.Make(JSON.stringify(basicSlotsJSON), assets);
```

## Animation Properties

### Basic Information

Get basic information about your animation:

```tsx twoslash
import { Skia } from "@shopify/react-native-skia";
const animation = {} as any;
// ---cut---
// Duration in seconds
const duration = animation.duration();

// Frames per second
const fps = animation.fps();

// Lottie version
const version = animation.version();

// Animation dimensions
const size = animation.size(); // { width: 800, height: 600 }
```

## Slot Management

Slots are placeholders built into the design of Lottie animations that allow for dynamic content replacement at runtime. This is incredibly convenient for customizing animations without recreating them - designers can create slots in After Effects, and developers can programmatically replace colors, text, images, and other properties.

Skottie supports slots for dynamic content replacement:

### Getting Slot Information

```tsx twoslash
const animation = {} as any;
// ---cut---
const slotInfo = animation.getSlotInfo();
// Returns:
// {
//   colorSlotIDs: ["FillsGroup", "StrokeGroup"],
//   imageSlotIDs: ["ImageSource"], 
//   scalarSlotIDs: ["Opacity"],
//   textSlotIDs: ["TextSource"],
//   vec2SlotIDs: ["ScaleGroup"]
// }
```

### Setting Color Slots

```tsx twoslash
import { Skia } from "@shopify/react-native-skia";
const animation = {} as any;
// ---cut---
animation.setColorSlot("FillsGroup", Skia.Color("cyan"));
animation.setColorSlot("StrokeGroup", Skia.Color("magenta"));
```

## Property Access and Modification

Beyond slots, Skottie provides powerful introspection capabilities that allow you to modify virtually any property of the animation at runtime. This gives you complete programmatic control over colors, text, opacity, transforms, and more - making it possible to create highly dynamic and interactive animations.

### Color Properties

```tsx twoslash
const animation = {} as any;
// ---cut---
// Get all color properties
const colorProps = animation.getColorProps();
// Returns array of: { key: string, value: Float32Array }

// Set a specific color property
const colorProp = colorProps[0];
animation.setColor(colorProp.key, Skia.Color("rgb(60, 120, 255)"));
```

### Text Properties

```tsx twoslash
const animation = {} as any;
// ---cut---
// Get all text properties
const textProps = animation.getTextProps();
// Returns array of: { key: string, value: { text: string, size: number } }

// Set text content
animation.setText("hello!", "World", 164);
```

### Opacity Properties

```tsx twoslash
const animation = {} as any;
// ---cut---
// Get all opacity properties
const opacityProps = animation.getOpacityProps();
// Returns array of: { key: string, value: number }
```

### Transform Properties

```tsx twoslash
const animation = {} as any;
// ---cut---
// Get all transform properties
const transformProps = animation.getTransformProps();
// Returns array of: { 
//   key: string, 
//   value: {
//     anchor: { x: number, y: number },
//     position: { x: number, y: number },
//     scale: { x: number, y: number },
//     rotation: number,
//     skew: number,
//     skewAxis: number
//   }
// }
```

## Complete Example

Here's a complete example showing how to load and render a Skottie animation with dynamic properties:

```tsx twoslash
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { 
  Canvas, 
  Skia, 
  useCanvasRef,
  Image
} from "@shopify/react-native-skia";

const animationJSON = require("./assets/fingerprint.json");

const SkottiePlayer = () => {
  const [animation, setAnimation] = useState(null);
  const [image, setImage] = useState(null);
  
  useEffect(() => {
    const skottieAnimation = Skia.Skottie.Make(JSON.stringify(animationJSON));
    setAnimation(skottieAnimation);
    
    // Get animation properties
    const colorProps = skottieAnimation.getColorProps();
    if (colorProps.length > 0) {
      // Change the first color property
      skottieAnimation.setColor(colorProps[0].key, Skia.Color("rgb(60, 120, 255)"));
    }
    
    // Render a frame
    const size = skottieAnimation.size();
    const surface = Skia.Surface.MakeOffscreen(size.width, size.height);
    const canvas = surface.getCanvas();
    
    skottieAnimation.seekFrame(120);
    skottieAnimation.render(canvas);
    surface.flush();
    
    const snapshot = surface.makeImageSnapshot();
    setImage(snapshot);
  }, []);

  if (!image) return <View />;

  return (
    <Canvas style={{ width: 400, height: 400 }}>
      <Image 
        image={image} 
        x={0} 
        y={0} 
        width={400} 
        height={400}
        fit="contain"
      />
    </Canvas>
  );
};
```

## Best Practices

1. **Asset Management**: Ensure all required fonts and images are properly bundled with your animation
2. **Performance**: Cache animations when possible, as parsing JSON can be expensive
3. **Frame Management**: Use `seekFrame()` to control animation playback programmatically
4. **Property Updates**: Batch property changes before rendering for better performance
5. **Memory Management**: Dispose of surfaces and animations when no longer needed

## Supported Features

- ✅ Basic animation playback
- ✅ Color slot manipulation
- ✅ Text property modification  
- ✅ Asset loading (fonts, images)
- ✅ Property introspection
- ✅ Transform properties
- ✅ Opacity controls

Skottie provides a powerful way to integrate After Effects animations into your React Native Skia applications with full programmatic control over animation properties.