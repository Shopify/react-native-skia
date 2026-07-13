import React, { useEffect, useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import type { SkRect } from "@shopify/react-native-skia";
import {
  Canvas,
  Group,
  Paragraph,
  RoundedRect,
  Skia,
  useFonts,
} from "@shopify/react-native-skia";
import type { SharedValue } from "react-native-reanimated";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const PADDING = 32;
// How many glyphs the highlight wave covers on each side of its center.
const SPREAD = 4;
const PALETTE = ["#61bea2", "#f5a623", "#5b8def", "#e4667e"];

interface GlyphHighlightProps {
  rect: SkRect;
  index: number;
  count: number;
  progress: SharedValue<number>;
}

const GlyphHighlight = ({
  rect,
  index,
  count,
  progress,
}: GlyphHighlightProps) => {
  const opacity = useDerivedValue(() => {
    // A highlight wave travels across the glyphs.
    const center = progress.value * (count + 2 * SPREAD) - SPREAD;
    const distance = Math.abs(index - center);
    return 0.15 + 0.85 * Math.max(0, 1 - distance / SPREAD);
  });
  return (
    <RoundedRect
      x={rect.x}
      y={rect.y}
      width={rect.width}
      height={rect.height}
      r={3}
      color={PALETTE[index % PALETTE.length]}
      opacity={opacity}
    />
  );
};

const GlyphBoundsDemo = () => {
  const { width } = useWindowDimensions();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 6000, easing: Easing.linear }),
      -1,
      false
    );
  }, [progress]);

  const customFontMgr = useFonts({
    "Roboto": [
      require("../../Tests/assets/Roboto-Medium.ttf"),
      require("../../Tests/assets/Roboto-Regular.ttf"),
    ],
    "Noto Sans SC": [require("../../Tests/assets/NotoSansSC-Regular.otf")],
  });

  const layoutWidth = width - PADDING * 2;
  const layout = useMemo(() => {
    if (customFontMgr === null) {
      return null;
    }
    const builder = Skia.ParagraphBuilder.Make({}, customFontMgr);
    builder.pushStyle({
      fontFamilies: ["Roboto", "Noto Sans SC"],
      fontSize: 32,
      color: Skia.Color("#1e1e24"),
    });
    builder.addText(
      "Skia knows the exact ink bounds of every glyph, even 你好 shaped via font fallback"
    );
    const paragraph = builder.build();
    paragraph.layout(layoutWidth);
    // extendedVisit() exposes the exact glyph layout that gets painted:
    // the resolved font, glyph ids, positions and per-glyph tight ink bounds.
    const glyphRects: SkRect[] = [];
    paragraph.extendedVisit((_lineNumber, info) => {
      if (info === null) {
        // end of line
        return;
      }
      for (let i = 0; i < info.glyphs.length; i++) {
        const bounds = info.bounds[i];
        if (bounds.width === 0 || bounds.height === 0) {
          // whitespace has no ink
          continue;
        }
        // positions are relative to the run origin, bounds to the glyph
        // origin: adding all three yields paragraph coordinates.
        glyphRects.push(
          Skia.XYWHRect(
            info.origin.x + info.positions[i].x + bounds.x,
            info.origin.y + info.positions[i].y + bounds.y,
            bounds.width,
            bounds.height
          )
        );
      }
    });
    return { paragraph, glyphRects, height: paragraph.getHeight() };
  }, [customFontMgr, layoutWidth]);

  if (layout === null) {
    return null;
  }
  return (
    <ScrollView>
      <Canvas style={{ width, height: layout.height + PADDING * 2 }}>
        <Group transform={[{ translateX: PADDING }, { translateY: PADDING }]}>
          {layout.glyphRects.map((rect, index) => (
            <GlyphHighlight
              key={index}
              rect={rect}
              index={index}
              count={layout.glyphRects.length}
              progress={progress}
            />
          ))}
          <Paragraph
            paragraph={layout.paragraph}
            x={0}
            y={0}
            width={layoutWidth}
          />
        </Group>
      </Canvas>
    </ScrollView>
  );
};

export const GlyphBounds = () => {
  if (Platform.OS === "web") {
    return (
      <View style={styles.fallback}>
        <Text>
          Paragraph.extendedVisit() is not implemented on React Native Web.
        </Text>
      </View>
    );
  }
  return <GlyphBoundsDemo />;
};

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: PADDING,
  },
});
