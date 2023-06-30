import React, { createContext, useContext, useMemo } from "react";
import { PixelRatio, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import type { SkImage } from "@shopify/react-native-skia";
import {
  Canvas,
  Rect,
  SkiaPictureView,
  Skia,
  useSVG,
} from "@shopify/react-native-skia";

import { Octocat } from "./SvgIcons/OctocatIcon";
import { StackExchange } from "./SvgIcons/StackExchangeIcon";
import { StackOverflow } from "./SvgIcons/StackOverflowIcon";
import { Github } from "./SvgIcons/GithubIcon";

const pd = PixelRatio.get();

const useSVGPicture = (module: number) => {
  const svg = useSVG(module);
  return useMemo(() => {
    if (!svg) {
      return null;
    }
    const surface = Skia.Surface.MakeOffscreen(48 * pd, 48 * pd);
    if (!surface) {
      throw new Error("Couldn't create offscreen surface");
    }
    const canvas = surface.getCanvas();
    canvas.clear(Float32Array.of(0, 0, 0, 0));
    canvas.save();
    canvas.scale(pd, pd);
    canvas.drawSvg(svg);
    canvas.restore();
    //surface.flush();
    return surface.makeImageSnapshot();
  }, [svg]);
};

const useLoadSVGs = () => {
  const github = useSVGPicture(require("../../../assets/icons8-github.svg"));
  const octocat = useSVGPicture(require("../../../assets/icons8-octocat.svg"));
  const stackExchange = useSVGPicture(
    require("../../../assets/icons8-stack-exchange.svg")
  );
  const overflow = useSVGPicture(
    require("../../../assets/icons8-stack-overflow.svg")
  );
  if (github && octocat && stackExchange && overflow) {
    return {
      github,
      octocat,
      stackExchange,
      overflow,
    };
  } else {
    return null;
  }
};

interface SVGAssets {
  github: SkImage;
  octocat: SkImage;
  stackExchange: SkImage;
  overflow: SkImage;
}

const SVGContext = createContext<SVGAssets | null>(null);

const useSVGs = () => {
  const svgs = useContext(SVGContext);
  if (!svgs) {
    throw new Error("No SVGs available");
  }
  return svgs;
};

interface IconProps {
  icon: SkImage;
  size?: number;
}

const style = { width: 48, height: 48 };

const Icon = ({ icon }: IconProps) => {
  return <SkiaPictureView style={style} texture={icon} />;
};

const Screen = () => {
  const { github, octocat, stackExchange, overflow } = useSVGs();
  return (
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFFFE0",
      }}
    >
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text>React Native Skia Picture</Text>
        <Icon icon={github} />
        <Icon icon={octocat} />
        <Icon icon={stackExchange} />
        <Icon icon={overflow} />
        <Text>React Native Skia Canvas</Text>
        <Canvas style={{ width: 50, height: 50 }}>
          <Rect x={0} y={0} width={50} height={50} color="red" />
        </Canvas>
        <Text>React Native View</Text>
        <View style={{ backgroundColor: "orange", width: 50, height: 50 }} />
      </View>
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text>React Native SVG</Text>
        <Github />
        <Octocat />
        <StackExchange />
        <StackOverflow />
        <Text>React Native View</Text>
        <View style={{ backgroundColor: "orange", width: 50, height: 50 }} />
      </View>
    </View>
  );
};

const HomeScreen = () => <Screen />;

const SettingsScreen = () => <Screen />;

const Tab = createBottomTabNavigator();

export const IconsExample = () => {
  const assets = useLoadSVGs();
  if (!assets) {
    return null;
  }
  return (
    <SVGContext.Provider value={assets}>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
      </Tab.Navigator>
    </SVGContext.Provider>
  );
};
