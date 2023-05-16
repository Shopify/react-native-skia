/* eslint-disable @typescript-eslint/no-explicit-any */
import type { HostComponent, NodeHandle, ViewComponent } from "react-native";

import type { DataModule } from "../skia/types";

export interface IPlatform {
  OS: string;
  requireNativeComponent: <T>(viewName: string) => HostComponent<T>;
  PixelRatio: number;
  NativeModules: Record<string, any>;
  findNodeHandle: (
    componentOrHandle:
      | null
      | number
      | React.Component<any, any>
      | React.ComponentClass<any>
  ) => null | NodeHandle;
  resolveAsset: (source: DataModule) => string;
  View: typeof ViewComponent;
}
