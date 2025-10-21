# JSI ArgParser Utility

A modern C++ utility for parsing JSI function arguments with type safety and cleaner syntax.

## Overview

The `ArgParser` class provides a sequential, type-safe way to parse JSI function arguments, eliminating the verbose patterns of manual argument handling. It automatically handles:

- Type checking and conversion
- Optional arguments (using `std::optional<T>`)
- Clear error messages with argument positions
- Support for primitives, objects, arrays, enums, and custom JsiSk* types

## Quick Example

**Before:**
```cpp
JSI_HOST_FUNCTION(drawImage) {
  auto image = JsiSkImage::fromValue(runtime, arguments[0]);
  auto x = arguments[1].asNumber();
  auto y = arguments[2].asNumber();
  std::shared_ptr<SkPaint> paint;
  if (count == 4) {
    paint = JsiSkPaint::fromValue(runtime, arguments[3]);
  }
  _canvas->drawImage(image, x, y, SkSamplingOptions(), paint.get());
  return jsi::Value::undefined();
}
```

**After:**
```cpp
JSI_HOST_FUNCTION(drawImage) {
  ArgParser parser(runtime, arguments, count);
  auto image = parser.next<sk_sp<SkImage>>();
  auto x = parser.next<float>();
  auto y = parser.next<float>();
  auto paint = parser.next<std::optional<std::shared_ptr<SkPaint>>>();
  _canvas->drawImage(image, x, y, SkSamplingOptions(),
                     paint.has_value() ? paint.value().get() : nullptr);
  return jsi::Value::undefined();
}
```

## Usage

### 1. Include the headers

```cpp
#include "JsiArgParser.h"
#include "JsiArgParserTypes.h"
```

### 2. Define type specializations (once per file)

For each JsiSk* type you'll use, define a parser specialization:

```cpp
// For shared_ptr types
JSI_ARG_PARSER_SHARED_PTR(SkPaint, JsiSkPaint)
JSI_ARG_PARSER_SHARED_PTR(SkRect, JsiSkRect)
JSI_ARG_PARSER_SHARED_PTR(SkPath, JsiSkPath)

// For sk_sp types
JSI_ARG_PARSER_SK_SP(SkImage, JsiSkImage)
JSI_ARG_PARSER_SK_SP(SkPicture, JsiSkPicture)
```

### 3. Use in your JSI functions

```cpp
JSI_HOST_FUNCTION(myFunction) {
  ArgParser parser(runtime, arguments, count);

  // Parse required arguments
  auto requiredArg = parser.next<Type>();

  // Parse optional arguments
  auto optionalArg = parser.next<std::optional<Type>>();

  // Use the parsed values...
  return jsi::Value::undefined();
}
```

## Supported Types

### Primitive Types

```cpp
auto num = parser.next<float>();          // or double
auto integer = parser.next<int>();        // or any integral type
auto flag = parser.next<bool>();
auto text = parser.next<std::string>();   // auto-converts from jsi::String
```

### JSI Types

```cpp
auto str = parser.next<jsi::String>();
auto obj = parser.next<jsi::Object>();
auto arr = parser.next<jsi::Array>();
auto func = parser.next<jsi::Function>();
```

### Enum Types

```cpp
auto filterMode = parser.next<SkFilterMode>();
auto blendMode = parser.next<SkBlendMode>();
```

### JsiSk* Wrapper Types

```cpp
// shared_ptr types
auto paint = parser.next<std::shared_ptr<SkPaint>>();
auto rect = parser.next<std::shared_ptr<SkRect>>();
auto path = parser.next<std::shared_ptr<SkPath>>();

// sk_sp types
auto image = parser.next<sk_sp<SkImage>>();
auto picture = parser.next<sk_sp<SkPicture>>();
auto textBlob = parser.next<sk_sp<SkTextBlob>>();
```

### Optional Arguments

Wrap any type in `std::optional<T>` to make it optional:

```cpp
auto paint = parser.next<std::optional<std::shared_ptr<SkPaint>>>();

// Check if value was provided
if (paint.has_value()) {
  usePaint(paint.value());
}

// Or use value_or for defaults
auto color = parser.next<std::optional<uint32_t>>().value_or(0xFF000000);
```

## Complete Examples

### Example 1: All Required Arguments

