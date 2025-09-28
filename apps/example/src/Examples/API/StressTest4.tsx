import {
    Alert,
    Button,
    PixelRatio,
    SafeAreaView,
    StyleSheet,
} from 'react-native';

import {
    Canvas,
    Image,
    Skia,
    SkImage,
    SkSurface,
} from '@shopify/react-native-skia';
import { useCallback, useState } from 'react';
import { Text } from 'react-native-gesture-handler';
import {
    runOnJS,
    runOnUI,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

export const StressTest4 = () => {
    console.log('state refreshed');
    const image = useSharedValue<SkImage | null>(null);
    const surface = useSharedValue<SkSurface | null>(null);
    const looper = useSharedValue(0);
    const x = useSharedValue(0);
    const pixelRatio = PixelRatio.get();
    const [direction, setDirection] = useState('left');
    const isLeft = useSharedValue(true);

    const revert = useCallback((d: string) => {
        setDirection(d);
    }, [setDirection]);

    const startBlink = useCallback(() => {
        'worklet';
        let blinkCnt = 0;
        const blink = () => {
            if (!surface.value) {
                Alert.alert('surface is null');
                return;
            }
            const canvas = surface.value.getCanvas();
            const paint = Skia.Paint();
            paint.setColor(
                Float32Array.from([
                    Math.random(),
                    Math.random(),
                    Math.random(),
                    1,
                ])
            );
            // for (let i = 0; i < 10; i++) {
                canvas.drawRect(
                    {
                        x: pixelRatio * x.value,
                        y: 0,
                        width: pixelRatio * 400,
                        height: pixelRatio * 400,
                    },
                    paint
                );
                surface.value.flush();
                image.value = surface.value.makeImageSnapshot();
            // }
            if (blinkCnt < 20) {
                blinkCnt++;
                looper.value = withTiming(
                    1 - looper.value,
                    { duration: 10 },
                    blink
                );
            } else {
                runOnJS(revert)(isLeft.value ? 'right' : 'left');
                isLeft.value = !isLeft.value;
                x.value = withTiming(400 - x.value, { duration: 200 }, () => {
                    blinkCnt = 0;
                    blink();
                });
            }
        };
        blink();
    }, []);

    const start = useCallback(() => {
        'worklet';
        if (!surface.value) {
            surface.value = Skia.Surface.MakeOffscreen(
                pixelRatio * 800,
                pixelRatio * 400
            );
        }
        startBlink();
    }, []);

    const imageX = useDerivedValue(() => -x.value);

    return (
        <SafeAreaView style={styles.container}>
            <Text>Direction: {direction}</Text>
            <Canvas
                style={{
                    width: 400,
                    height: 400,
                    borderColor: 'red',
                    borderWidth: 1,
                }}
            >
                <Image image={image} width={800} height={400} x={imageX} />
            </Canvas>
            <Button onPress={runOnUI(start)} title="Start" />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#ecf0f1',
        padding: 8,
    },
});