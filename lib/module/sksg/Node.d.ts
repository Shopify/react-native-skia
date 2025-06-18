import { NodeType } from "../dom/types";
export interface Node<Props = unknown> {
    type: NodeType;
    props: Props;
    children: Node[];
}
export declare const isColorFilter: (type: NodeType) => type is NodeType.MatrixColorFilter | NodeType.BlendColorFilter | NodeType.LinearToSRGBGammaColorFilter | NodeType.SRGBToLinearGammaColorFilter | NodeType.LumaColorFilter | NodeType.LerpColorFilter;
export declare const isPathEffect: (type: NodeType) => type is NodeType.DiscretePathEffect | NodeType.DashPathEffect | NodeType.Path1DPathEffect | NodeType.Path2DPathEffect | NodeType.CornerPathEffect | NodeType.SumPathEffect | NodeType.Line2DPathEffect;
export declare const isImageFilter: (type: NodeType) => type is NodeType.OffsetImageFilter | NodeType.DisplacementMapImageFilter | NodeType.BlurImageFilter | NodeType.DropShadowImageFilter | NodeType.MorphologyImageFilter | NodeType.BlendImageFilter | NodeType.RuntimeShaderImageFilter;
export declare const isShader: (type: NodeType) => type is NodeType.Shader | NodeType.ImageShader | NodeType.ColorShader | NodeType.Turbulence | NodeType.FractalNoise | NodeType.LinearGradient | NodeType.RadialGradient | NodeType.SweepGradient | NodeType.TwoPointConicalGradient;
export declare const sortNodeChildren: (parent: Node) => {
    colorFilters: Node<unknown>[];
    drawings: Node<unknown>[];
    maskFilters: Node<unknown>[];
    shaders: Node<unknown>[];
    pathEffects: Node<unknown>[];
    imageFilters: Node<unknown>[];
    paints: Node<unknown>[];
};
