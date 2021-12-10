/*
 * Type of timeline element. Timelines can be nested through the
 * children property, and wraps a generic data parameters so that
 * values like what should be animated and how can be stored as part
 * of the timeline object without the timeline needing to know.
 */
export type TimelineInfo<T> = {
  // Start delay in ms - if set to zero the offset will be after the previous
  // animation is done.
  delay?: number;
  // Duration of this including children in ms
  duration: number;
  // Number of times to repeat. -1 means infinity
  repeat: number;
  // Delay before repeat should be run
  repeatDelay: number;
  // True if repeat should use yoyo effect on animation when reversing
  yoyo: boolean;
  // Data on timeline
  data?: T;
  // Timeline label
  label?: string;
  // Position
  position?: number;
  // Active
  active?: boolean;
  // Children of timeline
  children: TimelineInfo<T>[];
  // Calculated offset
  _offset: number;
  // Calculated duration
  _duration: number;
};

/*
 * Type of starting point for distribute function
 */
export type DistributeFrom = "start" | "end" | "center" | "edges" | "random";

/**
 * @description Distribute parameters.
 */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export type DistributeParams<T> = {
  /*
   * Base of the stagger distribution. Default is 0
   */
  base?: number;
  /*
   * The total amount of time (in milliseconds) that gets split among all the staggers.
   * So if amount is 1 and there are 100 elements that stagger linearly, there
   * would be 0.01 seconds between each sub-tween's start time. If you prefer
   * to specify a certain amount of time between each tween, use the each property instead.
   */
  amount?: number;
  /**
   * The amount of time (in milliseconds) between each sub-tween's start
   * time. So if each is 1 (regardless of how many elements there are),
   *  there would be 1 second between each sub-tween's start time. If you
   * prefer to specify a total amount of time to split up among the staggers,
   * use the amount property instead.
   */
  each?: number;
  /*
   * The position in the Array from which the stagger will start. The animation for each
   * element will begin based on the element's proximity to the "from" value in the Array
   * (the closer it is, the sooner it'll begin). You can also use the following string values:
   * "start", "center", "edges", "random", or "end"  If you have a grid defined, you can
   * specify decimal values indicating the progress on each axis, like [0.5,0.5] would
   * be the center, [1,0] would be the top right corner, etc. Default: 0.
   */
  from?: DistributeFrom | number | number[];
  /*
   * If the elements are being displayed in a grid visually, indicate how many rows and columns
   * there are (like grid:[9,15])
   */
  grid?: number[];
  /*
   * If you define a grid, staggers are based on each element's total distance to the "from"
   * value on both the x and y axis, but you can focus on just one axis if you prefer ("x" or "y")
   */
  axis?: "x" | "y";
  /*
   * The ease that distributes the start times of the animations. So "power2" would start
   * out with bigger gaps and then get more tightly clustered toward the end. Default: "none".
   */
  easing?: (t: number) => number;
};

/**
 * @description Distribution function - will be called for each target in a tween
 * to create custom delays
 */
export type DistributionFunction<T> =
  /**
   * @param index Index of current timeline element
   * @param c Current timeline element to return stagger for
   * @param arr List of all timeline elements
   */
  (index: number, c: T, arr: T[]) => number;
