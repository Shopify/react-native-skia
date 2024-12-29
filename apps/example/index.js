/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from "./src/App";
import {name as appName} from './app.json';
import { Aurora, Breathe, Filters, FrostedCard, Glassmorphism, Gooey, GraphsScreen, Hue, Matrix, Neumorphism, PerformanceDrawingTest, ReanimatedExample, Severance, SpeedTest, Stickers, Transitions, Vertices, Video, Wallet, Wallpaper, WebGPU } from './src/Examples';
import { Boxes } from './src/Examples/Boxes';

AppRegistry.registerComponent(appName, () => App);

AppRegistry.registerComponent("Aurora", () => Aurora);
AppRegistry.registerComponent("Boxes", () => Boxes)
AppRegistry.registerComponent("Breathe", () => Breathe);
AppRegistry.registerComponent("Filters", () => Filters)
AppRegistry.registerComponent("FrostedCard", () => FrostedCard)
AppRegistry.registerComponent("GlassMorphism", () => Glassmorphism)
AppRegistry.registerComponent("Gooey", () => Gooey)
AppRegistry.registerComponent("Graphs", () => GraphsScreen)
AppRegistry.registerComponent("Hue", () => Hue)
AppRegistry.registerComponent("Matrix", () => Matrix)
AppRegistry.registerComponent("Neomorphism", () => Neumorphism)
AppRegistry.registerComponent("Performance", () => PerformanceDrawingTest)
AppRegistry.registerComponent("Reanimated", () => ReanimatedExample)
AppRegistry.registerComponent("Severance", () => Severance)
AppRegistry.registerComponent("SpeedTest", () => SpeedTest)
AppRegistry.registerComponent("Stickers", () => Stickers)
AppRegistry.registerComponent("Transitions", () => Transitions)
AppRegistry.registerComponent("Vertices", () => Vertices)
AppRegistry.registerComponent("Video", () => Video)
AppRegistry.registerComponent("Wallet", () => Wallet)
AppRegistry.registerComponent("Wallpaper", () => Wallpaper)
AppRegistry.registerComponent("WebGPU", () => WebGPU)
