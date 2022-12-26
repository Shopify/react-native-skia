"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[2727],{3905:(e,a,t)=>{t.d(a,{Zo:()=>m,kt:()=>k});var r=t(7294);function n(e,a,t){return a in e?Object.defineProperty(e,a,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[a]=t,e}function s(e,a){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);a&&(r=r.filter((function(a){return Object.getOwnPropertyDescriptor(e,a).enumerable}))),t.push.apply(t,r)}return t}function p(e){for(var a=1;a<arguments.length;a++){var t=null!=arguments[a]?arguments[a]:{};a%2?s(Object(t),!0).forEach((function(a){n(e,a,t[a])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):s(Object(t)).forEach((function(a){Object.defineProperty(e,a,Object.getOwnPropertyDescriptor(t,a))}))}return e}function l(e,a){if(null==e)return{};var t,r,n=function(e,a){if(null==e)return{};var t,r,n={},s=Object.keys(e);for(r=0;r<s.length;r++)t=s[r],a.indexOf(t)>=0||(n[t]=e[t]);return n}(e,a);if(Object.getOwnPropertySymbols){var s=Object.getOwnPropertySymbols(e);for(r=0;r<s.length;r++)t=s[r],a.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(n[t]=e[t])}return n}var o=r.createContext({}),i=function(e){var a=r.useContext(o),t=a;return e&&(t="function"==typeof e?e(a):p(p({},a),e)),t},m=function(e){var a=i(e.components);return r.createElement(o.Provider,{value:a},e.children)},d={inlineCode:"code",wrapper:function(e){var a=e.children;return r.createElement(r.Fragment,{},a)}},c=r.forwardRef((function(e,a){var t=e.components,n=e.mdxType,s=e.originalType,o=e.parentName,m=l(e,["components","mdxType","originalType","parentName"]),c=i(t),k=n,N=c["".concat(o,".").concat(k)]||c[k]||d[k]||s;return t?r.createElement(N,p(p({ref:a},m),{},{components:t})):r.createElement(N,p({ref:a},m))}));function k(e,a){var t=arguments,n=a&&a.mdxType;if("string"==typeof e||n){var s=t.length,p=new Array(s);p[0]=c;var l={};for(var o in a)hasOwnProperty.call(a,o)&&(l[o]=a[o]);l.originalType=e,l.mdxType="string"==typeof e?e:n,p[1]=l;for(var i=2;i<s;i++)p[i]=t[i];return r.createElement.apply(null,p)}return r.createElement.apply(null,t)}c.displayName="MDXCreateElement"},507:(e,a,t)=>{t.r(a),t.d(a,{assets:()=>o,contentTitle:()=>p,default:()=>d,frontMatter:()=>s,metadata:()=>l,toc:()=>i});var r=t(7462),n=(t(7294),t(3905));const s={id:"images",title:"Image Shaders",sidebar_label:"Images",slug:"/shaders/images"},p=void 0,l={unversionedId:"shaders/images",id:"shaders/images",title:"Image Shaders",description:"Image",source:"@site/docs/shaders/images.md",sourceDirName:"shaders",slug:"/shaders/images",permalink:"/react-native-skia/docs/shaders/images",draft:!1,editUrl:"https://github.com/shopify/react-native-skia/edit/main/docs/docs/shaders/images.md",tags:[],version:"current",frontMatter:{id:"images",title:"Image Shaders",sidebar_label:"Images",slug:"/shaders/images"},sidebar:"tutorialSidebar",previous:{title:"Language",permalink:"/react-native-skia/docs/shaders/overview"},next:{title:"Gradients",permalink:"/react-native-skia/docs/shaders/gradients"}},o={},i=[{value:"Image",id:"image",level:2},{value:"Example",id:"example",level:3},{value:"Result",id:"result",level:3}],m={toc:i};function d(e){let{components:a,...s}=e;return(0,n.kt)("wrapper",(0,r.Z)({},m,s,{components:a,mdxType:"MDXLayout"}),(0,n.kt)("h2",{id:"image"},"Image"),(0,n.kt)("p",null,"Returns an image as a shader with the specified tiling.\nIt will use cubic sampling."),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Name"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"image"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"SkImage")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Image instance.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"tx?"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"TileMode")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Can be ",(0,n.kt)("inlineCode",{parentName:"td"},"clamp"),", ",(0,n.kt)("inlineCode",{parentName:"td"},"repeat"),", ",(0,n.kt)("inlineCode",{parentName:"td"},"mirror"),", or ",(0,n.kt)("inlineCode",{parentName:"td"},"decal"),".")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"ty?"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"TileMode")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Can be ",(0,n.kt)("inlineCode",{parentName:"td"},"clamp"),", ",(0,n.kt)("inlineCode",{parentName:"td"},"repeat"),", ",(0,n.kt)("inlineCode",{parentName:"td"},"mirror"),", or ",(0,n.kt)("inlineCode",{parentName:"td"},"decal"),".")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"fm?"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"FilterMode")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Can be ",(0,n.kt)("inlineCode",{parentName:"td"},"linear")," or ",(0,n.kt)("inlineCode",{parentName:"td"},"nearest"),".")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"mm?"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"MipmapMode")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Can be ",(0,n.kt)("inlineCode",{parentName:"td"},"none"),", ",(0,n.kt)("inlineCode",{parentName:"td"},"linear")," or ",(0,n.kt)("inlineCode",{parentName:"td"},"nearest"),".")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"fit?"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Fit")),(0,n.kt)("td",{parentName:"tr",align:"left"},"Calculate the transformation matrix to fit the rectangle defined by ",(0,n.kt)("inlineCode",{parentName:"td"},"fitRect"),". See ",(0,n.kt)("a",{parentName:"td",href:"/docs/images"},"images"),".")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"rect?"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"SkRect")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The destination rectangle to calculate the transformation matrix via the ",(0,n.kt)("inlineCode",{parentName:"td"},"fit")," property.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"transform?"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("inlineCode",{parentName:"td"},"Transforms2d")),(0,n.kt)("td",{parentName:"tr",align:"left"},"see ",(0,n.kt)("a",{parentName:"td",href:"/docs/group#transformations"},"transformations"),".")))),(0,n.kt)("h3",{id:"example"},"Example"),(0,n.kt)("div",{className:"shiki-twoslash-fragment"},(0,n.kt)("pre",{parentName:"div",className:"shiki min-light twoslash lsp",style:{backgroundColor:"#ffffff",color:"#24292eff"}},(0,n.kt)("div",{parentName:"pre",className:"language-id"},"tsx"),(0,n.kt)("div",{parentName:"pre",className:"code-container"},(0,n.kt)("code",{parentName:"div"},(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"import"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," {")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  ",(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Canvas: React.FC<CanvasProps & React.RefAttributes<SkiaDomView>>\nimport Canvas"},"Canvas")),(0,n.kt)("span",{parentName:"div",style:{color:"#212121"}},",")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  ",(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Circle: (props: SkiaProps<CircleProps>) => JSX.Element\nimport Circle"},"Circle")),(0,n.kt)("span",{parentName:"div",style:{color:"#212121"}},",")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  ",(0,n.kt)("data-lsp",{parentName:"span",lsp:'(alias) const ImageShader: ({ tx, ty, fm, mm, fit, transform, ...props }: SkiaDefaultProps<ImageShaderProps, "tx" | "ty" | "fm" | "mm" | "fit" | "transform">) => JSX.Element\nimport ImageShader'},"ImageShader")),(0,n.kt)("span",{parentName:"div",style:{color:"#212121"}},",")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  ",(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: SkSkiaApi\nimport Skia"},"Skia")),(0,n.kt)("span",{parentName:"div",style:{color:"#212121"}},",")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  ",(0,n.kt)("data-lsp",{parentName:"span",lsp:'(alias) const Shader: ({ uniforms, ...props }: SkiaDefaultProps<ShaderProps, "uniforms">) => JSX.Element\nimport Shader'},"Shader")),(0,n.kt)("span",{parentName:"div",style:{color:"#212121"}},",")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  ",(0,n.kt)("data-lsp",{parentName:"span",lsp:'(alias) const useImage: (source: DataSourceParam, onError?: ((err: Error) => void) | undefined) => import("../types").SkImage | null\nimport useImage'},"useImage"))),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"} "),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"from"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#22863A"}},'"@shopify/react-native-skia"'),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},";")),(0,n.kt)("div",{parentName:"code",className:"line"},"\xa0"),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"const"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"const ImageShaderDemo: () => JSX.Element | null"},"ImageShaderDemo")),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," () "),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"=>"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," {")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  "),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"const"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"const image: SkImage | null"},"image")),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) useImage(source: DataSourceParam, onError?: ((err: Error) => void) | undefined): SkImage | null\nimport useImage"},"useImage")),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"("),(0,n.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"var require: NodeRequire\n(id: string) => any"},"require")),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"("),(0,n.kt)("span",{parentName:"div",style:{color:"#22863A"}},'"../../assets/oslo.jpg"'),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"));")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  "),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"if"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," (",(0,n.kt)("data-lsp",{parentName:"span",lsp:"const image: SkImage | null"},"image")," "),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"==="),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},"null"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},") {")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"    "),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"return"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},"null"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},";")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  }")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  "),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"return"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," (")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"    <"),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Canvas: React.FC<CanvasProps & React.RefAttributes<SkiaDomView>>\nimport Canvas"},"Canvas")),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) ViewProps.style?: StyleProp<ViewStyle>"},"style")),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"{{ ",(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) FlexStyle.flex?: number | undefined"},"flex")),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},":"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},"1"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," }}>")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"      <"),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Circle: (props: SkiaProps<CircleProps>) => JSX.Element\nimport Circle"},"Circle")),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) cx: AnimatedProp<number, any>"},"cx")),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"{"),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},"128"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"} "),(0,n.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) cy: AnimatedProp<number, any>"},"cy")),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"{"),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},"128"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"} "),(0,n.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) r: number"},"r")),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"{"),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},"128"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"}>")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"        <"),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:'(alias) const ImageShader: ({ tx, ty, fm, mm, fit, transform, ...props }: SkiaDefaultProps<ImageShaderProps, "tx" | "ty" | "fm" | "mm" | "fit" | "transform">) => JSX.Element\nimport ImageShader'},"ImageShader"))),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"          "),(0,n.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) image: AnimatedProp<SkImage, any>"},"image")),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"{",(0,n.kt)("data-lsp",{parentName:"span",lsp:"const image: SkImage"},"image"),"}")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"          "),(0,n.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) fit?: AnimatedProp<Fit, any> | undefined"},"fit")),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,n.kt)("span",{parentName:"div",style:{color:"#22863A"}},'"cover"')),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"          "),(0,n.kt)("span",{parentName:"div",style:{color:"#6F42C1"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) rect?: AnimatedProp<SkRect | undefined, any>"},"rect")),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},"="),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"{{ ",(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) SkRect.x: number"},"x")),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},":"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},"0"),(0,n.kt)("span",{parentName:"div",style:{color:"#212121"}},","),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) SkRect.y: number"},"y")),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},":"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},"0"),(0,n.kt)("span",{parentName:"div",style:{color:"#212121"}},","),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) SkRect.width: number"},"width")),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},":"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},"256"),(0,n.kt)("span",{parentName:"div",style:{color:"#212121"}},","),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," ",(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) SkRect.height: number"},"height")),(0,n.kt)("span",{parentName:"div",style:{color:"#D32F2F"}},":"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},"256"),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}}," }}")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"        />")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"      </"),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Circle: (props: SkiaProps<CircleProps>) => JSX.Element\nimport Circle"},"Circle")),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},">")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"    </"),(0,n.kt)("span",{parentName:"div",style:{color:"#1976D2"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Canvas: React.FC<CanvasProps & React.RefAttributes<SkiaDomView>>\nimport Canvas"},"Canvas")),(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},">")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"  );")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#24292EFF"}},"};"))))),(0,n.kt)("pre",{parentName:"div",className:"shiki nord twoslash lsp",style:{backgroundColor:"#2e3440ff",color:"#d8dee9ff"}},(0,n.kt)("div",{parentName:"pre",className:"language-id"},"tsx"),(0,n.kt)("div",{parentName:"pre",className:"code-container"},(0,n.kt)("code",{parentName:"div"},(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"import"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"{")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Canvas: React.FC<CanvasProps & React.RefAttributes<SkiaDomView>>\nimport Canvas"},"Canvas")),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},",")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Circle: (props: SkiaProps<CircleProps>) => JSX.Element\nimport Circle"},"Circle")),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},",")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:'(alias) const ImageShader: ({ tx, ty, fm, mm, fit, transform, ...props }: SkiaDefaultProps<ImageShaderProps, "tx" | "ty" | "fm" | "mm" | "fit" | "transform">) => JSX.Element\nimport ImageShader'},"ImageShader")),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},",")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Skia: SkSkiaApi\nimport Skia"},"Skia")),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},",")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:'(alias) const Shader: ({ uniforms, ...props }: SkiaDefaultProps<ShaderProps, "uniforms">) => JSX.Element\nimport Shader'},"Shader")),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},",")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:'(alias) const useImage: (source: DataSourceParam, onError?: ((err: Error) => void) | undefined) => import("../types").SkImage | null\nimport useImage'},"useImage"))),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"}"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"from"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,n.kt)("span",{parentName:"div",style:{color:"#A3BE8C"}},"@shopify/react-native-skia"),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,n.kt)("div",{parentName:"code",className:"line"},"\xa0"),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"const"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"const ImageShaderDemo: () => JSX.Element | null"},"ImageShaderDemo")),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"()"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"=>"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"{")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"const"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"const image: SkImage | null"},"image")),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) useImage(source: DataSourceParam, onError?: ((err: Error) => void) | undefined): SkImage | null\nimport useImage"},"useImage")),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"("),(0,n.kt)("span",{parentName:"div",style:{color:"#88C0D0"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"var require: NodeRequire\n(id: string) => any"},"require")),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"("),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,n.kt)("span",{parentName:"div",style:{color:"#A3BE8C"}},"../../assets/oslo.jpg"),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"))"),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"if"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," ("),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"const image: SkImage | null"},"image")),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"==="),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"null"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},") "),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"{")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"    "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"return"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"null;")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"}")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"return"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," (")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"    "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"<"),(0,n.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Canvas: React.FC<CanvasProps & React.RefAttributes<SkiaDomView>>\nimport Canvas"},"Canvas")),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) ViewProps.style?: StyleProp<ViewStyle>"},"style")),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"={"),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"{"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) FlexStyle.flex?: number | undefined"},"flex")),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},":"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#B48EAD"}},"1"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"}"),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"}>")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"      "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"<"),(0,n.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Circle: (props: SkiaProps<CircleProps>) => JSX.Element\nimport Circle"},"Circle")),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) cx: AnimatedProp<number, any>"},"cx")),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"={"),(0,n.kt)("span",{parentName:"div",style:{color:"#B48EAD"}},"128"),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"}"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) cy: AnimatedProp<number, any>"},"cy")),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"={"),(0,n.kt)("span",{parentName:"div",style:{color:"#B48EAD"}},"128"),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"}"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) r: number"},"r")),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"={"),(0,n.kt)("span",{parentName:"div",style:{color:"#B48EAD"}},"128"),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"}>")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"        "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"<"),(0,n.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:'(alias) const ImageShader: ({ tx, ty, fm, mm, fit, transform, ...props }: SkiaDefaultProps<ImageShaderProps, "tx" | "ty" | "fm" | "mm" | "fit" | "transform">) => JSX.Element\nimport ImageShader'},"ImageShader"))),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"          "),(0,n.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) image: AnimatedProp<SkImage, any>"},"image")),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"={"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"const image: SkImage"},"image")),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"}")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"          "),(0,n.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) fit?: AnimatedProp<Fit, any> | undefined"},"fit")),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"="),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"'),(0,n.kt)("span",{parentName:"div",style:{color:"#A3BE8C"}},"cover"),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},'"')),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"          "),(0,n.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) rect?: AnimatedProp<SkRect | undefined, any>"},"rect")),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"={"),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"{"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) SkRect.x: number"},"x")),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},":"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#B48EAD"}},"0"),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) SkRect.y: number"},"y")),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},":"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#B48EAD"}},"0"),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) SkRect.width: number"},"width")),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},":"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#B48EAD"}},"256"),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},","),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(property) SkRect.height: number"},"height")),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},":"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#B48EAD"}},"256"),(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}}," "),(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"}"),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"}")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"        "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"/>")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"      "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"</"),(0,n.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Circle: (props: SkiaProps<CircleProps>) => JSX.Element\nimport Circle"},"Circle")),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},">")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"    "),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},"</"),(0,n.kt)("span",{parentName:"div",style:{color:"#8FBCBB"}},(0,n.kt)("data-lsp",{parentName:"span",lsp:"(alias) const Canvas: React.FC<CanvasProps & React.RefAttributes<SkiaDomView>>\nimport Canvas"},"Canvas")),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},">")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#D8DEE9FF"}},"  )"),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},";")),(0,n.kt)("div",{parentName:"code",className:"line"},(0,n.kt)("span",{parentName:"div",style:{color:"#ECEFF4"}},"}"),(0,n.kt)("span",{parentName:"div",style:{color:"#81A1C1"}},";")))))),(0,n.kt)("h3",{id:"result"},"Result"),(0,n.kt)("p",null,(0,n.kt)("img",{alt:"Image Shader",src:t(3298).Z,width:"256",height:"256"})))}d.isMDXComponent=!0},3298:(e,a,t)=>{t.d(a,{Z:()=>r});const r=t.p+"assets/images/image-af0cc4f9cc7aa8468f8cf0f5334250ea.png"}}]);