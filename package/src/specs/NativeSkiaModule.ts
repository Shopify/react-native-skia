import type { TurboModule } from "react-native/Libraries/TurboModule/RCTExport";

import { Platform } from "../Platform";

export interface Spec extends TurboModule {
  install: () => boolean;
}

// eslint-disable-next-line import/no-default-export
export default Platform.getTurboModule<Spec>("RNSkiaModule");
