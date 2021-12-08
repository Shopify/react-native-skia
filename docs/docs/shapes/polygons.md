---
id: polygons
title: Polygons
sidebar_label: Polygons
slug: /shapes/polygons
---

## Rect

Draws a rectangle.

| Name   | Type     |  Description                                                  |
|:-------|:---------|:--------------------------------------------------------------|
| x      | `number` | X coordinate.                                                 |
| y      | `number` | Y coordinate.                                                 |
| width  | `number` | Width of the rectangle.                                       |
| height | `number` | Height of the rectangle.                                      |
| rx?    | `number` | Horizontal corner radius. Defaults to `ry` if specified or 0. |
| ry?    | `number` | Vertical corner radius. Defaults to `rx` if specified or 0.   |

## DRect

Draws the difference between two rectangles.

| Name   | Type          |  Description     |
|:-------|:--------------|:-----------------|
| outer  | `RectOrRRect` | Outer rectangle. |
| inner  | `RectOrRRect` | Inner rectangle. |

## Line

Draws a line between two points.

| Name | Type    |  Description     |
|:-----|:--------|:-----------------|
| p1   | `Point` | Start point.     |
| p2   | `Point` | End point.       |

## Points

Draws points and optionally draws the connection between them.

| Name   | Type        |  Description     |
|:-------|:------------|:-----------------|
| points | `Point`     | Points to draw.  |
| mode   | `PointMode` | How the points should be connected. Can be `points` (no connection), `lines` (connect points), or `polygon` (the last point is connected with the first one). Default is `points`.       |
