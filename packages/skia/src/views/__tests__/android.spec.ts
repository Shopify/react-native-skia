import type { NativeProps } from "../../specs/SkiaViewNativeComponent";
import type { AndroidBackingView, AndroidCanvasProps } from "../types";
import {
  androidNativeProps,
  resolveHighBitDepth,
  warnBackingViewAtMount,
  warnBackingViewChange,
} from "../android";

jest.mock("../../Platform", () => ({
  Platform: { OS: "android", Version: 35 },
}));

const { Platform } = jest.requireMock<{
  Platform: { OS: string; Version?: number };
}>("../../Platform");

let warn: jest.SpyInstance;

beforeEach(() => {
  Platform.OS = "android";
  Platform.Version = 35;
  warn = jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  warn.mockRestore();
});

// What a JavaScript caller can pass that TypeScript refuses.
const untyped = (android: object) => android as AndroidCanvasProps;

describe("AndroidCanvasProps", () => {
  // Without `backingView` the union cannot tell the views apart, so an
  // option of another view on the default TextureView must not compile.
  it("takes each option on the views that honour it only", () => {
    const textureViewTakesZOrder: {
      opaque: false;
      zOrderOnTop: true;
    } extends AndroidCanvasProps
      ? true
      : false = false;
    const hardwareBufferViewTakesOpaque: {
      backingView: "HardwareBufferView";
      opaque: true;
    } extends AndroidCanvasProps
      ? true
      : false = false;
    const surfaceViewTakesZOrder: {
      backingView: "SurfaceView";
      opaque: false;
      zOrderOnTop: true;
    } extends AndroidCanvasProps
      ? true
      : false = true;
    expect([
      textureViewTakesZOrder,
      hardwareBufferViewTakesOpaque,
      surfaceViewTakesZOrder,
    ]).toEqual([false, false, true]);
  });

  // The published types restate the views rather than import the spec.
  it("names the views the native component's spec takes", () => {
    type SpecBackingView = NonNullable<NativeProps["androidBackingView"]>;
    const sameViews: [AndroidBackingView] extends [SpecBackingView]
      ? [SpecBackingView] extends [AndroidBackingView]
        ? true
        : false
      : false = true;
    expect(sameViews).toBe(true);
  });
});

describe("androidNativeProps", () => {
  it("backs a canvas with a translucent TextureView by default", () => {
    expect(androidNativeProps()).toEqual({
      androidBackingView: "TextureView",
      androidOpaque: false,
      androidZOrderOnTop: false,
      androidZOrderMediaOverlay: false,
    });
  });

  it.each<[AndroidCanvasProps, boolean]>([
    [{ opaque: true }, true],
    [{ backingView: "TextureView" }, false],
    [{ backingView: "SurfaceView" }, true],
    [{ backingView: "SurfaceView", opaque: false }, false],
    [{ backingView: "HardwareBufferView" }, false],
  ])("resolves the opacity of %j to %s", (android, opaque) => {
    expect(androidNativeProps(android).androidOpaque).toBe(opaque);
  });

  it("keeps the z-order options to a SurfaceView", () => {
    const zOrder = { zOrderOnTop: true, zOrderMediaOverlay: true };
    expect(
      androidNativeProps({ backingView: "SurfaceView", ...zOrder })
    ).toMatchObject({
      androidZOrderOnTop: true,
      androidZOrderMediaOverlay: true,
    });
    expect(androidNativeProps(untyped(zOrder))).toMatchObject({
      androidBackingView: "TextureView",
      androidZOrderOnTop: false,
      androidZOrderMediaOverlay: false,
    });
  });

  // The generated string-enum parser aborts on a value it does not know.
  it("gives a value no view takes the default view", () => {
    expect(
      androidNativeProps(untyped({ backingView: "SurfaceControl" }))
    ).toEqual(androidNativeProps());
  });

  it("is a pure function of the android prop", () => {
    const android: AndroidCanvasProps = Object.freeze({
      backingView: "SurfaceView",
      opaque: false,
      zOrderMediaOverlay: true,
    });
    const first = androidNativeProps(android);
    expect(androidNativeProps(android)).toEqual(first);
    expect(androidNativeProps(android)).not.toBe(first);
    expect(android).toEqual({
      backingView: "SurfaceView",
      opaque: false,
      zOrderMediaOverlay: true,
    });
  });
});

