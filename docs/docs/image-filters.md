---
id: image-filters
title: Image Filters
sidebar_label: Image Filters
slug: /image-filters
---

Image filters are effects that operate on all the color bits of pixels that make up an image.

## Blur

Creates an image filter that blurs its input by the separate X and Y sigmas.
The provided tile mode is used when the blur kernel goes outside the input image.

| Name      | Type          |  Description                                            |
|:----------|:--------------|:--------------------------------------------------------|
| sigmaX    | `number`      | The Gaussian sigma value for blurring along the X axis. |
| sigmaY    | `number`      | The Gaussian sigma value for blurring along the Y axis. |
| mode?     | `TileMode`    |  (default is `decal`).                                  |
| children? | `ImageFilter` | Optional image filter to be applied first.              | 

## ColorFilterAsImageFilter

Creates an image filter that applies the color filter to the filter result.


