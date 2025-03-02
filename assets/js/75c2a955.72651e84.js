"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[3184],{1184:(e,t,s)=>{s.d(t,{R:()=>a,x:()=>c});var n=s(4041);const i={},l=n.createContext(i);function a(e){const t=n.useContext(l);return n.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function c(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(i):e.components||i:a(e.components),n.createElement(l.Provider,{value:t},e.children)}},4352:(e,t,s)=>{s.r(t),s.d(t,{assets:()=>r,contentTitle:()=>c,default:()=>o,frontMatter:()=>a,metadata:()=>n,toc:()=>d});const n=JSON.parse('{"id":"mask","title":"Mask","description":"The Mask component hides an element by masking the content at specific points.","source":"@site/docs/mask.md","sourceDirName":".","slug":"/mask","permalink":"/react-native-skia/docs/mask","draft":false,"unlisted":false,"editUrl":"https://github.com/shopify/react-native-skia/edit/main/docs/docs/mask.md","tags":[],"version":"current","frontMatter":{"id":"mask","title":"Mask","sidebar_label":"Mask","slug":"/mask"},"sidebar":"tutorialSidebar","previous":{"title":"Color Filters","permalink":"/react-native-skia/docs/color-filters"},"next":{"title":"Path Effects","permalink":"/react-native-skia/docs/path-effects"}}');var i=s(1085),l=s(1184);const a={id:"mask",title:"Mask",sidebar_label:"Mask",slug:"/mask"},c=void 0,r={},d=[{value:"Alpha Mask",id:"alpha-mask",level:2},{value:"Result",id:"result",level:3},{value:"Luminance Mask",id:"luminance-mask",level:2},{value:"Result",id:"result-1",level:3}];function h(e){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,l.R)(),...e.components};return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsxs)(t.p,{children:["The ",(0,i.jsx)(t.code,{children:"Mask"})," component hides an element by masking the content at specific points.\nJust like its ",(0,i.jsx)(t.a,{href:"https://developer.mozilla.org/en-US/docs/Web/CSS/mask",children:"CSS counterpart"}),", there are two modes available:"]}),"\n",(0,i.jsxs)(t.ul,{children:["\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"alpha"}),": This mode indicates that the mask layer image's transparency (alpha channel) values should be used as the mask values. This is how masks work in Figma."]}),"\n",(0,i.jsxs)(t.li,{children:[(0,i.jsx)(t.code,{children:"luminance"}),": This mode indicates that the luminance values of the mask layer image should be used as the mask values. This is how masks work in SVG."]}),"\n"]}),"\n",(0,i.jsxs)(t.p,{children:["The first child of ",(0,i.jsx)(t.code,{children:"Mask"})," is the drawing used as a mask, and the remaining children are the drawings to mask."]}),"\n",(0,i.jsxs)(t.p,{children:["By default, the mask is not clipped if you want to clip the mask with the bounds of the contents, the ",(0,i.jsx)(t.code,{children:"clip"})," property."]}),"\n",(0,i.jsxs)(t.table,{children:[(0,i.jsx)(t.thead,{children:(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.th,{style:{textAlign:"left"},children:"Name"}),(0,i.jsx)(t.th,{style:{textAlign:"left"},children:"Type"}),(0,i.jsx)(t.th,{style:{textAlign:"left"},children:"Description"})]})}),(0,i.jsxs)(t.tbody,{children:[(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.td,{style:{textAlign:"left"},children:"mode?"}),(0,i.jsxs)(t.td,{style:{textAlign:"left"},children:[(0,i.jsx)(t.code,{children:"alpha"})," or ",(0,i.jsx)(t.code,{children:"luminance"})]}),(0,i.jsxs)(t.td,{style:{textAlign:"left"},children:["Is it a luminance or alpha mask (default is ",(0,i.jsx)(t.code,{children:"alpha"}),")"]})]}),(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.td,{style:{textAlign:"left"},children:"clip?"}),(0,i.jsx)(t.td,{style:{textAlign:"left"},children:(0,i.jsx)(t.code,{children:"boolean"})}),(0,i.jsx)(t.td,{style:{textAlign:"left"},children:"clip the mask so it doesn't exceed the content"})]}),(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.td,{style:{textAlign:"left"},children:"mask"}),(0,i.jsx)(t.td,{style:{textAlign:"left"},children:"`ReactNode[]"}),(0,i.jsx)(t.td,{style:{textAlign:"left"},children:"ReactNode`"})]}),(0,i.jsxs)(t.tr,{children:[(0,i.jsx)(t.td,{style:{textAlign:"left"},children:"children"}),(0,i.jsx)(t.td,{style:{textAlign:"left"},children:"`ReactNode[]"}),(0,i.jsx)(t.td,{style:{textAlign:"left"},children:"ReactNode`"})]})]})]}),"\n",(0,i.jsx)(t.h2,{id:"alpha-mask",children:"Alpha Mask"}),"\n",(0,i.jsx)(t.p,{children:"Opaque pixels will be visible and transparent pixels invisible."}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-tsx",metastring:"twoslash",children:'import {Canvas, Mask, Group, Circle, Rect} from "@shopify/react-native-skia";\n\nconst Demo = () => (\n  <Canvas style={{ width: 256, height: 256 }}>\n    <Mask\n      mask={\n        <Group>\n          <Circle cx={128} cy={128} r={128} opacity={0.5} />\n          <Circle cx={128} cy={128} r={64} />\n        </Group>\n      }\n    >\n      <Rect x={0} y={0} width={256} height={256} color="lightblue" />\n    </Mask>\n  </Canvas>\n);\n'})}),"\n",(0,i.jsx)(t.h3,{id:"result",children:"Result"}),"\n",(0,i.jsx)("img",{src:s(4895).A,width:"256",height:"256"}),"\n",(0,i.jsx)(t.h2,{id:"luminance-mask",children:"Luminance Mask"}),"\n",(0,i.jsx)(t.p,{children:"White pixels will be visible and black pixels invisible."}),"\n",(0,i.jsx)(t.pre,{children:(0,i.jsx)(t.code,{className:"language-tsx",metastring:"twoslash",children:'import {Canvas, Mask, Group, Circle, Rect} from "@shopify/react-native-skia";\n\nconst Demo = () => (\n  <Canvas style={{ width: 256, height: 256 }}>\n    <Mask\n      mode="luminance"\n      mask={\n        <Group>\n          <Circle cx={128} cy={128} r={128} color="white" />\n          <Circle cx={128} cy={128} r={64} color="black" />\n        </Group>\n      }\n    >\n      <Rect x={0} y={0} width={256} height={256} color="lightblue" />\n    </Mask>\n  </Canvas>\n);\n'})}),"\n",(0,i.jsx)(t.h3,{id:"result-1",children:"Result"}),"\n",(0,i.jsx)("img",{src:s(4477).A,width:"256",height:"256"})]})}function o(e={}){const{wrapper:t}={...(0,l.R)(),...e.components};return t?(0,i.jsx)(t,{...e,children:(0,i.jsx)(h,{...e})}):h(e)}},4477:(e,t,s)=>{s.d(t,{A:()=>n});const n=s.p+"assets/images/luminance-mask-909a9a47f12be47816dab752cb680cfc.png"},4895:(e,t,s)=>{s.d(t,{A:()=>n});const n=s.p+"assets/images/alpha-mask-5a3f5963ba1f0af60da84f1ff1a226d8.png"}}]);