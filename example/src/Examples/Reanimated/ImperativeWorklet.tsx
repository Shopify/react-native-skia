import React, { useEffect, useMemo, useRef } from "react";
import { Dimensions, PixelRatio, StyleSheet, View } from "react-native";
import type { SharedValue } from "react-native-reanimated";
import Animated, {
  cancelAnimation,
  makeMutable,
  runOnUI,
  useAnimatedRef,
  useScrollViewOffset,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import type { SkCanvas } from "@shopify/react-native-skia";
import {
  Skia,
  SkiaImperativeView,
  TextAlign,
  rect,
} from "@shopify/react-native-skia";
import { makeUIMutable } from "react-native-reanimated/src/reanimated2/mutables";
import { SkiaViewApi } from "@shopify/react-native-skia/src/views/api";

const BOX_HEIGHT = 80;
const dimensions = Dimensions.get("screen");

const WINDOW_WIDTH = dimensions.width;
const WINDOW_HEIGHT = dimensions.height;

const randomWords = [
  "Hello",
  "World",
  "From Skia",
  "Testing",
  "Imperative rendering",
  "Stuff",
  "With Animations",
  "And Worklets",
];

type TextMessageProps = {
  id: number;
  text: string;
  offset: number;
};

type ComponentRenderer = {
  render: (ctx: SkCanvas) => void;
  isVisible: (currentOffset: number) => boolean;
  dispose: () => void;
};

const MakeParagraph = Skia.ParagraphBuilder.Make;
const { Color, Paint } = Skia;

const ratio = PixelRatio.get();

const transparent = Color("transparent");

const MESSAGES_PER_PAGE = Math.floor(WINDOW_HEIGHT / BOX_HEIGHT);

export const ImperativeWorkletExample: React.FC = () => {
  const ref = useRef<SkiaImperativeView>(null);
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  const renderList = useMemo<SharedValue<ComponentRenderer[]>>(
    () => makeMutable([]),
    []
  );

  const offset = useScrollViewOffset(scrollRef);
  const isRunning = useSharedValue(true);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
    const nativeId = ref.current?.nativeId!;

    runOnUI(() => {
      "worklet";

      const TextComponent = (props: TextMessageProps): ComponentRenderer => {
        "worklet";
        const paragraph = MakeParagraph({
          textAlign: TextAlign.Center,
        })
          .pushStyle({
            color: Color("white"),
            fontSize: 20,
          })
          .addText(props.text)
          .build();

        paragraph.layout(WINDOW_WIDTH);

        const textHeight = paragraph.getHeight();
        const textY = BOX_HEIGHT / 2 - textHeight / 2;

        const bubblePaint = Paint();
        bubblePaint.setColor(Color("green"));

        const textX = makeUIMutable(-50);

        textX.value = withRepeat(withTiming(50), -1, true);

        return {
          render(ctx: SkCanvas) {
            ctx.save();

            ctx.translate(0, props.offset);
            ctx.drawRect(rect(0, 0, WINDOW_WIDTH, BOX_HEIGHT), bubblePaint);
            paragraph.paint(ctx, textX.value, textY);

            ctx.restore();
          },
          isVisible(currentOffset: number) {
            const minY = props.offset + BOX_HEIGHT;
            const maxY = props.offset;
            const viewportMinY = currentOffset;
            const viewportMaxY = currentOffset + WINDOW_HEIGHT;

            return viewportMinY < minY && viewportMaxY > maxY;
          },
          dispose() {
            // this crashes app
            // paragraph.dispose();
            cancelAnimation(textX);
            bubblePaint.dispose();
          },
        };
      };

      function onScroll(nextOffset: number) {
        const currentPage = Math.floor(nextOffset / WINDOW_HEIGHT);
        if (renderList.value.length === 0) {
          renderList.value = randomWords.map((message, index) => {
            return TextComponent({
              id: index,
              text: message,
              offset: BOX_HEIGHT * index,
            });
          });
        }

        if (renderList.value.length < MESSAGES_PER_PAGE * (currentPage + 1)) {
          renderList.value.push(
            ...randomWords.map((message, index) => {
              return TextComponent({
                id: index,
                text: message,
                offset: BOX_HEIGHT * (index + renderList.value.length - 1),
              });
            })
          );
        }
      }

      onScroll(0);

      offset.addListener(0, onScroll);

      const frame = () => {
        const canvas = SkiaViewApi.getCanvas(nativeId);

        if (canvas) {
          canvas.clear(transparent);

          canvas.save();
          canvas.scale(ratio, ratio);

          canvas.save();

          canvas.translate(0, -offset.value);

          renderList.value.forEach((component) => {
            if (typeof component.render === "function") {
              if (!component.isVisible(offset.value)) {
                return;
              }

              component.render(canvas);
            }
          });

          canvas.restore();
          canvas.restore();
        }

        SkiaViewApi.renderImmediate(nativeId);

        if (isRunning.value) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    })();

    return () => {
      runOnUI(() => {
        "worklet";

        isRunning.value = false;

        renderList.value.forEach((component) => {
          component.dispose();
        });
      })();
    };
  }, []);

  return (
    <View style={styles.container}>
      <SkiaImperativeView ref={ref} style={styles.canvas} />

      <Animated.ScrollView ref={scrollRef} style={styles.container}>
        <View style={{ height: 100 * BOX_HEIGHT }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  canvas: {
    ...StyleSheet.absoluteFillObject,
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
  },
});
