---
id: canvas
title: Canvas
sidebar_label: Overview
slug: /canvas/overview
---

The Canvas component is the root of your Skia drawing.
You can treat it as a regular React Native view and assign a view style to it.
Behind the scenes, it is using its own React renderer.

| Name | Type     |  Description.    |
|:-----|:---------|:-----------------|
| style   | `ViewStyle` | View style. |
| ref?   | `Ref<SkiaView>` | Reference to the `SkiaView` object |
| onTouch?    | `TouchHandler` | Touch handler for the Canvas (see [touch handler](/docs/animations/overview#usetouchhandler)).        |

## Getting a Canvas Snapshot

