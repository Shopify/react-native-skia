"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[9740],{1298:(a,e,t)=>{t.d(e,{A:()=>n});const n=t.p+"assets/images/text-path-0d14722670ac214830630554763cb7dd.png"},2247:(a,e,t)=>{t.d(e,{xA:()=>i,yg:()=>g});var n=t(4041);function p(a,e,t){return e in a?Object.defineProperty(a,e,{value:t,enumerable:!0,configurable:!0,writable:!0}):a[e]=t,a}function r(a,e){var t=Object.keys(a);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(a);e&&(n=n.filter((function(e){return Object.getOwnPropertyDescriptor(a,e).enumerable}))),t.push.apply(t,n)}return t}function s(a){for(var e=1;e<arguments.length;e++){var t=null!=arguments[e]?arguments[e]:{};e%2?r(Object(t),!0).forEach((function(e){p(a,e,t[e])})):Object.getOwnPropertyDescriptors?Object.defineProperties(a,Object.getOwnPropertyDescriptors(t)):r(Object(t)).forEach((function(e){Object.defineProperty(a,e,Object.getOwnPropertyDescriptor(t,e))}))}return a}function l(a,e){if(null==a)return{};var t,n,p=function(a,e){if(null==a)return{};var t,n,p={},r=Object.keys(a);for(n=0;n<r.length;n++)t=r[n],e.indexOf(t)>=0||(p[t]=a[t]);return p}(a,e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(a);for(n=0;n<r.length;n++)t=r[n],e.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(a,t)&&(p[t]=a[t])}return p}var o=n.createContext({}),y=function(a){var e=n.useContext(o),t=e;return a&&(t="function"==typeof a?a(e):s(s({},e),a)),t},i=function(a){var e=y(a.components);return n.createElement(o.Provider,{value:e},a.children)},m="mdxType",d={inlineCode:"code",wrapper:function(a){var e=a.children;return n.createElement(n.Fragment,{},e)}},c=n.forwardRef((function(a,e){var t=a.components,p=a.mdxType,r=a.originalType,o=a.parentName,i=l(a,["components","mdxType","originalType","parentName"]),m=y(t),c=p,g=m["".concat(o,".").concat(c)]||m[c]||d[c]||r;return t?n.createElement(g,s(s({ref:e},i),{},{components:t})):n.createElement(g,s({ref:e},i))}));function g(a,e){var t=arguments,p=e&&e.mdxType;if("string"==typeof a||p){var r=t.length,s=new Array(r);s[0]=c;var l={};for(var o in e)hasOwnProperty.call(e,o)&&(l[o]=e[o]);l.originalType=a,l[m]="string"==typeof a?a:p,s[1]=l;for(var y=2;y<r;y++)s[y]=t[y];return n.createElement.apply(null,s)}return n.createElement.apply(null,t)}c.displayName="MDXCreateElement"},2332:(a,e,t)=>{t.r(e),t.d(e,{assets:()=>o,contentTitle:()=>s,default:()=>d,frontMatter:()=>r,metadata:()=>l,toc:()=>y});var n=t(9575),p=(t(4041),t(2247));const r={id:"path",title:"Text Path",sidebar_label:"Text Path",slug:"/text/path"},s=void 0,l={unversionedId:"text/path",id:"text/path",title:"Text Path",description:"Draws text along a path.",source:"@site/docs/text/path.md",sourceDirName:"text",slug:"/text/path",permalink:"/react-native-skia/docs/text/path",draft:!1,editUrl:"https://github.com/shopify/react-native-skia/edit/main/docs/docs/text/path.md",tags:[],version:"current",frontMatter:{id:"path",title:"Text Path",sidebar_label:"Text Path",slug:"/text/path"},sidebar:"tutorialSidebar",previous:{title:"Glyphs",permalink:"/react-native-skia/docs/text/glyphs"},next:{title:"Text Blob",permalink:"/react-native-skia/docs/text/blob"}},o={},y=[{value:"Example",id:"example",level:2}],i={toc:y},m="wrapper";function d(a){let{components:e,...r}=a;return(0,p.yg)(m,(0,n.A)({},i,r,{components:e,mdxType:"MDXLayout"}),(0,p.yg)("p",null,"Draws text along a path."),(0,p.yg)("table",null,(0,p.yg)("thead",{parentName:"table"},(0,p.yg)("tr",{parentName:"thead"},(0,p.yg)("th",{parentName:"tr",align:"left"},"Name"),(0,p.yg)("th",{parentName:"tr",align:"left"},"Type"),(0,p.yg)("th",{parentName:"tr",align:"left"},"Description"))),(0,p.yg)("tbody",{parentName:"table"},(0,p.yg)("tr",{parentName:"tbody"},(0,p.yg)("td",{parentName:"tr",align:"left"},"path"),(0,p.yg)("td",{parentName:"tr",align:"left"},(0,p.yg)("inlineCode",{parentName:"td"},"Path")," or ",(0,p.yg)("inlineCode",{parentName:"td"},"string")),(0,p.yg)("td",{parentName:"tr",align:"left"},"Path to draw. Can be a string using the ",(0,p.yg)("a",{parentName:"td",href:"https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths#line_commands"},"SVG Path notation")," or an object created with ",(0,p.yg)("inlineCode",{parentName:"td"},"Skia.Path.Make()"))),(0,p.yg)("tr",{parentName:"tbody"},(0,p.yg)("td",{parentName:"tr",align:"left"},"text"),(0,p.yg)("td",{parentName:"tr",align:"left"},(0,p.yg)("inlineCode",{parentName:"td"},"string")),(0,p.yg)("td",{parentName:"tr",align:"left"},"Text to draw")),(0,p.yg)("tr",{parentName:"tbody"},(0,p.yg)("td",{parentName:"tr",align:"left"},"font"),(0,p.yg)("td",{parentName:"tr",align:"left"},(0,p.yg)("inlineCode",{parentName:"td"},"SkFont")),(0,p.yg)("td",{parentName:"tr",align:"left"},"Font to use")))),(0,p.yg)("h2",{id:"example"},"Example"),(0,p.yg)("div",{className:"shiki-twoslash-fragment"},(0,p.yg)("pre",{parentName:"div",className:"shiki min-light twoslash lsp",style:{backgroundColor:"#ffffff",color:"#24292eff"}},(0,p.yg)("div",{parentName:"pre",className:"language-id"},"tsx"),(0,p.yg)("div",{parentName:"pre",className:"code-container"},(0,p.yg)("code",{parentName:"div"},(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"import"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," {",(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Canvas: ({ debug, opaque, children, onSize, onLayout: _onLayout, ref, ...viewProps }: CanvasProps) => React.JSX.Element\nimport Canvas"},"Canvas")),(0,p.yg)("span",{parentName:"div",style:{color:"#212121"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Group: ({ layer, ...props }: SkiaProps<PublicGroupProps>) => React.JSX.Element\nimport Group"},"Group")),(0,p.yg)("span",{parentName:"div",style:{color:"#212121"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,p.yg)("data-lsp",{parentName:"span",lsp:'(alias) const TextPath: ({ initialOffset, ...props }: SkiaDefaultProps<TextPathProps, "initialOffset">) => React.JSX.Element\nimport TextPath'},"TextPath")),(0,p.yg)("span",{parentName:"div",style:{color:"#212121"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: Skia\nimport Skia"},"Skia")),(0,p.yg)("span",{parentName:"div",style:{color:"#212121"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const useFont: (font: DataSourceParam, size?: number, onError?: (err: Error) => void) => SkFont | null\nimport useFont"},"useFont")),(0,p.yg)("span",{parentName:"div",style:{color:"#212121"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const vec: (x?: number, y?: number) => SkPoint\nimport vec"},"vec")),(0,p.yg)("span",{parentName:"div",style:{color:"#212121"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Fill: (props: SkiaProps<DrawingNodeProps>) => React.JSX.Element\nimport Fill"},"Fill"),"} "),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"from"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#22863A"}},'"@shopify/react-native-skia"'),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},";")),(0,p.yg)("div",{parentName:"code",className:"line"},"\xa0"),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"const"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const size: 128"},"size")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},"128"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},";")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"const"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const path: SkPath"},"path")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: Skia\nimport Skia"},"Skia")),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},"."),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) Skia.Path: PathFactory"},"Path")),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},".",(0,p.yg)("data-lsp",{parentName:"span",lsp:"(method) PathFactory.Make(): SkPath"},"Make")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"();")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const path: SkPath"},"path")),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},".",(0,p.yg)("data-lsp",{parentName:"span",lsp:"(method) SkPath.addCircle(x: number, y: number, r: number): SkPath"},"addCircle")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"(",(0,p.yg)("data-lsp",{parentName:"span",lsp:"const size: 128"},"size")),(0,p.yg)("span",{parentName:"div",style:{color:"#212121"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,p.yg)("data-lsp",{parentName:"span",lsp:"const size: 128"},"size")),(0,p.yg)("span",{parentName:"div",style:{color:"#212121"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,p.yg)("data-lsp",{parentName:"span",lsp:"const size: 128"},"size")),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"/"),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},"2"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},");")),(0,p.yg)("div",{parentName:"code",className:"line"},"\xa0"),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"export"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"const"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const HelloWorld: () => React.JSX.Element"},"HelloWorld")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," () "),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"=>"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," {")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"  "),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"const"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const font: SkFont | null"},"font")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) useFont(font: DataSourceParam, size?: number, onError?: (err: Error) => void): SkFont | null\nimport useFont"},"useFont")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"("),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"var require: NodeRequire\n(id: string) => any"},"require")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"("),(0,p.yg)("span",{parentName:"div",style:{color:"#22863A"}},'"./my-font.ttf"'),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},")"),(0,p.yg)("span",{parentName:"div",style:{color:"#212121"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},"24"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},");")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"  "),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"return"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," (")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"    <"),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Canvas: ({ debug, opaque, children, onSize, onLayout: _onLayout, ref, ...viewProps }: CanvasProps) => React.JSX.Element\nimport Canvas"},"Canvas")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) ViewProps.style?: StyleProp<ViewStyle>"},"style")),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"{{ ",(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) FlexStyle.flex?: number | undefined"},"flex")),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},":"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},"1"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," }}>")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"      <"),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Fill: (props: SkiaProps<DrawingNodeProps>) => React.JSX.Element\nimport Fill"},"Fill")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) color?: AnimatedProp<Color | undefined>"},"color")),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#22863A"}},'"white"'),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," />")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"      <"),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Group: ({ layer, ...props }: SkiaProps<PublicGroupProps>) => React.JSX.Element\nimport Group"},"Group")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) transform?: AnimatedProp<Transforms3d | undefined>"},"transform")),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"{[{ ",(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) rotate: number"},"rotate")),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},":"),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"var Math: Math"},"Math")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"."),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) Math.PI: number"},"PI")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," }]} "),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) origin?: AnimatedProp<SkPoint | undefined>"},"origin")),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"{"),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) vec(x?: number, y?: number): SkPoint\nimport vec"},"vec")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"(",(0,p.yg)("data-lsp",{parentName:"span",lsp:"const size: 128"},"size")),(0,p.yg)("span",{parentName:"div",style:{color:"#212121"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,p.yg)("data-lsp",{parentName:"span",lsp:"const size: 128"},"size"),")}>")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"        <"),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:'(alias) const TextPath: ({ initialOffset, ...props }: SkiaDefaultProps<TextPathProps, "initialOffset">) => React.JSX.Element\nimport TextPath'},"TextPath")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) font: AnimatedProp<SkFont | null>"},"font")),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"{",(0,p.yg)("data-lsp",{parentName:"span",lsp:"const font: SkFont | null"},"font"),"} "),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) path: AnimatedProp<PathDef>"},"path")),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"{",(0,p.yg)("data-lsp",{parentName:"span",lsp:"const path: SkPath"},"path"),"} "),(0,p.yg)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) text: AnimatedProp<string>"},"text")),(0,p.yg)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#22863A"}},'"Hello World!"'),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}}," />")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"      </"),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Group: ({ layer, ...props }: SkiaProps<PublicGroupProps>) => React.JSX.Element\nimport Group"},"Group")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},">")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"    </"),(0,p.yg)("span",{parentName:"div",style:{color:"#1976D2"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Canvas: ({ debug, opaque, children, onSize, onLayout: _onLayout, ref, ...viewProps }: CanvasProps) => React.JSX.Element\nimport Canvas"},"Canvas")),(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},">")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"  );")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#24292EFF"}},"};"))))),(0,p.yg)("pre",{parentName:"div",className:"shiki nord twoslash lsp",style:{backgroundColor:"#2e3440ff",color:"#d8dee9ff"}},(0,p.yg)("div",{parentName:"pre",className:"language-id"},"tsx"),(0,p.yg)("div",{parentName:"pre",className:"code-container"},(0,p.yg)("code",{parentName:"div"},(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"import"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},"{"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Canvas: ({ debug, opaque, children, onSize, onLayout: _onLayout, ref, ...viewProps }: CanvasProps) => React.JSX.Element\nimport Canvas"},"Canvas")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Group: ({ layer, ...props }: SkiaProps<PublicGroupProps>) => React.JSX.Element\nimport Group"},"Group")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:'(alias) const TextPath: ({ initialOffset, ...props }: SkiaDefaultProps<TextPathProps, "initialOffset">) => React.JSX.Element\nimport TextPath'},"TextPath")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: Skia\nimport Skia"},"Skia")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const useFont: (font: DataSourceParam, size?: number, onError?: (err: Error) => void) => SkFont | null\nimport useFont"},"useFont")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const vec: (x?: number, y?: number) => SkPoint\nimport vec"},"vec")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Fill: (props: SkiaProps<DrawingNodeProps>) => React.JSX.Element\nimport Fill"},"Fill")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},"}"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"from"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,p.yg)("span",{parentName:"div",style:{color:"#A3BE8C"}},"@shopify/react-native-skia"),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,p.yg)("div",{parentName:"code",className:"line"},"\xa0"),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"const"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const size: 128"},"size")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#B48EAD"}},"128"),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"const"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const path: SkPath"},"path")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: Skia\nimport Skia"},"Skia")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},"."),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) Skia.Path: PathFactory"},"Path")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},"."),(0,p.yg)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(method) PathFactory.Make(): SkPath"},"Make")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"()"),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const path: SkPath"},"path")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},"."),(0,p.yg)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(method) SkPath.addCircle(x: number, y: number, r: number): SkPath"},"addCircle")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"("),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const size: 128"},"size")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const size: 128"},"size")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const size: 128"},"size")),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"/"),(0,p.yg)("span",{parentName:"div",style:{color:"#B48EAD"}},"2"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},")"),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,p.yg)("div",{parentName:"code",className:"line"},"\xa0"),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"export"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"const"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const HelloWorld: () => React.JSX.Element"},"HelloWorld")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},"()"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"=>"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},"{")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"const"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const font: SkFont | null"},"font")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) useFont(font: DataSourceParam, size?: number, onError?: (err: Error) => void): SkFont | null\nimport useFont"},"useFont")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"("),(0,p.yg)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"var require: NodeRequire\n(id: string) => any"},"require")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"("),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,p.yg)("span",{parentName:"div",style:{color:"#A3BE8C"}},"./my-font.ttf"),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},")"),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#B48EAD"}},"24"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},")"),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"return"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," (")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"    "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"<"),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Canvas: ({ debug, opaque, children, onSize, onLayout: _onLayout, ref, ...viewProps }: CanvasProps) => React.JSX.Element\nimport Canvas"},"Canvas")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) ViewProps.style?: StyleProp<ViewStyle>"},"style")),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"={"),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},"{"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) FlexStyle.flex?: number | undefined"},"flex")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},":"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#B48EAD"}},"1"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},"}"),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"}>")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"      "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"<"),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Fill: (props: SkiaProps<DrawingNodeProps>) => React.JSX.Element\nimport Fill"},"Fill")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) color?: AnimatedProp<Color | undefined>"},"color")),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,p.yg)("span",{parentName:"div",style:{color:"#A3BE8C"}},"white"),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"/>")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"      "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"<"),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Group: ({ layer, ...props }: SkiaProps<PublicGroupProps>) => React.JSX.Element\nimport Group"},"Group")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) transform?: AnimatedProp<Transforms3d | undefined>"},"transform")),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"={"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"["),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},"{"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) rotate: number"},"rotate")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},":"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"var Math: Math"},"Math")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},"."),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) Math.PI: number"},"PI")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},"}"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"]"),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"}"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) origin?: AnimatedProp<SkPoint | undefined>"},"origin")),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"={"),(0,p.yg)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) vec(x?: number, y?: number): SkPoint\nimport vec"},"vec")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"("),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const size: 128"},"size")),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const size: 128"},"size")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},")"),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"}>")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"        "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"<"),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:'(alias) const TextPath: ({ initialOffset, ...props }: SkiaDefaultProps<TextPathProps, "initialOffset">) => React.JSX.Element\nimport TextPath'},"TextPath")),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) font: AnimatedProp<SkFont | null>"},"font")),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"={"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const font: SkFont | null"},"font")),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"}"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) path: AnimatedProp<PathDef>"},"path")),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"={"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"const path: SkPath"},"path")),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"}"),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(property) text: AnimatedProp<string>"},"text")),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,p.yg)("span",{parentName:"div",style:{color:"#A3BE8C"}},"Hello World!"),(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"/>")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"      "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"</"),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Group: ({ layer, ...props }: SkiaProps<PublicGroupProps>) => React.JSX.Element\nimport Group"},"Group")),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},">")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"    "),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},"</"),(0,p.yg)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,p.yg)("data-lsp",{parentName:"span",lsp:"(alias) const Canvas: ({ debug, opaque, children, onSize, onLayout: _onLayout, ref, ...viewProps }: CanvasProps) => React.JSX.Element\nimport Canvas"},"Canvas")),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},">")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  )"),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,p.yg)("div",{parentName:"code",className:"line"},(0,p.yg)("span",{parentName:"div",style:{color:"#ECEFF4"}},"}"),(0,p.yg)("span",{parentName:"div",style:{color:"#81A1C1"}},";")))))),(0,p.yg)("img",{src:t(1298).A,width:"256",height:"256"}))}d.isMDXComponent=!0}}]);