import React from "react";
import { StyleSheet, Dimensions, ScrollView, View } from "react-native";
import {
  Skia,
  PathOp,
  Canvas,
  Path,
  Group,
  rect,
} from "@shopify/react-native-skia";

import { Title } from "./components/Title";
import {
  Backface,
  CARD_HEIGHT,
  CARD_WIDTH,
} from "./components/drawings/backface";

const { width } = Dimensions.get("window");
const SIZE = width;

const strokeWidth = 10;
const r = 32;
const d = 2 * r;
const example1Height = 150;

const s = Skia.Path.MakeFromSVGString(
  // eslint-disable-next-line max-len
  "M73.1761 184.56C57.9867 184.56 44.9307 182.256 34.0081 177.648C23.0854 173.04 14.8081 166.982 9.17606 159.472C3.54406 151.963 0.557398 143.856 0.216064 135.152C0.216064 133.616 0.728065 132.336 1.75206 131.312C2.77606 130.288 4.05606 129.776 5.59206 129.776H28.3761C30.4241 129.776 31.9601 130.203 32.9841 131.056C34.1787 131.739 35.2881 132.934 36.3121 134.64C38.0187 140.443 41.9441 145.307 48.0881 149.232C54.2321 153.158 62.5947 155.12 73.1761 155.12C85.2934 155.12 94.4241 153.158 100.568 149.232C106.712 145.136 109.784 139.504 109.784 132.336C109.784 127.558 108.163 123.632 104.92 120.56C101.848 117.488 97.1547 114.843 90.8401 112.624C84.6961 110.406 75.4801 107.675 63.1921 104.432C43.0534 99.6536 28.2907 93.3389 18.9041 85.4882C9.68806 77.4669 5.08006 66.1176 5.08006 51.4402C5.08006 41.5416 7.7254 32.7522 13.0161 25.0722C18.4774 17.3922 26.2427 11.3336 36.3121 6.89624C46.5521 2.4589 58.4134 0.240234 71.8961 0.240234C85.8907 0.240234 98.0081 2.7149 108.248 7.66423C118.488 12.6136 126.253 18.8429 131.544 26.3522C137.005 33.6909 139.907 41.0296 140.248 48.3682C140.248 49.9042 139.736 51.1842 138.712 52.2082C137.688 53.2322 136.408 53.7442 134.872 53.7442H111.064C107.48 53.7442 105.005 52.1229 103.64 48.8802C102.616 43.4189 99.2027 38.8962 93.4001 35.3122C87.5974 31.5576 80.4294 29.6802 71.8961 29.6802C62.3387 29.6802 54.8294 31.4722 49.3681 35.0562C43.9067 38.6402 41.1761 43.8456 41.1761 50.6722C41.1761 55.4509 42.5414 59.3762 45.2721 62.4482C48.0027 65.5202 52.2694 68.2509 58.0721 70.6402C64.0454 73.0296 72.5787 75.6749 83.6721 78.5762C98.6907 81.9896 110.637 85.8296 119.512 90.0962C128.557 94.3629 135.213 99.7389 139.48 106.224C143.747 112.71 145.88 120.987 145.88 131.056C145.88 141.979 142.808 151.536 136.664 159.728C130.691 167.75 122.157 173.894 111.064 178.16C100.141 182.427 87.5121 184.56 73.1761 184.56Z"
)!;
s.offset(16, 16);
s.stroke({
  width: 10,
});

const rect1 = Skia.Path.Make();
rect1.addRect(
  rect(strokeWidth / 2, (example1Height - d) / 2, SIZE - strokeWidth, 70)
);
const circle = Skia.Path.Make();
circle.addCircle(SIZE / 2, example1Height / 2 - d / 2, r);
const result = Skia.Path.MakeFromOp(rect1, circle, PathOp.Difference)!;
result.simplify();

export const PathExample = () => {
  return (
    <ScrollView>
      <Title>Path Operations</Title>
      <Canvas style={styles.container}>
        <Group style="stroke" color="#fb61da" strokeWidth={2}>
          <Path
            path={result}
            color="#61DAFB"
            strokeWidth={strokeWidth}
            strokeJoin="round"
          />
          <Path path={circle} />
          <Path path={rect1} />
        </Group>
      </Canvas>
      <Title>Paths</Title>
      <View style={styles.cardContainer}>
        <Canvas style={styles.card}>
          <Backface />
        </Canvas>
      </View>
      <Title>Stroke</Title>
      <Canvas style={styles.stroke}>
        <Path path={s} color="black" style="stroke" strokeWidth={1} />
      </Canvas>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SIZE,
    height: example1Height,
  },
  cardContainer: {
    width,
    padding: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  stroke: {
    width: SIZE,
    height: SIZE,
  },
});
