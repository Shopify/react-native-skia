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
  useDerivedValue,
  runDecay,
} from "@shopify/react-native-skia";
import React from "react";
import { Dimensions } from "react-native";

import { Background } from "./components/Background";
import { Ball } from "./components/Ball";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = width - 64;
const CARD_HEIGHT = CARD_WIDTH * 0.61;
const clip = rrect(rect(0, 0, CARD_WIDTH, CARD_HEIGHT), 20, 20);

export const Glassmorphism = () => {
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
  const transform = useDerivedValue(
    () => [{ translateY: x.current }, { translateX: y.current }],
    [x, y]
  );
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
        <Text
          text="SUPERBANK"
          x={20}
          y={40}
          familyName="source-sans-pro-semi-bold"
          size={24}
        />
        <Text
          x={20}
          y={110}
          text="1234 5678 1234 5678"
          familyName="source-sans-pro-semi-bold"
          size={24}
        />
        <Text
          text="VALID THRU"
          x={20}
          y={145}
          color="white"
          familyName="sans-serif-medium"
          size={10}
        />
        <Text
          text="12/29"
          x={20}
          y={160}
          color="white"
          size={12}
          familyName="sans-serif-medium"
        />
        <Text
          text="JOHN DOE"
          x={20}
          y={185}
          color="white"
          size={18}
          familyName="source-sans-pro-semi-bold"
        />
      </BackdropBlur>
    </Canvas>
  );
};
