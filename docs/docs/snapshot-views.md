---
id: snapshotviews
title: Snapshot Views
sidebar_label: Snapshot Views
slug: /snapshotviews
---

## Creating Snapshots of Views

The function `makeImageFromView` lets you take a snapshot of another React Native View as a Skia SkImage. The function accepts a ref to a native view and returns a promise that resolves to an `SkImage` instance upon success.

```tsx twoslash
import { useState, useRef } from "react";
import { View } from "react-native";
import type { SkImage } from "@shopify/react-native-skia";
import { makeImageFromView } from "@shopify/react-native-skia";

// Create a ref for the view you'd like to take a snapshot of
const viewRef = useRef<View>(null);

// Create a state variable to store the snapshot
const [image, setImage] = useState<SkImage | null>(null);

// Create a function to take the snapshot
const takeSnapshot = async () => {
  if (viewRef.current == null) {
    return;
  }
  // Take the snapshot of the view
  const snapshot = await makeImageFromView(viewRef);
  setImage(snapshot);
};
```
