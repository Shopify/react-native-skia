"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[4622],{1184:(e,t,n)=>{n.d(t,{R:()=>c,x:()=>r});var s=n(4041);const a={},i=s.createContext(a);function c(e){const t=s.useContext(i);return s.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function r(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:c(e.components),s.createElement(i.Provider,{value:t},e.children)}},1388:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>o,contentTitle:()=>r,default:()=>h,frontMatter:()=>c,metadata:()=>s,toc:()=>l});const s=JSON.parse('{"id":"canvas/canvas","title":"Canvas","description":"The Canvas component is the root of your Skia drawing.","source":"@site/docs/canvas/canvas.md","sourceDirName":"canvas","slug":"/canvas/overview","permalink":"/react-native-skia/docs/canvas/overview","draft":false,"unlisted":false,"editUrl":"https://github.com/shopify/react-native-skia/edit/main/docs/docs/canvas/canvas.md","tags":[],"version":"current","frontMatter":{"id":"canvas","title":"Canvas","sidebar_label":"Overview","slug":"/canvas/overview"},"sidebar":"tutorialSidebar","previous":{"title":"Bundle Size","permalink":"/react-native-skia/docs/getting-started/bundle-size"},"next":{"title":"Contexts","permalink":"/react-native-skia/docs/canvas/contexts"}}');var a=n(1085),i=n(1184);const c={id:"canvas",title:"Canvas",sidebar_label:"Overview",slug:"/canvas/overview"},r=void 0,o={},l=[{value:"Getting the Canvas size",id:"getting-the-canvas-size",level:2},{value:"Getting a Canvas Snapshot",id:"getting-a-canvas-snapshot",level:2},{value:"Example",id:"example",level:3},{value:"Accessibilty",id:"accessibilty",level:2}];function d(e){const t={a:"a",code:"code",h2:"h2",h3:"h3",li:"li",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",ul:"ul",...(0,i.R)(),...e.components};return(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(t.p,{children:"The Canvas component is the root of your Skia drawing.\nYou can treat it as a regular React Native view and assign a view style.\nBehind the scenes, it is using its own React renderer."}),"\n",(0,a.jsxs)(t.table,{children:[(0,a.jsx)(t.thead,{children:(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.th,{style:{textAlign:"left"},children:"Name"}),(0,a.jsx)(t.th,{style:{textAlign:"left"},children:"Type"}),(0,a.jsx)(t.th,{style:{textAlign:"left"},children:"Description."})]})}),(0,a.jsxs)(t.tbody,{children:[(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{style:{textAlign:"left"},children:"style?"}),(0,a.jsx)(t.td,{style:{textAlign:"left"},children:(0,a.jsx)(t.code,{children:"ViewStyle"})}),(0,a.jsx)(t.td,{style:{textAlign:"left"},children:"View style"})]}),(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{style:{textAlign:"left"},children:"ref?"}),(0,a.jsx)(t.td,{style:{textAlign:"left"},children:(0,a.jsx)(t.code,{children:"Ref<SkiaView>"})}),(0,a.jsxs)(t.td,{style:{textAlign:"left"},children:["Reference to the ",(0,a.jsx)(t.code,{children:"SkiaView"})," object"]})]}),(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{style:{textAlign:"left"},children:"opaque?"}),(0,a.jsx)(t.td,{style:{textAlign:"left"},children:(0,a.jsx)(t.code,{children:"boolean"})}),(0,a.jsx)(t.td,{style:{textAlign:"left"},children:"By default, the canvas is transparent but on Android, you can make it opaque to improve performance."})]}),(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{style:{textAlign:"left"},children:"onSize?"}),(0,a.jsx)(t.td,{style:{textAlign:"left"},children:(0,a.jsx)(t.code,{children:"SharedValue<Size>"})}),(0,a.jsxs)(t.td,{style:{textAlign:"left"},children:["Reanimated value to which the canvas size will be assigned  (see ",(0,a.jsx)(t.a,{href:"/docs/animations/hooks#canvas-size",children:"canvas size"}),")"]})]}),(0,a.jsxs)(t.tr,{children:[(0,a.jsx)(t.td,{style:{textAlign:"left"},children:"onLayout?"}),(0,a.jsx)(t.td,{style:{textAlign:"left"},children:(0,a.jsx)(t.code,{children:"NativeEvent<LayoutEvent>"})}),(0,a.jsxs)(t.td,{style:{textAlign:"left"},children:["Invoked on mount and on layout changes (see ",(0,a.jsx)(t.a,{href:"https://reactnative.dev/docs/view#onlayout",children:"onLayout"}),")"]})]})]})]}),"\n",(0,a.jsx)(t.h2,{id:"getting-the-canvas-size",children:"Getting the Canvas size"}),"\n",(0,a.jsx)(t.p,{children:"If the size of the Canvas is unknown, there are two ways to access it:"}),"\n",(0,a.jsxs)(t.ul,{children:["\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"On the JS thread"}),", using the ",(0,a.jsx)(t.a,{href:"https://reactnative.dev/docs/view#onlayout",children:(0,a.jsx)(t.code,{children:"onLayout"})})," prop, like you would on any regular React Native View."]}),"\n",(0,a.jsxs)(t.li,{children:[(0,a.jsx)(t.strong,{children:"On the UI thread"}),", using the ",(0,a.jsx)(t.a,{href:"/docs/animations/hooks#canvas-size",children:(0,a.jsx)(t.code,{children:"onSize"})})," prop with ",(0,a.jsx)(t.a,{href:"/docs/animations/animations",children:"Reanimated"}),"."]}),"\n"]}),"\n",(0,a.jsx)(t.h2,{id:"getting-a-canvas-snapshot",children:"Getting a Canvas Snapshot"}),"\n",(0,a.jsxs)(t.p,{children:["You can save your drawings as an image by using the ",(0,a.jsx)(t.code,{children:"makeImageSnapshotAsync"})," method. This method returns a promise that resolves to an ",(0,a.jsx)(t.a,{href:"/docs/images",children:"Image"}),".\nIt executes on the UI thread, ensuring access to the same Skia context as your on-screen canvases, including ",(0,a.jsx)(t.a,{href:"https://shopify.github.io/react-native-skia/docs/animations/textures",children:"textures"}),"."]}),"\n",(0,a.jsxs)(t.p,{children:["If your drawing does not contain textures, you may also use the synchronous ",(0,a.jsx)(t.code,{children:"makeImageSnapshot"})," method for simplicity."]}),"\n",(0,a.jsx)(t.h3,{id:"example",children:"Example"}),"\n",(0,a.jsx)(t.pre,{children:(0,a.jsx)(t.code,{className:"language-tsx",metastring:"twoslash",children:'import {useEffect} from "react";\nimport {Canvas, useCanvasRef, Circle} from "@shopify/react-native-skia";\n\nexport const Demo = () => {\n  const ref = useCanvasRef();\n  useEffect(() => {\n    setTimeout(() => {\n      // you can pass an optional rectangle\n      // to only save part of the image\n      const image = ref.current?.makeImageSnapshot();\n      if (image) {\n        // you can use image in an <Image> component\n        // Or save to file using encodeToBytes -> Uint8Array\n        const bytes = image.encodeToBytes();\n        console.log({ bytes });\n      }\n    }, 1000)\n  });\n  return (\n    <Canvas style={{ flex: 1 }} ref={ref}>\n      <Circle r={128} cx={128} cy={128} color="red" />\n    </Canvas>\n  );\n};\n'})}),"\n",(0,a.jsx)(t.h2,{id:"accessibilty",children:"Accessibilty"}),"\n",(0,a.jsxs)(t.p,{children:["The Canvas component supports the same properties as a View component including its ",(0,a.jsx)(t.a,{href:"https://reactnative.dev/docs/accessibility#accessible",children:"accessibility properties"}),".\nYou can make elements inside the canvas accessible as well by overlayings views on top of your canvas.\nThis is the same recipe used for ",(0,a.jsx)(t.a,{href:"https://shopify.github.io/react-native-skia/docs/animations/gestures/#element-tracking",children:"applying gestures on specific canvas elements"}),"."]})]})}function h(e={}){const{wrapper:t}={...(0,i.R)(),...e.components};return t?(0,a.jsx)(t,{...e,children:(0,a.jsx)(d,{...e})}):d(e)}}}]);