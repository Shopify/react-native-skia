import { getSkiaExports } from "@shopify/react-native-skia/lib/module/headless";
import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web/LoadSkiaWeb";

await LoadSkiaWeb();
const { Skia } = getSkiaExports();
