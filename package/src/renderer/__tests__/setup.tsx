/* eslint-disable @typescript-eslint/no-explicit-any */
import fs from "fs";
import path from "path";

import React from "react";
import type { ReactNode } from "react";
import ReactReconciler from "react-reconciler";
import type { Server, WebSocket } from "ws";
import { WebSocketServer } from "ws";

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
import type { SkFont, SkImage } from "../../skia/types";
import { isPath } from "../../skia/types";
import { E2E } from "../../__tests__/setup";

jest.setTimeout(180 * 1000);

export let surface: TestingSurface;

beforeAll(async () => {
  if (surface === undefined) {
    surface = E2E ? new RemoteSurface() : new LocalSurface();
    await surface.init();
  }
});

afterAll(() => {
  surface.dispose();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  surface = undefined;
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

export const loadFontWithAsset = (uri: string, ftSize?: number) => {
  const Skia = global.SkiaApi;
  const typeface = resolveFile(uri);
  const tf = Skia.Typeface.MakeFreeTypeFaceFromData(
    Skia.Data.fromBytes(resolveFile(uri))
  );
  expect(tf).toBeTruthy();
  const size = ftSize ?? fontSize;
  const font = Skia.Font(tf!, size);
  const assets = new Map<SkFont, number[]>();
  assets.set(font, Array.from(new Uint8Array(typeface)));
  return { font, assets };
};

export const loadFont = (uri: string, ftSize?: number) => {
  const Skia = global.SkiaApi;
  const tf = Skia.Typeface.MakeFreeTypeFaceFromData(
    Skia.Data.fromBytes(resolveFile(uri))
  );
  expect(tf).toBeTruthy();
  const font = Skia.Font(tf!, ftSize ?? fontSize);
  return font;
};

export const importSkia = (): typeof SkiaExports => require("../..");
export const getSkDOM = () => {
  const { Skia } = importSkia();
  const depMgr = new DependencyManager(() => () => {});
  return new JsiSkDOM({ Skia, depMgr });
};

beforeAll(async () => {
  await LoadSkiaWeb();
  const Skia = JsiSkApi(global.CanvasKit);
  global.SkiaApi = Skia;
  global.SkiaValueApi = ValueApi;
});

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
    opacity: 1,
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

export const serialize = (element: ReactNode, assets: Assets) => {
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
  const serialized = serializeNode(container.root, assets);
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

const serializeSkOjects = (obj: any, assets: Assets): any => {
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
        bytes: Array.from((obj as SkImage).encodeToBytes()),
      };
    } else if (obj.__typename__ === "Font") {
      const font: SkFont = obj;
      return {
        __typename__: "Font",
        size: font.getSize(),
        typeface: assets.get(font)!,
      };
    }
  }
  return obj;
};

const serializeNode = (node: Node<any>, assets: Assets): SerializedNode => {
  const props: any = {};
  const ogProps = node.getProps();
  if (ogProps) {
    Object.keys(ogProps)
      .filter((key) => key !== "children")
      .forEach((key) => {
        props[key] = serializeSkOjects(ogProps[key], assets);
      });
  }
  return {
    type: node.type,
    props,
    children: node.children().map((child) => serializeNode(child, assets)),
  };
};

type Assets = Map<SkFont, number[]>;

interface TestingSurface {
  init(): Promise<void>;
  eval(code: string): Promise<string>;
  draw(node: ReactNode, assets?: Assets): Promise<SkImage>;
  dispose(): void;
  width: number;
  height: number;
  fontSize: number;
}

class LocalSurface implements TestingSurface {
  readonly width = 256;
  readonly height = 256;
  readonly fontSize = 32;

  init() {
    return new Promise<void>((resolve) => {
      resolve();
    });
  }

  dispose(): void {}

  eval(code: string): Promise<string> {
    return Promise.resolve(
      // eslint-disable-next-line no-eval
      eval(`(function Main(){const {Skia} = this;${code}})`).call({
        Skia: global.SkiaApi,
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

  private server: Server;
  private client: WebSocket | null = null;
  constructor() {
    this.server = new WebSocketServer({ port: 4242 });
  }

  init() {
    return new Promise<void>((resolve) => {
      this.server.on("connection", (client) => {
        this.client = client;
        resolve();
      });
    });
  }

  dispose() {
    if (this.client) {
      this.client.close();
    }
    this.server.close();
  }

  private assertInit() {
    if (this.client === null) {
      throw new Error("Client is not connected. Did you call init?");
    }
  }

  eval(code: string): Promise<string> {
    this.assertInit();
    return new Promise((resolve) => {
      const client = this.client!;
      client!.once("message", (raw: Buffer) => {
        resolve(JSON.parse(raw.toString()));
      });
      client!.send(JSON.stringify({ code }));
    });
  }

  draw(node: ReactNode, assets: Assets = new Map()): Promise<SkImage> {
    this.assertInit();
    return new Promise((resolve) => {
      const client = this.client!;
      client!.once("message", (raw: Buffer) => {
        const Skia = global.SkiaApi;
        const data = Skia.Data.fromBytes(new Uint8Array(raw));
        const image = Skia.Image.MakeImageFromEncoded(data);
        if (image === null) {
          throw new Error("Unable to decode image");
        }
        resolve(image);
      });
      client!.send(serialize(node, assets));
    });
  }
}
