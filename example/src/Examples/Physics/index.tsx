import React, { useMemo, useState } from "react";
import { Button, StyleSheet, View } from "react-native";
import * as box2d from "@flyover/box2d";
import {
  PaintStyle,
  Skia,
  SkiaView,
  useDrawCallback,
  usePaint,
} from "@shopify/react-native-skia";

const ColumnCount = 2;
const RowCount = 10;

export const PhysicsExample: React.FC = () => {
  const [replay, setReplay] = useState<number>(0);

  const bodies = useMemo(() => {
    return new Array(RowCount * ColumnCount) as box2d.Body[];
  }, []);

  const world = useMemo(() => {
    const gravity = new box2d.Vec2(0, -10);
    const b2world = new box2d.World(gravity);

    const indices: number[] = new Array(RowCount * ColumnCount);

    const bd = new box2d.BodyDef();
    const ground = b2world.CreateBody(bd);

    const shape = new box2d.EdgeShape();
    shape.SetTwoSided(new box2d.Vec2(-80.0, 0.0), new box2d.Vec2(80.0, 0.0));
    ground.CreateFixture(shape, 0.0);

    const xs = [0.0, -2.5, -5, 2.5, 5];

    for (let j = 0; j < ColumnCount; ++j) {
      const boxShape = new box2d.PolygonShape();
      boxShape.SetAsBox(0.5, 0.5);

      const fd = new box2d.FixtureDef();
      fd.shape = boxShape;
      fd.density = 1.0;
      fd.friction = 0.3;

      for (let i = 0; i < RowCount; ++i) {
        const bodyDef = new box2d.BodyDef();
        bodyDef.type = box2d.BodyType.b2_dynamicBody;

        const n = j * RowCount + i;
        indices[n] = n;
        bodyDef.userData = indices[n];

        const x = box2d.RandomRange(-0.12, 0.12);
        //const x = i % 2 === 0 ? -0.04 : 0.04;
        bodyDef.position.Set(xs[j] + x, 0.55 + 1.2 * i);
        const body = b2world.CreateBody(bodyDef);

        bodies[n] = body;

        body.CreateFixture(fd);
      }
    }
    return b2world;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodies, replay]);

  const bg = usePaint((p) => p.setColor(Skia.Color("#CECECE")));
  const fg = usePaint((p) => {
    p.setColor(Skia.Color("#000"));
    p.setStyle(PaintStyle.Stroke);
    p.setStrokeWidth(0.05);
  });

  const fgfill = usePaint((p) => {
    p.setColor(Skia.Color("#337FA955"));
    p.setStyle(PaintStyle.Fill);
  });

  const rect = useMemo(() => Skia.XYWHRect(-0.5, -0.5, 1, 1), []);

  const onDraw = useDrawCallback(
    (canvas, info) => {
      // Clear screen
      canvas.drawPaint(bg);
      canvas.save();
      canvas.translate(info.width / 2, info.height);
      canvas.scale(30, 30);
      canvas.rotate(180, 0, 0);

      // Tick screen
      world.Step(info.timestamp / 100000, 8, 4);

      // Draw boxes
      for (let i = 0; i < bodies.length; i++) {
        canvas.save();
        canvas.translate(bodies[i].GetPosition().x, bodies[i].GetPosition().y);
        canvas.rotate(bodies[i].GetAngle() * (180 / Math.PI), 0, 0);
        canvas.drawRect(rect, fg);
        canvas.drawRect(rect, fgfill);
        canvas.restore();
      }
      canvas.restore();
    },
    [world]
  );

  return (
    <>
      <SkiaView onDraw={onDraw} style={styles.container} mode={"continuous"} />
      <View style={styles.buttonContainer}>
        <Button title="Replay" onPress={() => setReplay((p) => p + 1)} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  buttonContainer: {
    alignItems: "center",
    justifyContent: "flex-start",
    ...StyleSheet.absoluteFillObject,
  },
});
