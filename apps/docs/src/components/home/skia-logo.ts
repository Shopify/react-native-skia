import type { Canvas, FrameInfo } from "redraw";
import {
  Color,
  Easing,
  RadialGradient,
  SingleStrokeBrush,
  createColor,
  createTimeline,
  deflate,
  fitPath,
  interpolateColorsCyclic,
  luminousTubeShade,
  parseSVG,
  tubeProfile,
} from "redraw";
import { d, std } from "typegpu";

// This module holds TypeGPU "use gpu" callbacks: next.config.ts runs it
// through unplugin-typegpu so they compile to WGSL.

// The handwritten "skia" lettering.
const skiaPath = parseSVG(
  "M151.63 61.9558C95.1099.5158 34.8698 46.8458 48.3398 98.6458 53.0898 116.936 67.0499 135.906 93.5999 151.056 130.3 171.986 146.05 196.286 147.42 218.426 150.57 269.036 78.6 308.356 10 270.376M187 193C275.17 87.2259 276.11 16.5759 254.77 10.3659 240.04 6.5859 215.13 32.0359 204 89.3659 191.52 155.526 186.67 193.066 176 282.956M176 283C191.58 239.676 200.49 202.746 231.45 177.956 240.589 170.551 251.818 166.197 263.56 165.506 314.71 162.806 307.17 234.096 227.95 218.406M227.95 218.426C261.55 224.726 257.27 246.036 266.75 270.326 268.111 273.913 270.445 277.051 273.49 279.386 293.49 294.386 329.49 264.616 340.36 245.216 357.21 220.636 370.24 192.916 383.36 166.486M400.5 126C400.5 127.933 398.933 129.5 397 129.5 395.067 129.5 393.5 127.933 393.5 126 393.5 124.067 395.067 122.5 397 122.5 398.933 122.5 400.5 124.067 400.5 126ZM383.38 166.486C370.12 199.766 361.597 225.196 357.81 242.776 354.54 269.546 361.24 281.636 372.32 284.256 396.7 290.016 442.23 249.896 449.13 219.256 462.37 160.396 548.18 138.556 567.97 207.656M567.97 207.636C548.18 138.536 462.21 160.376 449.13 219.236 445.37 243.676 452.85 261.336 465.67 271.966 472.621 277.63 480.908 281.417 489.74 282.966 504.132 285.496 518.957 283.178 531.89 276.376 532.69 275.956 533.49 275.516 534.29 275.056 542.441 270.27 549.382 263.672 554.574 255.773 559.765 247.875 563.069 238.887 564.23 229.506 567.09 207.196 574.04 182.656 578.59 166.086M578.59 166.076C571.36 192.426 558.1 237.746 564.77 264.156 566.283 270.292 570.122 275.599 575.475 278.958 580.828 282.316 587.277 283.463 593.46 282.156 611.39 278.256 629.78 260.156 641.09 242.336"
);

// The whole sequence is authored once on a timeline, in milliseconds: the
// lettering writes on, holds for three seconds, the camera zooms in, and the
// end frame rests for a second. render() plays it as an endless loop.
const timeline = createTimeline({ progress: 0, zoomIn: 0 });
timeline.progress.timing({
  to: 1,
  duration: 2500,
  easing: Easing.cubicBezier(0.37, 0, 0.63, 1),
});
timeline.wait(3000);
timeline.zoomIn.timing({
  to: 1,
  duration: 650,
  easing: Easing.cubicBezier(0.32, 0, 0.67, 0),
});
timeline.wait(1000);

// The width of the reference layout the stroke width is designed against.
const ARTBOARD_WIDTH = 1920;
// The stroke width of the reference layout: 125 wide when the lettering
// spans the artboard width; the render scales it with the fitted path.
const MAX_STROKE_WIDTH = 125;

// The PBR-style tube shading (luminousTubeShade over the stroke band's
// tubeProfile) under a cyclic palette driven by the along-path ctx.t, with
// an outer glow.
const PBRColor = createColor(
  (ctx, _tctx, paint, props) => {
    "use gpu";
    const colors = [
      Color("#2B5CFF"),
      Color("#00D4FF"),
      Color("#FF2D9B"),
      Color("#FF6B2B"),
      Color("#B44AFF"),
      Color("#2B5CFF"),
      Color("#00D4FF"),
      Color("#FF2D9B"),
      Color("#FF6B2B"),
    ];
    // Ease each stop-to-stop blend so the colors dwell at their stops: warp
    // the in-segment fraction with a smoothstep before the linear read.
    const pos = std.fract(ctx.t + props.colorShift) * colors.length;
    const frac = std.fract(pos);
    const eased = std.floor(pos) + frac * frac * (3.0 - 2.0 * frac);
    const rgb = interpolateColorsCyclic(eased / colors.length, colors).xyz;

    const profile = tubeProfile(ctx.sdf, paint.strokeWidth);
    const shade = luminousTubeShade(profile, rgb);
    const inside = 1.0 - std.smoothstep(-1.0, 1.0, ctx.sdf);
    const glowDist = std.max(ctx.sdf, 0.0);
    const glow = std.exp(-glowDist * 0.02) * std.step(0.001, glowDist);
    const glowStrength = glow * props.glowIntensity;

    const out = shade.xyz.mul(inside).add(rgb.mul(glowStrength));
    const alpha = std.saturate(shade.w * inside + glowStrength * 0.6);

    return d.vec4f(std.min(out, d.vec3f(1)), alpha);
  },
  { colorShift: 0, glowIntensity: 0 }
);

// The radial background gradient (#2C2C2C at the center to #080808).
const background = new RadialGradient(["#2C2C2C", "#080808"]);

export const library = {
  functions: [PBRColor],
};

export function render(canvas: Canvas, { width, height, time }: FrameInfo) {
  background.center = [width / 2, height / 2];
  background.radius = width / 2;
  canvas.fill(background);

  // The timeline is finite; play it as an endless loop.
  const { progress, zoomIn } = timeline.loop(time);

  const pathGeo = fitPath(skiaPath, deflate({ width, height }, 50));
  // The stroke scales with the fitted lettering, up to MAX_STROKE_WIDTH.
  const sw = Math.min(
    (pathGeo.bounds()[2] * MAX_STROKE_WIDTH) / ARTBOARD_WIDTH,
    MAX_STROKE_WIDTH
  );

  const f = 1 + zoomIn * 40;
  canvas.save();
  canvas.translate(width / 2, height / 2);
  canvas.scale(f);
  canvas.translate(-width / 2, -height / 2);
  if (progress > 0.001) {
    const paint = new SingleStrokeBrush(sw).addShader(PBRColor, {
      colorShift: time * 0.0001,
      glowIntensity: 0.7,
    });
    canvas.drawSinglePathStroke(pathGeo.segment(0, progress), paint);
  }
  canvas.restore();
}
