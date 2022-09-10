---
id: size
title: Bundle Sizes
sidebar_label: Bundle Size
slug: /getting-started/bundlesize
---

React Native Skia includes both prebuilt library files and C++ files that are compiled and linked with your app when being built - adding to the size of your app.

For a regular arm 64-bit **Android** device the increased download size will be around **4** MB added after adding React Native Skia - on **iOS** the increased download size will be around **6** MB.

On **Web** the increase will be around **7,2** MB which can be reduced by distributing the included CanvasKit Web Assembly file through a CDN.

> On _Android_ you should use [App Bundles](https://developer.android.com/guide/app-bundle) to ensure that only the required files are downloaded to your user’s devices.

Below is an explanation of how these numbers where found - using a bare bones React Native app created with `npx react-native init` before and after adding React Native Skia.

### **Android**

If we compare the before and after AKPs built in **release** **mode**, we can see the difference between the two using the APK Analyzer in Android Studio. The main difference is in the lib folder where there is an increased size of 41.3 MB after adding React Native Skia.

The interesting part is that if we inspect the contents of the lib folder we’ll see that the there are multiple folders - one for each target architecture. By peeking into the one that is most interesting for our users (arm 64-bit) we see that the file `libreactskia.so` is the biggest one - but its size is only around **3,8** MB**.**

This implies that if you distribute your apps using [App Bundles](https://developer.android.com/guide/app-bundle) the increase in download size should be around **4mb** on Android devices when distributed (including and increase of 220 KB to the Javascript Bundle).

### iOS

Finding the correct increase in size on iOS is not as easy as on Android - but by archiving and distributing our build using the Ad-Hoc distribution method we'll some numbers in the report "App Thinning Size.txt":

**Base app:** 2,6 MB compressed, 7,2 MB uncompressed
**With React Native Skia:**: 5,2 MB compressed, 13 MB uncompressed

Meaning that we’ve increased the size of our app with around **5,8** MB after adding React Native Skia. If we add the increased Javascript bundle of around 220 KB we end up with around **6** MB of increased download size after including React Native Skia.

### Notes

You might wonder why the NPM download is a lot bigger than these numbers indicate - The main reason is that on iOS it is required to also distribute the bitcode (intermediate representation of a compiled program that can be used to recompile the program). This requirement will be removed in the future.

Also remember that we need to distribute our libraries for all target platforms meaning that we distribute quite a few versions of the same library files.
