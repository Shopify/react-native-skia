import { Canvas, Rect } from "@shopify/react-native-skia/src";
import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import {
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

const AnimatedSquareCanvas = () => {
    const x = useSharedValue(0);
    useEffect(() => {
        x.value = withRepeat(
            withSequence(
                withTiming(100, { duration: 1000 }),
                withTiming(0, { duration: 1000 })
            ),
            -1
        );
    }, [x]);

    const width = useSharedValue(100);

    const handlePress = () => {
        width.value = 200;
    };

    return (
        <View style={{ gap: 20 }}>
            <TouchableOpacity onPress={handlePress}>
                <Canvas style={{ width: "100%", height: "100%" }}>
                    <Rect x={0} y={0} width={width} height={100} color="blue" />
                </Canvas>
            </TouchableOpacity>
            <Canvas style={{ width: "100%", height: "100%" }}>
                <Rect x={x} y={0} width={100} height={100} color="red" />
            </Canvas>
        </View>
    );
};
export default AnimatedSquareCanvas;
