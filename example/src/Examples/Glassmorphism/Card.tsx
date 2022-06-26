import {
  BackdropBlur,
  Canvas,
  rect,
  rrect,
  vec,
  useValue,
  useTouchHandler,
  Rect,
  LinearGradient,
  Paint,
  Text,
  useComputedValue,
  runDecay,
  useFont,
} from "@shopify/react-native-skia";
import React, { useMemo } from "react";
import { useWindowDimensions } from "react-native";

import { Background } from "./components/Background";
import { Ball } from "./components/Ball";

export const Glassmorphism = () => {
  const titleFont = useFont(require("../../assets/SF-Mono-Semibold.otf"), 24);
  const subtitleFont = useFont(
    require("../../assets/SF-Mono-Semibold.otf"),
    18
  );
  const font = useFont(require("../../assets/SF-Mono-Semibold.otf"), 12);
  const { width, height } = useWindowDimensions();
  const CARD_WIDTH = width - 64;
  const CARD_HEIGHT = CARD_WIDTH * 0.61;
  const clip = useMemo(
    () => rrect(rect(0, 0, CARD_WIDTH, CARD_HEIGHT), 20, 20),
    [CARD_HEIGHT, CARD_WIDTH]
  );

  const x = useValue((width - CARD_WIDTH) / 2);
  const y = useValue((height - CARD_HEIGHT) / 2);
  const offsetX = useValue(0);
  const offsetY = useValue(0);
  const onTouch = useTouchHandler({
    onStart: (pos) => {
      offsetX.current = x.current - pos.x;
      offsetY.current = y.current - pos.y;
    },
    onActive: (pos) => {
      x.current = offsetX.current + pos.x;
      y.current = offsetY.current + pos.y;
    },
    onEnd: ({ velocityX, velocityY }) => {
      runDecay(x, { velocity: velocityX });
      runDecay(y, { velocity: velocityY });
    },
  });
  const transform = useComputedValue(
    () => [{ translateY: x.current }, { translateX: y.current }],
    [x, y]
  );
  if (titleFont === null || subtitleFont === null || font === null) {
    return null;
  }
  return (
    <Canvas style={{ flex: 1 }} onTouch={onTouch} debug>
      <Background />
      <Ball r={100} c={vec(75, 75)} />
      <Ball r={50} c={vec(width, height / 2)} />
      <Ball r={100} c={vec(150, height - 200)} />
      <Ball r={75} c={vec(300, height / 2 - 200)} />
      <BackdropBlur
        clip={clip}
        blur={15}
        color="rgba(255, 255, 255, 0.1)"
        transform={transform}
      >
        <Paint>
          <LinearGradient
            start={vec(0, 0)}
            end={vec(CARD_WIDTH, 0)}
            colors={["#5DA7D2ee", "#B848D9ee"]}
          />
        </Paint>
        <Rect x={0} y={CARD_HEIGHT - 70} width={CARD_WIDTH} height={70} />
        <Text text="SUPERBANK" x={20} y={40} font={titleFont} />
        <Text x={20} y={110} text="1234 5678 1234 5678" font={titleFont} />
        <Text text="VALID THRU" x={20} y={145} color="white" font={font} />
        <Text text="12/29" x={20} y={160} color="white" font={font} />
        <Text
          text="JOHN DOE"
          x={20}
          y={185}
          color="white"
          font={subtitleFont}
        />
      </BackdropBlur>
    </Canvas>
  );
};