```cpp
JSI_HOST_FUNCTION(drawLine) {
  ArgParser parser(runtime, arguments, count);
  auto x1 = parser.next<float>();
  auto y1 = parser.next<float>();
  auto x2 = parser.next<float>();
  auto y2 = parser.next<float>();
  auto paint = parser.next<std::shared_ptr<SkPaint>>();
  _canvas->drawLine(x1, y1, x2, y2, *paint);
  return jsi::Value::undefined();
}
```

### Example 2: Mix of Required and Optional

```cpp
JSI_HOST_FUNCTION(drawImageCubic) {
  ArgParser parser(runtime, arguments, count);
  auto image = parser.next<sk_sp<SkImage>>();
  auto x = parser.next<float>();
  auto y = parser.next<float>();
  auto B = parser.next<float>();
  auto C = parser.next<float>();
  auto paint = parser.next<std::optional<std::shared_ptr<SkPaint>>>();
  _canvas->drawImage(image, x, y, SkSamplingOptions({B, C}),
                     paint.has_value() ? paint.value().get() : nullptr);
  return jsi::Value::undefined();
}
```

### Example 3: Boolean and Enum Arguments

```cpp
JSI_HOST_FUNCTION(drawArc) {
  ArgParser parser(runtime, arguments, count);
  auto oval = parser.next<std::shared_ptr<SkRect>>();
  auto startAngle = parser.next<float>();
  auto sweepAngle = parser.next<float>();
  auto useCenter = parser.next<bool>();
  auto paint = parser.next<std::shared_ptr<SkPaint>>();
  _canvas->drawArc(*oval, startAngle, sweepAngle, useCenter, *paint);
  return jsi::Value::undefined();
}
```

### Example 4: Complex Types with Enums and Optionals

```cpp
JSI_HOST_FUNCTION(drawImageOptions) {
  ArgParser parser(runtime, arguments, count);
  auto image = parser.next<sk_sp<SkImage>>();
  auto x = parser.next<float>();
  auto y = parser.next<float>();
  auto filterMode = parser.next<SkFilterMode>();
  auto mipmapMode = parser.next<SkMipmapMode>();
  auto paint = parser.next<std::optional<std::shared_ptr<SkPaint>>>();
  _canvas->drawImage(image, x, y, SkSamplingOptions(filterMode, mipmapMode),
                     paint.has_value() ? paint.value().get() : nullptr);
  return jsi::Value::undefined();
}
```

## Helper Methods

```cpp
ArgParser parser(runtime, arguments, count);

// Get current parsing position
size_t pos = parser.currentIndex();

// Check if more arguments available
if (parser.hasMore()) {
  auto extra = parser.next<int>();
}

// Reset to beginning (rarely needed)
parser.reset();

// Get total argument count
size_t total = parser.totalCount();
```

## Error Handling

The parser automatically throws `jsi::JSError` with clear messages:

```cpp
// If required argument is missing:
// "Missing required argument at index 3"

// If type is wrong:
// "Expected number for argument at index 2"
// "Expected boolean for argument at index 4"
```

## Adding Support for New Types

### For a new JsiSk* wrapper type:

1. Include the header for your type
2. Add the parser specialization:

```cpp
// In your implementation file
JSI_ARG_PARSER_SHARED_PTR(SkMyType, JsiSkMyType)
// or
JSI_ARG_PARSER_SK_SP(SkMyType, JsiSkMyType)
```

### For a completely custom type:

Add a template specialization in your code:

```cpp
template <>
inline MyCustomType ArgParser::parse<MyCustomType>(const jsi::Value &value) {
  // Your custom parsing logic
  return parseMyType(value);
}
```

## Benefits

1. **Cleaner Code**: Sequential parsing is more readable than indexed access
2. **Type Safety**: Compile-time type checking for all arguments
3. **Better Errors**: Automatic position tracking in error messages
4. **Less Boilerplate**: No manual count checking or null validation
5. **Self-Documenting**: The types in the code clearly show the function signature
6. **Refactor-Friendly**: Easy to add/remove/reorder arguments

## Migration Guide

To migrate existing code:

1. Add includes and type specializations at the top of your file
2. Create an `ArgParser` instance at the start of each function
3. Replace each `arguments[N]...` with `parser.next<Type>()`
4. Replace optional argument patterns with `std::optional<T>`
5. Remove manual count checks and null validations

## Performance

ArgParser has zero runtime overhead compared to manual parsing:
- Header-only, fully inlined
- No allocations beyond what the original code did
- Compiled away to the same assembly as manual parsing
- Template-based, resolved at compile time
