"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[9048],{3400:(e,t,n)=>{n.r(t),n.d(t,{default:()=>pe});var a=n(4041),o=n(3640),i=n(6756),s=n(5055),l=n(324),c=n(6953),r=n(9175),d=n(3e3),u=n(446);const m={backToTopButton:"backToTopButton_z1FD",backToTopButtonShow:"backToTopButtonShow_w1wE"};var b=n(1085);function h(){const{shown:e,scrollToTop:t}=function(e){let{threshold:t}=e;const[n,o]=(0,a.useState)(!1),i=(0,a.useRef)(!1),{startScroll:s,cancelScroll:l}=(0,d.gk)();return(0,d.Mq)(((e,n)=>{let{scrollY:a}=e;const s=n?.scrollY;s&&(i.current?i.current=!1:a>=s?(l(),o(!1)):a<t?o(!1):a+window.innerHeight<document.documentElement.scrollHeight&&o(!0))})),(0,u.$)((e=>{e.location.hash&&(i.current=!0,o(!1))})),{shown:n,scrollToTop:()=>s(0)}}({threshold:300});return(0,b.jsx)("button",{"aria-label":(0,r.T)({id:"theme.BackToTopButton.buttonAriaLabel",message:"Scroll back to top",description:"The ARIA label for the back to top button"}),className:(0,o.A)("clean-btn",s.G.common.backToTopButton,m.backToTopButton,e&&m.backToTopButtonShow),type:"button",onClick:t})}var p=n(7613),x=n(6090),f=n(4221),j=n(8062),v=n(8705);function _(e){return(0,b.jsx)("svg",{width:"20",height:"20","aria-hidden":"true",...e,children:(0,b.jsxs)("g",{fill:"#7a7a7a",children:[(0,b.jsx)("path",{d:"M9.992 10.023c0 .2-.062.399-.172.547l-4.996 7.492a.982.982 0 01-.828.454H1c-.55 0-1-.453-1-1 0-.2.059-.403.168-.551l4.629-6.942L.168 3.078A.939.939 0 010 2.528c0-.548.45-.997 1-.997h2.996c.352 0 .649.18.828.45L9.82 9.472c.11.148.172.347.172.55zm0 0"}),(0,b.jsx)("path",{d:"M19.98 10.023c0 .2-.058.399-.168.547l-4.996 7.492a.987.987 0 01-.828.454h-3c-.547 0-.996-.453-.996-1 0-.2.059-.403.168-.551l4.625-6.942-4.625-6.945a.939.939 0 01-.168-.55 1 1 0 01.996-.997h3c.348 0 .649.18.828.45l4.996 7.492c.11.148.168.347.168.55zm0 0"})]})})}const g="collapseSidebarButton_Ftvb",C="collapseSidebarButtonIcon_c4WT";function A(e){let{onClick:t}=e;return(0,b.jsx)("button",{type:"button",title:(0,r.T)({id:"theme.docs.sidebar.collapseButtonTitle",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),"aria-label":(0,r.T)({id:"theme.docs.sidebar.collapseButtonAriaLabel",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),className:(0,o.A)("button button--secondary button--outline",g),onClick:t,children:(0,b.jsx)(_,{className:C})})}var k=n(3401),S=n(1860);const T=Symbol("EmptyContext"),N=a.createContext(T);function I(e){let{children:t}=e;const[n,o]=(0,a.useState)(null),i=(0,a.useMemo)((()=>({expandedItem:n,setExpandedItem:o})),[n]);return(0,b.jsx)(N.Provider,{value:i,children:t})}var y=n(9286),w=n(3833),B=n(3198),L=n(1927);function E(e){let{collapsed:t,categoryLabel:n,onClick:a}=e;return(0,b.jsx)("button",{"aria-label":t?(0,r.T)({id:"theme.DocSidebarItem.expandCategoryAriaLabel",message:"Expand sidebar category '{label}'",description:"The ARIA label to expand the sidebar category"},{label:n}):(0,r.T)({id:"theme.DocSidebarItem.collapseCategoryAriaLabel",message:"Collapse sidebar category '{label}'",description:"The ARIA label to collapse the sidebar category"},{label:n}),"aria-expanded":!t,type:"button",className:"clean-btn menu__caret",onClick:a})}function M(e){let{item:t,onItemClick:n,activePath:i,level:c,index:r,...d}=e;const{items:u,label:m,collapsible:h,className:p,href:x}=t,{docs:{sidebar:{autoCollapseCategories:f}}}=(0,j.p)(),v=function(e){const t=(0,L.A)();return(0,a.useMemo)((()=>e.href&&!e.linkUnlisted?e.href:!t&&e.collapsible?(0,l.Nr)(e):void 0),[e,t])}(t),_=(0,l.w8)(t,i),g=(0,w.ys)(x,i),{collapsed:C,setCollapsed:A}=(0,y.u)({initialState:()=>!!h&&(!_&&t.collapsed)}),{expandedItem:k,setExpandedItem:I}=function(){const e=(0,a.useContext)(N);if(e===T)throw new S.dV("DocSidebarItemsExpandedStateProvider");return e}(),M=function(e){void 0===e&&(e=!C),I(e?null:r),A(e)};return function(e){let{isActive:t,collapsed:n,updateCollapsed:o}=e;const i=(0,S.ZC)(t);(0,a.useEffect)((()=>{t&&!i&&n&&o(!1)}),[t,i,n,o])}({isActive:_,collapsed:C,updateCollapsed:M}),(0,a.useEffect)((()=>{h&&null!=k&&k!==r&&f&&A(!0)}),[h,k,r,A,f]),(0,b.jsxs)("li",{className:(0,o.A)(s.G.docs.docSidebarItemCategory,s.G.docs.docSidebarItemCategoryLevel(c),"menu__list-item",{"menu__list-item--collapsed":C},p),children:[(0,b.jsxs)("div",{className:(0,o.A)("menu__list-item-collapsible",{"menu__list-item-collapsible--active":g}),children:[(0,b.jsx)(B.A,{className:(0,o.A)("menu__link",{"menu__link--sublist":h,"menu__link--sublist-caret":!x&&h,"menu__link--active":_}),onClick:h?e=>{n?.(t),x?M(!1):(e.preventDefault(),M())}:()=>{n?.(t)},"aria-current":g?"page":void 0,role:h&&!x?"button":void 0,"aria-expanded":h&&!x?!C:void 0,href:h?v??"#":v,...d,children:m}),x&&h&&(0,b.jsx)(E,{collapsed:C,categoryLabel:m,onClick:e=>{e.preventDefault(),M()}})]}),(0,b.jsx)(y.N,{lazy:!0,as:"ul",className:"menu__list",collapsed:C,children:(0,b.jsx)(q,{items:u,tabIndex:C?-1:0,onItemClick:n,activePath:i,level:c+1})})]})}var H=n(8918),R=n(5162);const G="menuExternalLink_xK2O";function P(e){let{item:t,onItemClick:n,activePath:a,level:i,index:c,...r}=e;const{href:d,label:u,className:m,autoAddBaseUrl:h}=t,p=(0,l.w8)(t,a),x=(0,H.A)(d);return(0,b.jsx)("li",{className:(0,o.A)(s.G.docs.docSidebarItemLink,s.G.docs.docSidebarItemLinkLevel(i),"menu__list-item",m),children:(0,b.jsxs)(B.A,{className:(0,o.A)("menu__link",!x&&G,{"menu__link--active":p}),autoAddBaseUrl:h,"aria-current":p?"page":void 0,to:d,...x&&{onClick:n?()=>n(t):void 0},...r,children:[u,!x&&(0,b.jsx)(R.A,{})]})},u)}const W="menuHtmlItem_anEq";function D(e){let{item:t,level:n,index:a}=e;const{value:i,defaultStyle:l,className:c}=t;return(0,b.jsx)("li",{className:(0,o.A)(s.G.docs.docSidebarItemLink,s.G.docs.docSidebarItemLinkLevel(n),l&&[W,"menu__list-item"],c),dangerouslySetInnerHTML:{__html:i}},a)}function F(e){let{item:t,...n}=e;switch(t.type){case"category":return(0,b.jsx)(M,{item:t,...n});case"html":return(0,b.jsx)(D,{item:t,...n});default:return(0,b.jsx)(P,{item:t,...n})}}function V(e){let{items:t,...n}=e;const a=(0,l.Y)(t,n.activePath);return(0,b.jsx)(I,{children:a.map(((e,t)=>(0,b.jsx)(F,{item:e,index:t,...n},t)))})}const q=(0,a.memo)(V),z="menu_qiME",Y="menuWithAnnouncementBar_hRfJ";function K(e){let{path:t,sidebar:n,className:i}=e;const l=function(){const{isActive:e}=(0,k.M)(),[t,n]=(0,a.useState)(e);return(0,d.Mq)((t=>{let{scrollY:a}=t;e&&n(0===a)}),[e]),e&&t}();return(0,b.jsx)("nav",{"aria-label":(0,r.T)({id:"theme.docs.sidebar.navAriaLabel",message:"Docs sidebar",description:"The ARIA label for the sidebar navigation"}),className:(0,o.A)("menu thin-scrollbar",z,l&&Y,i),children:(0,b.jsx)("ul",{className:(0,o.A)(s.G.docs.docSidebarMenu,"menu__list"),children:(0,b.jsx)(q,{items:n,activePath:t,level:1})})})}const U="sidebar_vJCc",O="sidebarWithHideableNavbar_Fo4g",X="sidebarHidden_vBKa",J="sidebarLogo_nlll";function Z(e){let{path:t,sidebar:n,onCollapse:a,isHidden:i}=e;const{navbar:{hideOnScroll:s},docs:{sidebar:{hideable:l}}}=(0,j.p)();return(0,b.jsxs)("div",{className:(0,o.A)(U,s&&O,i&&X),children:[s&&(0,b.jsx)(v.A,{tabIndex:-1,className:J}),(0,b.jsx)(K,{path:t,sidebar:n}),l&&(0,b.jsx)(A,{onClick:a})]})}const Q=a.memo(Z);var $=n(2840),ee=n(5965);const te=e=>{let{sidebar:t,path:n}=e;const a=(0,ee.M)();return(0,b.jsx)("ul",{className:(0,o.A)(s.G.docs.docSidebarMenu,"menu__list"),children:(0,b.jsx)(q,{items:t,activePath:n,onItemClick:e=>{"category"===e.type&&e.href&&a.toggle(),"link"===e.type&&a.toggle()},level:1})})};function ne(e){return(0,b.jsx)($.GX,{component:te,props:e})}const ae=a.memo(ne);function oe(e){const t=(0,f.l)(),n="desktop"===t||"ssr"===t,a="mobile"===t;return(0,b.jsxs)(b.Fragment,{children:[n&&(0,b.jsx)(Q,{...e}),a&&(0,b.jsx)(ae,{...e})]})}const ie={expandButton:"expandButton_SZY_",expandButtonIcon:"expandButtonIcon_CMLm"};function se(e){let{toggleSidebar:t}=e;return(0,b.jsx)("div",{className:ie.expandButton,title:(0,r.T)({id:"theme.docs.sidebar.expandButtonTitle",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),"aria-label":(0,r.T)({id:"theme.docs.sidebar.expandButtonAriaLabel",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),tabIndex:0,role:"button",onKeyDown:t,onClick:t,children:(0,b.jsx)(_,{className:ie.expandButtonIcon})})}const le={docSidebarContainer:"docSidebarContainer_e5ai",docSidebarContainerHidden:"docSidebarContainerHidden_vqQo",sidebarViewport:"sidebarViewport_N8x0"};function ce(e){let{children:t}=e;const n=(0,c.t)();return(0,b.jsx)(a.Fragment,{children:t},n?.name??"noSidebar")}function re(e){let{sidebar:t,hiddenSidebarContainer:n,setHiddenSidebarContainer:i}=e;const{pathname:l}=(0,x.zy)(),[c,r]=(0,a.useState)(!1),d=(0,a.useCallback)((()=>{c&&r(!1),!c&&(0,p.O)()&&r(!0),i((e=>!e))}),[i,c]);return(0,b.jsx)("aside",{className:(0,o.A)(s.G.docs.docSidebarContainer,le.docSidebarContainer,n&&le.docSidebarContainerHidden),onTransitionEnd:e=>{e.currentTarget.classList.contains(le.docSidebarContainer)&&n&&r(!0)},children:(0,b.jsx)(ce,{children:(0,b.jsxs)("div",{className:(0,o.A)(le.sidebarViewport,c&&le.sidebarViewportHidden),children:[(0,b.jsx)(oe,{sidebar:t,path:l,onCollapse:d,isHidden:c}),c&&(0,b.jsx)(se,{toggleSidebar:d})]})})})}const de={docMainContainer:"docMainContainer_namt",docMainContainerEnhanced:"docMainContainerEnhanced_sRjM",docItemWrapperEnhanced:"docItemWrapperEnhanced_TX_6"};function ue(e){let{hiddenSidebarContainer:t,children:n}=e;const a=(0,c.t)();return(0,b.jsx)("main",{className:(0,o.A)(de.docMainContainer,(t||!a)&&de.docMainContainerEnhanced),children:(0,b.jsx)("div",{className:(0,o.A)("container padding-top--md padding-bottom--lg",de.docItemWrapper,t&&de.docItemWrapperEnhanced),children:n})})}const me={docRoot:"docRoot_HciC",docsWrapper:"docsWrapper_XLvK"};function be(e){let{children:t}=e;const n=(0,c.t)(),[o,i]=(0,a.useState)(!1);return(0,b.jsxs)("div",{className:me.docsWrapper,children:[(0,b.jsx)(h,{}),(0,b.jsxs)("div",{className:me.docRoot,children:[n&&(0,b.jsx)(re,{sidebar:n.items,hiddenSidebarContainer:o,setHiddenSidebarContainer:i}),(0,b.jsx)(ue,{hiddenSidebarContainer:o,children:t})]})]})}var he=n(6267);function pe(e){const t=(0,l.B5)(e);if(!t)return(0,b.jsx)(he.A,{});const{docElement:n,sidebarName:a,sidebarItems:r}=t;return(0,b.jsx)(i.e3,{className:(0,o.A)(s.G.page.docsDocPage),children:(0,b.jsx)(c.V,{name:a,items:r,children:(0,b.jsx)(be,{children:n})})})}},6267:(e,t,n)=>{n.d(t,{A:()=>l});n(4041);var a=n(3640),o=n(9175),i=n(8553),s=n(1085);function l(e){let{className:t}=e;return(0,s.jsx)("main",{className:(0,a.A)("container margin-vert--xl",t),children:(0,s.jsx)("div",{className:"row",children:(0,s.jsxs)("div",{className:"col col--6 col--offset-3",children:[(0,s.jsx)(i.A,{as:"h1",className:"hero__title",children:(0,s.jsx)(o.A,{id:"theme.NotFound.title",description:"The title of the 404 page",children:"Page Not Found"})}),(0,s.jsx)("p",{children:(0,s.jsx)(o.A,{id:"theme.NotFound.p1",description:"The first paragraph of the 404 page",children:"We could not find what you were looking for."})}),(0,s.jsx)("p",{children:(0,s.jsx)(o.A,{id:"theme.NotFound.p2",description:"The 2nd paragraph of the 404 page",children:"Please contact the owner of the site that linked you to the original URL and let them know their link is broken."})})]})})})}}}]);