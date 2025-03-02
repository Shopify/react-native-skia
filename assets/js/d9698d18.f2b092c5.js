"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[8258],{821:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>d,contentTitle:()=>l,default:()=>h,frontMatter:()=>a,metadata:()=>i,toc:()=>o});const i=JSON.parse('{"id":"image-filters/runtime-shader","title":"Runtime Shader","description":"The RuntimeShader image filter allows you to write your own Skia Shader as an image filter.","source":"@site/docs/image-filters/runtime-shader.md","sourceDirName":"image-filters","slug":"/image-filters/runtime-shader","permalink":"/react-native-skia/docs/image-filters/runtime-shader","draft":false,"unlisted":false,"editUrl":"https://github.com/shopify/react-native-skia/edit/main/docs/docs/image-filters/runtime-shader.md","tags":[],"version":"current","frontMatter":{"id":"runtime-shader","title":"Runtime Shader","sidebar_label":"Runtime Shader","slug":"/image-filters/runtime-shader"},"sidebar":"tutorialSidebar","previous":{"title":"Morphology","permalink":"/react-native-skia/docs/image-filters/morphology"},"next":{"title":"Backdrop Filters","permalink":"/react-native-skia/docs/backdrops-filters"}}');var r=n(1085),s=n(1184);const a={id:"runtime-shader",title:"Runtime Shader",sidebar_label:"Runtime Shader",slug:"/image-filters/runtime-shader"},l=void 0,d={},o=[{value:"Example",id:"example",level:2},{value:"Pixel Density",id:"pixel-density",level:2}];function c(e){const t={a:"a",admonition:"admonition",code:"code",h2:"h2",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,s.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(t.p,{children:["The ",(0,r.jsx)(t.code,{children:"RuntimeShader"})," image filter allows you to write your own ",(0,r.jsx)(t.a,{href:"/docs/shaders/overview",children:"Skia Shader"})," as an image filter.\nThis component receives the currently filtered image as a shader uniform (or the implicit source image if no children are provided)."]}),"\n",(0,r.jsx)(t.admonition,{type:"info",children:(0,r.jsxs)(t.p,{children:["Because RuntimeShader doesn't take into account the pixel density scaling, we recommend applying a technique known as supersampling. ",(0,r.jsx)(t.a,{href:"#pixel-density",children:"See below"}),"."]})}),"\n",(0,r.jsxs)(t.table,{children:[(0,r.jsx)(t.thead,{children:(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.th,{style:{textAlign:"left"},children:"Name"}),(0,r.jsx)(t.th,{style:{textAlign:"left"},children:"Type"}),(0,r.jsx)(t.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,r.jsxs)(t.tbody,{children:[(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{style:{textAlign:"left"},children:"source"}),(0,r.jsx)(t.td,{style:{textAlign:"left"},children:(0,r.jsx)(t.code,{children:"SkRuntimeEffect"})}),(0,r.jsx)(t.td,{style:{textAlign:"left"},children:"Shader to use as an image filter"})]}),(0,r.jsxs)(t.tr,{children:[(0,r.jsx)(t.td,{style:{textAlign:"left"},children:"children?"}),(0,r.jsx)(t.td,{style:{textAlign:"left"},children:(0,r.jsx)(t.code,{children:"ImageFilter"})}),(0,r.jsx)(t.td,{style:{textAlign:"left"},children:"Optional image filter to be applied first"})]})]})]}),"\n",(0,r.jsx)(t.h2,{id:"example",children:"Example"}),"\n",(0,r.jsxs)(t.p,{children:["The example below generates a circle with a green mint color.\nThe circle is first drawn with the light blue color ",(0,r.jsx)(t.code,{children:"#add8e6"}),", and the runtime shader switches the blue with the green channel: we get mint green ",(0,r.jsx)(t.code,{children:"#ade6d8"}),"."]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",metastring:"twoslash",children:'import {Canvas, Text, RuntimeShader, Skia, Group, Circle} from "@shopify/react-native-skia";\n\nconst source = Skia.RuntimeEffect.Make(`\nuniform shader image;\n\nhalf4 main(float2 xy) {\n  return image.eval(xy).rbga;\n}\n`)!;\n\nexport const RuntimeShaderDemo = () => {\n  const r = 128;\n  return (\n    <Canvas style={{ flex: 1 }}>\n      <Group>\n        <RuntimeShader source={source} />\n        <Circle cx={r} cy={r} r={r} color="lightblue" />\n      </Group>\n    </Canvas>\n  );\n};\n'})}),"\n",(0,r.jsx)("img",{alt:"Runtime Shader",src:n(7459).A,width:"256",height:"256"}),"\n",(0,r.jsx)(t.h2,{id:"pixel-density",children:"Pixel Density"}),"\n",(0,r.jsxs)(t.p,{children:[(0,r.jsx)(t.code,{children:"RuntimeShader"})," is not taking into account the pixel density scaling (",(0,r.jsx)(t.a,{href:"https://issues.skia.org/issues/40044507",children:"learn more why"}),").\nTo keep the image filter output crisp, We upscale the filtered drawing to the ",(0,r.jsx)(t.a,{href:"https://reactnative.dev/docs/pixelratio",children:"pixel density of the app"}),". Once the drawing is filtered, we scale it back to the original size. This can be seen in the example below. These operations must be performed on a Skia layer via the ",(0,r.jsx)(t.code,{children:"layer"})," property."]}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-tsx",metastring:"twoslash",children:'import {Canvas, Text, RuntimeShader, Skia, Group, Circle, Paint, Fill, useFont} from "@shopify/react-native-skia";\nimport {PixelRatio} from "react-native";\n\nconst pd = PixelRatio.get();\nconst source = Skia.RuntimeEffect.Make(`\nuniform shader image;\n\nhalf4 main(float2 xy) {\n  if (xy.x < 256 * ${pd}/2) {\n    return color;\n  }\n  return image.eval(xy).rbga;\n}\n`)!;\n\nexport const RuntimeShaderDemo = () => {\n  const r = 128;\n  const font = useFont(require("./SF-Pro.ttf"), 24);\n  return (\n    <Canvas style={{ flex: 1 }}>\n      <Group transform={[{ scale: 1 / pd }]}>\n        <Group\n          layer={\n            <Paint>\n              <RuntimeShader source={source} />\n            </Paint>\n          }\n          transform={[{ scale: pd }]}\n        >\n          <Fill color="#b7c9e2" />\n          <Text\n            text="Hello World"\n            x={16}\n            y={32}\n            color="#e38ede"\n            font={font}\n          />\n        </Group>\n      </Group>\n    </Canvas>\n  );\n};\n'})}),"\n",(0,r.jsxs)("table",{style:{width:"100%"},children:[(0,r.jsxs)("tr",{children:[(0,r.jsx)("td",{children:(0,r.jsx)("b",{children:"With supersampling"})}),(0,r.jsx)("td",{children:(0,r.jsx)("b",{children:"Without supersampling"})})]}),(0,r.jsxs)("tr",{children:[(0,r.jsx)("td",{style:{textAlign:"left",width:"50%"},children:(0,r.jsx)("div",{style:{overflow:"hidden",height:100},children:(0,r.jsx)("img",{alt:"Runtime Shader",src:n(9457).A,style:{width:512,height:512}})})}),(0,r.jsx)("td",{style:{textAlign:"right",width:"50%"},children:(0,r.jsx)("div",{style:{overflow:"hidden",height:100},children:(0,r.jsx)("img",{alt:"Runtime Shader",src:n(5943).A,style:{width:512,height:512}})})})]})]})]})}function h(e={}){const{wrapper:t}={...(0,s.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(c,{...e})}):c(e)}},1184:(e,t,n)=>{n.d(t,{R:()=>a,x:()=>l});var i=n(4041);const r={},s=i.createContext(r);function a(e){const t=i.useContext(s);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function l(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:a(e.components),i.createElement(s.Provider,{value:t},e.children)}},5943:(e,t,n)=>{n.d(t,{A:()=>i});const i=n.p+"assets/images/without-supersampling-04f88a55ab281545721f4e5cd428037e.png"},7459:(e,t,n)=>{n.d(t,{A:()=>i});const i=n.p+"assets/images/runtime-shader-61c54f569a910a924e61ff7d993f89b5.png"},9457:(e,t,n)=>{n.d(t,{A:()=>i});const i=n.p+"assets/images/with-supersampling-dacc89c1dc5a9bcdc58cf839baa9a696.png"}}]);