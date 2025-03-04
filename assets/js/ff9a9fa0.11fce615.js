"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[4119],{1402:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>o,default:()=>c,frontMatter:()=>i,metadata:()=>l,toc:()=>s});var a=n(9575),r=(n(4041),n(2247));const i={id:"bundle-size",title:"Bundle Size",sidebar_label:"Bundle Size",slug:"/getting-started/bundle-size"},o=void 0,l={unversionedId:"getting-started/bundle-size",id:"getting-started/bundle-size",title:"Bundle Size",description:"Below is the app size increase to be expected when adding React Native Skia to your project.",source:"@site/docs/getting-started/bundle-size.md",sourceDirName:"getting-started",slug:"/getting-started/bundle-size",permalink:"/react-native-skia/docs/getting-started/bundle-size",draft:!1,editUrl:"https://github.com/shopify/react-native-skia/edit/main/docs/docs/getting-started/bundle-size.md",tags:[],version:"current",frontMatter:{id:"bundle-size",title:"Bundle Size",sidebar_label:"Bundle Size",slug:"/getting-started/bundle-size"},sidebar:"tutorialSidebar",previous:{title:"Headless",permalink:"/react-native-skia/docs/getting-started/headless"},next:{title:"Overview",permalink:"/react-native-skia/docs/canvas/overview"}},d={},s=[{value:"Android",id:"android",level:2},{value:"Apple",id:"apple",level:3},{value:"NPM Package",id:"npm-package",level:3}],p={toc:s},u="wrapper";function c(e){let{components:t,...n}=e;return(0,r.yg)(u,(0,a.A)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,r.yg)("p",null,"Below is the app size increase to be expected when adding React Native Skia to your project."),(0,r.yg)("table",null,(0,r.yg)("thead",{parentName:"table"},(0,r.yg)("tr",{parentName:"thead"},(0,r.yg)("th",{parentName:"tr",align:null},"Apple"),(0,r.yg)("th",{parentName:"tr",align:null},"Android"),(0,r.yg)("th",{parentName:"tr",align:null},"Web"))),(0,r.yg)("tbody",{parentName:"table"},(0,r.yg)("tr",{parentName:"tbody"},(0,r.yg)("td",{parentName:"tr",align:null},"6 MB"),(0,r.yg)("td",{parentName:"tr",align:null},"4 MB"),(0,r.yg)("td",{parentName:"tr",align:null},"2.9 MB","*")))),(0,r.yg)("p",null,"*","This figure is the size of the gzipped file served through a CDN (",(0,r.yg)("a",{parentName:"p",href:"web"},"learn more"),")."),(0,r.yg)("p",null,"React Native Skia includes both prebuilt library files and C++ files that are compiled and linked with your app when being built - adding to the size of your app."),(0,r.yg)("p",null,"For a regular arm 64-bit ",(0,r.yg)("strong",{parentName:"p"},"Android")," device, the increased download size will be around ",(0,r.yg)("strong",{parentName:"p"},"4 MB")," added after adding React Native Skia - on ",(0,r.yg)("strong",{parentName:"p"},"Apple"),", the increased download size will be around ",(0,r.yg)("strong",{parentName:"p"},"6 MB"),"."),(0,r.yg)("p",null,"Below is an explanation of how these numbers were found - using a bare-bones React Native app created with ",(0,r.yg)("inlineCode",{parentName:"p"},"npx react-native init")," before and after adding React Native Skia."),(0,r.yg)("h2",{id:"android"},"Android"),(0,r.yg)("p",null,(0,r.yg)("em",{parentName:"p"},"On ",(0,r.yg)("em",{parentName:"em"},"Android")," you should use ",(0,r.yg)("a",{parentName:"em",href:"https://developer.android.com/guide/app-bundle"},"App Bundles")," to ensure that only the required files are downloaded to your user\u2019s devices.")),(0,r.yg)("p",null,"When building an APK in release mode, you will see an increase of 41.3 MB after adding React Native Skia.\nThis is because the library is built for different target architectures.\nIf we take ",(0,r.yg)("inlineCode",{parentName:"p"},"arm-64-bit")," for instance, the ",(0,r.yg)("inlineCode",{parentName:"p"},"librnskia.so")," library file is only around 3,8 MB."),(0,r.yg)("p",null,"This implies that if you distribute your apps using ",(0,r.yg)("a",{parentName:"p",href:"https://developer.android.com/guide/app-bundle"},"App Bundles"),", the increase in download size should be around 4 MB on Android devices when distributed (including an increase of 220 KB to the Javascript Bundle)."),(0,r.yg)("h3",{id:"apple"},"Apple"),(0,r.yg)("p",null,'Unlike Android, there is no standard way to find the app size increase on iOS - but by archiving and distributing our build using the Ad-Hoc distribution method, we\'ll find some numbers in the report "App Thinning Size.txt":'),(0,r.yg)("p",null,(0,r.yg)("strong",{parentName:"p"},"Base app:")," 2,6 MB compressed, 7,2 MB uncompressed",(0,r.yg)("br",null),"\n",(0,r.yg)("strong",{parentName:"p"},"With React Native Skia:")," 5,2 MB compressed, 13 MB uncompressed"),(0,r.yg)("p",null,"Meaning that we\u2019ve increased the size of our app by around 5,8 MB after adding React Native Skia. If we add the increased Javascript bundle of about 220 KB, we end up with about 6 MB of increased download size after including React Native Skia."),(0,r.yg)("h3",{id:"npm-package"},"NPM Package"),(0,r.yg)("p",null,"The NPM download is bigger than these numbers indicate because we need to distribute Skia for all target platforms on both iOS and Android."))}c.isMDXComponent=!0},2247:(e,t,n)=>{n.d(t,{xA:()=>p,yg:()=>y});var a=n(4041);function r(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function i(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);t&&(a=a.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,a)}return n}function o(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?i(Object(n),!0).forEach((function(t){r(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):i(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function l(e,t){if(null==e)return{};var n,a,r=function(e,t){if(null==e)return{};var n,a,r={},i=Object.keys(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||(r[n]=e[n]);return r}(e,t);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(a=0;a<i.length;a++)n=i[a],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(r[n]=e[n])}return r}var d=a.createContext({}),s=function(e){var t=a.useContext(d),n=t;return e&&(n="function"==typeof e?e(t):o(o({},t),e)),n},p=function(e){var t=s(e.components);return a.createElement(d.Provider,{value:t},e.children)},u="mdxType",c={inlineCode:"code",wrapper:function(e){var t=e.children;return a.createElement(a.Fragment,{},t)}},g=a.forwardRef((function(e,t){var n=e.components,r=e.mdxType,i=e.originalType,d=e.parentName,p=l(e,["components","mdxType","originalType","parentName"]),u=s(n),g=r,y=u["".concat(d,".").concat(g)]||u[g]||c[g]||i;return n?a.createElement(y,o(o({ref:t},p),{},{components:n})):a.createElement(y,o({ref:t},p))}));function y(e,t){var n=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var i=n.length,o=new Array(i);o[0]=g;var l={};for(var d in t)hasOwnProperty.call(t,d)&&(l[d]=t[d]);l.originalType=e,l[u]="string"==typeof e?e:r,o[1]=l;for(var s=2;s<i;s++)o[s]=n[s];return a.createElement.apply(null,o)}return a.createElement.apply(null,n)}g.displayName="MDXCreateElement"}}]);