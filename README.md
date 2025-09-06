# React Native Skia

High-performance 2d Graphics for React Native using Skia

[![CI](https://github.com/Shopify/react-native-skia/actions/workflows/ci.yml/badge.svg)](https://github.com/Shopify/react-native-skia/actions/workflows/tests.yml)
[![npm version](https://img.shields.io/npm/v/@shopify/react-native-skia.svg?style=flat)](https://www.npmjs.com/package/@shopify/react-native-skia)
[![issues](https://img.shields.io/github/issues/shopify/react-native-skia.svg?style=flat)](https://github.com/shopify/react-native-skia/issues)

<img width="400" alt="skia" src="https://user-images.githubusercontent.com/306134/146549218-b7959ad9-0107-4c1c-b439-b96c780f5230.png">

Checkout the full documentation [here](https://shopify.github.io/react-native-skia).

React Native Skia brings the Skia Graphics Library to React Native. Skia serves as the graphics engine for Google Chrome and Chrome OS, Android, Flutter, Mozilla Firefox and Firefox OS, and many other products.

## Getting Started

[Installation instructions](https://shopify.github.io/react-native-skia/docs/getting-started/installation/)

## Contributing

For detailed information on library development, building, testing, and contributing guidelines, please see [CONTRIBUTING.md](packages/skia/CONTRIBUTING.md).

## Graphite

Skia has two backends: Ganesh and Graphite. Ganesh is the default backend.
If you want to experiment with Graphite, you can enable it by building Skia with `SK_GRAPHITE=1 yarn build-skia`.  
Skia Graphite requires Android API Level 26 or above.

React Native Skia automatically detects if the Dawn WebGPU implementation library files are available. If they are present, it will automatically assume that Graphite is enabled.
  
