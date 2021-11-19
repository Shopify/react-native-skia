import React, {useMemo, useState} from 'react';
import {Button, StyleSheet, View} from 'react-native';

import * as b2 from '@flyover/box2d';
import {
  PaintStyle,
  Skia,
  useDrawCallback,
  usePaint,
} from '@shopify/react-native-skia';

const e_columnCount = 4;
const e_rowCount = 10;

export const PhysicsExample: React.FC = () => {
  const [replay, setReplay] = useState<number>(0);

  const bodies = useMemo(() => {
    return new Array(e_rowCount * e_columnCount) as b2.b2Body[];
  }, []);

  const world = useMemo(() => {
    const gravity: b2.b2Vec2 = new b2.b2Vec2(0, -10);
    const b2world = new b2.b2World(gravity);

    const indices: number[] = new Array(e_rowCount * e_columnCount);

    const bd = new b2.b2BodyDef();
    const ground = b2world.CreateBody(bd);

    const shape = new b2.b2EdgeShape();
    shape.Set(new b2.b2Vec2(-80.0, 0.0), new b2.b2Vec2(80.0, 0.0));
    ground.CreateFixture(shape, 0.0);

    const xs = [0.0, -2.5, -5, 2.5, 5];

    for (let j = 0; j < e_columnCount; ++j) {
      const boxShape = new b2.b2PolygonShape();
      boxShape.SetAsBox(0.5, 0.5);

      const fd = new b2.b2FixtureDef();
      fd.shape = boxShape;
      fd.density = 1.0;
      fd.friction = 0.3;

      for (let i = 0; i < e_rowCount; ++i) {
        const bodyDef = new b2.b2BodyDef();
        bodyDef.type = b2.b2BodyType.b2_dynamicBody;

        const n = j * e_rowCount + i;
        indices[n] = n;
        bodyDef.userData = indices[n];

        const x = b2.b2RandomRange(-0.12, 0.12);
        //const x = i % 2 === 0 ? -0.04 : 0.04;
        bodyDef.position.Set(xs[j] + x, 0.55 + 2 * i);
        const body = b2world.CreateBody(bodyDef);

        bodies[n] = body;

        body.CreateFixture(fd);
      }
    }
    return b2world;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bodies, replay]);

  const bg = usePaint(p => p.setColor(Skia.Color('#CECECE')));
  const fg = usePaint(p => {
    p.setColor(Skia.Color('#000'));
    p.setStyle(PaintStyle.Stroke);
    p.setStrokeWidth(0.05);
  });
  const fgfill = usePaint(p => {
    p.setColor(Skia.Color('#337FA955'));
    p.setStyle(PaintStyle.Fill);
  });
  const onDraw = useDrawCallback(
    (canvas, info) => {
      // Clear screen
      canvas.drawPaint(bg);
      canvas.save();
      canvas.translate(info.width / 2, info.height / 2);
      canvas.scale(20, 20);
      canvas.rotate(180);

      // Tick screen
      world.Step(info.timestamp / 10000000, 8, 3);

      // Draw boxes
      for (let i = 0; i < bodies.length; i++) {
        canvas.save();
        canvas.translate(bodies[i].GetPosition().x, bodies[i].GetPosition().y);
        canvas.rotate(bodies[i].GetAngle() * (180 / Math.PI));
        canvas.drawRect(Skia.Rect(-0.5, -0.5, 1, 1), fg);
        canvas.drawRect(Skia.Rect(-0.5, -0.5, 1, 1), fgfill);
        canvas.restore();
      }
      canvas.restore();
    },
    [world],
  );

  return (
    <>
      <Skia.View onDraw={onDraw} style={styles.container} mode={'continuous'} />
      <View style={styles.buttonContainer}>
        <Button title="Replay" onPress={() => setReplay(p => p + 1)} />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1},
  buttonContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    ...StyleSheet.absoluteFillObject,
  },
});
