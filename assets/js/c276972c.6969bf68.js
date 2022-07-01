"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[4237],{3905:function(e,t,a){a.d(t,{Zo:function(){return c},kt:function(){return k}});var n=a(7294);function r(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function o(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,n)}return a}function l(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?o(Object(a),!0).forEach((function(t){r(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):o(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function s(e,t){if(null==e)return{};var a,n,r=function(e,t){if(null==e)return{};var a,n,r={},o=Object.keys(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||(r[a]=e[a]);return r}(e,t);if(Object.getOwnPropertySymbols){var o=Object.getOwnPropertySymbols(e);for(n=0;n<o.length;n++)a=o[n],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(r[a]=e[a])}return r}var p=n.createContext({}),i=function(e){var t=n.useContext(p),a=t;return e&&(a="function"==typeof e?e(t):l(l({},t),e)),a},c=function(e){var t=i(e.components);return n.createElement(p.Provider,{value:t},e.children)},m={inlineCode:"code",wrapper:function(e){var t=e.children;return n.createElement(n.Fragment,{},t)}},d=n.forwardRef((function(e,t){var a=e.components,r=e.mdxType,o=e.originalType,p=e.parentName,c=s(e,["components","mdxType","originalType","parentName"]),d=i(a),k=r,N=d["".concat(p,".").concat(k)]||d[k]||m[k]||o;return a?n.createElement(N,l(l({ref:t},c),{},{components:a})):n.createElement(N,l({ref:t},c))}));function k(e,t){var a=arguments,r=t&&t.mdxType;if("string"==typeof e||r){var o=a.length,l=new Array(o);l[0]=d;var s={};for(var p in t)hasOwnProperty.call(t,p)&&(s[p]=t[p]);s.originalType=e,s.mdxType="string"==typeof e?e:r,l[1]=s;for(var i=2;i<o;i++)l[i]=a[i];return n.createElement.apply(null,l)}return n.createElement.apply(null,a)}d.displayName="MDXCreateElement"},90:function(e,t,a){a.r(t),a.d(t,{assets:function(){return c},contentTitle:function(){return p},default:function(){return k},frontMatter:function(){return s},metadata:function(){return i},toc:function(){return m}});var n=a(3117),r=a(102),o=(a(7294),a(3905)),l=["components"],s={id:"blob",title:"Text Blob",sidebar_label:"Text Blob",slug:"/text/blob"},p=void 0,i={unversionedId:"text/blob",id:"text/blob",title:"Text Blob",description:"A text blob contains glyphs, positions, and paint attributes specific to the text.",source:"@site/docs/text/blob.md",sourceDirName:"text",slug:"/text/blob",permalink:"/react-native-skia/docs/text/blob",editUrl:"https://github.com/shopify/react-native-skia/edit/main/docs/docs/text/blob.md",tags:[],version:"current",frontMatter:{id:"blob",title:"Text Blob",sidebar_label:"Text Blob",slug:"/text/blob"},sidebar:"tutorialSidebar",previous:{title:"Text Path",permalink:"/react-native-skia/docs/text/path"},next:{title:"Language",permalink:"/react-native-skia/docs/shaders/overview"}},c={},m=[{value:"Example",id:"example",level:2}],d={toc:m};function k(e){var t=e.components,a=(0,r.Z)(e,l);return(0,o.kt)("wrapper",(0,n.Z)({},d,a,{components:t,mdxType:"MDXLayout"}),(0,o.kt)("p",null,"A text blob contains glyphs, positions, and paint attributes specific to the text."),(0,o.kt)("table",null,(0,o.kt)("thead",{parentName:"table"},(0,o.kt)("tr",{parentName:"thead"},(0,o.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,o.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,o.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,o.kt)("tbody",{parentName:"table"},(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},"blob"),(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"TextBlob")),(0,o.kt)("td",{parentName:"tr",align:"left"},"Text blob")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},"x?"),(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"number")),(0,o.kt)("td",{parentName:"tr",align:"left"},"x coordinate of the origin of the entire run. Default is 0")),(0,o.kt)("tr",{parentName:"tbody"},(0,o.kt)("td",{parentName:"tr",align:"left"},"y?"),(0,o.kt)("td",{parentName:"tr",align:"left"},(0,o.kt)("inlineCode",{parentName:"td"},"number")),(0,o.kt)("td",{parentName:"tr",align:"left"},"y coordinate of the origin of the entire run. Default is 0")))),(0,o.kt)("h2",{id:"example"},"Example"),(0,o.kt)("div",{className:"shiki-twoslash-fragment"},(0,o.kt)("pre",{parentName:"div",className:"shiki min-light twoslash lsp",style:{backgroundColor:"#ffffff",color:"#24292eff"}},(0,o.kt)("div",{parentName:"pre",className:"language-id"},"tsx"),(0,o.kt)("div",{parentName:"pre",className:"code-container"},(0,o.kt)("code",{parentName:"div"},(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"import"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," {",(0,o.kt)("data-lsp",{parentName:"span",lsp:'(alias) const Canvas: React.ForwardRefExoticComponent<Pick<CanvasProps, "children" | "mode" | "debug" | "onDraw" | "hitSlop" | "onLayout" | "pointerEvents" | "removeClippedSubviews" | "style" | "testID" | "nativeID" | ... 46 more ... | "fontMgr"> & React.RefAttributes<...>>\nimport Canvas'},"Canvas")),(0,o.kt)("span",{parentName:"div",style:{color:"#212121"}},","),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,o.kt)("data-lsp",{parentName:"span",lsp:"(alias) module TextBlob\n(alias) const TextBlob: {\n    (props: AnimatedProps<TextBlobProps>): JSX.Element;\n    defaultProps: {\n        x: number;\n        y: number;\n    };\n}\nimport TextBlob"},"TextBlob")),(0,o.kt)("span",{parentName:"div",style:{color:"#212121"}},","),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,o.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: SkSkiaApi\nimport Skia"},"Skia"),"} "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"from"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#22863A"}},'"@shopify/react-native-skia"'),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},";")),(0,o.kt)("div",{parentName:"code",className:"line"},"\xa0"),(0,o.kt)("div",{parentName:"code",className:"line"},"\xa0"),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"export"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"const"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"const HelloWorld: () => JSX.Element"},"HelloWorld")),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," () "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"=>"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," {")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"const"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"const typeface: SkTypeface | null"},"typeface")),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: SkSkiaApi\nimport Skia"},"Skia")),(0,o.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},"."),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(property) Skia.FontMgr: FontMgrFactory"},"FontMgr")),(0,o.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},".",(0,o.kt)("data-lsp",{parentName:"span",lsp:"(property) FontMgrFactory.RefDefault: () => SkFontMgr"},"RefDefault")),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"()"),(0,o.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},".",(0,o.kt)("data-lsp",{parentName:"span",lsp:"(method) SkFontMgr.matchFamilyStyle(familyName: string, fontStyle?: FontStyle | undefined): SkTypeface | null"},"matchFamilyStyle")),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"("),(0,o.kt)("span",{parentName:"div",style:{color:"#22863A"}},'"helvetica"'),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},");")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"if"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," ("),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"!"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"const typeface: SkTypeface | null"},"typeface"),") {")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"    "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"throw"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"new"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"var Error: ErrorConstructor\nnew (message?: string | undefined) => Error"},"Error")),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"("),(0,o.kt)("span",{parentName:"div",style:{color:"#22863A"}},'"Helvetica not found"'),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},");")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  }")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"const"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"const font: SkFont"},"font")),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: SkSkiaApi\nimport Skia"},"Skia")),(0,o.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},".",(0,o.kt)("data-lsp",{parentName:"span",lsp:"(property) Skia.Font: (typeface?: SkTypeface | undefined, size?: number | undefined) => SkFont"},"Font")),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"(",(0,o.kt)("data-lsp",{parentName:"span",lsp:"const typeface: SkTypeface"},"typeface")),(0,o.kt)("span",{parentName:"div",style:{color:"#212121"}},","),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},"30"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},");")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"const"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"const blob: SkTextBlob"},"blob")),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: SkSkiaApi\nimport Skia"},"Skia")),(0,o.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},"."),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(property) Skia.TextBlob: TextBlobFactory"},"TextBlob")),(0,o.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},".",(0,o.kt)("data-lsp",{parentName:"span",lsp:"(method) TextBlobFactory.MakeFromText(str: string, font: SkFont): SkTextBlob"},"MakeFromText")),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"("),(0,o.kt)("span",{parentName:"div",style:{color:"#22863A"}},'"Hello World!"'),(0,o.kt)("span",{parentName:"div",style:{color:"#212121"}},","),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,o.kt)("data-lsp",{parentName:"span",lsp:"const font: SkFont"},"font"),");")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  "),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"return"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," (")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"      <"),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:'(alias) const Canvas: React.ForwardRefExoticComponent<Pick<CanvasProps, "children" | "mode" | "debug" | "onDraw" | "hitSlop" | "onLayout" | "pointerEvents" | "removeClippedSubviews" | "style" | "testID" | "nativeID" | ... 46 more ... | "fontMgr"> & React.RefAttributes<...>>\nimport Canvas'},"Canvas")),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(JSX attribute) style?: StyleProp<ViewStyle>"},"style")),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"{{ ",(0,o.kt)("data-lsp",{parentName:"span",lsp:"(property) FlexStyle.flex?: number | undefined"},"flex")),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},":"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},"1"),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," }}>")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"        <"),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(alias) module TextBlob\n(alias) const TextBlob: {\n    (props: AnimatedProps<TextBlobProps>): JSX.Element;\n    defaultProps: {\n        x: number;\n        y: number;\n    };\n}\nimport TextBlob"},"TextBlob"))),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"          "),(0,o.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(JSX attribute) blob: SkTextBlob | SkiaValue<SkTextBlob>"},"blob")),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"{",(0,o.kt)("data-lsp",{parentName:"span",lsp:"const blob: SkTextBlob"},"blob"),"}")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"          "),(0,o.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(JSX attribute) color?: Color | SkiaValue<Color | undefined> | undefined"},"color")),(0,o.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,o.kt)("span",{parentName:"div",style:{color:"#22863A"}},'"blue"')),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"        />")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"      </"),(0,o.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:'(alias) const Canvas: React.ForwardRefExoticComponent<Pick<CanvasProps, "children" | "mode" | "debug" | "onDraw" | "hitSlop" | "onLayout" | "pointerEvents" | "removeClippedSubviews" | "style" | "testID" | "nativeID" | ... 46 more ... | "fontMgr"> & React.RefAttributes<...>>\nimport Canvas'},"Canvas")),(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},">")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  );")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"};"))))),(0,o.kt)("pre",{parentName:"div",className:"shiki nord twoslash lsp",style:{backgroundColor:"#2e3440ff",color:"#d8dee9ff"}},(0,o.kt)("div",{parentName:"pre",className:"language-id"},"tsx"),(0,o.kt)("div",{parentName:"pre",className:"code-container"},(0,o.kt)("code",{parentName:"div"},(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"import"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"{"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:'(alias) const Canvas: React.ForwardRefExoticComponent<Pick<CanvasProps, "children" | "mode" | "debug" | "onDraw" | "hitSlop" | "onLayout" | "pointerEvents" | "removeClippedSubviews" | "style" | "testID" | "nativeID" | ... 46 more ... | "fontMgr"> & React.RefAttributes<...>>\nimport Canvas'},"Canvas")),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(alias) module TextBlob\n(alias) const TextBlob: {\n    (props: AnimatedProps<TextBlobProps>): JSX.Element;\n    defaultProps: {\n        x: number;\n        y: number;\n    };\n}\nimport TextBlob"},"TextBlob")),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: SkSkiaApi\nimport Skia"},"Skia")),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"}"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"from"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,o.kt)("span",{parentName:"div",style:{color:"#A3BE8C"}},"@shopify/react-native-skia"),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,o.kt)("div",{parentName:"code",className:"line"},"\xa0"),(0,o.kt)("div",{parentName:"code",className:"line"},"\xa0"),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"export"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"const"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"const HelloWorld: () => JSX.Element"},"HelloWorld")),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"()"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"=>"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"{")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"const"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"const typeface: SkTypeface | null"},"typeface")),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: SkSkiaApi\nimport Skia"},"Skia")),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"."),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(property) Skia.FontMgr: FontMgrFactory"},"FontMgr")),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"."),(0,o.kt)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(property) FontMgrFactory.RefDefault: () => SkFontMgr"},"RefDefault")),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"()"),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"."),(0,o.kt)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(method) SkFontMgr.matchFamilyStyle(familyName: string, fontStyle?: FontStyle | undefined): SkTypeface | null"},"matchFamilyStyle")),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"("),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,o.kt)("span",{parentName:"div",style:{color:"#A3BE8C"}},"helvetica"),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},")"),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"if"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," ("),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"!"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"const typeface: SkTypeface | null"},"typeface")),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},") "),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"{")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"    "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"throw"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"new"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"var Error: ErrorConstructor\nnew (message?: string | undefined) => Error"},"Error")),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"("),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,o.kt)("span",{parentName:"div",style:{color:"#A3BE8C"}},"Helvetica not found"),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},")"),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"}")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"const"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"const font: SkFont"},"font")),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: SkSkiaApi\nimport Skia"},"Skia")),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"."),(0,o.kt)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(property) Skia.Font: (typeface?: SkTypeface | undefined, size?: number | undefined) => SkFont"},"Font")),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"("),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"const typeface: SkTypeface"},"typeface")),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#B48EAD"}},"30"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},")"),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"const"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"const blob: SkTextBlob"},"blob")),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: SkSkiaApi\nimport Skia"},"Skia")),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"."),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(property) Skia.TextBlob: TextBlobFactory"},"TextBlob")),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"."),(0,o.kt)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(method) TextBlobFactory.MakeFromText(str: string, font: SkFont): SkTextBlob"},"MakeFromText")),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"("),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,o.kt)("span",{parentName:"div",style:{color:"#A3BE8C"}},"Hello World!"),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"const font: SkFont"},"font")),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},")"),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"return"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," (")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"      "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"<"),(0,o.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:'(alias) const Canvas: React.ForwardRefExoticComponent<Pick<CanvasProps, "children" | "mode" | "debug" | "onDraw" | "hitSlop" | "onLayout" | "pointerEvents" | "removeClippedSubviews" | "style" | "testID" | "nativeID" | ... 46 more ... | "fontMgr"> & React.RefAttributes<...>>\nimport Canvas'},"Canvas")),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(JSX attribute) style?: StyleProp<ViewStyle>"},"style")),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"={"),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"{"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(property) FlexStyle.flex?: number | undefined"},"flex")),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},":"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#B48EAD"}},"1"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"}"),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"}>")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"        "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"<"),(0,o.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(alias) module TextBlob\n(alias) const TextBlob: {\n    (props: AnimatedProps<TextBlobProps>): JSX.Element;\n    defaultProps: {\n        x: number;\n        y: number;\n    };\n}\nimport TextBlob"},"TextBlob"))),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"          "),(0,o.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(JSX attribute) blob: SkTextBlob | SkiaValue<SkTextBlob>"},"blob")),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"={"),(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"const blob: SkTextBlob"},"blob")),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"}")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"          "),(0,o.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:"(JSX attribute) color?: Color | SkiaValue<Color | undefined> | undefined"},"color")),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,o.kt)("span",{parentName:"div",style:{color:"#A3BE8C"}},"blue"),(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"')),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"        "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"/>")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"      "),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"</"),(0,o.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,o.kt)("data-lsp",{parentName:"span",lsp:'(alias) const Canvas: React.ForwardRefExoticComponent<Pick<CanvasProps, "children" | "mode" | "debug" | "onDraw" | "hitSlop" | "onLayout" | "pointerEvents" | "removeClippedSubviews" | "style" | "testID" | "nativeID" | ... 46 more ... | "fontMgr"> & React.RefAttributes<...>>\nimport Canvas'},"Canvas")),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},">")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  )"),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,o.kt)("div",{parentName:"code",className:"line"},(0,o.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"}"),(0,o.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},";")))))))}k.isMDXComponent=!0}}]);