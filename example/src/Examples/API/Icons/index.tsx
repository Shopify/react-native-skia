import React, { Component, createContext, useContext, useMemo } from "react";
import {
  PixelRatio,
  StyleSheet,
  Text,
  View,
  requireNativeComponent,
} from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  AlphaType,
  Canvas,
  ColorType,
  Rect,
  Skia,
  SkiaViewNativeId,
  useSVG,
} from "@shopify/react-native-skia";
import type { ViewProps } from "react-native-svg/lib/typescript/fabric/utils";

import { Octocat } from "./SvgIcons/OctocatIcon";
import { StackExchange } from "./SvgIcons/StackExchangeIcon";
import { StackOverflow } from "./SvgIcons/StackOverflowIcon";
import { Github } from "./SvgIcons/GithubIcon";

interface SkiaBitmapViewProps {
  data: Uint8Array;
  width: number;
  height: number;
  style?: ViewProps["style"];
}

interface SkiaBitmapViewNativeProps {
  nativeID: string;
  style?: ViewProps["style"];
}

const SkiaBitmapViewNative =
  requireNativeComponent<SkiaBitmapViewNativeProps>("SkiaBitmapView");

class SkiaBitmapView extends Component<SkiaBitmapViewProps> {
  private nativeID: number;

  constructor(props: SkiaBitmapViewProps) {
    super(props);
    this.nativeID = SkiaViewNativeId.current++;
    const { data } = this.props;
    SkiaViewApi.registerBitmap(this.nativeID, data);
  }

  componentWillUnmount() {
    SkiaViewApi.unregisterBitmap(this.nativeID);
  }

  render() {
    const { nativeID } = this;
    const { style, width, height } = this.props;
    const flattenedStyle = StyleSheet.flatten(style);
    return (
      <SkiaBitmapViewNative
        nativeID={`${nativeID}`}
        style={{ ...flattenedStyle, width, height }}
      />
    );
  }
}

const pixels = new Uint8Array(256 * 256 * 4);
pixels.fill(255);
let i = 0;
for (let x = 0; x < 256 * 4; x++) {
  for (let y = 0; y < 256 * 4; y++) {
    pixels[i++] = (x * y) % 255;
  }
}
const data = Skia.Data.fromBytes(pixels);
const img = Skia.Image.MakeImage(
  {
    width: 256,
    height: 256,
    alphaType: AlphaType.Opaque,
    colorType: ColorType.RGBA_8888,
  },
  data,
  256 * 4
)!;

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
    canvas.drawSvg(svg);
    //surface.flush();
    // const pixels = surface.readPixels();
    return pixels;
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
  github: Uint8Array;
  octocat: Uint8Array;
  stackExchange: Uint8Array;
  overflow: Uint8Array;
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
  icon: Uint8Array;
  size?: number;
}

const style = { width: 48, height: 48 };

const Icon = ({ icon }: IconProps) => {
  return <SkiaBitmapView data={pixels} width={48} height={48} />;
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
