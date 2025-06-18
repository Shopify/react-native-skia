export function fitbox(fit: any, src: any, dst: any, rotation?: number): ({
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
export function FitBox({ fit, src, dst, children }: {
    fit?: string | undefined;
    src: any;
    dst: any;
    children: any;
}): React.DetailedReactHTMLElement<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
import React from "react";
