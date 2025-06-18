export function size(width?: number, height?: number): {
    width: number;
    height: number;
};
export function rect2rect(src: any, dst: any): ({
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
export function fitRects(fit: any, rect: any, { x, y, width, height }: {
    x: any;
    y: any;
    width: any;
    height: any;
}): {
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
