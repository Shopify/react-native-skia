"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[8512],{1184:(A,w,e)=>{e.d(w,{R:()=>r,x:()=>t});var g=e(4041);const n={},s=g.createContext(n);function r(A){const w=g.useContext(s);return g.useMemo((function(){return"function"==typeof A?A(w):{...w,...A}}),[w,A])}function t(A){let w;return w=A.disableParentContext?"function"==typeof A.components?A.components(n):A.components||n:r(A.components),g.createElement(s.Provider,{value:w},A.children)}},1261:(A,w,e)=>{e.d(w,{A:()=>g});const g=e.p+"assets/images/nested-d1e659c1a3de25ffc1dc5ddf7df93580.png"},2020:(A,w,e)=>{e.r(w),e.d(w,{assets:()=>a,contentTitle:()=>t,default:()=>d,frontMatter:()=>r,metadata:()=>g,toc:()=>i});const g=JSON.parse('{"id":"shaders/language","title":"Shading Language","description":"Skia provides a shading language.","source":"@site/docs/shaders/language.md","sourceDirName":"shaders","slug":"/shaders/overview","permalink":"/react-native-skia/docs/shaders/overview","draft":false,"unlisted":false,"editUrl":"https://github.com/shopify/react-native-skia/edit/main/docs/docs/shaders/language.md","tags":[],"version":"current","frontMatter":{"id":"language","title":"Shading Language","sidebar_label":"Language","slug":"/shaders/overview"},"sidebar":"tutorialSidebar","previous":{"title":"Text Blob","permalink":"/react-native-skia/docs/text/blob"},"next":{"title":"Images","permalink":"/react-native-skia/docs/shaders/images"}}');var n=e(1085),s=e(1184);const r={id:"language",title:"Shading Language",sidebar_label:"Language",slug:"/shaders/overview"},t=void 0,a={},i=[{value:"Shader",id:"shader",level:2},{value:"Simple Shader",id:"simple-shader",level:3},{value:"Using Uniforms",id:"using-uniforms",level:3},{value:"Nested Shaders",id:"nested-shaders",level:3}];function l(A){const w={a:"a",code:"code",h2:"h2",h3:"h3",img:"img",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,s.R)(),...A.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsxs)(w.p,{children:["Skia provides a shading language.\nYou can play with it ",(0,n.jsx)(w.a,{href:"https://shaders.skia.org/",children:"here"}),".\nThe syntax is very similar to GLSL.\nIf you're already familiar with GLSL, or are looking to convert a GLSL shader to SKSL, you can view a list of their differences ",(0,n.jsx)(w.a,{href:"https://github.com/google/skia/tree/main/src/sksl#readme",children:"here"}),"."]}),"\n",(0,n.jsxs)(w.p,{children:["The first step is to create a shader and compile it using ",(0,n.jsx)(w.code,{children:"RuntimeEffect.Make"}),"."]}),"\n",(0,n.jsx)(w.pre,{children:(0,n.jsx)(w.code,{className:"language-tsx",metastring:"twoslash",children:'import {Skia} from "@shopify/react-native-skia";\n\nconst source = Skia.RuntimeEffect.Make(`\nvec4 main(vec2 pos) {\n  // The canvas is 256x256\n  vec2 canvas = vec2(256);\n  // normalized x,y values go from 0 to 1\n  vec2 normalized = pos/canvas;\n  return vec4(normalized.x, normalized.y, 0.5, 1);\n}`);\n\nif (!source) {\n  throw new Error("Couldn\'t compile the shader")\n}\n'})}),"\n",(0,n.jsx)(w.h2,{id:"shader",children:"Shader"}),"\n",(0,n.jsx)(w.p,{children:"Creates a shader from source.\nShaders can be nested with one another."}),"\n",(0,n.jsxs)(w.table,{children:[(0,n.jsx)(w.thead,{children:(0,n.jsxs)(w.tr,{children:[(0,n.jsx)(w.th,{style:{textAlign:"left"},children:"Name"}),(0,n.jsx)(w.th,{style:{textAlign:"left"},children:"Type"}),(0,n.jsx)(w.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,n.jsxs)(w.tbody,{children:[(0,n.jsxs)(w.tr,{children:[(0,n.jsx)(w.td,{style:{textAlign:"left"},children:"source"}),(0,n.jsx)(w.td,{style:{textAlign:"left"},children:(0,n.jsx)(w.code,{children:"RuntimeEffect"})}),(0,n.jsx)(w.td,{style:{textAlign:"left"},children:"Compiled shaders"})]}),(0,n.jsxs)(w.tr,{children:[(0,n.jsx)(w.td,{style:{textAlign:"left"},children:"uniforms"}),(0,n.jsx)(w.td,{style:{textAlign:"left"},children:(0,n.jsx)(w.code,{children:"{ [name: string]: number &#124; Vector &#124; Vector[] &#124; number[] &#124; number[][] }"})}),(0,n.jsx)(w.td,{style:{textAlign:"left"},children:"uniform values"})]}),(0,n.jsxs)(w.tr,{children:[(0,n.jsx)(w.td,{style:{textAlign:"left"},children:"children"}),(0,n.jsx)(w.td,{style:{textAlign:"left"},children:(0,n.jsx)(w.code,{children:"Shader"})}),(0,n.jsx)(w.td,{style:{textAlign:"left"},children:"Shaders to be used as uniform"})]})]})]}),"\n",(0,n.jsx)(w.h3,{id:"simple-shader",children:"Simple Shader"}),"\n",(0,n.jsx)(w.pre,{children:(0,n.jsx)(w.code,{className:"language-tsx",metastring:"twoslash",children:'import {Skia, Canvas, Shader, Fill} from "@shopify/react-native-skia";\n\nconst source = Skia.RuntimeEffect.Make(`\nvec4 main(vec2 pos) {\n  // normalized x,y values go from 0 to 1, the canvas is 256x256\n  vec2 normalized = pos/vec2(256);\n  return vec4(normalized.x, normalized.y, 0.5, 1);\n}`)!;\n\nconst SimpleShader = () => {\n  return (\n    <Canvas style={{ width: 256, height: 256 }}>\n      <Fill>\n        <Shader source={source} />\n      </Fill>\n    </Canvas>\n  );\n};\n'})}),"\n",(0,n.jsx)(w.p,{children:(0,n.jsx)(w.img,{alt:"Simple Shader",src:e(9681).A+"",width:"256",height:"256"})}),"\n",(0,n.jsx)(w.h3,{id:"using-uniforms",children:"Using Uniforms"}),"\n",(0,n.jsxs)(w.p,{children:["Uniforms are variables used to parametrize shaders.\nThe following uniform types are supported: ",(0,n.jsx)(w.code,{children:"float"}),", ",(0,n.jsx)(w.code,{children:"float2"}),", ",(0,n.jsx)(w.code,{children:"float3"}),", ",(0,n.jsx)(w.code,{children:"float4"}),", ",(0,n.jsx)(w.code,{children:"float2x2"}),", ",(0,n.jsx)(w.code,{children:"float3x3"}),", ",(0,n.jsx)(w.code,{children:"float4x4"}),", ",(0,n.jsx)(w.code,{children:"int"}),", ",(0,n.jsx)(w.code,{children:"int2"}),", ",(0,n.jsx)(w.code,{children:"int3"})," and, ",(0,n.jsx)(w.code,{children:"int4"}),".\nThe types can also be used as arrays, e.g. ",(0,n.jsx)(w.code,{children:"uniform float3 colors[12]"}),"."]}),"\n",(0,n.jsx)(w.pre,{children:(0,n.jsx)(w.code,{className:"language-tsx",metastring:"twoslash",children:'import {Canvas, Skia, Shader, Fill, vec} from "@shopify/react-native-skia";\n\nconst source = Skia.RuntimeEffect.Make(`\nuniform vec2 c;\nuniform float r;\nuniform float blue;\n\nvec4 main(vec2 pos) {\n  vec2 normalized = pos/vec2(2 * r);\n  return distance(pos, c) > r ? vec4(1) : vec4(normalized, blue, 1);\n}`)!;\n\nconst UniformShader = () => {\n  const r = 128;\n  const c = vec(2 * r, r);\n  const blue = 1.0;\n  return (\n    <Canvas style={{ width: 256, height: 256 }}>\n      <Fill>\n        <Shader source={source} uniforms={{ c, r, blue }} />\n      </Fill>\n    </Canvas>\n  );\n};\n'})}),"\n",(0,n.jsx)(w.p,{children:(0,n.jsx)(w.img,{alt:"Simple Shader",src:e(2549).A+"",width:"256",height:"256"})}),"\n",(0,n.jsx)(w.h3,{id:"nested-shaders",children:"Nested Shaders"}),"\n",(0,n.jsx)(w.pre,{children:(0,n.jsx)(w.code,{className:"language-tsx",metastring:"twoslash",children:'import {Canvas, Skia, ImageShader, Shader, Fill, useImage} from "@shopify/react-native-skia";\n\nconst source = Skia.RuntimeEffect.Make(`\nuniform shader image;\n\nhalf4 main(float2 xy) {   \n  xy.x += sin(xy.y / 3) * 4;\n  return image.eval(xy).rbga;\n}`)!;\n\nconst NestedShader = () => {\n  const image = useImage(require("./assets/oslo.jpg"));\n  if (!image) {\n    return null;\n  }\n  return (\n    <Canvas style={{ width: 256, height: 256 }}>\n      <Fill>\n        <Shader source={source}>\n          <ImageShader\n            image={image}\n            fit="cover"\n            rect={{ x: 0, y: 0, width: 256, height: 256 }}\n          />\n        </Shader>\n      </Fill>\n    </Canvas>\n  );\n};\n'})}),"\n",(0,n.jsx)(w.p,{children:(0,n.jsx)(w.img,{alt:"Simple Shader",src:e(1261).A+"",width:"256",height:"256"})})]})}function d(A={}){const{wrapper:w}={...(0,s.R)(),...A.components};return w?(0,n.jsx)(w,{...A,children:(0,n.jsx)(l,{...A})}):l(A)}},2549:(A,w,e)=>{e.d(w,{A:()=>g});const g="data:image/png;base64,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"},9681:(A,w,e)=>{e.d(w,{A:()=>g});const g="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAAAx5JREFUeJzt1IEJgAAQxLB7cHA310GaQFfobe932yT1enYDogwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwgwAwn4irQd73OUzEQAAAABJRU5ErkJggg=="}}]);