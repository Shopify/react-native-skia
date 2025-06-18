export function Mock(CanvasKit: any): {
    Canvas: typeof import("react-native").View;
    useValue: () => {
        current: number;
    };
    useComputedValue: () => {
        current: number;
    };
    useTiming: () => {
        current: number;
    };
    useLoop: () => {
        current: number;
    };
    useSpring: () => {
        current: number;
    };
    useClockValue: () => {
        current: number;
    };
    useValueEffect: () => undefined;
    useClock: () => {
        value: number;
    };
    usePathInterpolation: () => {
        value: number;
    };
    useImageAsTexture: () => {
        value: number;
    };
    useTextureValue: () => {
        value: number;
    };
    useTextureValueFromPicture: () => {
        value: number;
    };
    useRSXformBuffer: () => {
        value: number;
    };
    usePointBuffer: () => {
        value: number;
    };
    useColorBuffer: () => {
        value: number;
    };
    useRectBuffer: () => {
        value: number;
    };
    useBuffer: () => {
        value: number;
    };
    useRawData: () => undefined;
    useData: () => undefined;
    useFont: () => import("../../..").SkFont;
    useFonts: () => undefined;
    useTypeface: () => null;
    useImage: () => null;
    useSVG: () => null;
    useVideo: () => null;
    NodeType: {};
    enumKey: (k: any) => any;
    processPath: (Skia: any, rawPath: any) => any;
    isPathDef: (def: any) => boolean;
    size: (width?: number, height?: number) => {
        width: number;
        height: number;
    };
    rect2rect: (src: any, dst: any) => ({
        translateX: number;
        translateY?: undefined;
        scaleX?: undefined;
        scaleY?: undefined;
    } | {
        translateY: number;
        translateX?: undefined;
        scaleX?: undefined;
        scaleY?: undefined;
    } | {
        scaleX: number;
        translateX?: undefined;
        translateY?: undefined;
        scaleY?: undefined;
    } | {
        scaleY: number;
        translateX?: undefined;
        translateY?: undefined;
        scaleX?: undefined;
    })[];
    fitRects: (fit: any, rect: any, { x, y, width, height }: {
        x: any;
        y: any;
        width: any;
        height: any;
    }) => {
        src: {
            x: any;
            y: any;
            width: any;
            height: any;
        };
        dst: {
            x: any;
            y: any;
            width: any;
            height: any;
        };
    };
    isEdge: (pos: any, b: any) => boolean;
    processRect: (Skia: any, def: any) => any;
    processRRect: (Skia: any, def: any) => any;
    inflate: (Skia: any, box: any, dx: any, dy: any, tx?: number, ty?: number) => any;
    deflate: (Skia: any, box: any, dx: any, dy: any, tx?: number, ty?: number) => any;
    processRadius: (Skia: any, radius: any) => any;
    isCircleScalarDef: (def: any) => boolean;
    processCircle: (def: any) => any;
    transformOrigin: (origin: any, transform: any) => any[];
    processColor: (Skia: any, color: any) => any;
    processGradientProps: (Skia: any, { colors, positions, mode, flags, ...transform }: {
        [x: string]: any;
        colors: any;
        positions: any;
        mode: any;
        flags: any;
    }) => {
        colors: any;
        positions: any;
        mode: any;
        flags: any;
        localMatrix: any;
    };
    getRect: (Skia: any, props: any) => any;
    processTransformProps: (m3: any, props: any) => void;
    processTransformProps2: (Skia: any, props: any) => any;
    validateInterpolationOptions(type: any): {
        extrapolateLeft: any;
        extrapolateRight: any;
    };
    interpolate(x: any, input: any, output: any, type: any): any;
    Extrapolate: {};
    interpolateColors: (value: any, inputRange: any, _outputRange: any) => any[];
    mixColors: (value: any, x: any, y: any) => Float32Array<ArrayBuffer>;
    interpolateVector: (value: any, inputRange: any, outputRange: any, options: any) => {
        x: any;
        y: any;
    };
    mixVector: (value: any, from: any, to: any) => {
        x: any;
        y: any;
    };
    interpolatePaths: (value: any, input: any, outputRange: any, options: any, output: any) => any;
    Skia: import("../../../src/headless").Skia;
    loadData: (source: any, factory: any, onError: any) => Promise<any>;
    useCollectionLoading: (source: any, loader: any) => null;
    matchFont: (inputStyle?: {}, fontMgr?: import("../../..").SkFontMgr) => import("../../..").SkFont;
    listFontFamilies: (fontMgr?: import("../../..").SkFontMgr) => string[];
    makeImageFromView: (viewRef: any, callback?: null) => any;
    useAnimatedImage: (source: any, onError: any) => null;
    createPicture: (cb: any, rect: any) => import("../../..").SkPicture;
    vec: (x: number | undefined, y: any) => import("../../..").SkPoint;
    point: (x: number | undefined, y: any) => import("../../..").SkPoint;
    neg: (a: any) => import("../../..").SkPoint;
    add: (a: any, b: any) => import("../../..").SkPoint;
    sub: (a: any, b: any) => import("../../..").SkPoint;
    dist: (a: any, b: any) => number;
    rect: (x: any, y: any, width: any, height: any) => import("../../..").SkHostRect;
    bounds: (rects: any) => import("../../..").SkHostRect;
    topLeft: (r: any) => import("../../..").SkPoint;
    topRight: (r: any) => import("../../..").SkPoint;
    bottomLeft: (r: any) => import("../../..").SkPoint;
    bottomRight: (r: any) => import("../../..").SkPoint;
    center: (r: any) => import("../../..").SkPoint;
    rrect: (r: any, rx: any, ry: any) => import("../../..").SkRRect;
    processTransform2d: (transforms: any) => any;
    isRNModule: (mod: any) => mod is number;
    VertexMode: {};
    isShader: (obj: any) => boolean;
    processUniforms: (source: any, uniforms: any, builder: any) => any[];
    FilterMode: {};
    MipmapMode: {};
    ImageFormat: {};
    isCubicSampling: (sampling: any) => boolean;
    MitchellCubicSampling: {
        B: number;
        C: number;
    };
    CatmullRomCubicSampling: {
        B: number;
        C: number;
    };
    CubicSampling: {
        B: number;
        C: number;
    };
    MakeCubic: (B: any, C: any) => {
        B: any;
        C: any;
    };
    AlphaType: {};
    ColorType: {};
    isColorFilter: (obj: any) => boolean;
    TileMode: {};
    isImageFilter: (obj: any) => boolean;
    ColorChannel: {};
    FontWeight: {};
    FontWidth: {};
    FontSlant: {};
    FontEdging: {};
    FontHinting: {};
    FontStyle: {
        Normal: {
            weight: any;
            width: any;
            slant: any;
        };
        Bold: {
            weight: any;
            width: any;
            slant: any;
        };
        Italic: {
            weight: any;
            width: any;
            slant: any;
        };
        BoldItalic: {
            weight: any;
            width: any;
            slant: any;
        };
    };
    PaintStyle: {};
    StrokeCap: {};
    StrokeJoin: {};
    isPaint: (obj: any) => boolean;
    BlendMode: {};
    FillType: {};
    PathOp: {};
    PathVerb: {};
    isPath: (obj: any) => boolean;
    ClipOp: {};
    SaveLayerFlag: {};
    BlurStyle: {};
    isMaskFilter: (obj: any) => boolean;
    isMatrix: (obj: any) => boolean;
    processTransform: (m: any, transforms: any) => any;
    toDegrees: (rad: any) => number;
    isPathEffect: (obj: any) => boolean;
    Path1DEffectStyle: {};
    PointMode: {};
    isRect: (def: any) => boolean;
    isRRect: (def: any) => boolean;
    PlaceholderAlignment: {};
    TextDirection: {};
    TextAlign: {};
    TextHeightBehavior: {};
    TextDecoration: {};
    TextDecorationStyle: {};
    TextBaseline: {};
    Matrix4: () => number[];
    translate: (x: any, y: any, z?: number) => any[];
    perspective: (p: any) => number[];
    matrixVecMul4: (m: any, v: any) => number[];
    mapPoint3d: (m: any, v: any) => number[];
    multiply4: (a: any, b: any) => any[];
    toMatrix3: (m: any) => any[];
    pivot: (m: any, p: any) => any[];
    scale: (sx: any, sy: any, sz: number | undefined, p: any) => any[];
    rotateZ: (value: any, p: any) => any[];
    rotateX: (value: any, p: any) => any[];
    rotateY: (value: any, p: any) => any[];
    processTransform3d: (transforms: any) => any;
    convertToColumnMajor: (rowMajorMatrix: any) => any[];
    convertToAffineMatrix: (m4: any) => any[];
    invert4: (m: any) => number[];
    CanvasKitWebGLBuffer: typeof import("../skia").CanvasKitWebGLBuffer;
    isNativeBufferAddr: (buffer: any) => buffer is BigInt;
    isNativeBufferWeb: (buffer: any) => boolean;
    isNativeBufferNode: (buffer: any) => buffer is ArrayBuffer;
    Circle: (props: any) => import("react").DOMElement<any, Element>;
    Rect: (props: any) => import("react").DOMElement<any, Element>;
    RoundedRect: (props: any) => import("react").DOMElement<any, Element>;
    DiffRect: (props: any) => import("react").DOMElement<any, Element>;
    Line: (props: any) => import("react").DOMElement<any, Element>;
    Path: ({ start, end, ...props }: {
        [x: string]: any;
        start?: number | undefined;
        end?: number | undefined;
    }) => import("react").DOMElement<any, Element>;
    Oval: (props: any) => import("react").DOMElement<any, Element>;
    Points: ({ mode, ...props }: {
        [x: string]: any;
        mode?: string | undefined;
    }) => import("react").DOMElement<any, Element>;
    Patch: (props: any) => import("react").DOMElement<any, Element>;
    Vertices: ({ mode, ...props }: {
        [x: string]: any;
        mode?: string | undefined;
    }) => import("react").DOMElement<any, Element>;
    Fill: (props: any) => import("react").DOMElement<any, Element>;
    fitbox: (fit: any, src: any, dst: any, rotation?: number) => ({
        translateX: number;
        translateY?: undefined;
        scaleX?: undefined;
        scaleY?: undefined;
    } | {
        translateY: number;
        translateX?: undefined;
        scaleX?: undefined;
        scaleY?: undefined;
    } | {
        scaleX: number;
        translateX?: undefined;
        translateY?: undefined;
        scaleY?: undefined;
    } | {
        scaleY: number;
        translateX?: undefined;
        translateY?: undefined;
        scaleX?: undefined;
    } | {
        translate: any[];
        rotate?: undefined;
    } | {
        rotate: number;
        translate?: undefined;
    })[];
    FitBox: ({ fit, src, dst, children }: {
        fit?: string | undefined;
        src: any;
        dst: any;
        children: any;
    }) => import("react").DetailedReactHTMLElement<import("react").InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    BoxShadow: (props: any) => import("react").DOMElement<any, Element>;
    Box: (props: any) => import("react").DOMElement<any, Element>;
    Atlas: (props: any) => import("react").DOMElement<any, Element>;
    BackdropFilter: ({ filter, children: groupChildren, ...props }: {
        [x: string]: any;
        filter: any;
        children: any;
    }) => import("react").DetailedReactHTMLElement<import("react").InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    BackdropBlur: ({ blur, children, ...props }: {
        [x: string]: any;
        blur: any;
        children: any;
    }) => import("react").FunctionComponentElement<{
        [x: string]: any;
        filter: any;
        children: any;
    }>;
    Image: ({ fit, ...props }: {
        [x: string]: any;
        fit?: string | undefined;
    }) => import("react").DOMElement<any, Element>;
    ImageShader: ({ tx, ty, fit, transform, ...props }: {
        [x: string]: any;
        tx?: string | undefined;
        ty?: string | undefined;
        fit?: string | undefined;
        transform?: never[] | undefined;
    }) => import("react").DOMElement<any, Element>;
    ImageSVG: (props: any) => import("react").DOMElement<any, Element>;
    RadialGradient: (props: any) => import("react").DOMElement<any, Element>;
    LinearGradient: (props: any) => import("react").DOMElement<any, Element>;
    TwoPointConicalGradient: (props: any) => import("react").DOMElement<any, Element>;
    SweepGradient: (props: any) => import("react").DOMElement<any, Element>;
    ColorShader: (props: any) => import("react").DOMElement<any, Element>;
    Turbulence: ({ seed, tileWidth, tileHeight, ...props }: {
        [x: string]: any;
        seed?: number | undefined;
        tileWidth?: number | undefined;
        tileHeight?: number | undefined;
    }) => import("react").DOMElement<any, Element>;
    FractalNoise: ({ seed, tileWidth, tileHeight, ...props }: {
        [x: string]: any;
        seed?: number | undefined;
        tileWidth?: number | undefined;
        tileHeight?: number | undefined;
    }) => import("react").DOMElement<any, Element>;
    Shader: ({ uniforms, ...props }: {
        [x: string]: any;
        uniforms?: {} | undefined;
    }) => import("react").DOMElement<any, Element>;
    ShaderLib: {
        Math: string;
        Colors: string;
    };
    Text: ({ x, y, ...props }: {
        [x: string]: any;
        x?: number | undefined;
        y?: number | undefined;
    }) => import("react").DOMElement<any, Element>;
    Glyphs: ({ x, y, ...props }: {
        [x: string]: any;
        x?: number | undefined;
        y?: number | undefined;
    }) => import("react").DOMElement<any, Element>;
    TextBlob: ({ x, y, ...props }: {
        [x: string]: any;
        x?: number | undefined;
        y?: number | undefined;
    }) => import("react").DOMElement<any, Element>;
    TextPath: ({ initialOffset, ...props }: {
        [x: string]: any;
        initialOffset?: number | undefined;
    }) => import("react").DOMElement<any, Element>;
    ColorMatrix: (props: any) => import("react").DOMElement<any, Element>;
    OpacityMatrix: (opacity: any) => any[];
    BlendColor: (props: any) => import("react").DOMElement<any, Element>;
    Lerp: (props: any) => import("react").DOMElement<any, Element>;
    LinearToSRGBGamma: (props: any) => import("react").DOMElement<any, Element>;
    SRGBToLinearGamma: (props: any) => import("react").DOMElement<any, Element>;
    LumaColorFilter: (props: any) => import("react").DOMElement<any, Element>;
    BlurMask: ({ style, respectCTM, ...props }: {
        [x: string]: any;
        style?: string | undefined;
        respectCTM?: boolean | undefined;
    }) => import("react").DOMElement<any, Element>;
    Blur: ({ mode, ...props }: {
        [x: string]: any;
        mode?: string | undefined;
    }) => import("react").DOMElement<any, Element>;
    Offset: ({ x, y, ...props }: {
        [x: string]: any;
        x?: number | undefined;
        y?: number | undefined;
    }) => import("react").DOMElement<any, Element>;
    DisplacementMap: (props: any) => import("react").DOMElement<any, Element>;
    Shadow: (props: any) => import("react").DOMElement<any, Element>;
    Morphology: ({ operator, ...props }: {
        [x: string]: any;
        operator?: string | undefined;
    }) => import("react").DOMElement<any, Element>;
    RuntimeShader: (props: any) => import("react").DOMElement<any, Element>;
    DiscretePathEffect: ({ seed, ...props }: {
        [x: string]: any;
        seed?: number | undefined;
    }) => import("react").DOMElement<any, Element>;
    DashPathEffect: (props: any) => import("react").DOMElement<any, Element>;
    CornerPathEffect: (props: any) => import("react").DOMElement<any, Element>;
    SumPathEffect: (props: any) => import("react").DOMElement<any, Element>;
    Line2DPathEffect: (props: any) => import("react").DOMElement<any, Element>;
    Path1DPathEffect: (props: any) => import("react").DOMElement<any, Element>;
    Path2DPathEffect: (props: any) => import("react").DOMElement<any, Element>;
    canvas2Cartesian: (v: any, center: any) => {
        x: number;
        y: number;
    };
    cartesian2Canvas: (v: any, center: any) => {
        x: any;
        y: any;
    };
    cartesian2Polar: (v: any) => {
        theta: number;
        radius: number;
    };
    polar2Cartesian: (p: any) => {
        x: number;
        y: number;
    };
    polar2Canvas: (p: any, center: any) => {
        x: any;
        y: any;
    };
    canvas2Polar: (v: any, center: any) => {
        theta: number;
        radius: number;
    };
    mix: (value: any, x: any, y: any) => number;
    clamp: (value: any, lowerBound: any, upperBound: any) => number;
    saturate: (value: any) => number;
    rotate: (tr: any, origin: any, rotation: any) => {
        x: any;
        y: any;
    };
    Picture: (props: any) => import("react").DOMElement<any, Element>;
    Group: ({ layer, ...props }: {
        [x: string]: any;
        layer: any;
    }) => import("react").DOMElement<any, Element>;
    Mask: ({ children, mask, mode, clip }: {
        children: any;
        mask: any;
        mode?: string | undefined;
        clip?: boolean | undefined;
    }) => import("react").FunctionComponentElement<{
        [x: string]: any;
        layer: any;
    }>;
    Paint: (props: any) => import("react").DOMElement<any, Element>;
    Blend: (props: any) => import("react").DOMElement<any, Element>;
    Paragraph: (props: any) => import("react").DOMElement<any, Element>;
};
