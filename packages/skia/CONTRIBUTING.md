# Contributing to React Native Skia Scene Graph

This guide explains how to add new components to the React Native Skia scene graph system.

## 🎯 Two Types of Components

**1. Drawing Commands** (like `Skottie`)
- Draw content directly to the canvas
- Examples: Skottie, Circle, Rect, Text

**2. Context Declarations** (like `ImageFilter`)
- Modify the rendering context for child components
- Examples: ImageFilter, ColorFilter, MaskFilter, Shader

## 📝 Step-by-Step Implementation

### 1. **Define Component Props Interface**
📁 `src/dom/types/Drawings.ts`

```typescript
// Add import for Skia types
import { SkImageFilter } from "../../skia/types";

// Define props interface
export interface ImageFilterProps extends GroupProps {
  imageFilter: SkImageFilter;
}
```

### 2. **Add Node Type**
📁 `src/dom/types/NodeType.ts`

```typescript
export const enum NodeType {
  // ... existing types
  ImageFilter = "skImageFilter",
}
```

### 3. **Create React Component**
📁 `src/renderer/components/ImageFilter.tsx`

```typescript
import React from "react";
import type { ImageFilterProps } from "../../dom/types";
import type { SkiaProps } from "../processors";

export const ImageFilter = (props: SkiaProps<ImageFilterProps>) => {
  return <skImageFilter {...props} />;
};
```

### 4. **Export Component**
📁 `src/renderer/components/index.ts`

```typescript
export * from "./ImageFilter";
```

### 5. **Add Property Converter (if needed)**
📁 `cpp/api/recorder/Convertor.h`

For components that use complex Skia types (like `SkImageFilter`, `skottie::Animation`, etc.), add a template specialization to convert JSI values to native types:

```cpp
template <>
sk_sp<SkImageFilter> getPropertyValue(jsi::Runtime &runtime,
                                      const jsi::Value &value) {
  if (value.isObject() && value.asObject(runtime).isHostObject(runtime)) {
    auto ptr = std::dynamic_pointer_cast<JsiSkImageFilter>(
        value.asObject(runtime).asHostObject(runtime));
    if (ptr != nullptr) {
      return ptr->getObject();
    }
  } else if (value.isNull()) {
    return nullptr;
  }
  throw std::runtime_error(
      "Expected JsiSkImageFilter object or null for the imageFilter property.");
}
```

### 6. **Implement C++ Command**
📁 `cpp/api/recorder/ImageFilters.h`

#### For Context Declarations (like ImageFilter)

```cpp
struct ImageFilterCmdProps {
  sk_sp<SkImageFilter> imageFilter;
};

class ImageFilterCmd : public Command {
private:
  ImageFilterCmdProps props;

public:
  ImageFilterCmd(jsi::Runtime &runtime, const jsi::Object &object,
                 Variables &variables)
      : Command(CommandType::PushImageFilter, "skImageFilter") {
    convertProperty(runtime, object, "imageFilter", props.imageFilter, variables);
  }

  void pushImageFilter(DrawingCtx *ctx) {
    ctx->imageFilters.push_back(props.imageFilter);
  }
};
```

#### For Drawing Commands (like Skottie)

```cpp
struct SkottieCmdProps {
  sk_sp<skottie::Animation> animation;
  float frame;
};

class SkottieCmd : public Command {
private:
  SkottieCmdProps props;

public:
  SkottieCmd(jsi::Runtime &runtime, const jsi::Object &object,
             Variables &variables)
      : Command(CommandType::DrawSkottie) {
    convertProperty(runtime, object, "animation", props.animation, variables);
    convertProperty(runtime, object, "frame", props.frame, variables);
  }

  void draw(DrawingCtx *ctx) {
    props.animation->seekFrame(props.frame);
    props.animation->render(ctx->canvas);
  }
};
```

### 7. **Register in Recorder**
📁 `cpp/api/recorder/RNRecorder.h`

