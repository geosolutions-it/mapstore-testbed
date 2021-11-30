(self.webpackChunkfgjson_app=self.webpackChunkfgjson_app||[]).push([[546],{84081:(e,t,s)=>{"use strict";s.d(t,{Z:()=>Y});var n=s(67294),r=s.n(n),o=s(2479),i=s(8486);function p(){return p=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var n in s)Object.prototype.hasOwnProperty.call(s,n)&&(e[n]=s[n])}return e},p.apply(this,arguments)}const a=e=>{let{loading:t,isLoading:s}=e;return t||s&&("function"==typeof s?s():!0===s)};var l=s(69934);const c=(0,o.CA)({onNext:e=>{let{index:t=0,setIndex:s=(()=>{}),validResponses:n=[]}=e;return()=>{s(Math.min(n.length-1,t+1))}},onPrevious:e=>{let{index:t,setIndex:s=(()=>{})}=e;return()=>{s(Math.max(0,t-1))}}}),h=(0,o.lG)({format:(0,l.wR)(),validator:l.Te});var u=s(33664),d=s(22222),m=s(48953),f=s(86807),g=s(45697),y=s.n(g),v=s(27723),b=s(83404),x=s(80681);function E(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}class P extends r().Component{constructor(){super(...arguments),E(this,"onTouchStart",(e=>{const t=e.touches[0];this.startX=t.pageX,this.startY=t.pageY,this.setState({scrolling:!1})})),E(this,"onTouchMove",(e=>{const t=e.touches[0],s=e.currentTarget;if(this.state.scrolling)return void e.stopPropagation();if(Math.abs(this.startY-t.pageY)>Math.abs(this.startX-t.pageX))return void e.stopPropagation();const n=this.startX<t.pageX?"left":"right";(s&&"left"===n&&s.clientWidth<s.scrollWidth&&0!==s.scrollLeft||s&&"right"===n&&s.clientWidth+s.scrollLeft!==s.scrollWidth)&&(this.setState({scrolling:!0}),e.stopPropagation())})),E(this,"onTouchEnd",(()=>{this.setState({scrolling:!1})})),E(this,"renderPage",(()=>{const e="function"==typeof this.props.viewers?this.props.viewers:this.props.viewers[this.props.format];return e?r().createElement(e,{response:this.props.response,layer:this.props.layer}):null}))}render(){return r().createElement("div",{style:{width:"100%",height:"100%",overflowX:"auto"},onTouchMove:this.onTouchMove,onTouchStart:this.onTouchStart,onTouchEnd:this.onTouchEnd},this.renderPage())}}E(P,"propTypes",{format:y().string,viewers:y().oneOfType([y().func,y().object]),response:y().oneOfType([y().string,y().object,y().node]),layer:y().object});var w=s(41609),R=s.n(w),N=s(31351),O=s.n(N),C=s(10240),T=s.n(C),j=(s(27361),s(63278));function M(){return M=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var s=arguments[t];for(var n in s)Object.prototype.hasOwnProperty.call(s,n)&&(e[n]=s[n])}return e},M.apply(this,arguments)}function I(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}class k extends r().Component{constructor(){super(...arguments),I(this,"getResponseProperties",(()=>{const e=this.props.validator(this.props.format),t=this.props.responses.map((e=>void 0===e?{}:e)),s=this.props.renderValidOnly?e.getValidResponses(t):t,n=e.getNoValidResponses(this.props.responses),r=this.props.requests.length===n.length;return{validResponses:s,currResponse:this.getCurrentResponse(s[this.props.index]),emptyResponses:r,invalidResponses:n}})),I(this,"getCurrentResponse",(e=>this.props.validator(this.props.format).getValidResponses([e]))),I(this,"renderEmptyLayers",(()=>{const{invalidResponses:e,emptyResponses:t}=this.getResponseProperties();if(0===this.props.missingResponses&&t)return null;let s=0!==e.length;if(this.props.renderValidOnly||(s=s&&0===this.props.missingResponses),s){const t=e.map((e=>{const{layerMetadata:t}=e;return t.title}));return this.props.showEmptyMessageGFI?r().createElement(x.Alert,{bsStyle:"info"},r().createElement(b.Z,{msgId:"noInfoForLayers"}),r().createElement("b",null,t.join(", "))):null}return null})),I(this,"renderPage",(e=>{const t=this.props.viewers[this.props.format];return t?r().createElement(t,{response:e}):null})),I(this,"renderEmptyPages",(()=>{const{emptyResponses:e}=this.getResponseProperties();return 0===this.props.missingResponses&&e?r().createElement(x.Alert,{bsStyle:"danger"},r().createElement("h4",null,r().createElement(v.Z,{msgId:"noFeatureInfo"}))):null})),I(this,"renderPages",(()=>{const{validResponses:e}=this.getResponseProperties();return e.map(((t,s)=>{var n;const{response:o,layerMetadata:i}=t,p=((e,t)=>{const{format:s,queryParams:n={}}=e;return n.info_format||n.outputFormat||s&&j.O7[s]||t.format})(t,this.props),a=this.props.header;let c;null!=i&&null!==(n=i.viewer)&&void 0!==n&&n.type&&(c=(0,l.gA)(i.viewer.type));const h=e.filter((e=>!T()(e.response,"no features were found"))).length;return r().createElement(x.Panel,{eventKey:s,key:s,collapsible:this.props.collapsible,header:a?r().createElement("span",null,r().createElement(a,M({size:h},this.props.headerOptions,i,{index:this.props.index,onNext:()=>this.props.onNext(),onPrevious:()=>this.props.onPrevious()}))):null,style:this.props.style},r().createElement(P,{response:o,format:p,viewers:c||this.props.viewers,layer:i}))}))})),I(this,"containerStyle",(e=>R()(e)&&this.props.isMobile?{height:"100%"}:{display:R()(e)?"none":"block"}))}shouldComponentUpdate(e){return e.responses!==this.props.responses||e.missingResponses!==this.props.missingResponses||e.index!==this.props.index}render(){const e=this.props.container,{currResponse:t,emptyResponses:s}=this.getResponseProperties();let n=[this.renderEmptyLayers(),r().createElement(e,M({},this.props.containerProps,{onChangeIndex:e=>{this.props.setIndex(e)},ref:"container",index:this.props.index||0,key:"swiper",style:this.containerStyle(t),className:"swipeable-view"}),this.renderPages())];return n=this.props.isMobile?n:O()(n),r().createElement("div",{className:"mapstore-identify-viewer"},s?this.renderEmptyPages():n.map((e=>e)))}}I(k,"propTypes",{format:y().string,collapsible:y().bool,requests:y().array,responses:y().array,missingResponses:y().number,container:y().oneOfType([y().object,y().func]),header:y().oneOfType([y().object,y().func]),headerOptions:y().object,validator:y().func,viewers:y().object,style:y().object,containerProps:y().object,index:y().number,onNext:y().func,onPrevious:y().func,onUpdateIndex:y().func,setIndex:y().func,showEmptyMessageGFI:y().bool,renderValidOnly:y().bool,loaded:y().bool,isMobile:y().bool}),I(k,"defaultProps",{format:(0,l.wR)(),responses:[],requests:[],missingResponses:0,collapsible:!1,headerOptions:{},container:x.Accordion,validator:l.Te,viewers:(0,l.Qm)(),style:{position:"relative",marginBottom:0},containerProps:{},showEmptyMessageGFI:!0,renderValidOnly:!1,onNext:()=>{},onPrevious:()=>{},setIndex:()=>{},isMobile:!1});const q=k;var G=s(1469),S=s.n(G),F=s(52353),B=s.n(F),L=s(49836);function A(e,t,s){return t in e?Object.defineProperty(e,t,{value:s,enumerable:!0,configurable:!0,writable:!0}):e[t]=s,e}class V extends r().Component{constructor(){super(...arguments),A(this,"renderLeftButton",(()=>{const e=0===this.props.index;return this.props.useButtons?r().createElement(L.Z,{ref:"left",disabled:e,className:this.props.btnClassName||"square-button-md no-border",onClick:()=>{this.props.onPrevious()}},r().createElement(x.Glyphicon,{glyph:"back"})):r().createElement("a",{ref:"left",disabled:e,className:this.props.btnClassName||"square-button-md",onClick:()=>{this.props.onPrevious()}},r().createElement(x.Glyphicon,{glyph:"back"}))})),A(this,"renderRightButton",(()=>{const e=this.props.index===this.props.size-1;return this.props.useButtons?r().createElement(L.Z,{ref:"right",disabled:e,className:this.props.btnClassName||"square-button-md no-border",onClick:()=>{this.props.onNext()}},r().createElement(x.Glyphicon,{glyph:"next"})):r().createElement("a",{ref:"right",disabled:e,className:this.props.btnClassName||"square-button-md",onClick:()=>{this.props.onNext()}},r().createElement(x.Glyphicon,{glyph:"next"}))}))}componentWillUnmount(){this.interval&&clearInterval(this.interval)}render(){return r().createElement("div",{className:"ms-identify-swipe-header"},this.props.size>1&&r().createElement("div",{className:"ms-identify-swipe-header-arrow"},this.renderLeftButton()),r().createElement("div",{className:"ms-identify-swipe-header-title"},this.props.title),this.props.size>1&&r().createElement("div",{className:"ms-identify-swipe-header-arrow"},this.renderRightButton()))}}A(V,"propTypes",{title:y().string,index:y().number,size:y().number,container:y().oneOfType([y().object,y().func]),useButtons:y().bool,onPrevious:y().func,onNext:y().func,btnClassName:y().string}),A(V,"defaultProps",{useButtons:!0});const W=V;var X=s(99586);const Z=(0,o.qC)((0,u.connect)((0,d.P1)(m.Qf,(e=>({index:e}))),{setIndex:f.oO}),(0,o.lG)({index:0,responses:[]})),z=(0,d.P1)([m.q7,m.o9,m.OK,m.us,m.x0,X.hp,m.vR],((e,t,s,n,r,o,i)=>({responses:e,validResponses:t,requests:s,format:n,showEmptyMessageGFI:r,missingResponses:(s||[]).length-(e||[]).length,renderValidOnly:o,loaded:i}))),Y={identify:(0,o.qC)((0,u.connect)(z),(0,o.lG)({responses:[],container:e=>{let{index:t,children:s}=e;return r().createElement(r().Fragment,null,S()(s)&&s[t]||s)},header:W}),Z,h,c,function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:a,t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:i.Z;return(0,o.WY)(e,(()=>e=>{let{loaderProps:n}=e;return r().createElement(s,p({},t,n))}))}((e=>{let{loaded:t}=e;return B()(t)})))(q)}},26160:(e,t,s)=>{"use strict";s.d(t,{fH:()=>o,FP:()=>i,R3:()=>p});var n=s(55877),r=s.n(n);const o=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:r()(),t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"ms-map-popup";const s=document.createElement("div");return s.setAttribute("id",e+"-map-popup"),s.setAttribute("class",t),s},i=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:"";return e.startsWith("<")},p=(e,t)=>{if(!t)return e;if(t instanceof Node){const s=document.createDocumentFragment();s.appendChild(t),e.appendChild(s)}else i(t)?e.innerHTML=t:e.append(document.createTextNode(String(t)));return e}},31351:e=>{var t=Array.prototype.reverse;e.exports=function(e){return null==e?e:t.call(e)}},10240:(e,t,s)=>{var n=s(29750),r=s(80531),o=s(40554),i=s(79833);e.exports=function(e,t,s){return e=i(e),s=null==s?0:n(o(s),0,e.length),t=r(t),e.slice(s,s+t.length)==t}}}]);