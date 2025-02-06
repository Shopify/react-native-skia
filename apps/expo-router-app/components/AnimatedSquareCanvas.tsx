import { Rect } from "@shopify/react-native-skia/src";

const AnimatedSquareCanvas = () => {
	return (
		<Canvas style={{ width: "100%", height: "100%" }}>
			<Rect x={0} y={0} width={100} height={100} color="blue" />
		</Canvas>
	);
};
export default AnimatedSquareCanvas;
