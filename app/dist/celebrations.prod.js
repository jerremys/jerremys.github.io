"use strict";function _classCallCheck(t,i){if(!(t instanceof i))throw new TypeError("Cannot call a class as a function")}function _defineProperties(t,i){for(var e=0;e<i.length;e++){var s=i[e];s.enumerable=s.enumerable||!1,s.configurable=!0,"value"in s&&(s.writable=!0),Object.defineProperty(t,s.key,s)}}function _createClass(t,i,e){return i&&_defineProperties(t.prototype,i),e&&_defineProperties(t,e),t}latin.celebrations={},function(){function t(){for(var h=0<arguments.length&&void 0!==arguments[0]?arguments[0]:12,t=[],i=function(t,i){var e=Math.sin(Math.PI/h*2*t+i),s=(Math.floor(127*e)+128).toString(16);return 1===s.length?"0"+s:s},e=0;e<h;e++){var s=i(e,0*Math.PI*2/3),a=i(e,2*Math.PI/3),n=i(e,2*Math.PI*2/3);t[e]="#"+s+n+a}return t}var e,s,h,a,n,o,r,l,c,u={},i={},d={},f={},y={},g={},w={},x={el:document.getElementById("celebrationCanvas"),ctx:null,resize:function(){x.el.width=$(document).width(),x.el.height=$(window).height()},show:function(){$("body").css("overflow","hidden"),x.resize(),null===x.ctx&&(x.ctx=x.el.getContext("2d")),$(x.el).show()},hide:function(){$("body").css("overflow","auto"),$(x.el).hide()},getSize:function(){return{x:x.el.width=$(document).width(),y:x.el.height}}};function v(){var t,i;h&&(r&&x.ctx.clearRect(0,0,x.el.width,x.el.height),(i=x.ctx).fillStyle=a[n++%a.length],i.shadowColor="#333",i.shadowBlur=10,r&&(i.shadowOffsetX=c.width-l.minWidth,i.shadowOffsetY=c.height-l.minHeight,t=i.shadowOffsetX<i.shadowOffsetY?i.shadowOffsetX:i.shadowOffsetY,i.shadowBlur=Math.floor(t/2)),i.fillRect(c.x,c.y,c.width,c.height),c.width>=l.maxWidth?l.growWidth=!1:c.width<=l.minWidth&&(l.growWidth=!0),c.height>=l.maxHeight?l.growHeight=!1:c.height<=l.minHeight&&(l.growHeight=!0),c.height+=l.growHeight?l.growBy:-l.growBy,c.width+=l.growWidth?l.growBy:-l.growBy,c.x>=e-c.width?c.xStep=-o:c.x<=0&&(c.xStep=o),c.y>=s-c.height?c.yStep=-o:c.y<=0&&(c.yStep=o),c.x+=c.xStep,c.y+=c.yStep,window.requestAnimationFrame(v))}function p(){i.resize(),h=!0,x.show(),v()}function m(){h=!1,x.hide()}function b(){e=$("#celebrations").width(),s=$("#celebrations").height(),c.x=Math.floor(Math.random()*(e-100)),c.y=Math.floor(Math.random()*(s-100)),x.resize()}!function(){var o=["#ffc000","#ff3b3b","#ff8400"];window.explode=function(t,i){var e=[],s=window.devicePixelRatio,h=document.createElement("canvas"),a=h.getContext("2d");h.style.position="absolute",h.style.left=t-100+"px",h.style.top=i-100+"px",h.style.pointerEvents="none",h.style.width="200px",h.style.height="200px",h.style.zIndex=100,h.width=200*s,h.height=200*s,document.body.appendChild(h);for(var n=0;n<25;n++)e.push({x:h.width/2,y:h.height/2,radius:l(20,30),color:o[Math.floor(Math.random()*o.length)],rotation:l(0,360,!0),speed:l(8,12),friction:.9,opacity:l(0,.5,!0),yVel:0,gravity:.1});r(e,a,h.width,h.height),setTimeout(function(){return document.body.removeChild(h)},1e3)};var r=function t(i,e,s,h){return requestAnimationFrame(function(){return t(i,e,s,h)}),e.clearRect(0,0,s,h),i.forEach(function(t,i){t.x+=t.speed*Math.cos(t.rotation*Math.PI/180),t.y+=t.speed*Math.sin(t.rotation*Math.PI/180),t.opacity-=.01,t.speed*=t.friction,t.radius*=t.friction,t.yVel+=t.gravity,t.y+=t.yVel,t.opacity<0||t.radius<0||(e.beginPath(),e.globalAlpha=t.opacity,e.fillStyle=t.color,e.arc(t.x,t.y,t.radius,0,2*Math.PI,!1),e.fill())}),e},l=function(t,i,e){return parseFloat((Math.random()*((t||1)-(i||0))+(i||0)).toFixed(e||0))}}(),function(){var r=0,l=0,i=0,e=0,t=0,h={r:255,g:0,b:0},s=!0,a=function(){function t(){_classCallCheck(this,t),this.reset()}return _createClass(t,[{key:"reset",value:function(){var t=400*Math.random()-200,i=400*Math.random()-200,e=800*Math.random()-200;this.x=t||0,this.y=i||0,this.z=e||0,this.particles=[];for(var s=0;s<200;s++)this.particles.push(new n(this.x,this.y,this.z,{r:h.r,g:h.g,b:h.b}))}},{key:"update",value:function(){var t=this.particles.length;this.particles.sort(function(t,i){return i.z-t.z});for(var i=0;i<t;i++)this.particles[i].update();this.particles.length<=0&&this.reset()}},{key:"render",value:function(t){for(var i=t.data,e=0;e<this.particles.length;e++){var s=this.particles[e],h=Math.sqrt((s.x-s.ox)*(s.x-s.ox)+(s.y-s.oy)*(s.y-s.oy)+(s.z-s.oz)*(s.z-s.oz));if(255<h&&(s.render=!1,this.particles.splice(e,1),this.particles.length--),s.render&&s.xPos<r&&0<s.xPos&&0<s.yPos&&s.yPos<l)for(var a=0;a<s.size;a++)for(var n,o=0;o<s.size;o++){s.xPos+a<r&&0<s.xPos+a&&0<s.yPos+o&&s.yPos+o<l&&(i[n=4*(~~(s.xPos+a)+~~(s.yPos+o)*r)]=s.color[0],i[1+n]=s.color[1],i[2+n]=s.color[2],i[3+n]=255-h)}}}}]),t}();function n(t,i,e,s){this.x=t,this.y=i,this.z=e,this.startX=this.x,this.startY=this.y,this.startZ=this.z,this.ox=this.x,this.oy=this.y,this.oz=this.z,this.xPos=0,this.yPos=0,this.vx=10*Math.random()-5,this.vy=10*Math.random()-5,this.vz=10*Math.random()-5,this.color=[s.r,s.g,s.b],this.render=!0,this.size=Math.round(+Math.random()+1)}function o(){if(s){c();for(var t=x.ctx.createImageData(r,l),i=0;i<30;i++)d[i].update(),d[i].render(t);x.ctx.putImageData(t,0,0),requestAnimationFrame(o)}}function c(){100<(t+=.6)&&(t=0),h.r=~~(127*Math.sin(.3*t+0)+128),h.g=~~(127*Math.sin(.3*t+2)+128),h.b=~~(127*Math.sin(.3*t+4)+128)}n.prototype.rotate=function(){var t=this.startX*Math.cos(180)-this.startY*Math.sin(180),i=this.startY*Math.cos(180)+this.startX*Math.sin(180);this.x=t,this.y=i},n.prototype.update=function(){var t;this.x=this.startX+=this.vx,this.y=this.startY+=this.vy,this.z=this.startZ-=this.vz,this.rotate(),this.vy+=.1,this.x+=this.vx,this.y+=this.vy,this.z-=this.vz,this.render=!1,-300<this.z&&(t=300/(300+this.z),this.size=2*t,this.xPos=e+this.x*t,this.yPos=i+this.y*t,this.render=!0)};for(var d=[],f=0;f<30;f++)c(),d.push(new a);u.show=function(t){s=!0,x.show(t),r=x.getSize().x,l=x.getSize().y,i=l/2,e=r/2,o()},u.hide=function(){s=!1,x.hide()},u.resize=function(){x.resize()}}(),h=!0,a=t(40),l={maxWidth:150,minWidth:50,maxHeight:150,minHeight:50,growBy:8,growWidth:!(r=!(o=20)),growHeight:!(n=0)},c={x:0,y:0,xStep:o,yStep:o,height:100,width:100},i.show=function(){r=!1,l.growBy=8,o=20,p()},i.hide=m,i.resize=b,d.show=function(){r=!0,l.growBy=1,o=c.xStep=c.yStep=5,p()},d.hide=m,d.resize=b,function(){var n=!1,h=t(12),a=0;f.show=function(t){n=!0,x.show(t),i()},f.hide=function(){n=!1,x.hide()},f.resize=function(){x.resize(),i()};var o=function(){function s(t,i){_classCallCheck(this,s),this.canvas=t[0],this.context=x.ctx,this.canvasWidth=t.width(),this.canvasHeight=t.height(),this.x=this.canvasWidth/2,this.y=this.canvasHeight,this.radius=10,this.speed=this.canvasWidth/500,this.angle=Math.PI/2,this.generation=0,this.lifespan=0,this.totalDistance=0,this.distance=0,this.depth=0,i&&(this.x=i.x,this.y=i.y,this.angle=i.angle,this.speed=i.speed,this.radius=.95*i.radius,this.generation=i.generation+1,this.fillStyle=i.fillStyle,this.totalDistance=i.totalDistance,this.depth=i.depth+1)}return _createClass(s,[{key:"split",value:function(){var t=(this.distance-this.canvasHeight/(0==this.generation?5:10))/100;if(Math.random()<t){for(var i=2+Math.round(2*Math.random()),e=0;e<i;e++)r.add(new s($(x.el),this));r.remove(this)}}},{key:"next",value:function(){this.draw(),this.iterate(),this.angle+=Math.random()/5-.1,this.split(),this.lifespan++,this.killBranchIfTooSmall()}},{key:"draw",value:function(){var t=this.context;t.save(),t.fillStyle="#333333",t.shadowColor="rgba(0, 0, 0, .3)",t.shadowBlur=8,t.shadowOffsetX=5,t.shadowOffsetY=5,t.beginPath(),t.moveTo(this.x,this.y),t.arc(this.x,this.y,this.radius,0,2*Math.PI,!0),t.closePath(),t.fill(),t.restore()}},{key:"iterate",value:function(){var t=this.x,i=this.y;this.x+=this.speed*Math.cos(this.angle),this.y+=this.speed*-Math.sin(this.angle),this.radius*=.99-this.generation/250;var e=Math.sqrt(Math.abs(t-this.x)+Math.abs(i-this.y));this.distance+=e,this.totalDistance+=e,this.speed>2*this.radius&&(this.speed=2*this.radius)}},{key:"killBranchIfTooSmall",value:function(){this.radius<.2&&(r.remove(this),this.drawLeaf(this.x,this.y))}},{key:"drawLeaf",value:function(t,i){var e=this.context;e.fillStyle=h[a++%h.length],e.strokeStyle=h[a%h.length],e.beginPath(),e.ellipse(t,i,3,9,this.angle,0,2*Math.PI),e.fill(),e.stroke()}}]),s}(),r={branches:[],next:function(){for(var t in r.branches)r.branches[t]&&r.branches[t].next()},add:function(t){r.branches.push(t)},remove:function(t){for(var i in r.branches)r.branches[i]===t&&r.branches.splice(i,1);r.branches.length||(n=!1)}};function i(){for(var t=$(x.el),i=t.width(),e=4+8*Math.random(),s=i/50,h=0;h<e;h++){var a=new o(t);a.x=i/2-s+h*s*2/e,a.radius=s,r.add(a)}!function t(){r.next(),n&&requestAnimationFrame(t)}()}}(),latin.celebrations={fireworks:u,filler:i,bouncer:d,tree:f,aquarium:y,bear:g,stars:w},y.show=function(t){$("#aquarium-celebration").show()},y.hide=function(){$("#aquarium-celebration").hide()},g.show=function(t){$("#bear-celebration").show()},g.hide=function(){$("#bear-celebration").hide()},w.show=function(t){$("#stars-celebration").show()},w.hide=function(){$("#stars-celebration").hide()}}();