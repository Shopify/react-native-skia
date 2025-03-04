"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([[7528,8714],{1398:(e,t,n)=>{n.d(t,{n:()=>r,r:()=>c});var a=n(4041),o=n(4902);const l=a.createContext(null);function r(e){let{children:t,version:n}=e;return a.createElement(l.Provider,{value:n},t)}function c(){const e=(0,a.useContext)(l);if(null===e)throw new o.dV("DocsVersionProvider");return e}},4819:(e,t,n)=>{n.r(t),n.d(t,{default:()=>Ce});var a=n(4041),o=n(9546),l=n(1016),r=n(7917),c=n(8041),i=n(8091),s=n(1398),d=n(8070),m=n(4307),u=n(1915),b=n(3030),p=n(3912);const h={backToTopButton:"backToTopButton_z1FD",backToTopButtonShow:"backToTopButtonShow_w1wE"};function E(){const{shown:e,scrollToTop:t}=function(e){let{threshold:t}=e;const[n,o]=(0,a.useState)(!1),l=(0,a.useRef)(!1),{startScroll:r,cancelScroll:c}=(0,b.gk)();return(0,b.Mq)(((e,n)=>{let{scrollY:a}=e;const r=n?.scrollY;r&&(l.current?l.current=!1:a>=r?(c(),o(!1)):a<t?o(!1):a+window.innerHeight<document.documentElement.scrollHeight&&o(!0))})),(0,p.$)((e=>{e.location.hash&&(l.current=!0,o(!1))})),{shown:n,scrollToTop:()=>r(0)}}({threshold:300});return a.createElement("button",{"aria-label":(0,u.T)({id:"theme.BackToTopButton.buttonAriaLabel",message:"Scroll back to top",description:"The ARIA label for the back to top button"}),className:(0,o.A)("clean-btn",r.G.common.backToTopButton,h.backToTopButton,e&&h.backToTopButtonShow),type:"button",onClick:t})}var f=n(5659),g=n(6090),v=n(6916),C=n(6140),_=n(3315),A=n(9575);function k(e){return a.createElement("svg",(0,A.A)({width:"20",height:"20","aria-hidden":"true"},e),a.createElement("g",{fill:"#7a7a7a"},a.createElement("path",{d:"M9.992 10.023c0 .2-.062.399-.172.547l-4.996 7.492a.982.982 0 01-.828.454H1c-.55 0-1-.453-1-1 0-.2.059-.403.168-.551l4.629-6.942L.168 3.078A.939.939 0 010 2.528c0-.548.45-.997 1-.997h2.996c.352 0 .649.18.828.45L9.82 9.472c.11.148.172.347.172.55zm0 0"}),a.createElement("path",{d:"M19.98 10.023c0 .2-.058.399-.168.547l-4.996 7.492a.987.987 0 01-.828.454h-3c-.547 0-.996-.453-.996-1 0-.2.059-.403.168-.551l4.625-6.942-4.625-6.945a.939.939 0 01-.168-.55 1 1 0 01.996-.997h3c.348 0 .649.18.828.45l4.996 7.492c.11.148.168.347.168.55zm0 0"})))}const S="collapseSidebarButton_Ftvb",T="collapseSidebarButtonIcon_c4WT";function N(e){let{onClick:t}=e;return a.createElement("button",{type:"button",title:(0,u.T)({id:"theme.docs.sidebar.collapseButtonTitle",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),"aria-label":(0,u.T)({id:"theme.docs.sidebar.collapseButtonAriaLabel",message:"Collapse sidebar",description:"The title attribute for collapse button of doc sidebar"}),className:(0,o.A)("button button--secondary button--outline",S),onClick:t},a.createElement(k,{className:T}))}var I=n(9995),x=n(4902);const w=Symbol("EmptyContext"),y=a.createContext(w);function B(e){let{children:t}=e;const[n,o]=(0,a.useState)(null),l=(0,a.useMemo)((()=>({expandedItem:n,setExpandedItem:o})),[n]);return a.createElement(y.Provider,{value:l},t)}var L=n(744),M=n(7923),P=n(2915),H=n(8529);function F(e){let{categoryLabel:t,onClick:n}=e;return a.createElement("button",{"aria-label":(0,u.T)({id:"theme.DocSidebarItem.toggleCollapsedCategoryAriaLabel",message:"Toggle the collapsible sidebar category '{label}'",description:"The ARIA label to toggle the collapsible sidebar category"},{label:t}),type:"button",className:"clean-btn menu__caret",onClick:n})}function G(e){let{item:t,onItemClick:n,activePath:l,level:c,index:s,...d}=e;const{items:m,label:u,collapsible:b,className:p,href:h}=t,{docs:{sidebar:{autoCollapseCategories:E}}}=(0,C.p)(),f=function(e){const t=(0,H.A)();return(0,a.useMemo)((()=>e.href?e.href:!t&&e.collapsible?(0,i._o)(e):void 0),[e,t])}(t),g=(0,i.w8)(t,l),v=(0,M.ys)(h,l),{collapsed:_,setCollapsed:k}=(0,L.u)({initialState:()=>!!b&&(!g&&t.collapsed)}),{expandedItem:S,setExpandedItem:T}=function(){const e=(0,a.useContext)(y);if(e===w)throw new x.dV("DocSidebarItemsExpandedStateProvider");return e}(),N=function(e){void 0===e&&(e=!_),T(e?null:s),k(e)};return function(e){let{isActive:t,collapsed:n,updateCollapsed:o}=e;const l=(0,x.ZC)(t);(0,a.useEffect)((()=>{t&&!l&&n&&o(!1)}),[t,l,n,o])}({isActive:g,collapsed:_,updateCollapsed:N}),(0,a.useEffect)((()=>{b&&null!=S&&S!==s&&E&&k(!0)}),[b,S,s,k,E]),a.createElement("li",{className:(0,o.A)(r.G.docs.docSidebarItemCategory,r.G.docs.docSidebarItemCategoryLevel(c),"menu__list-item",{"menu__list-item--collapsed":_},p)},a.createElement("div",{className:(0,o.A)("menu__list-item-collapsible",{"menu__list-item-collapsible--active":v})},a.createElement(P.A,(0,A.A)({className:(0,o.A)("menu__link",{"menu__link--sublist":b,"menu__link--sublist-caret":!h&&b,"menu__link--active":g}),onClick:b?e=>{n?.(t),h?N(!1):(e.preventDefault(),N())}:()=>{n?.(t)},"aria-current":v?"page":void 0,"aria-expanded":b?!_:void 0,href:b?f??"#":f},d),u),h&&b&&a.createElement(F,{categoryLabel:u,onClick:e=>{e.preventDefault(),N()}})),a.createElement(L.N,{lazy:!0,as:"ul",className:"menu__list",collapsed:_},a.createElement(K,{items:m,tabIndex:_?-1:0,onItemClick:n,activePath:l,level:c+1})))}var W=n(7216),D=n(9213);const q="menuExternalLink_xK2O";function R(e){let{item:t,onItemClick:n,activePath:l,level:c,index:s,...d}=e;const{href:m,label:u,className:b,autoAddBaseUrl:p}=t,h=(0,i.w8)(t,l),E=(0,W.A)(m);return a.createElement("li",{className:(0,o.A)(r.G.docs.docSidebarItemLink,r.G.docs.docSidebarItemLinkLevel(c),"menu__list-item",b),key:u},a.createElement(P.A,(0,A.A)({className:(0,o.A)("menu__link",!E&&q,{"menu__link--active":h}),autoAddBaseUrl:p,"aria-current":h?"page":void 0,to:m},E&&{onClick:n?()=>n(t):void 0},d),u,!E&&a.createElement(D.A,null)))}const V="menuHtmlItem_anEq";function O(e){let{item:t,level:n,index:l}=e;const{value:c,defaultStyle:i,className:s}=t;return a.createElement("li",{className:(0,o.A)(r.G.docs.docSidebarItemLink,r.G.docs.docSidebarItemLinkLevel(n),i&&[V,"menu__list-item"],s),key:l,dangerouslySetInnerHTML:{__html:c}})}function z(e){let{item:t,...n}=e;switch(t.type){case"category":return a.createElement(G,(0,A.A)({item:t},n));case"html":return a.createElement(O,(0,A.A)({item:t},n));default:return a.createElement(R,(0,A.A)({item:t},n))}}function U(e){let{items:t,...n}=e;return a.createElement(B,null,t.map(((e,t)=>a.createElement(z,(0,A.A)({key:t,item:e,index:t},n)))))}const K=(0,a.memo)(U),Y="menu_qiME",J="menuWithAnnouncementBar_hRfJ";function X(e){let{path:t,sidebar:n,className:l}=e;const c=function(){const{isActive:e}=(0,I.Mj)(),[t,n]=(0,a.useState)(e);return(0,b.Mq)((t=>{let{scrollY:a}=t;e&&n(0===a)}),[e]),e&&t}();return a.createElement("nav",{"aria-label":(0,u.T)({id:"theme.docs.sidebar.navAriaLabel",message:"Docs sidebar",description:"The ARIA label for the sidebar navigation"}),className:(0,o.A)("menu thin-scrollbar",Y,c&&J,l)},a.createElement("ul",{className:(0,o.A)(r.G.docs.docSidebarMenu,"menu__list")},a.createElement(K,{items:n,activePath:t,level:1})))}const j="sidebar_vJCc",Q="sidebarWithHideableNavbar_Fo4g",Z="sidebarHidden_vBKa",$="sidebarLogo_nlll";function ee(e){let{path:t,sidebar:n,onCollapse:l,isHidden:r}=e;const{navbar:{hideOnScroll:c},docs:{sidebar:{hideable:i}}}=(0,C.p)();return a.createElement("div",{className:(0,o.A)(j,c&&Q,r&&Z)},c&&a.createElement(_.A,{tabIndex:-1,className:$}),a.createElement(X,{path:t,sidebar:n}),i&&a.createElement(N,{onClick:l}))}const te=a.memo(ee);var ne=n(5318),ae=n(3515);const oe=e=>{let{sidebar:t,path:n}=e;const l=(0,ae.M)();return a.createElement("ul",{className:(0,o.A)(r.G.docs.docSidebarMenu,"menu__list")},a.createElement(K,{items:t,activePath:n,onItemClick:e=>{"category"===e.type&&e.href&&l.toggle(),"link"===e.type&&l.toggle()},level:1}))};function le(e){return a.createElement(ne.GX,{component:oe,props:e})}const re=a.memo(le);function ce(e){const t=(0,v.l)(),n="desktop"===t||"ssr"===t,o="mobile"===t;return a.createElement(a.Fragment,null,n&&a.createElement(te,e),o&&a.createElement(re,e))}const ie={expandButton:"expandButton_qIqc",expandButtonIcon:"expandButtonIcon_aOpf"};function se(e){let{toggleSidebar:t}=e;return a.createElement("div",{className:ie.expandButton,title:(0,u.T)({id:"theme.docs.sidebar.expandButtonTitle",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),"aria-label":(0,u.T)({id:"theme.docs.sidebar.expandButtonAriaLabel",message:"Expand sidebar",description:"The ARIA label and title attribute for expand button of doc sidebar"}),tabIndex:0,role:"button",onKeyDown:t,onClick:t},a.createElement(k,{className:ie.expandButtonIcon}))}const de={docSidebarContainer:"docSidebarContainer_aIKW",docSidebarContainerHidden:"docSidebarContainerHidden_UIq3",sidebarViewport:"sidebarViewport_DwR9"};function me(e){let{children:t}=e;const n=(0,d.t)();return a.createElement(a.Fragment,{key:n?.name??"noSidebar"},t)}function ue(e){let{sidebar:t,hiddenSidebarContainer:n,setHiddenSidebarContainer:l}=e;const{pathname:c}=(0,g.zy)(),[i,s]=(0,a.useState)(!1),d=(0,a.useCallback)((()=>{i&&s(!1),!i&&(0,f.O)()&&s(!0),l((e=>!e))}),[l,i]);return a.createElement("aside",{className:(0,o.A)(r.G.docs.docSidebarContainer,de.docSidebarContainer,n&&de.docSidebarContainerHidden),onTransitionEnd:e=>{e.currentTarget.classList.contains(de.docSidebarContainer)&&n&&s(!0)}},a.createElement(me,null,a.createElement("div",{className:(0,o.A)(de.sidebarViewport,i&&de.sidebarViewportHidden)},a.createElement(ce,{sidebar:t,path:c,onCollapse:d,isHidden:i}),i&&a.createElement(se,{toggleSidebar:d}))))}const be={docMainContainer:"docMainContainer_fv3b",docMainContainerEnhanced:"docMainContainerEnhanced_wOQt",docItemWrapperEnhanced:"docItemWrapperEnhanced_DUiu"};function pe(e){let{hiddenSidebarContainer:t,children:n}=e;const l=(0,d.t)();return a.createElement("main",{className:(0,o.A)(be.docMainContainer,(t||!l)&&be.docMainContainerEnhanced)},a.createElement("div",{className:(0,o.A)("container padding-top--md padding-bottom--lg",be.docItemWrapper,t&&be.docItemWrapperEnhanced)},n))}const he={docPage:"docPage_pOTq",docsWrapper:"docsWrapper_BqXd","themedComponent--light":"themedComponent--light_HcOG"};function Ee(e){let{children:t}=e;const n=(0,d.t)(),[o,l]=(0,a.useState)(!1);return a.createElement(m.A,{wrapperClassName:he.docsWrapper},a.createElement(E,null),a.createElement("div",{className:he.docPage},n&&a.createElement(ue,{sidebar:n.items,hiddenSidebarContainer:o,setHiddenSidebarContainer:l}),a.createElement(pe,{hiddenSidebarContainer:o},t)))}var fe=n(7528),ge=n(4393);function ve(e){const{versionMetadata:t}=e;return a.createElement(a.Fragment,null,a.createElement(ge.A,{version:t.version,tag:(0,c.tU)(t.pluginId,t.version)}),a.createElement(l.be,null,t.noIndex&&a.createElement("meta",{name:"robots",content:"noindex, nofollow"})))}function Ce(e){const{versionMetadata:t}=e,n=(0,i.mz)(e);if(!n)return a.createElement(fe.default,null);const{docElement:c,sidebarName:m,sidebarItems:u}=n;return a.createElement(a.Fragment,null,a.createElement(ve,e),a.createElement(l.e3,{className:(0,o.A)(r.G.wrapper.docsPages,r.G.page.docsDocPage,e.versionMetadata.className)},a.createElement(s.n,{version:t},a.createElement(d.V,{name:m,items:u},a.createElement(Ee,null,c)))))}},7528:(e,t,n)=>{n.r(t),n.d(t,{default:()=>c});var a=n(4041),o=n(1915),l=n(1016),r=n(4307);function c(){return a.createElement(a.Fragment,null,a.createElement(l.be,{title:(0,o.T)({id:"theme.NotFound.title",message:"Page Not Found"})}),a.createElement(r.A,null,a.createElement("main",{className:"container margin-vert--xl"},a.createElement("div",{className:"row"},a.createElement("div",{className:"col col--6 col--offset-3"},a.createElement("h1",{className:"hero__title"},a.createElement(o.A,{id:"theme.NotFound.title",description:"The title of the 404 page"},"Page Not Found")),a.createElement("p",null,a.createElement(o.A,{id:"theme.NotFound.p1",description:"The first paragraph of the 404 page"},"We could not find what you were looking for.")),a.createElement("p",null,a.createElement(o.A,{id:"theme.NotFound.p2",description:"The 2nd paragraph of the 404 page"},"Please contact the owner of the site that linked you to the original URL and let them know their link is broken.")))))))}}}]);