describe("resolveHighBitDepth", () => {
  it("gives the 10-bit format to a SurfaceView only, on Android", () => {
    expect(
      resolveHighBitDepth({
        highBitDepth: true,
        android: { backingView: "SurfaceView" },
      })
    ).toBe(true);
    expect(
      resolveHighBitDepth({ highBitDepth: true, android: { opaque: true } })
    ).toBe(false);
    expect(
      resolveHighBitDepth({
        highBitDepth: true,
        android: { backingView: "HardwareBufferView" },
      })
    ).toBe(false);
  });

  it("leaves the bit depth to the prop on the other platforms", () => {
    Platform.OS = "ios";
    expect(resolveHighBitDepth({ highBitDepth: true })).toBe(true);
    expect(resolveHighBitDepth({ highBitDepth: false })).toBe(false);
  });
});

describe("warnBackingViewAtMount", () => {
  it("says when the z-order options reach a view that ignores them", () => {
    warnBackingViewAtMount({ android: untyped({ zOrderOnTop: true }) });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("only apply to a SurfaceView");
  });

  it("stays quiet about options the view honours", () => {
    warnBackingViewAtMount({
      highBitDepth: true,
      android: { backingView: "SurfaceView", zOrderMediaOverlay: true },
    });
    expect(warn).not.toHaveBeenCalled();
  });
});

describe("warnBackingViewChange", () => {
  const mount: AndroidCanvasProps = { backingView: "SurfaceView" };
  const change = (android: AndroidCanvasProps) =>
    warnBackingViewChange({ android: mount }, { android: mount }, { android });
  const warnings = () => warn.mock.calls.map(([message]) => message);

  // SurfaceView moves a live surface on a changed zOrderOnTop from Android
  // 11, and on a changed zOrderMediaOverlay only from Android 14: up to
  // Android 13 the media overlay sublayer is read when the surface is created.
  it.each<[number, boolean, boolean]>([
    [29, true, true],
    [30, false, true],
    [33, false, true],
    [34, false, false],
  ])(
    "on API %i, warns about zOrderOnTop: %s, zOrderMediaOverlay: %s",
    (version, onTopIgnored, mediaOverlayIgnored) => {
      Platform.Version = version;
      change({ backingView: "SurfaceView", zOrderOnTop: true });
      expect(warnings()).toEqual(
        onTopIgnored
          ? [
              expect.stringContaining(
                "Ignoring a change of android.zOrderOnTop"
              ),
            ]
          : []
      );
      warn.mockClear();
      change({ backingView: "SurfaceView", zOrderMediaOverlay: true });
      expect(warnings()).toEqual(
        mediaOverlayIgnored
          ? [
              expect.stringContaining(
                "Ignoring a change of android.zOrderMediaOverlay"
              ),
            ]
          : []
      );
    }
  );

  // Android 13 moves a surface leaving the top to the default sublayer,
  // whatever sublayer was asked for: a media overlay would come back among
  // the other SurfaceViews, so there it reads zOrderOnTop when it mounts.
  it.each<[number, boolean]>([
    [30, false],
    [32, false],
    [33, true],
    [34, false],
  ])(
    "on API %i, warns about zOrderOnTop on a media overlay: %s",
    (version, ignored) => {
      Platform.Version = version;
      const mediaOverlay = {
        backingView: "SurfaceView",
        zOrderMediaOverlay: true,
      } as const;
      warnBackingViewChange(
        { android: mediaOverlay },
        { android: mediaOverlay },
        { android: { ...mediaOverlay, zOrderOnTop: true } }
      );
      expect(warnings()).toEqual(
        ignored
          ? [
              expect.stringContaining(
                "Ignoring a change of android.zOrderOnTop"
              ),
            ]
          : []
      );
    }
  );

  it("warns about an opacity a highBitDepth canvas cannot take", () => {
    const highBitDepthMount = { highBitDepth: true, android: mount };
    warnBackingViewChange(highBitDepthMount, highBitDepthMount, {
      highBitDepth: true,
      android: { backingView: "SurfaceView", opaque: false },
    });
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("a highBitDepth canvas is opaque");
  });
});
