import { Rect, Canvas } from "@shopify/react-native-skia/src";
import { useEffect } from "react";
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
				withTiming(0, { duration: 1000 }),
			),
			-1,
		);
	}, [x]);

	return (
		<Canvas style={{ width: "100%", height: "100%" }}>
			<Rect x={x} y={0} width={100} height={100} color="blue" />
		</Canvas>
	);
};
export default AnimatedSquareCanvas;
