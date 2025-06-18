import type { SharedValue } from "react-native-reanimated";
import type { DataSourceParam, SkImage } from "../../skia/types";
export declare const useAnimatedImageValue: (source: DataSourceParam, paused?: SharedValue<boolean>) => SharedValue<SkImage | null>;
