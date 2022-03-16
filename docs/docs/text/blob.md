---
id: blob
title: Text Blob
sidebar_label: Text Blob
slug: /text/blob
---

A text blob contains glyphs, positions, and paint attributes specific to the text.

| Name        | Type       |  Description                                                 |
|:------------|:-----------|:-------------------------------------------------------------|
| blob        | `TextBlob` | Text blob                                                    |
| x?          | `number`   | x coordinate of the origin of the entire run. Default is 0   |
| y?          | `number`   | y coordinate of the origin of the entire run. Default is 0   |

## Example

```tsx twoslash
import {Canvas, TextBlob, Skia} from "@shopify/react-native-skia";


export const HelloWorld = () => {
  const typeface = Skia.FontMgr.RefDefault().matchFamilyStyle("helvetica");
  if (!typeface) {
    throw new Error("Helvetica not found");
  }
  const font = Skia.Font(typeface, 30);
  const blob = Skia.TextBlob.MakeFromText("Hello World!", font);
  return (
      <Canvas style={{ flex: 1 }}>
        <TextBlob
          blob={blob}
          color="blue"
        />
      </Canvas>
  );
};
```