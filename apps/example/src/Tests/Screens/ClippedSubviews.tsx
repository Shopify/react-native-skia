import React, { useEffect, useRef, useState } from "react";
import type { NativeScrollEvent, NativeSyntheticEvent } from "react-native";
import { ScrollView, View } from "react-native";
import {
  Canvas,
  createPicture,
  Fill,
  Skia,
  SkiaImageView,
  SkiaPictureView,
} from "react-native-skia";
import { useAnimatedReaction, useSharedValue } from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { exhaustiveCheck } from "react-native-skia/src/renderer/typeddash";

import { forceGpuDeviceLoss } from "../GpuDevice";
import { useScreenDone } from "../ScreenDone";

import { CyanGraphiteView } from "./GraphiteView";

const ROW_HEIGHT = 1000;
const AWAY = 4 * ROW_HEIGHT;

const cyan = createPicture((canvas) => canvas.drawColor(Skia.Color("cyan")));

const makeCyanImage = () => {
  const surface = Skia.Surface.MakeOffscreen(16, 16)!;
  surface.getCanvas().drawColor(Skia.Color("cyan"));
  surface.flush();
  return surface.makeImageSnapshot();
};

type Change = "nothing" | "state" | "sharedValue" | "deviceLost";

// The views in the row: a canvas beside a picture view and a graphite view,
// or a static canvas beside an image view.
type Row = "canvas" | "static";

interface ClippedSubviewsProps {
  change: Change;
  roundTrips: number;
  row: Row;
}

// A canvas (red, or cyan once changed) beside a picture view and a graphite
// view (both cyan), or a static canvas (the same) beside an image view (cyan),
// at the top of a scroll view that clips its subviews. They mount unclipped, so
// that their native views are in the window first; then clipping is turned on
// and the scroll view goes away and back, roundTrips times, each step once the
// scroll view reports the offset of the one before. A change is made while
// away: React state, a shared value, or the GPU device lost and replaced. React
// Native flattens the row, so the views themselves leave their superview while
// away.
const ClippedSubviews = ({ change, roundTrips, row }: ClippedSubviewsProps) => {
  const scrollView = useRef<ScrollView>(null);
  const tripsLeft = useRef(roundTrips);
  const [clipped, setClipped] = useState(false);
  const [color, setColor] = useState("red");
  const sharedColor = useSharedValue("red");
  const deviceLost = useRef(false);
  const [cyanImage] = useState(makeCyanImage);
  const done = useScreenDone();
  const scrollBack = () =>
    scrollView.current?.scrollTo({ y: 0, animated: false });
  useEffect(() => {
    if (!clipped) {
      setClipped(true);
      return;
    }
    scrollView.current?.scrollTo({ y: AWAY, animated: false });
  }, [clipped]);
  // A change React commits while the canvas is away: back once it is drawn.
  useEffect(() => {
    if (color !== "red") {
      scrollBack();
    }
  }, [color]);
  // A shared value set while the canvas is away: back once the UI thread
  // has run the canvas's mapper on it, as the scroll back reaches that
  // thread after the reaction's frame. Cyan is set only while away, and a
  // reaction made again by a render may first see it already set.
  useAnimatedReaction(
    () => sharedColor.value,
    (value) => {
      if (value === "cyan") {
        scheduleOnRN(scrollBack);
      }
    }
  );
  const onScroll = ({
    nativeEvent,
  }: NativeSyntheticEvent<NativeScrollEvent>) => {
    // Android can report the offset a fraction of a point short of AWAY.
    if (nativeEvent.contentOffset.y > AWAY - 1) {
      switch (change) {
        case "nothing":
          scrollBack();
          break;
        case "state":
          setColor("cyan");
          break;
        case "sharedValue":
          sharedColor.value = "cyan";
          break;
        case "deviceLost":
          // Once: the scroll view may report the offset again.
          if (!deviceLost.current) {
            deviceLost.current = true;
            const { lost } = Skia.gpu;
            forceGpuDeviceLoss();
            lost.then(scrollBack);
          }
          break;
        default:
          exhaustiveCheck(change);
      }
    } else if (nativeEvent.contentOffset.y === 0 && clipped) {
      tripsLeft.current -= 1;
      if (tripsLeft.current > 0) {
        scrollView.current?.scrollTo({ y: AWAY, animated: false });
      } else {
        done();
      }
    }
  };
  return (
    <ScrollView
      ref={scrollView}
      removeClippedSubviews={clipped}
      onScroll={onScroll}
      scrollEventThrottle={16}
      style={{ flex: 1 }}
    >
      <View style={{ flexDirection: "row", height: ROW_HEIGHT }}>
        <Canvas style={{ flex: 1 }} static={row === "static"}>
          <Fill color={change === "sharedValue" ? sharedColor : color} />
        </Canvas>
        {row === "static" ? (
          <SkiaImageView style={{ flex: 1 }} image={cyanImage} />
        ) : (
          <>
            <SkiaPictureView style={{ flex: 1 }} picture={cyan} />
            <CyanGraphiteView style={{ flex: 1 }} />
          </>
        )}
      </View>
      <View style={{ height: 2 * AWAY }} />
    </ScrollView>
  );
};

export const ClippedSubviewsBack = () => (
  <ClippedSubviews change="nothing" roundTrips={1} row="canvas" />
);

export const ClippedSubviewsTwice = () => (
  <ClippedSubviews change="nothing" roundTrips={2} row="canvas" />
);

export const ClippedSubviewsStateChanged = () => (
  <ClippedSubviews change="state" roundTrips={1} row="canvas" />
);

export const ClippedSubviewsSharedValueChanged = () => (
  <ClippedSubviews change="sharedValue" roundTrips={1} row="canvas" />
);

export const ClippedSubviewsDeviceLost = () => (
  <ClippedSubviews change="deviceLost" roundTrips={1} row="canvas" />
);

export const ClippedStaticBack = () => (
  <ClippedSubviews change="nothing" roundTrips={1} row="static" />
);

export const ClippedStaticTwice = () => (
  <ClippedSubviews change="nothing" roundTrips={2} row="static" />
);

export const ClippedStaticStateChanged = () => (
  <ClippedSubviews change="state" roundTrips={1} row="static" />
);

export const ClippedStaticSharedValueChanged = () => (
  <ClippedSubviews change="sharedValue" roundTrips={1} row="static" />
);
