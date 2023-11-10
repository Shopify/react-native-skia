import type { ViewProps } from "react-native";

import { Platform } from "../Platform";

export interface NativeProps extends ViewProps {
  mode: string;
  debug?: boolean;
}

// eslint-disable-next-line import/no-default-export
export default Platform.codegenNativeComponent<NativeProps>("SkiaDrawView");
