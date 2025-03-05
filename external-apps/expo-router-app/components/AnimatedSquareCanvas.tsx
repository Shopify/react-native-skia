import { Canvas, RoundedRect } from "@shopify/react-native-skia/src";
import { useCallback, useEffect, useState } from "react";
import { runOnJS, useAnimatedReaction, useSharedValue, withRepeat, withSequence, withTiming } from "react-native-reanimated";

const AnimatedSquareCanvas = () => {
    const isActive = useSharedValue(false);

    const [, setFirstRenderFinished] = useState(false);

    const setIsActive = useCallback(() => {
        runOnJS(setFirstRenderFinished)(true);
    }, []);

    useAnimatedReaction(
        () => isActive.value,
        () => {
            runOnJS(setIsActive)();
        },
        [isActive, setIsActive]
    );

    const x = useSharedValue(0);
    useEffect(() => {
        x.value = withRepeat(withSequence(withTiming(100, { duration: 1000 }), withTiming(0, { duration: 1000 })), -1);
    }, [x]);

    return (
        <Canvas style={{ width: "100%", height: "100%" }}>
            <RoundedRect x={x} y={0} width={100} height={100} color="blue" r={8} />
        </Canvas>
    );
};
export default AnimatedSquareCanvas;
