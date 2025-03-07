import AnimatedSquareCanvas from "@/components/AnimatedSquareCanvas";
import { DrawingCanvas } from "@/components/DrawingCanvas";
import { View } from "react-native";

const Home = () => {
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <View style={{ width: "50%" }}>
        <AnimatedSquareCanvas />
      </View>
      <DrawingCanvas />
    </View>
  );
};
export default Home;