```cpp
// Add to appropriate push method
void pushImageFilter(jsi::Runtime &runtime, const std::string &nodeType,
                     const jsi::Object &props) {
  // ... existing registrations
  } else if (nodeType == "skImageFilter") {
    commands.push_back(
        std::make_unique<ImageFilterCmd>(runtime, props, variables));
  }
}
```

### 8. **Add Execution Logic**
📁 `cpp/api/recorder/RNRecorder.h`

```cpp
// In the play method's switch statement
case CommandType::PushImageFilter: {
  auto nodeType = cmd->nodeType;
  // ... existing cases
  } else if (nodeType == "skImageFilter") {
    auto *imageFilterCmd = static_cast<ImageFilterCmd *>(cmd.get());
    imageFilterCmd->pushImageFilter(ctx);
  }
  break;
}
```

### 9. **Update Node Classification (if needed)**
📁 `src/sksg/Node.ts`

For new general component types (like `ImageFilter`, `ColorFilter`, etc.), add them to the appropriate classification function:

```typescript
// For context declarations like ImageFilter
export const isImageFilter = (type: NodeType) => {
  "worklet";
  return (
    type === NodeType.ImageFilter ||        // Add your new general type here
    type === NodeType.OffsetImageFilter ||
    // ... other specific types
  );
};
```

### 10. **Create Tests**
📁 `src/renderer/__tests__/e2e/ImageFilter.spec.tsx`

```typescript
import React from "react";
import { checkImage, docPath } from "../../../__tests__/setup";
import { importSkia, surface } from "../setup";
import { ImageFilter, Circle, Group } from "../../components";
import { TileMode } from "../../../skia/types";

describe("ImageFilter", () => {
  it("Should render ImageFilter component with blur filter", async () => {
    const { Skia } = importSkia();
    const blurFilter = Skia.ImageFilter.MakeBlur(10, 10, TileMode.Clamp, null);
    
    const img = await surface.draw(
      <Group>
        <ImageFilter imageFilter={blurFilter}>
          <Circle cx={50} cy={50} r={30} color="red" />
        </ImageFilter>
      </Group>
    );
    
    checkImage(img, docPath("image-filter/blur-filter.png"));
  });
});
```

### 11. **Verify Implementation**

```bash
# Check TypeScript compilation
yarn tsc --noEmit

# Create test image directory
mkdir -p apps/docs/static/img/your-component/

# Run tests
yarn test src/renderer/__tests__/e2e/YourComponent.spec.tsx
```

## 🔑 Key Differences

### Drawing Commands (Skottie-style)
- Use `CommandType::DrawSkottie` or similar
- Implement `draw(DrawingCtx *ctx)` method
- Render directly to `ctx->canvas`
- Examples: Skottie, Circle, Rect, Text

### Context Declarations (ImageFilter-style)
- Use `CommandType::PushImageFilter` or similar
- Implement `pushImageFilter(DrawingCtx *ctx)` method
- Modify context state (e.g., `ctx->imageFilters.push_back()`)
- Examples: ImageFilter, ColorFilter, MaskFilter, Shader

## 📋 Checklist

When adding a new component, ensure you:

- [ ] Define props interface in `Drawings.ts`
- [ ] Add node type in `NodeType.ts`
- [ ] Create React component
- [ ] Export component in `index.ts`
- [ ] Add property converter (if needed) in `Convertor.h`
- [ ] Implement C++ command class
- [ ] Register command in `RNRecorder.h`
- [ ] Add execution logic in `RNRecorder.h`
- [ ] Update Node classification (if needed) in `Node.ts`
- [ ] Create comprehensive tests
- [ ] Verify TypeScript compilation
- [ ] Run and verify tests pass

## 📚 Reference Implementation

The ImageFilter component serves as a complete reference implementation for context declarations, while Skottie serves as a reference for drawing commands. Both follow the established patterns and can be used as templates for new components.

## 🔄 Pattern Summary

This pattern allows you to add both types of components consistently to the React Native Skia scene graph system, maintaining clean separation between React component layer, type definitions, and native C++ implementation.