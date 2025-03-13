"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[7924],{1184:(e,n,t)=>{t.d(n,{R:()=>a,x:()=>o});var i=t(4041);const s={},r=i.createContext(s);function a(e){const n=i.useContext(r);return i.useMemo((function(){return"function"==typeof e?e(n):{...n,...e}}),[n,e])}function o(e){let n;return n=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:a(e.components),i.createElement(r.Provider,{value:n},e.children)}},4376:(e,n,t)=>{t.r(n),t.d(n,{assets:()=>d,contentTitle:()=>o,default:()=>h,frontMatter:()=>a,metadata:()=>i,toc:()=>l});const i=JSON.parse('{"id":"getting-started/installation","title":"Installation","description":"React Native Skia brings the Skia Graphics Library to React Native.","source":"@site/docs/getting-started/installation.md","sourceDirName":"getting-started","slug":"/getting-started/installation","permalink":"/react-native-skia/docs/getting-started/installation","draft":false,"unlisted":false,"editUrl":"https://github.com/shopify/react-native-skia/edit/main/docs/docs/getting-started/installation.md","tags":[],"version":"current","frontMatter":{"id":"installation","title":"Installation","sidebar_label":"Installation","slug":"/getting-started/installation"},"sidebar":"tutorialSidebar","next":{"title":"Hello World","permalink":"/react-native-skia/docs/getting-started/hello-world"}}');var s=t(1085),r=t(1184);const a={id:"installation",title:"Installation",sidebar_label:"Installation",slug:"/getting-started/installation"},o=void 0,d={},l=[{value:"Bundle Size",id:"bundle-size",level:3},{value:"iOS",id:"ios",level:2},{value:"Android",id:"android",level:2},{value:"Proguard",id:"proguard",level:3},{value:"TroubleShooting",id:"troubleshooting",level:3},{value:"Web",id:"web",level:2},{value:"TV",id:"tv",level:2},{value:"Debugging",id:"debugging",level:2},{value:"Testing with Jest",id:"testing-with-jest",level:2},{value:"ESM Setup",id:"esm-setup",level:3},{value:"CommonJS Setup",id:"commonjs-setup",level:3},{value:"Playground",id:"playground",level:2}];function c(e){const n={a:"a",admonition:"admonition",code:"code",em:"em",h2:"h2",h3:"h3",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,r.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(n.p,{children:["React Native Skia brings the ",(0,s.jsx)(n.a,{href:"https://skia.org/",children:"Skia Graphics Library"})," to React Native.\nSkia serves as the graphics engine for Google Chrome and Chrome OS, Android, Flutter, Mozilla Firefox, Firefox OS, and many other products."]}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.strong,{children:"Version compatibility:"}),"\n",(0,s.jsx)(n.code,{children:"react-native@>=0.71"})," and ",(0,s.jsx)(n.code,{children:"react@>=18"})," are required. ",(0,s.jsx)("br",{}),"\nIn addition you should make sure you're on at least ",(0,s.jsx)(n.code,{children:"iOS 13"})," and ",(0,s.jsx)(n.code,{children:"Android API level 21"})," or above. ",(0,s.jsx)("br",{}),"\nTo use React Native Skia with the new architecture, ",(0,s.jsx)(n.code,{children:"react-native@>=0.72"})," is required. ",(0,s.jsx)("br",{}),"\nTo use React Native Skia with video support, ",(0,s.jsx)(n.code,{children:"Android API level 26"})," or above is required."]}),"\n",(0,s.jsxs)(n.p,{children:["For ",(0,s.jsx)(n.code,{children:"react-native@>=0.78"})," and ",(0,s.jsx)(n.code,{children:"react@>=19"}),", you need to use ",(0,s.jsx)(n.code,{children:"@shopify/react-native-skia@next"}),"."]}),"\n",(0,s.jsxs)(n.p,{children:[(0,s.jsx)(n.code,{children:"tvOS >= 13"})," is also supported."]}),"\n",(0,s.jsxs)(n.p,{children:["Skia has a new experimental backend named Graphite which runs on Vulkan and Metal.\nWe currently are working on a new version of React Native Skia that uses this new backend.\nFor Graphite to run, you will need to use ",(0,s.jsx)(n.code,{children:"Android API level 26"})," and ",(0,s.jsx)(n.code,{children:"iOS 15.1"})," or above."]}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Install the library using yarn:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sh",children:"yarn add @shopify/react-native-skia\n"})}),"\n",(0,s.jsx)(n.p,{children:(0,s.jsx)(n.strong,{children:"Or using npm:"})}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-sh",children:"npm install @shopify/react-native-skia\n"})}),"\n",(0,s.jsx)(n.h3,{id:"bundle-size",children:"Bundle Size"}),"\n",(0,s.jsxs)(n.p,{children:["Below is the app size increase to be expected when adding React Native Skia to your project (",(0,s.jsx)(n.a,{href:"bundle-size",children:"learn more"}),")."]}),"\n",(0,s.jsxs)(n.table,{children:[(0,s.jsx)(n.thead,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.th,{children:"iOS"}),(0,s.jsx)(n.th,{children:"Android"}),(0,s.jsx)(n.th,{children:"Web"})]})}),(0,s.jsx)(n.tbody,{children:(0,s.jsxs)(n.tr,{children:[(0,s.jsx)(n.td,{children:"6 MB"}),(0,s.jsx)(n.td,{children:"4 MB"}),(0,s.jsx)(n.td,{children:"2.9 MB"})]})})]}),"\n",(0,s.jsx)(n.h2,{id:"ios",children:"iOS"}),"\n",(0,s.jsxs)(n.p,{children:["Run ",(0,s.jsx)(n.code,{children:"pod install"})," on the ",(0,s.jsx)(n.code,{children:"ios/"})," directory."]}),"\n",(0,s.jsx)(n.h2,{id:"android",children:"Android"}),"\n",(0,s.jsxs)(n.p,{children:["Currently, you will need Android NDK to be installed.\nIf you have Android Studio installed, make sure ",(0,s.jsx)(n.code,{children:"$ANDROID_NDK"})," is available.\n",(0,s.jsx)(n.code,{children:"ANDROID_NDK=/Users/username/Library/Android/sdk/ndk/<version>"})," for instance."]}),"\n",(0,s.jsxs)(n.p,{children:["If the NDK is not installed, you can install it via Android Studio by going to the menu ",(0,s.jsx)(n.em,{children:"File > Project Structure"})]}),"\n",(0,s.jsxs)(n.p,{children:["And then the ",(0,s.jsx)(n.em,{children:"SDK Location"})," section. It will show you the NDK path, or the option to download it if you don't have it installed."]}),"\n",(0,s.jsx)(n.h3,{id:"proguard",children:"Proguard"}),"\n",(0,s.jsxs)(n.p,{children:["If you're using Proguard, make sure to add the following rule at ",(0,s.jsx)(n.code,{children:"proguard-rules.pro"}),":"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{children:"-keep class com.shopify.reactnative.skia.** { *; }\n"})}),"\n",(0,s.jsx)(n.h3,{id:"troubleshooting",children:"TroubleShooting"}),"\n",(0,s.jsxs)(n.p,{children:["For error ",(0,s.jsx)(n.strong,{children:(0,s.jsx)(n.em,{children:"CMake 'X.X.X' was not found in SDK, PATH, or by cmake.dir property."})})]}),"\n",(0,s.jsxs)(n.p,{children:["open ",(0,s.jsx)(n.em,{children:"Tools > SDK Manager"}),", switch to the ",(0,s.jsx)(n.em,{children:"SDK Tools"})," tab.\nFind ",(0,s.jsx)(n.code,{children:"CMake"})," and click ",(0,s.jsx)(n.em,{children:"Show Package Details"})," and download compatiable version ",(0,s.jsx)(n.strong,{children:"'X.X.X'"}),", and apply to install."]}),"\n",(0,s.jsx)(n.h2,{id:"web",children:"Web"}),"\n",(0,s.jsxs)(n.p,{children:["To use this library in the browser, see ",(0,s.jsx)(n.a,{href:"/docs/getting-started/web",children:"these instructions"}),"."]}),"\n",(0,s.jsx)(n.h2,{id:"tv",children:"TV"}),"\n",(0,s.jsxs)(n.p,{children:["Starting from version ",(0,s.jsx)(n.a,{href:"https://github.com/Shopify/react-native-skia/releases/tag/v1.9.0",children:"1.9.0"})," React Native Skia supports running on TV devices using ",(0,s.jsx)(n.a,{href:"https://github.com/react-native-tvos/react-native-tvos",children:"React Native TVOS"}),".\nCurrently both Android TV and Apple TV are supported."]}),"\n",(0,s.jsx)(n.admonition,{type:"info",children:(0,s.jsxs)(n.p,{children:["Not all features have been tested yet, so please ",(0,s.jsx)(n.a,{href:"https://github.com/Shopify/react-native-skia/issues",children:"report"})," any issues you encounter when using React Native Skia on TV devices."]})}),"\n",(0,s.jsx)(n.h2,{id:"debugging",children:"Debugging"}),"\n",(0,s.jsxs)(n.p,{children:["We recommend using React Native DevTools to debug your JS code \u2014 see the ",(0,s.jsx)(n.a,{href:"https://reactnative.dev/docs/debugging",children:"React Native docs"}),". Alternatively, you can debug both JS and platform code in VS Code and via native IDEs. If using VS Code, we recommend ",(0,s.jsx)(n.a,{href:"https://github.com/expo/vscode-expo",children:"Expo Tools"}),", ",(0,s.jsx)(n.a,{href:"https://ide.swmansion.com/",children:"Radon IDE"}),", or Microsoft's ",(0,s.jsx)(n.a,{href:"https://marketplace.visualstudio.com/items?itemName=msjsdiag.vscode-react-native#debugging-react-native-applications",children:"React Native Tools"}),"."]}),"\n",(0,s.jsx)(n.h2,{id:"testing-with-jest",children:"Testing with Jest"}),"\n",(0,s.jsx)(n.p,{children:"React Native Skia test mocks use a web implementation that depends on loading CanvasKit."}),"\n",(0,s.jsxs)(n.p,{children:["The very first step is to make sure that your Skia files are not being transformed by jest, for instance, we can add it the ",(0,s.jsx)(n.code,{children:"transformIgnorePatterns"})," directive:"]}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:'"transformIgnorePatterns": [\n  "node_modules/(?!(react-native|react-native.*|@react-native.*|@?react-navigation.*|@shopify/react-native-skia)/)"\n]\n'})}),"\n",(0,s.jsxs)(n.p,{children:["Next, we recommend using ",(0,s.jsx)(n.a,{href:"https://jestjs.io/docs/ecmascript-modules",children:"ESM"}),". To enable ESM support, you need to update your ",(0,s.jsx)(n.code,{children:"jest"})," command to ",(0,s.jsx)(n.code,{children:"node --experimental-vm-modules node_modules/.bin/jest"}),".\nBut we also support ",(0,s.jsx)(n.a,{href:"#commonjs-setup",children:"CommonJS"}),"."]}),"\n",(0,s.jsx)(n.h3,{id:"esm-setup",children:"ESM Setup"}),"\n",(0,s.jsx)(n.p,{children:"To load CanvasKit and subsequently the React Native Skia mock, add the following setup file to your Jest configuration:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:'// notice the extension: .mjs\n"setupFiles": ["@shopify/react-native-skia/jestSetup.mjs"]\n'})}),"\n",(0,s.jsx)(n.h3,{id:"commonjs-setup",children:"CommonJS Setup"}),"\n",(0,s.jsx)(n.p,{children:"We also offer a version of the setup file without ECMAScript modules support. To use this version, add the following setup file to your Jest configuration:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:'// notice the extension: .js\n"setupFiles": ["@shopify/react-native-skia/jestSetup.js"]\n'})}),"\n",(0,s.jsx)(n.p,{children:"With this setup, you need to load the Skia environment in your test. Include the following at the top of your test file:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:"/**\n * @jest-environment @shopify/react-native-skia/jestEnv.mjs\n */\n"})}),"\n",(0,s.jsx)(n.p,{children:"For instance:"}),"\n",(0,s.jsx)(n.pre,{children:(0,s.jsx)(n.code,{className:"language-js",children:'/**\n * @jest-environment @shopify/react-native-skia/jestEnv.mjs\n */\nimport "react-native";\nimport React from "react";\nimport { cleanup, render } from "@testing-library/react-native";\nimport App from "./App";\n\nit("renders correctly", () => {\n  render(<App />);\n});\n\nafterEach(cleanup);\n'})}),"\n",(0,s.jsx)(n.p,{children:"With this configuration, you will have properly set up Jest to work with React Native Skia mocks using either ECMAScript Modules or CommonJS."}),"\n",(0,s.jsx)(n.h2,{id:"playground",children:"Playground"}),"\n",(0,s.jsxs)(n.p,{children:["We have example projects you can play with ",(0,s.jsx)(n.a,{href:"https://github.com/Shopify/react-native-skia/tree/main/apps",children:"here"}),".\nIt would require you first to ",(0,s.jsx)(n.a,{href:"https://github.com/shopify/react-native-skia?tab=readme-ov-file#library-development",children:"build Skia locally"})," first."]})]})}function h(e={}){const{wrapper:n}={...(0,r.R)(),...e.components};return n?(0,s.jsx)(n,{...e,children:(0,s.jsx)(c,{...e})}):c(e)}}}]);