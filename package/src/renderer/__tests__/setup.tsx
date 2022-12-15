/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";

import React from "react";
import type { ReactNode } from "react";
import ReactReconciler from "react-reconciler";
import type { Server, WebSocket } from "ws";

import { DependencyManager } from "../DependencyManager";
import { skHostConfig } from "../HostConfig";
import { Container } from "../Container";
import type { DrawingContext } from "../DrawingContext";
import { ValueApi } from "../../values/web";
import { LoadSkiaWeb } from "../../web/LoadSkiaWeb";
import type * as SkiaExports from "../..";
import { SkiaView } from "../../views/SkiaView.web";
import { JsiSkApi } from "../../skia/web/JsiSkia";
import type { Node } from "../../dom/nodes";
import { JsiSkDOM } from "../../dom/nodes";
import { Group } from "../components";
import type { SkImage, SkFont } from "../../skia/types";
import { isPath } from "../../skia/types";
import { E2E } from "../../__tests__/setup";

jest.setTimeout(180 * 1000);

declare global {
  var testServer: Server;
  var testClient: WebSocket;
}
export let surface: TestingSurface;
const assets = new Map<SkImage | SkFont, string>();
export let images: { oslo: SkImage };
export let fonts: {
  RobotoMedium: SkFont;
  NotoColorEmoji: SkFont;
  NotoSansSCRegular: SkFont;
};

beforeAll(async () => {
  await LoadSkiaWeb();
  const Skia = JsiSkApi(global.CanvasKit);
  global.SkiaApi = Skia;
  global.SkiaValueApi = ValueApi;
  surface = E2E ? new RemoteSurface() : new LocalSurface();
  const { fontSize } = surface;
  const NotoSansSCRegular = loadFont(
    "skia/__tests__/assets/NotoSansSC-Regular.otf",
    fontSize
  );
  const NotoColorEmoji = loadFont(
    "skia/__tests__/assets/NotoColorEmoji.ttf",
    fontSize
  );
  const RobotoMedium = loadFont(
    "skia/__tests__/assets/Roboto-Medium.ttf",
    fontSize
  );
  const oslo = loadImage("skia/__tests__/assets/oslo.jpg");
  images = { oslo };
  fonts = { RobotoMedium, NotoColorEmoji, NotoSansSCRegular };
  assets.set(oslo, "oslo");
  assets.set(RobotoMedium, "RobotoMedium");
  assets.set(NotoColorEmoji, "NotoColorEmoji");
  assets.set(NotoSansSCRegular, "NotoSansSCRegular");
});

export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const resolveFile = (uri: string) =>
  fs.readFileSync(path.resolve(__dirname, `../../${uri}`));

(global as any).fetch = jest.fn((uri: string) =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(resolveFile(uri)),
  })
);

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface EmptyProps {}

jest.mock("react-native", () => ({
  PixelRatio: {
    get(): number {
      return 1;
    },
  },
  Platform: { OS: "web" },
  Image: {
    resolveAssetSource: jest.fn,
  },
  requireNativeComponent: jest.fn,
}));

export const loadImage = (uri: string) => {
  const Skia = global.SkiaApi;
  const image = Skia.Image.MakeImageFromEncoded(
    Skia.Data.fromBytes(resolveFile(uri))
  );
  expect(image).toBeTruthy();
  return image!;
};

export const loadFont = (uri: string, ftSize?: number) => {
  const Skia = global.SkiaApi;
  const tf = Skia.Typeface.MakeFreeTypeFaceFromData(
    Skia.Data.fromBytes(resolveFile(uri))
  );
  expect(tf).toBeTruthy();
  return Skia.Font(tf!, ftSize ?? fontSize);
};

export const importSkia = (): typeof SkiaExports => require("../..");
export const getSkDOM = () => {
  const { Skia } = importSkia();
  const depMgr = new DependencyManager(() => () => {});
  return new JsiSkDOM({ Skia, depMgr });
};

export const PIXEL_RATIO = 3;
export const fontSize = 32 * PIXEL_RATIO;
export const width = 256 * PIXEL_RATIO;
export const height = 256 * PIXEL_RATIO;
export const center = { x: width / 2, y: height / 2 };

const skiaReconciler = ReactReconciler(skHostConfig);

skiaReconciler.injectIntoDevTools({
  bundleType: 1,
  version: "0.0.1",
  rendererPackageName: "react-native-skia",
});

export const drawOnNode = (element: ReactNode) => {
  const { surface: ckSurface, draw } = mountCanvas(element);
  draw();
  return ckSurface;
};

export const mountCanvas = (element: ReactNode) => {
  const Skia = global.SkiaApi;
  expect(Skia).toBeDefined();
  const ckSurface = Skia.Surface.Make(width, height)!;
  expect(ckSurface).toBeDefined();
  const canvas = ckSurface.getCanvas();
  expect(canvas).toBeDefined();
  expect(element).toBeDefined();

  const ref = {
    current: new SkiaView({}) as any,
  };
  const registerValues = (values: Array<SkiaExports.SkiaValue<unknown>>) => {
    if (ref.current === null) {
      throw new Error("Canvas ref is not set");
    }
    return ref.current.registerValues(values);
  };

  const depMgr = new DependencyManager(registerValues);
  const container = new Container(Skia, depMgr);
  const root = skiaReconciler.createContainer(
    container,
    0,
    null,
    true,
    null,
    "",
    console.error,
    null
  );
  skiaReconciler.updateContainer(element, root, null, () => {
    container.depMgr.update();
  });
  const ctx: DrawingContext = {
    width,
    height,
    timestamp: 0,
    canvas,
    paint: Skia.Paint(),
    ref,
    center: Skia.Point(width / 2, height / 2),
    Skia,
  };
  return {
    draw: () => {
      container.draw(ctx);
    },
    surface: ckSurface,
    container,
  };
};

