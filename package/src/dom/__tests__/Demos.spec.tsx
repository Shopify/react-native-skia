import { importSkia, width, height } from "../../renderer/__tests__/setup";
import { setupSkia } from "../../skia/__tests__/setup";
import { processResult } from "../../__tests__/setup";
import { GroupNode, PaintNode, FillNode } from "../nodes";

describe("Drawings", () => {
  it("Hello World", () => {
    const { surface, canvas } = setupSkia(width, height);
    const { Skia } = importSkia();
    // const c = vec(width / 2, height / 2);
    // const c1 = Skia.Color("#61bea2");
    // const c2 = Skia.Color("#529ca0");
    const color = Skia.Color("rgb(36,43,56)");
    const bgPaint = new PaintNode({ color });
    const root = new GroupNode({ paint: bgPaint });
    root.addChild(new FillNode());

    const ctx = { canvas, paint: Skia.Paint(), opacity: 1, Skia };
    root.render(ctx);
    processResult(surface, "snapshots/demos/breathe.png");
  });
});

/*



interface RingProps {
  index: number;
  progress: SkiaValue<number>;
}

const Ring = ({ index, progress }: RingProps) => {
  const { width, height } = useWindowDimensions();
  const R = width / 4;
  const center = useMemo(
    () => vec(width / 2, height / 2 - 64),
    [height, width]
  );

  const theta = (index * (2 * Math.PI)) / 6;
  const transform = useComputedValue(() => {
    const { x, y } = polar2Canvas(
      { theta, radius: progress.current * R },
      { x: 0, y: 0 }
    );
    const scale = mix(progress.current, 0.3, 1);
    return [{ translateX: x }, { translateY: y }, { scale }];
  }, [progress]);

  return (
    <Group origin={center} transform={transform}>
      <Circle c={center} r={R} color={index % 2 ? c1 : c2} />
    </Group>
  );
};

export const Breathe = () => {
  const { width, height } = useWindowDimensions();
  const center = useMemo(
    () => vec(width / 2, height / 2 - 64),
    [height, width]
  );

  const progress = useLoop({
    duration: 3000,
    easing: Easing.inOut(Easing.ease),
  });

  const transform = useComputedValue(
    () => [{ rotate: mix(progress.current, -Math.PI, 0) }],
    [progress]
  );

  return (
    <Canvas style={styles.container} debug>
      <Fill color="rgb(36,43,56)" />
      <Group origin={center} transform={transform} blendMode="screen">
        <BlurMask style="solid" blur={40} />
        {new Array(6).fill(0).map((_, index) => {
          return <Ring key={index} index={index} progress={progress} />;
        })}
      </Group>
    </Canvas>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

*/
