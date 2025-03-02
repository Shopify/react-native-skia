"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[9766],{1184:(e,t,n)=>{n.d(t,{R:()=>i,x:()=>o});var a=n(4041);const s={},r=a.createContext(s);function i(e){const t=a.useContext(r);return a.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function o(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:i(e.components),a.createElement(r.Provider,{value:t},e.children)}},4319:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>l,contentTitle:()=>o,default:()=>d,frontMatter:()=>i,metadata:()=>a,toc:()=>c});const a=JSON.parse('{"id":"animations/gestures","title":"Gestures","description":"When integrating with reanimated, we recommend using react-native-gesture-handler.","source":"@site/docs/animations/gestures.md","sourceDirName":"animations","slug":"/animations/gestures","permalink":"/react-native-skia/docs/animations/gestures","draft":false,"unlisted":false,"editUrl":"https://github.com/shopify/react-native-skia/edit/main/docs/docs/animations/gestures.md","tags":[],"version":"current","frontMatter":{"id":"gestures","title":"Gestures","sidebar_label":"Gestures","slug":"/animations/gestures"},"sidebar":"tutorialSidebar","previous":{"title":"Animations","permalink":"/react-native-skia/docs/animations/animations"},"next":{"title":"Hooks","permalink":"/react-native-skia/docs/animations/hooks"}}');var s=n(1085),r=n(1184);const i={id:"gestures",title:"Gestures",sidebar_label:"Gestures",slug:"/animations/gestures"},o=void 0,l={},c=[{value:"Element Tracking",id:"element-tracking",level:2}];function u(e){const t={a:"a",code:"code",h2:"h2",p:"p",pre:"pre",...(0,r.R)(),...e.components};return(0,s.jsxs)(s.Fragment,{children:[(0,s.jsxs)(t.p,{children:["When integrating with ",(0,s.jsx)(t.a,{href:"/docs/animations/animations",children:"reanimated"}),", we recommend using ",(0,s.jsx)(t.a,{href:"https://docs.swmansion.com/react-native-gesture-handler/docs/",children:"react-native-gesture-handler"}),"."]}),"\n",(0,s.jsxs)(t.p,{children:["We've prepared a few ",(0,s.jsx)(t.a,{href:"/docs/tutorials#gestures",children:"tutorials"})," that showcase the use of advanced gestures within the context of Skia drawings."]}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-tsx",metastring:"twoslash",children:'import { useWindowDimensions } from "react-native";\nimport { Canvas, Circle, Fill } from "@shopify/react-native-skia";\nimport { GestureDetector, Gesture } from "react-native-gesture-handler";\nimport { useSharedValue, withDecay } from "react-native-reanimated";\n\nexport const AnimationWithTouchHandler = () => {\n  const { width } = useWindowDimensions();\n  const leftBoundary = 0;\n  const rightBoundary = width;\n  const translateX = useSharedValue(width / 2);\n\n  const gesture = Gesture.Pan()\n    .onChange((e) => {\n      translateX.value += e.changeX;\n    })\n    .onEnd((e) => {\n      translateX.value = withDecay({\n        velocity: e.velocityX,\n        clamp: [leftBoundary, rightBoundary],\n      });\n    });\n\n  return (\n    <GestureDetector gesture={gesture}>\n      <Canvas style={{ flex: 1 }}>\n        <Fill color="white" />\n        <Circle cx={translateX} cy={40} r={20} color="#3E3E" />\n      </Canvas>\n    </GestureDetector>\n  );\n};\n'})}),"\n",(0,s.jsx)(t.h2,{id:"element-tracking",children:"Element Tracking"}),"\n",(0,s.jsx)(t.p,{children:"A common use-case involves activating gestures only for a specific element on the Canvas. The Gesture Handler excels in this area as it can account for all the transformations applied to an element, such as translations, scaling, and rotations. To track each element, overlay an animated view on it, ensuring that the same transformations applied to the canvas element are mirrored on the animated view."}),"\n",(0,s.jsx)(t.p,{children:"In the example below, each circle is tracked separately by two gesture handlers."}),"\n",(0,s.jsx)(t.pre,{children:(0,s.jsx)(t.code,{className:"language-tsx",metastring:"twoslash",children:'import { View } from "react-native";\nimport { Canvas, Circle, Fill } from "@shopify/react-native-skia";\nimport { GestureDetector, Gesture } from "react-native-gesture-handler";\nimport Animated, { useSharedValue, useAnimatedStyle } from "react-native-reanimated";\n\nconst radius = 30;\n\nexport const ElementTracking = () => {\n  // The position of the ball\n  const x = useSharedValue(100);\n  const y = useSharedValue(100);\n  // This style will be applied to the "invisible" animated view\n  // that overlays the ball\n  const style = useAnimatedStyle(() => ({\n    position: "absolute",\n    top: -radius,\n    left: -radius,\n    width: radius * 2,\n    height: radius * 2,\n    transform: [{ translateX: x.value }, { translateY: y.value }],\n  }));\n  // The gesture handler for the ball\n  const gesture = Gesture.Pan().onChange((e) => {\n    x.value += e.x;\n    y.value += e.y;\n  });\n  return (\n    <View style={{ flex: 1 }}>\n      <Canvas style={{ flex: 1 }}>\n        <Fill color="white" />\n        <Circle cx={x} cy={y} r={radius} color="cyan" />\n      </Canvas>\n      <GestureDetector gesture={gesture}>\n        <Animated.View style={style} />\n      </GestureDetector>\n    </View>\n  );\n};\n'})})]})}function d(e={}){const{wrapper:t}={...(0,r.R)(),...e.components};return t?(0,s.jsx)(t,{...e,children:(0,s.jsx)(u,{...e})}):u(e)}}}]);