import React, { useEffect, useMemo } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import {
  Canvas,
  FontWeight,
  Group,
  Path,
  Skia,
  useFonts,
} from "@shopify/react-native-skia";
import {
  Easing,
  useDerivedValue,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const PADDING = 32;

const ParagraphPathDemo = () => {
  const { width } = useWindowDimensions();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withTiming(1, { duration: 4000, easing: Easing.inOut(Easing.cubic) }),
      -1,
      true
    );
  }, [progress]);

  const customFontMgr = useFonts({
    Roboto: [
      require("../../Tests/assets/Roboto-Medium.ttf"),
      require("../../Tests/assets/Roboto-Regular.ttf"),
    ],
  });

  const layout = useMemo(() => {
    if (customFontMgr === null) {
      return null;
    }
    const builder = Skia.ParagraphBuilder.Make({}, customFontMgr);
    builder.pushStyle({
      fontFamilies: ["Roboto"],
      fontSize: 42,
      fontStyle: { weight: FontWeight.Medium },
      color: Skia.Color("black"),
    });
    builder.addText("Can it be done in React Native?");
    const paragraph = builder.build();
    paragraph.layout(width - PADDING * 2);
    // getPath() converts the glyphs of a laid out line into an SkPath, with
    // all font fallbacks already applied. Merge the lines into a single path.
    const path = Skia.Path.Make();
    paragraph.getLineMetrics().forEach(({ lineNumber }) => {
      const line = paragraph.getPath(lineNumber);
      if (line) {
        path.addPath(line);
      }
    });
    return { path, height: paragraph.getHeight() };
  }, [customFontMgr, width]);

  // The text writes itself as a trimmed stroke, then the fill fades in.
  const end = useDerivedValue(() => Math.min(1, progress.value / 0.7));
  const fillOpacity = useDerivedValue(() =>
    Math.max(0, (progress.value - 0.7) / 0.3)
  );

  if (layout === null) {
    return null;
  }
  return (
    <ScrollView>
      <Canvas style={{ width, height: layout.height + PADDING * 2 }}>
        <Group transform={[{ translateX: PADDING }, { translateY: PADDING }]}>
          <Path path={layout.path} color="#1e1e24" opacity={fillOpacity} />
          <Path
            path={layout.path}
            style="stroke"
            strokeWidth={2}
            strokeCap="round"
            strokeJoin="round"
            color="#61bea2"
            end={end}
          />
        </Group>
      </Canvas>
    </ScrollView>
  );
};

export const ParagraphPath = () => {
  if (Platform.OS === "web") {
    return (
      <View style={styles.fallback}>
        <Text>Paragraph.getPath() is not implemented on React Native Web.</Text>
      </View>
    );
  }
  return <ParagraphPathDemo />;
};

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: PADDING,
  },
});
