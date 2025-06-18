import React from "react";
import type { FractalNoiseProps } from "../../../dom/types";
import type { SkiaDefaultProps } from "../../processors/Animations/Animations";
export declare const FractalNoise: ({ seed, tileWidth, tileHeight, ...props }: SkiaDefaultProps<FractalNoiseProps, "seed" | "tileHeight" | "tileWidth">) => React.JSX.Element;
