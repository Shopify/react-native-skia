/* eslint-disable @typescript-eslint/no-explicit-any */
import type { NodeHandle, TurboModule, ViewComponent } from "react-native";
import type codegenNativeComponent from "react-native/Libraries/Utilities/codegenNativeComponent";

import type { DataModule } from "../skia/types";

export interface IPlatform {
  OS: string;
  PixelRatio: number;
  findNodeHandle: (
    componentOrHandle:
      | null
      | number
      | React.Component<any, any>
      | React.ComponentClass<any>
  ) => null | NodeHandle;
  resolveAsset: (source: DataModule) => string;
  View: typeof ViewComponent;
  codegenNativeComponent: typeof codegenNativeComponent;
  getTurboModule<T extends TurboModule>(name: string): T;
}
