import type { Animation, AnimationValue, TimelineAnimation } from "../types";
import { Value } from "../Value";
import { Timing } from "../Timing";

import type { DistributeParams, TimelineInfo } from "./types";
import {
  addTimeline,
  createTimeline,
  getStaggeredTimeline,
  getTimeline,
  getTimelines,
  normalizeForTimeline,
} from "./functions";
import { getResolvedPosition } from "./parameters";

export const create = (
  animationOrAnimations?: Animation | Animation[],
  staggerParams?: number | DistributeParams<Animation>,
  position?: string | number
) => {
  return new TimelineAnimationImpl(
    animationOrAnimations,
    staggerParams,
    position
  );
};

export const add = (
  animation: Animation,
  animationValue: AnimationValue,
  params?: Partial<
    Pick<TimelineInfo<Animation>, "delay" | "repeat" | "repeatDelay" | "yoyo">
  >,
  position?: number | string,
  parent?: TimelineAnimationImpl
): TimelineAnimation => {
  const resolvedParent = parent ?? new TimelineAnimationImpl();
  return resolvedParent;
};

class TimelineAnimationImpl implements TimelineAnimation {
  constructor(
    animationOrAnimations?: Animation | Animation[],
    staggerParams?: number | DistributeParams<Animation>,
    position?: string | number
  ) {
    // Create root timelineInfo
    this._rootTimeline = createTimeline();
    if (animationOrAnimations) {
      this.add(animationOrAnimations, staggerParams, position);
    }
  }

  /******* Private Members *******/

  private _rootTimeline: TimelineInfo<Animation>;
  private _cachedTimelines: TimelineInfo<Animation>[] | undefined;
  private _cachedTimeline: TimelineInfo<Animation> | undefined;

  private _timelineAnimations: TimelineInfoAnimation[] = [];
  private _driverAnimation: Animation | undefined = undefined;
  private _timelineValues: AnimationValue[] = [];

  /******* Public Properties *******/

  /**
   * Returns values for child animations
   */
  public get values(): AnimationValue<number>[] {
    return this._timelineValues;
  }

  /**
   * Returns the duration of the animation
   */
  public get duration(): number {
    return this.getRootInfo()._duration;
  }

  /******* Public Members *******/

  /**
   * @description Returns the root timelineInfo for this timeline
   */
  public getRootInfo(): TimelineInfo<Animation> {
    if (!this._cachedTimeline) {
      this._cachedTimeline = getTimeline(this._rootTimeline);
    }
    return this._cachedTimeline;
  }

  /***
   * @description Returns a list of all child timelines in this timeline
   * @returns The list includes only children with data
   */
  public getChildInfos(): TimelineInfo<Animation>[] {
    if (!this._cachedTimelines) {
      this._cachedTimelines = getTimelines(this._rootTimeline).filter(
        (t) => t.data
      );
    }
    return this._cachedTimelines;
  }

  /**
   * @description Adds one or more timelines as children to this timeline
   * @param valueOrValues Values to add to timeline
   * @param staggerParams Stagger parameters. Set to undefined to add sequential timelines
   * @param position Position parameter
   */
  public add(
    animationOrAnimations: Animation | Animation[],
    staggerParams?: number | DistributeParams<Animation>,
    position?: string | number
  ) {
    // Stop any animations when modifying the timeline
    if (this.active()) {
      console.warn(
        "Changing the timeline while running will stop the animation."
      );
    }
    this.stop();
    if (animationOrAnimations instanceof Array) {
      // Resolve input
      const timelines: TimelineInfo<Animation>[] = animationOrAnimations.map(
        (animation) => {
          const a =
            animation instanceof TimelineAnimationImpl
              ? animation.getRootInfo()
              : createTimeline({
                  data: animation,
                  duration: animation.duration,
                });
          console.log(a.duration);
          return a;
        }
      ) as TimelineInfo<Animation>[];

      // Calculate starting point
      const startingPoint =
        this.getRootInfo().children.length > 0
          ? this.getRootInfo().children[this.getRootInfo().children.length - 1]
              ._offset +
            this.getRootInfo().children[this.getRootInfo().children.length - 1]
              ._duration
          : 0;

      // Add staggered
      this._rootTimeline = addTimeline(
        this._rootTimeline,
        ...getStaggeredTimeline(timelines, staggerParams, startingPoint)
      );
    } else {
      // Resolve
      let resolvedTimeline =
        animationOrAnimations instanceof TimelineAnimationImpl
          ? animationOrAnimations.getRootInfo()
          : createTimeline({
              data: animationOrAnimations,
              duration: animationOrAnimations.duration,
            });

      // Add
      const startingPoint = getResolvedPosition(this.getRootInfo(), position);
      if (startingPoint !== undefined) {
        resolvedTimeline = {
          ...resolvedTimeline,
          delay: startingPoint,
        };
      }
      this._rootTimeline = addTimeline(this._rootTimeline, resolvedTimeline);
    }

    // Invalidate caches
    this._cachedTimelines = undefined;
    this._cachedTimeline = undefined;

    // Create animations for each timeline child
    const infos = this.getChildInfos();
    this._timelineAnimations = infos.map(
      (child) => new TimelineInfoAnimation(child, this)
    );

    // Create animation values for each timeline child
    this._timelineValues = infos.map(() => Value.create(0));
    dumpTimeline(this.getRootInfo());
    return this;
  }

