"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[4119],{1184:(e,i,n)=>{n.d(i,{R:()=>r,x:()=>a});var t=n(4041);const d={},s=t.createContext(d);function r(e){const i=t.useContext(s);return t.useMemo((function(){return"function"==typeof e?e(i):{...i,...e}}),[i,e])}function a(e){let i;return i=e.disableParentContext?"function"==typeof e.components?e.components(d):e.components||d:r(e.components),t.createElement(s.Provider,{value:i},e.children)}},9522:(e,i,n)=>{n.r(i),n.d(i,{assets:()=>o,contentTitle:()=>a,default:()=>h,frontMatter:()=>r,metadata:()=>t,toc:()=>l});const t=JSON.parse('{"id":"getting-started/bundle-size","title":"Bundle Size","description":"Below is the app size increase to be expected when adding React Native Skia to your project.","source":"@site/docs/getting-started/bundle-size.md","sourceDirName":"getting-started","slug":"/getting-started/bundle-size","permalink":"/react-native-skia/docs/getting-started/bundle-size","draft":false,"unlisted":false,"editUrl":"https://github.com/shopify/react-native-skia/edit/main/docs/docs/getting-started/bundle-size.md","tags":[],"version":"current","frontMatter":{"id":"bundle-size","title":"Bundle Size","sidebar_label":"Bundle Size","slug":"/getting-started/bundle-size"},"sidebar":"tutorialSidebar","previous":{"title":"Headless","permalink":"/react-native-skia/docs/getting-started/headless"},"next":{"title":"Overview","permalink":"/react-native-skia/docs/canvas/overview"}}');var d=n(1085),s=n(1184);const r={id:"bundle-size",title:"Bundle Size",sidebar_label:"Bundle Size",slug:"/getting-started/bundle-size"},a=void 0,o={},l=[{value:"Android",id:"android",level:2},{value:"Apple",id:"apple",level:3},{value:"NPM Package",id:"npm-package",level:3}];function c(e){const i={a:"a",code:"code",em:"em",h2:"h2",h3:"h3",p:"p",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,s.R)(),...e.components};return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(i.p,{children:"Below is the app size increase to be expected when adding React Native Skia to your project."}),"\n",(0,d.jsxs)(i.table,{children:[(0,d.jsx)(i.thead,{children:(0,d.jsxs)(i.tr,{children:[(0,d.jsx)(i.th,{children:"Apple"}),(0,d.jsx)(i.th,{children:"Android"}),(0,d.jsx)(i.th,{children:"Web"})]})}),(0,d.jsx)(i.tbody,{children:(0,d.jsxs)(i.tr,{children:[(0,d.jsx)(i.td,{children:"6 MB"}),(0,d.jsx)(i.td,{children:"4 MB"}),(0,d.jsx)(i.td,{children:"2.9 MB*"})]})})]}),"\n",(0,d.jsxs)(i.p,{children:["*This figure is the size of the gzipped file served through a CDN (",(0,d.jsx)(i.a,{href:"web",children:"learn more"}),")."]}),"\n",(0,d.jsx)(i.p,{children:"React Native Skia includes both prebuilt library files and C++ files that are compiled and linked with your app when being built - adding to the size of your app."}),"\n",(0,d.jsxs)(i.p,{children:["For a regular arm 64-bit ",(0,d.jsx)(i.strong,{children:"Android"})," device, the increased download size will be around ",(0,d.jsx)(i.strong,{children:"4 MB"})," added after adding React Native Skia - on ",(0,d.jsx)(i.strong,{children:"Apple"}),", the increased download size will be around ",(0,d.jsx)(i.strong,{children:"6 MB"}),"."]}),"\n",(0,d.jsxs)(i.p,{children:["Below is an explanation of how these numbers were found - using a bare-bones React Native app created with ",(0,d.jsx)(i.code,{children:"npx react-native init"})," before and after adding React Native Skia."]}),"\n",(0,d.jsx)(i.h2,{id:"android",children:"Android"}),"\n",(0,d.jsx)(i.p,{children:(0,d.jsxs)(i.em,{children:["On ",(0,d.jsx)(i.em,{children:"Android"})," you should use ",(0,d.jsx)(i.a,{href:"https://developer.android.com/guide/app-bundle",children:"App Bundles"})," to ensure that only the required files are downloaded to your user\u2019s devices."]})}),"\n",(0,d.jsxs)(i.p,{children:["When building an APK in release mode, you will see an increase of 41.3 MB after adding React Native Skia.\nThis is because the library is built for different target architectures.\nIf we take ",(0,d.jsx)(i.code,{children:"arm-64-bit"})," for instance, the ",(0,d.jsx)(i.code,{children:"librnskia.so"})," library file is only around 3,8 MB."]}),"\n",(0,d.jsxs)(i.p,{children:["This implies that if you distribute your apps using ",(0,d.jsx)(i.a,{href:"https://developer.android.com/guide/app-bundle",children:"App Bundles"}),", the increase in download size should be around 4 MB on Android devices when distributed (including an increase of 220 KB to the Javascript Bundle)."]}),"\n",(0,d.jsx)(i.h3,{id:"apple",children:"Apple"}),"\n",(0,d.jsx)(i.p,{children:'Unlike Android, there is no standard way to find the app size increase on iOS - but by archiving and distributing our build using the Ad-Hoc distribution method, we\'ll find some numbers in the report "App Thinning Size.txt":'}),"\n",(0,d.jsxs)(i.p,{children:[(0,d.jsx)(i.strong,{children:"Base app:"})," 2,6 MB compressed, 7,2 MB uncompressed",(0,d.jsx)("br",{}),"\n",(0,d.jsx)(i.strong,{children:"With React Native Skia:"})," 5,2 MB compressed, 13 MB uncompressed"]}),"\n",(0,d.jsx)(i.p,{children:"Meaning that we\u2019ve increased the size of our app by around 5,8 MB after adding React Native Skia. If we add the increased Javascript bundle of about 220 KB, we end up with about 6 MB of increased download size after including React Native Skia."}),"\n",(0,d.jsx)(i.h3,{id:"npm-package",children:"NPM Package"}),"\n",(0,d.jsx)(i.p,{children:"The NPM download is bigger than these numbers indicate because we need to distribute Skia for all target platforms on both iOS and Android."})]})}function h(e={}){const{wrapper:i}={...(0,s.R)(),...e.components};return i?(0,d.jsx)(i,{...e,children:(0,d.jsx)(c,{...e})}):c(e)}}}]);