export const serialize = (element: ReactNode) => {
  const Skia = global.SkiaApi;
  expect(Skia).toBeDefined();
  const ckSurface = Skia.Surface.Make(width, height)!;
  expect(ckSurface).toBeDefined();
  const canvas = ckSurface.getCanvas();
  expect(canvas).toBeDefined();
  expect(element).toBeDefined();

  const ref = {
    current: new SkiaView({}) as any,
  };
  const registerValues = (values: Array<SkiaExports.SkiaValue<unknown>>) => {
    if (ref.current === null) {
      throw new Error("Canvas ref is not set");
    }
    return ref.current.registerValues(values);
  };

  const depMgr = new DependencyManager(registerValues);
  const container = new Container(Skia, depMgr);
  const root = skiaReconciler.createContainer(
    container,
    0,
    null,
    true,
    null,
    "",
    console.error,
    null
  );
  skiaReconciler.updateContainer(element, root, null, () => {
    container.depMgr.update();
  });
  const serialized = serializeNode(container.root);
  return JSON.stringify(serialized);
};

interface SerializedProps {
  [key: string]: any;
}

interface SerializedNode {
  type: string;
  props: SerializedProps;
  children: SerializedNode[];
}

const serializeSkOjects = (obj: any): any => {
  if (obj && typeof obj === "object" && "__typename__" in obj) {
    if (obj.__typename__ === "Point") {
      return { __typename__: "Point", x: obj.x, y: obj.y };
    } else if (obj.__typename__ === "Rect") {
      return {
        __typename__: "Rect",
        x: obj.x,
        y: obj.y,
        width: obj.width,
        height: obj.height,
      };
    } else if (obj.__typename__ === "RRect") {
      return {
        __typename__: "RRect",
        x: obj.rect.x,
        y: obj.rect.y,
        width: obj.rect.width,
        height: obj.rect.height,
        rx: obj.rx,
        ry: obj.ry,
      };
    } else if (isPath(obj)) {
      return {
        __typename__: "Path",
        cmds: obj.toCmds(),
      };
    } else if (obj.__typename__ === "Image") {
      return {
        __typename__: "Image",
        name: assets.get(obj)!,
      };
    } else if (obj.__typename__ === "Font") {
      return {
        __typename__: "Font",
        size: obj.getSize(),
        name: assets.get(obj)!,
      };
    } else if (obj.__typename__ === "RuntimeEffect") {
      return {
        __typename__: "RuntimeEffect",
        source: obj.source(),
      };
    }
  }
  return obj;
};

const serializeNode = (node: Node<any>): SerializedNode => {
  const props: any = {};
  const ogProps = node.getProps();
  if (ogProps) {
    Object.keys(ogProps)
      .filter((key) => key !== "children")
      .forEach((key) => {
        props[key] = serializeSkOjects(ogProps[key]);
      });
  }
  return {
    type: node.type,
    props,
    children: node.children().map((child) => serializeNode(child)),
  };
};

type EvalContext = Record<string, any>;

interface TestingSurface {
  eval(code: string, ctx?: EvalContext): Promise<any>;
  draw(node: ReactNode): Promise<SkImage>;
  width: number;
  height: number;
  fontSize: number;
}

class LocalSurface implements TestingSurface {
  readonly width = 256;
  readonly height = 256;
  readonly fontSize = 32;

  eval(code: string, ctx: EvalContext = {}): Promise<any> {
    return Promise.resolve(
      // eslint-disable-next-line no-eval
      eval(`(function Main(){const {Skia, ctx} = this;${code}})`).call({
        Skia: global.SkiaApi,
        ctx,
      })
    );
  }

  draw(node: ReactNode): Promise<SkImage> {
    const { surface: ckSurface, draw } = mountCanvas(
      <Group transform={[{ scale: PIXEL_RATIO }]}>{node}</Group>
    );
    draw();
    return Promise.resolve(ckSurface.makeImageSnapshot());
  }
}

class RemoteSurface implements TestingSurface {
  readonly width = 256;
  readonly height = 256;
  readonly fontSize = 32;

  private get client() {
    if (global.testClient === null) {
      throw new Error("Client is not connected. Did you call init?");
    }
    return global.testClient!;
  }

  eval(code: string, context: EvalContext = {}): Promise<any> {
    return new Promise((resolve) => {
      this.client.once("message", (raw: Buffer) => {
        resolve(JSON.parse(raw.toString()));
      });
      const ctx: EvalContext = {};
      Object.keys(context).forEach((key) => {
        ctx[key] = serializeSkOjects(context[key]);
      });
      this.client.send(JSON.stringify({ code, ctx }));
    });
  }

  draw(node: ReactNode): Promise<SkImage> {
    return new Promise((resolve) => {
      this.client.once("message", (raw: Buffer) => {
        const Skia = global.SkiaApi;
        const data = Skia.Data.fromBytes(new Uint8Array(raw));
        const image = Skia.Image.MakeImageFromEncoded(data);
        if (image === null) {
          throw new Error("Unable to decode image");
        }
        resolve(image);
      });
      this.client!.send(serialize(node));
    });
  }
}
