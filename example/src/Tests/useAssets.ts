import { Skia, useImage, useTypeface } from "@shopify/react-native-skia";
import { useCallback, useState } from "react";
import { Platform } from "react-native";

const data = Skia.Data.fromBase64(
  // eslint-disable-next-line max-len
  "iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAABHNCSVQICAgIfAhkiAAABJhJREFUeJzt3T2LVGcYx+H7GeJXCDjGtLurVep8i3W0swg2wSJdUDAgCAYMFlaKBgJ2gqSwEBIQBJM0gRRiQEEUDBqEFQQLwbhz7hR5ITHqHuM588zMua4PsPtv5seZM+elfH3r1wxa2bM6LrU3QJdGtQcskM3aA6BrAtDes9oDoGsC0N7T2gOgawLQVilPak+ArglAW5mPa0+ArglAe49qD4CuCUBbJR/WngBdE4CWMsuD2hugawLQ0qjEvdoboGsC0FKJ0d3aG6BrAtDS883mdu0N0DUBaCEjnuzbPf6l9g7omgC0UCJu1N4AfRCAVvJ67QXQBwFoISN+qr0B+iAALYya6Y+1N0AfBGBrG+u73v+59gjogwBsITO+q70B+iIAW8qrtRdAXwRgK6NypfYE6IsAvN7Nycr4Vu0R0BcBeI3MvFx7A/RJAF5jNNp2qfYG6JMAvEopd9ZX3v2+9gzokwC8Qom8WHsD9E0AXqm5UHsB9E0AXqbEtfWV99wAxNITgJfIzPO1N8AsCMB/bUxWd3xVewTMggC8ICPO1d4AsyIAL2jK9EztDTArAvAveXrfyk7P/2cwBOAfsmlO1d4AsyQAf8vTk107PfqbQRGAP02n5UTtDTBrAhARGXHcc/8ZIgGIuN9Mtx+rPQJqGHwAMvLovt3lt9o7oIahB+AbV/0xZIMOQCnN4doboKbBBqDJOOKOP4ZuqAG4undt/HntEVDbEAOwWZrNT2qPgHkwuACUEge96gv+MLQAnF1fGX9ZewTMiyEF4Ic9q+OPa4+AeTKUAGxkM/2o9giYN4MIQGbsd6cf/NfSByAjD0zWxt/W3gHz6J3aA/pVDk1Wxy71hVdY2iOAjDi+Z3X7F7V3wDxbygBk5snJ6viz2jtg3i1dADLz5GRtx6e1d8AiWKoAZMRxH35ob4lOApZDE9/54Y0sRQAy8oCz/fDmFj0AG5mxf7K2w+/88D8s8jmAH7KZfugiH/j/FvUI4Kwbe+DtLVoANkuJg27phW4s0leAq6XZ/MCHH7qzEEcATcYRz/CD7s17AL4ppTm8d9XTe6EP8xqA+xl51Es7oF9zF4CMON5Mtx/zui7o3xwFIE9Pp+WEt/TC7MxBAPJ0Ns0pj+yC2asVgI2MONeU6Zl9KzsfVNoAgzfbAJS4lpnnndyD+dB/AEq5UyIvRjQXvIwT5ktfAbiZmZdHo22X1lfe/b6n/wG8pa4CsJEZ30Xk1RiVK5OV8a2O/i7QozcOQEY8KRE3IvJ6Rvw0aqY/etkmLKa/ArAZEc8i4mmU8iQyH0fEoyj5MLM8GJW4V2J09/lmc9vv9AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACy93wFAN/itW1l45QAAAABJRU5ErkJggg=="
);
const circle = Skia.Image.MakeImageFromEncoded(data)!;

const SkiaLogo =
  Platform.OS === "web" ? require("./assets/skia_logo.png") : "skia_logo";
const SkiaLogoJpeg =
  Platform.OS === "web"
    ? require("./assets/skia_logo_jpeg.jpg")
    : "skia_logo_jpeg";

// NotoColorEmoji.ttf is only available on iOS
const NotoColorEmojiSrc =
  Platform.OS === "ios"
    ? require("./assets/Roboto-Medium.ttf")
    : require("./assets/NotoColorEmoji.ttf");

export const useAssets = () => {
  const [error, setError] = useState<Error | null>(null);
  const errorHandler = useCallback((e: Error) => setError(e), []);
  const mask = useImage(require("./assets/mask.png"), errorHandler);
  const oslo = useImage(require("./assets/oslo.jpg"), errorHandler);
  const skiaLogoJpeg = useImage(SkiaLogoJpeg, errorHandler);
  const skiaLogoPng = useImage(SkiaLogo, errorHandler);
  const RobotoMedium = useTypeface(
    require("./assets/Roboto-Medium.ttf"),
    errorHandler
  );
  const NotoColorEmoji = useTypeface(NotoColorEmojiSrc, errorHandler);
  const UberMoveMediumMono = useTypeface(
    require("./assets/UberMove-Medium_mono.ttf"),
    errorHandler
  );
  const NotoSansSCRegular = useTypeface(
    require("./assets/NotoSansSC-Regular.otf"),
    errorHandler
  );
  if (error) {
    throw new Error("Failed to load assets: " + error.message);
  }
  if (
    !RobotoMedium ||
    !oslo ||
    !NotoColorEmoji ||
    !NotoSansSCRegular ||
    !UberMoveMediumMono ||
    !skiaLogoJpeg ||
    !skiaLogoPng ||
    !mask
  ) {
    return null;
  }
  return {
    RobotoMedium,
    NotoColorEmoji,
    NotoSansSCRegular,
    UberMoveMediumMono,
    oslo,
    skiaLogoJpeg,
    skiaLogoPng,
    circle,
    mask,
  };
};
