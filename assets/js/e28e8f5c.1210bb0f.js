"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[8673],{1184:(e,n,i)=>{i.d(n,{R:()=>o,x:()=>r});var t=i(4041);const a={},s=t.createContext(a);function o(e){const n=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function r(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:o(e.components),t.createElement(s.Provider,{value:n},e.children)}},6190:(e,n,i)=>{i.r(n),i.d(n,{assets:()=>h,contentTitle:()=>p,default:()=>f,frontMatter:()=>l,metadata:()=>t,toc:()=>u});const t=JSON.parse('{"id":"getting-started/web","title":"Web Support","description":"React Native Skia runs in the browser via CanvasKit, a WebAssembly (WASM) build of Skia.","source":"@site/docs/getting-started/web.mdx","sourceDirName":"getting-started","slug":"/getting-started/web","permalink":"/react-native-skia/docs/getting-started/web","draft":false,"unlisted":false,"editUrl":"https://github.com/shopify/react-native-skia/edit/main/docs/docs/getting-started/web.mdx","tags":[],"version":"current","frontMatter":{"id":"web","title":"Web Support","sidebar_label":"Web","slug":"/getting-started/web"},"sidebar":"tutorialSidebar","previous":{"title":"Hello World","permalink":"/react-native-skia/docs/getting-started/hello-world"},"next":{"title":"Headless","permalink":"/react-native-skia/docs/getting-started/headless"}}');var a=i(1085),s=i(1184),o=i(4041),r=i(6085);const d={append:function(e,n){if((n=n||{}).id=n.id||e.dataset.snackId||e.dataset.sketchId,n.platform=n.platform||e.dataset.snackPlatform||e.dataset.sketchPlatform,n.supportedPlatforms=n.supportedPlatforms||e.dataset.snackSupportedPlatforms||e.dataset.snackSupportedplatforms,n.preview=n.preview||e.dataset.snackPreview||e.dataset.sketchPreview||"true",n.sdkVersion=n.sdkVersion||e.dataset.snackSdkVersion||e.dataset.snackSdkversion,n.name=n.name||e.dataset.snackName,n.description=n.description||e.dataset.snackDescription,n.theme=n.theme||e.dataset.snackTheme,n.appetizePayerCode=n.appetizePayerCode||e.dataset.snackAppetizePayerCode,n.loading=n.loading||e.dataset.snackLoading,!n.code&&e.dataset.snackCode&&(n.code=decodeURIComponent(e.dataset.snackCode)),!n.files&&e.dataset.snackFiles&&(n.files=decodeURIComponent(e.dataset.snackFiles)),!n.dependencies&&e.dataset.snackDependencies&&(n.dependencies=e.dataset.snackDependencies),!e.querySelector("iframe[data-snack-iframe]")&&(n.id||n.code||n.files)){var i=Math.random().toString(36).substr(2,10),t=document.createElement("iframe"),a="?iframeId="+i;n.preview&&(a+="&preview="+n.preview),n.platform&&(a+="&platform="+n.platform),n.supportedPlatforms&&(a+="&supportedPlatforms="+n.supportedPlatforms),n.sdkVersion&&(a+="&sdkVersion="+n.sdkVersion),n.name&&(a+="&name="+n.name),n.description&&(a+="&description="+n.description),n.theme&&(a+="&theme="+n.theme),n.appetizePayerCode&&(a+="&appetizePayerCode="+n.appetizePayerCode),n.verbose&&(a+="&verbose="+n.verbose),n.loading&&(t.loading=n.loading),n.id?t.src="https://snack.expo.dev/embedded/"+n.id+a:t.src="https://snack.expo.dev/embedded"+a+"&waitForData=true",t.style="display: block",t.height="100%",t.width="100%",t.frameBorder="0",t.allowTransparency=!0,t.dataset.snackIframe=!0,e.appendChild(t),(n.code||n.files||n.dependencies)&&window.addEventListener("message",(function(e){var a=e.data[0],s=e.data[1];"expoFrameLoaded"===a&&s.iframeId===i&&t.contentWindow.postMessage(["expoDataEvent",{iframeId:i,dependencies:n.dependencies,code:n.code,files:n.files}],"*")}))}},remove:function(e){var n=e.querySelector("iframe[data-snack-iframe]");n&&n.parentNode.removeChild(n)},initialize:function(){document.querySelectorAll("[data-sketch-id], [data-snack-id], [data-snack-code]").forEach((function(e){d.append(e)}))}},c=e=>{let{id:n}=e;const{colorMode:i}=(0,r.G)(),t=(0,o.useRef)(null);return(0,o.useEffect)((()=>{d.remove(t.current),d.append(t.current)}),[i]),(0,a.jsx)("div",{ref:t,"data-snack-id":n,"data-snack-platform":"web","data-snack-preview":"true","data-snack-theme":"dark"===i?"dark":"light",style:{overflow:"hidden",background:"#f9f9f9",border:"1px solid var(--color-border)",borderRadius:4,height:505,width:"100%"}})},l={id:"web",title:"Web Support",sidebar_label:"Web",slug:"/getting-started/web"},p=void 0,h={},u=[{value:"Expo",id:"expo",level:2},{value:"Snack",id:"snack",level:3},{value:"Remotion",id:"remotion",level:2},{value:"Loading Skia",id:"loading-skia",level:2},{value:"Using Code-Splitting",id:"using-code-splitting",level:3},{value:"Using Deferred Component Registration",id:"using-deferred-component-registration",level:3},{value:"Using a CDN",id:"using-a-cdn",level:2},{value:"Unsupported Features",id:"unsupported-features",level:2},{value:"Manual webpack Installation",id:"manual-webpack-installation",level:2}];function m(e){const n={a:"a",admonition:"admonition",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",ul:"ul",...(0,s.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)(n.p,{children:["React Native Skia runs in the browser via ",(0,a.jsx)(n.a,{href:"https://skia.org/docs/user/modules/canvaskit/",children:"CanvasKit"}),", a WebAssembly (WASM) build of Skia.\nThe CanvasKit WASM file, which is 2.9MB when gzipped, is loaded asynchronously.\nDespite its considerable size, it offers flexibility in determining when and how Skia loads, giving you full control over the user experience."]}),"\n",(0,a.jsxs)(n.p,{children:["We support direct integration with ",(0,a.jsx)(n.a,{href:"#expo",children:"Expo"})," and ",(0,a.jsx)(n.a,{href:"#remotion",children:"Remotion"}),".\nAdditionally, you'll find manual installation steps for any webpack projects."]}),"\n",(0,a.jsx)(n.p,{children:"It should also be mentionned that React Native Skia can be used on projects without the need to install React Native Web."}),"\n",(0,a.jsx)(n.h2,{id:"expo",children:"Expo"}),"\n",(0,a.jsx)(n.admonition,{type:"info",children:(0,a.jsxs)(n.p,{children:["Metro and expo-router support is available from v0.1.240 and onwards.\nIf you are using v0.1.221 (recommended version for Expo SDK 50), you can use ",(0,a.jsx)(n.a,{href:"https://github.com/Shopify/react-native-skia/files/14357144/%40shopify%2Breact-native-skia%2B0.1.221.patch",children:"this patch"})," (using ",(0,a.jsx)(n.a,{href:"https://www.npmjs.com/package/patch-package",children:(0,a.jsx)(n.code,{children:"patch-package"})}),"."]})}),"\n",(0,a.jsxs)(n.p,{children:["Use the ",(0,a.jsx)(n.code,{children:"setup-skia-web"})," script to ensure that the ",(0,a.jsx)(n.code,{children:"canvaskit.wasm"})," file is accessible within your Expo project's public folder.\nIf you're ",(0,a.jsx)(n.a,{href:"#using-a-cdn",children:"loading CanvasKit from a CDN"}),", running the ",(0,a.jsx)(n.code,{children:"setup-skia-web"})," script is unnecessary."]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-bash",children:"$ npx expo install @shopify/react-native-skia\n$ yarn setup-skia-web\n"})}),"\n",(0,a.jsx)(n.admonition,{type:"info",children:(0,a.jsxs)(n.p,{children:["Run ",(0,a.jsx)(n.code,{children:"yarn setup-skia-web"})," each time you upgrade the ",(0,a.jsx)(n.code,{children:"@shopify/react-native-skia"})," package.\nConsider incorporating it into your ",(0,a.jsx)(n.code,{children:"postinstall"})," script for convenience."]})}),"\n",(0,a.jsxs)(n.p,{children:["After setup, choose your method to ",(0,a.jsx)(n.a,{href:"#loading-skia",children:"Load Skia"}),"."]}),"\n",(0,a.jsxs)(n.p,{children:["For projects using Expo Router, you can use ",(0,a.jsx)(n.a,{href:"#using-code-splitting",children:"code-splitting"})," or ",(0,a.jsx)(n.a,{href:"#using-deferred-component-registration",children:"deferred component registration"}),".\nIf you wish to use deferred component registration with Expo Router, you need to create your own ",(0,a.jsx)(n.code,{children:"main"})," property in ",(0,a.jsx)(n.code,{children:"package.json"}),".\nFor instance, if you've created ",(0,a.jsx)(n.code,{children:"index.tsx"})," and ",(0,a.jsx)(n.code,{children:"index.web.tsx"})," in your root directory, update your ",(0,a.jsx)(n.code,{children:"package.json"})," accordingly:"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-patch",children:'-  "main": "expo-router/entry",\n+  "main": "index",\n'})}),"\n",(0,a.jsxs)(n.p,{children:["Below is an example of ",(0,a.jsx)(n.code,{children:"index.web.tsx"}),":"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-tsx",children:"import '@expo/metro-runtime';\nimport { App } from 'expo-router/build/qualified-entry';\nimport { renderRootComponent } from 'expo-router/build/renderRootComponent';\n\nimport { LoadSkiaWeb } from '@shopify/react-native-skia/lib/module/web';\n\nLoadSkiaWeb().then(async () => {\n  renderRootComponent(App);\n});\n"})}),"\n",(0,a.jsxs)(n.p,{children:["For the ",(0,a.jsx)(n.code,{children:"index.tsx"})," file, directly invoke ",(0,a.jsx)(n.code,{children:"renderRootComponent(App)"}),"."]}),"\n",(0,a.jsx)(n.h3,{id:"snack",children:"Snack"}),"\n",(0,a.jsxs)(n.p,{children:["Utilize the ",(0,a.jsx)(n.a,{href:"#using-code-splitting",children:"code-splitting"})," method for incorporating React Native Skia on ",(0,a.jsx)(n.a,{href:"https://snack.expo.dev/",children:"snack"}),"."]}),"\n",(0,a.jsx)(c,{id:"@wcandillon/hello-snack"}),"\n",(0,a.jsx)(n.h2,{id:"remotion",children:"Remotion"}),"\n",(0,a.jsxs)(n.p,{children:["Follow these ",(0,a.jsx)(n.a,{href:"https://remotion.dev/skia",children:"installation steps"})," to use React Native Skia with Remotion."]}),"\n",(0,a.jsx)(n.h2,{id:"loading-skia",children:"Loading Skia"}),"\n",(0,a.jsx)(n.p,{children:"Ensure Skia is fully loaded and initialized before importing the Skia module.\nTwo methods facilitate Skia's loading:"}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"<WithSkiaWeb />"})," for code-splitting, delaying the loading of Skia-importing components."]}),"\n",(0,a.jsxs)(n.li,{children:[(0,a.jsx)(n.code,{children:"LoadSkiaWeb()"})," to defer root component registration until Skia loads."]}),"\n"]}),"\n",(0,a.jsx)(n.h3,{id:"using-code-splitting",children:"Using Code-Splitting"}),"\n",(0,a.jsxs)(n.p,{children:["The ",(0,a.jsx)(n.code,{children:"<WithSkiaWeb>"})," component utilizes ",(0,a.jsx)(n.a,{href:"https://reactjs.org/docs/code-splitting.html",children:"code splitting"})," to preload Skia.\nThe following example demonstrates preloading Skia before rendering the ",(0,a.jsx)(n.code,{children:"MySkiaComponent"}),":"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-tsx",children:'import React from \'react\';\nimport { Text } from "react-native";\nimport { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";\n\nexport default function App() {\n  return (\n    <WithSkiaWeb\n      // import() uses the default export of MySkiaComponent.tsx\n      getComponent={() => import("@/components/MySkiaComponent")}\n      fallback={<Text>Loading Skia...</Text>}\n    />\n  );\n}\n'})}),"\n",(0,a.jsx)(n.admonition,{type:"info",children:(0,a.jsx)(n.p,{children:"When using expo router in dev mode you cannot load components that are inside the app directory, as they will get evaluated by the router before CanvasKit is loaded.\nMake sure the component to load lies outside the 'app' directory."})}),"\n",(0,a.jsx)(n.h3,{id:"using-deferred-component-registration",children:"Using Deferred Component Registration"}),"\n",(0,a.jsxs)(n.p,{children:["The ",(0,a.jsx)(n.code,{children:"LoadSkiaWeb()"})," function facilitates Skia's loading prior to the React app's initiation.\nBelow is an ",(0,a.jsx)(n.code,{children:"index.web.js"})," example:"]}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-tsx",children:'import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";\n\nLoadSkiaWeb().then(async () => {\n  const App = (await import("./src/App")).default;\n  AppRegistry.registerComponent("Example", () => App);\n});\n'})}),"\n",(0,a.jsx)(n.h2,{id:"using-a-cdn",children:"Using a CDN"}),"\n",(0,a.jsx)(n.p,{children:"Below, CanvasKit loads via code-splitting from a CDN.\nIt is critical that the CDN-hosted CanvasKit version aligns with React Native Skia's requirements."}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-tsx",children:'import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";\nimport { version } from \'canvaskit-wasm/package.json\';\n\nexport default function App() {\n  return (\n    <WithSkiaWeb\n      opts={{ locateFile: (file) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${version}/bin/full/${file}` }}\n      getComponent={() => import("./MySkiaComponent")}\n  );\n}\n'})}),"\n",(0,a.jsx)(n.p,{children:"Alternatively, use deferred component registration:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-tsx",children:'import { LoadSkiaWeb } from "@shopify/react-native-skia/lib/module/web";\nimport { version } from \'canvaskit-wasm/package.json\';\n\nLoadSkiaWeb({\n  locateFile: (file) => `https://cdn.jsdelivr.net/npm/canvaskit-wasm@${version}/bin/full/${file}`\n}).then(async () => {\n  const App = (await import("./src/App")).default;\n  AppRegistry.registerComponent("Example", () => App);\n});\n'})}),"\n",(0,a.jsx)(n.h2,{id:"unsupported-features",children:"Unsupported Features"}),"\n",(0,a.jsxs)(n.p,{children:["The following React Native Skia APIs are currently unsupported on React Native Web.\nTo request these features, please submit ",(0,a.jsx)(n.a,{href:"https://github.com/Shopify/react-native-skia/issues/new/choose",children:"a feature request on GitHub"}),"."]}),"\n",(0,a.jsx)(n.p,{children:(0,a.jsx)(n.strong,{children:"Unsupported"})}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.code,{children:"PathEffectFactory.MakeSum()"})}),"\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.code,{children:"PathEffectFactory.MakeCompose()"})}),"\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.code,{children:"PathFactory.MakeFromText()"})}),"\n",(0,a.jsx)(n.li,{children:(0,a.jsx)(n.code,{children:"ShaderFilter"})}),"\n"]}),"\n",(0,a.jsx)(n.h2,{id:"manual-webpack-installation",children:"Manual webpack Installation"}),"\n",(0,a.jsx)(n.p,{children:"To enable React Native Skia on Web using webpack, three key actions are required:"}),"\n",(0,a.jsxs)(n.ul,{children:["\n",(0,a.jsxs)(n.li,{children:["Ensure the ",(0,a.jsx)(n.code,{children:"canvaskit.wasm"})," file is accessible to the build system."]}),"\n",(0,a.jsxs)(n.li,{children:["Configure the build system to resolve the ",(0,a.jsx)(n.code,{children:"fs"})," and ",(0,a.jsx)(n.code,{children:"path"})," node modules, achievable via the ",(0,a.jsx)(n.a,{href:"https://www.npmjs.com/package/node-polyfill-webpack-plugin",children:"node polyfill plugin"}),"."]}),"\n",(0,a.jsxs)(n.li,{children:["Update aliases for ",(0,a.jsx)(n.code,{children:"react-native-reanimated"})," and ",(0,a.jsx)(n.code,{children:"react-native/Libraries/Image/AssetRegistry"})," so webpack can do the bundle."]}),"\n"]}),"\n",(0,a.jsx)(n.p,{children:"Here is an example webpack v5 configuration accommodating React Native Skia:"}),"\n",(0,a.jsx)(n.pre,{children:(0,a.jsx)(n.code,{className:"language-tsx",children:'import fs from "fs";\nimport { sources } from "webpack";\nimport NodePolyfillPlugin from "node-polyfill-webpack-plugin";\n\nconst newConfiguration = {\n  ...currentConfiguration,\n  plugins: [\n    ...currentConfiguration.plugins,\n    // 1. Ensure wasm file availability\n    new (class CopySkiaPlugin {\n      apply(compiler) {\n        compiler.hooks.thisCompilation.tap("AddSkiaPlugin", (compilation) => {\n          compilation.hooks.processAssets.tapPromise(\n            {\n              name: "copy-skia",\n              stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL,\n            },\n            async () => {\n              const src = require.resolve("canvaskit-wasm/bin/full/canvaskit.wasm");\n              if (!compilation.getAsset(src)) {\n                compilation.emitAsset("/canvaskit.wasm", new sources.RawSource(await fs.promises.readFile(src)));\n              }\n            }\n          );\n        });\n      }\n    })(),\n    // 2. Polyfill fs and path modules\n\n\n    new NodePolyfillPlugin()\n  ],\n  alias: {\n    ...currentConfiguration.alias,\n    // 3. Suppress reanimated module warning\n    // This assumes Reanimated is installed, if not you can use false.\n    "react-native-reanimated/package.json": require.resolve(\n      "react-native-reanimated/package.json"\n    ),\n    "react-native-reanimated": require.resolve("react-native-reanimated"),\n    "react-native/Libraries/Image/AssetRegistry": false,\n  },\n}\n'})}),"\n",(0,a.jsxs)(n.p,{children:["Finally, proceed to ",(0,a.jsx)(n.a,{href:"#loading-skia",children:"load Skia"}),"."]})]})}function f(e={}){const{wrapper:n}={...(0,s.R)(),...e.components};return n?(0,a.jsx)(n,{...e,children:(0,a.jsx)(m,{...e})}):m(e)}}}]);