  public evaluate(timestampSeconds: number): number {
    if (this._driverAnimation) {
      const retVal = this._driverAnimation.evaluate(timestampSeconds);
      if (retVal >= 1.01) {
        this.stop();
      }
      return retVal;
    } else {
      return 0;
    }
  }

  _begin(_: number) {
    this._driverAnimation = Timing.create({
      duration: this.duration,
      from: 0,
      to: 1.1,
      easing: Timing.Easing.linear,
    })._begin(0);
    return this;
  }

  start(value?: AnimationValue): Promise<TimelineAnimation> {
    if (value !== undefined) {
      // We might have a value that should be used for the timeline children
      if (this.getChildInfos().length === 1) {
        this._timelineValues[0] = value;
      } else {
        console.warn("TimelineAnimation should not be started with a value");
      }
    }

    this._begin(0);
    const { values } = this;

    console.log("Starting timeline", this.duration, values.length);

    const promises = this._timelineAnimations.map((animation, index) =>
      animation.start(values[index])
    );

    return Promise.all(promises).then(() => {
      return this;
    });
  }

  stop() {
    console.log("Timeline animation stopped");
    this._timelineAnimations?.forEach((animation) => animation.stop());
    this._driverAnimation?.stop();
    this._driverAnimation = undefined;
  }

  active() {
    return this._driverAnimation?.active() ?? false;
  }
}

class TimelineInfoAnimation implements Animation {
  constructor(info: TimelineInfo<Animation>, root: TimelineAnimationImpl) {
    this._info = info;
    this._parentAnimation = root;
  }

  private _info: TimelineInfo<Animation>;
  private _parentAnimation: TimelineAnimationImpl;
  private _value: AnimationValue | undefined = undefined;

  public get duration(): number {
    return this._info._duration;
  }

  public _begin(start: number) {
    this._info.data!._begin(start);
    return this;
  }

  public start(currentValue?: AnimationValue): Promise<Animation> {
    currentValue === undefined &&
      console.warn("Value must be initialized for the TimelineInfoAnimation");

    this._value = currentValue;
    this._begin(currentValue!.value);
    return new Promise<Animation>((resolve) =>
      currentValue?.startAnimation(this, () => resolve(this))
    );
  }

  public stop() {
    this._value?.stopAnimation(this);
  }

  public active() {
    return this._info.data!.active();
  }

  public evaluate(timestampSeconds: number): number {
    const progress = this._parentAnimation.evaluate(timestampSeconds);
    const value = normalizeForTimeline(
      progress * this._parentAnimation.duration,
      this._info,
      this._parentAnimation.duration
    );
    const retVal = this._info.data!.evaluate(value);
    return retVal;
  }
}

export const dumpTimeline = <T>(root: TimelineInfo<T>) => {
  const infos = getTimelines(root);
  console.log("Timeline - total duration", root._duration);
  infos
    .filter((f) => f.data)
    .forEach((info, index) => {
      console.log(`Timeline: ${index}`, info._offset, info._duration);
    });
};
