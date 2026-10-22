/* Atlas Abierto — ampliar y desplazar el mapa (botones, Ctrl + rueda, pellizco y arrastre). Todo en el navegador. */
(function(){
  'use strict';
  var frame=document.querySelector('.map-frame-screen')||document.querySelector('.map-frame');
  var svg=frame&&frame.querySelector('svg');
  if(!svg||!svg.viewBox||!svg.viewBox.baseVal.width)return;
  var vb0=svg.viewBox.baseVal,B={x:vb0.x,y:vb0.y,w:vb0.width,h:vb0.height},V={x:B.x,y:B.y,w:B.w,h:B.h};
  var MAXZ=10;
  var css=document.createElement('style');css.textContent=
   '.map-frame,.map-frame-screen{position:relative}'+
   '.zoom-ctl{position:absolute;top:10px;right:10px;z-index:20;display:flex;flex-direction:column;gap:6px}'+
   '.zoom-ctl button{width:38px;height:38px;border-radius:6px;border:1px solid var(--line-strong,#8a8f7d);background:var(--paper,#f4efe0);color:var(--ink,#22301F);font-size:22px;line-height:1;cursor:pointer;font-family:"IBM Plex Mono",monospace;box-shadow:0 1px 4px rgba(0,0,0,.2);padding:0}'+
   '.zoom-ctl button:hover{background:var(--ink,#22301F);color:var(--paper,#f4efe0)}'+
   '.zoom-ctl button[disabled]{opacity:.4;cursor:default}'+
   '.zoom-ctl .zr{font-size:15px}'+
   '.zoom-hint{position:absolute;left:10px;bottom:10px;z-index:20;font-family:"IBM Plex Mono",monospace;font-size:11px;background:rgba(244,239,224,.92);color:var(--ink,#22301F);padding:4px 9px;border-radius:999px;pointer-events:none;transition:opacity .6s}'+
   'svg.zoomed{cursor:grab;touch-action:none}svg.zoomed.panning{cursor:grabbing}'+
   '@media print{.zoom-ctl,.zoom-hint{display:none !important}}';
  document.head.appendChild(css);
  var ctl=document.createElement('div');ctl.className='zoom-ctl';
  ctl.innerHTML='<button type="button" data-z="in" aria-label="Ampliar" title="Ampliar">+</button><button type="button" data-z="out" aria-label="Reducir" title="Reducir">−</button><button type="button" data-z="reset" class="zr" aria-label="Vista completa" title="Vista completa">⤢</button>';
  frame.appendChild(ctl);
  var hint=document.createElement('div');hint.className='zoom-hint';hint.textContent='Ctrl + rueda para ampliar · arrastra para mover';frame.appendChild(hint);
  setTimeout(function(){hint.style.opacity='0';},6000);
  var bIn=ctl.querySelector('[data-z=in]'),bOut=ctl.querySelector('[data-z=out]'),bRs=ctl.querySelector('[data-z=reset]');
  function apply(){
    var z=B.w/V.w;
    svg.setAttribute('viewBox',V.x+' '+V.y+' '+V.w+' '+V.h);
    svg.classList.toggle('zoomed',z>1.01);
    bIn.disabled=z>=MAXZ-.01;bOut.disabled=z<=1.01;bRs.disabled=z<=1.01;
  }
  function clamp(){
    V.w=Math.min(B.w,Math.max(B.w/MAXZ,V.w));V.h=V.w*B.h/B.w;
    V.x=Math.min(B.x+B.w-V.w,Math.max(B.x,V.x));V.y=Math.min(B.y+B.h-V.h,Math.max(B.y,V.y));
  }
  function toSvg(cx,cy){var r=svg.getBoundingClientRect();return {x:V.x+(cx-r.left)/r.width*V.w,y:V.y+(cy-r.top)/r.height*V.h,fx:(cx-r.left)/r.width,fy:(cy-r.top)/r.height};}
  function zoomAt(f,cx,cy){
    var p=toSvg(cx,cy);V.w=V.w/f;V.h=V.w*B.h/B.w;clamp0();
    V.x=p.x-p.fx*V.w;V.y=p.y-p.fy*V.h;clamp();apply();
  }
  function clamp0(){V.w=Math.min(B.w,Math.max(B.w/MAXZ,V.w));V.h=V.w*B.h/B.w;}
  function center(){var r=svg.getBoundingClientRect();return [r.left+r.width/2,r.top+r.height/2];}
  bIn.onclick=function(){var c=center();zoomAt(1.6,c[0],c[1]);};
  bOut.onclick=function(){var c=center();zoomAt(1/1.6,c[0],c[1]);};
  bRs.onclick=function(){V={x:B.x,y:B.y,w:B.w,h:B.h};apply();};
  frame.addEventListener('wheel',function(e){
    if(!(e.ctrlKey||e.metaKey))return;e.preventDefault();
    zoomAt(Math.exp(-e.deltaY*(e.deltaMode===1?0.05:0.0025)),e.clientX,e.clientY);hint.style.opacity='0';
  },{passive:false});
  /* arrastrar (ratón o dedo) y pellizcar */
  var ptrs={},drag=null,moved=false,pinch=null;
  svg.addEventListener('pointerdown',function(e){
    if(e.target.closest&&e.target.closest('.zoom-ctl'))return;
    ptrs[e.pointerId]=[e.clientX,e.clientY];moved=false;
    var ids=Object.keys(ptrs);
    if(ids.length===2&&svg.classList.contains('zoomed')){var a=ptrs[ids[0]],b=ptrs[ids[1]];pinch={d:Math.hypot(a[0]-b[0],a[1]-b[1])};drag=null;}
    else if(ids.length===1&&svg.classList.contains('zoomed')){drag={x:e.clientX,y:e.clientY,vx:V.x,vy:V.y};}
  });
  svg.addEventListener('pointermove',function(e){
    if(!ptrs[e.pointerId])return;ptrs[e.pointerId]=[e.clientX,e.clientY];
    var ids=Object.keys(ptrs);
    if(pinch&&ids.length>=2){
      var a=ptrs[ids[0]],b=ptrs[ids[1]],d=Math.hypot(a[0]-b[0],a[1]-b[1]);
      if(pinch.d>0){zoomAt(d/pinch.d,(a[0]+b[0])/2,(a[1]+b[1])/2);}pinch.d=d;moved=true;return;
    }
    if(drag){
      var dx=e.clientX-drag.x,dy=e.clientY-drag.y;
      if(!moved&&Math.hypot(dx,dy)<6)return;
      moved=true;svg.classList.add('panning');
      var r=svg.getBoundingClientRect();
      V.x=drag.vx-dx/r.width*V.w;V.y=drag.vy-dy/r.height*V.h;clamp();apply();
    }
  });
  function up(e){delete ptrs[e.pointerId];if(Object.keys(ptrs).length<2)pinch=null;if(!Object.keys(ptrs).length){drag=null;svg.classList.remove('panning');}else if(svg.classList.contains('zoomed')){var k=Object.keys(ptrs)[0];drag={x:ptrs[k][0],y:ptrs[k][1],vx:V.x,vy:V.y};}}
  svg.addEventListener('pointerup',up);svg.addEventListener('pointercancel',up);
  /* un arrastre no cuenta como clic (importante para el modo juego) */
  frame.addEventListener('click',function(e){if(moved){e.stopPropagation();e.preventDefault();moved=false;}},true);
  /* al imprimir se imprime siempre el mapa completo */
  var saved=null;
  window.addEventListener('beforeprint',function(){saved={x:V.x,y:V.y,w:V.w,h:V.h};V={x:B.x,y:B.y,w:B.w,h:B.h};apply();});
  window.addEventListener('afterprint',function(){if(saved){V=saved;saved=null;apply();}});
  apply();
})();
