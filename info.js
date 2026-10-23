/* Atlas Abierto — al pulsar un terremoto o un volcán del mapa geológico se muestran sus datos. Todo en el navegador. */
(function(){
  'use strict';
  var me=document.currentScript;
  var frame=document.querySelector('.map-frame-screen')||document.querySelector('.map-frame');
  var svg=frame&&frame.querySelector('svg');
  if(!svg||!me)return;
  var URLQ=me.getAttribute('data-quakes'),URLV=me.getAttribute('data-volc');
  var NS='http://www.w3.org/2000/svg';
  var MES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  var css=document.createElement('style');css.textContent=
   '.info-pop{position:absolute;z-index:30;max-width:290px;background:var(--paper,#f4efe0);color:var(--ink,#22301F);border:1px solid var(--line-strong,#8a8f7d);border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.28);padding:11px 30px 11px 14px;font-size:13.5px;line-height:1.5;font-family:"IBM Plex Sans",sans-serif}'+
   '.info-pop b.t{display:block;font-family:"Fraunces",serif;font-size:16.5px;margin-bottom:2px}'+
   '.info-pop .s{color:var(--ink-soft,#4B5A45)}.info-pop .f{display:block;margin-top:6px;font-size:11.5px;color:var(--ink-soft,#4B5A45);font-family:"IBM Plex Mono",monospace}'+
   '.info-pop button{position:absolute;top:4px;right:6px;border:none;background:none;font-size:20px;line-height:1;cursor:pointer;color:var(--ink,#22301F)}'+
   '@media print{.info-pop{display:none !important}}';
  document.head.appendChild(css);
  var pop=null,ring=null,D=null,vol=[],qk=[],loading=false;
  function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function vis(id){var g=svg.querySelector('#'+id);return !!g&&getComputedStyle(g).display!=='none';}
  function clear(){if(pop){pop.remove();pop=null;}if(ring){ring.remove();ring=null;}}
  function load(cb){
    if(D){cb();return;}
    if(loading)return;loading=true;
    Promise.all([fetch(URLQ).then(function(r){return r.json();}),fetch(URLV).then(function(r){return r.json();})]).then(function(a){
      D={q:a[0],v:a[1]};
      /* geometría en unidades del SVG */
      qk=[].slice.call(svg.querySelectorAll('#terremotos circle')).map(function(c){return [+c.getAttribute('cx'),+c.getAttribute('cy'),+c.getAttribute('r')];});
      vol=[].slice.call(svg.querySelectorAll('#volcanes path[data-v]')).map(function(p){var b=p.getBBox();return {x:b.x+b.width/2,y:b.y+b.height*0.55,r:Math.max(b.width,b.height)/2,id:p.getAttribute('data-v'),nm:p.getAttribute('data-name')};});
      loading=false;cb();
    }).catch(function(){loading=false;D={q:[],v:{}};cb(true);});
  }
  function fecha(s){var p=s.split('-');return (+p[2])+' de '+MES[+p[1]-1]+' de '+p[0];}
  function anio(y){return y<0?(-y)+' a. C.':String(y);}
  function mag(m){return (Math.round(m*10)/10).toFixed(1).replace('.',',');}
  function show(html,x,y,at){
    clear();
    pop=document.createElement('div');pop.className='info-pop';pop.setAttribute('role','status');
    pop.innerHTML='<button type="button" aria-label="Cerrar">×</button>'+html;
    frame.appendChild(pop);
    pop.querySelector('button').onclick=clear;
    var fr=frame.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
    var px=x-fr.left+14,py=y-fr.top+14;
    if(px+w>fr.width-8)px=x-fr.left-w-14;if(px<8)px=8;
    if(py+h>fr.height-8)py=y-fr.top-h-14;if(py<8)py=8;
    pop.style.left=px+'px';pop.style.top=py+'px';
    var u=1/svg.getScreenCTM().a;
    ring=document.createElementNS(NS,'circle');ring.setAttribute('cx',at[0]);ring.setAttribute('cy',at[1]);ring.setAttribute('r',Math.max(at[2]+4*u,9*u));
    ring.setAttribute('fill','none');ring.setAttribute('stroke','#0b4f9c');ring.setAttribute('stroke-width',2.6*u);ring.setAttribute('pointer-events','none');svg.appendChild(ring);
  }
  function onClick(ev){
    if(document.body.classList.contains('juego-on'))return;
    var m=svg.getScreenCTM();if(!m)return;
    var inv=m.inverse(),p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;p=p.matrixTransform(inv);
    var u=1/m.a,tol=11*u;
    var haveV=vis('volcanes'),haveQ=vis('terremotos');
    if(!haveV&&!haveQ){clear();return;}
    load(function(failed){
      var best=null,bd=1e9;
      if(haveV)vol.forEach(function(v){var d=Math.hypot(v.x-p.x,v.y-p.y)-v.r;if(d<=tol&&d<bd){bd=d;best={t:'v',v:v};}});
      if(!best&&haveQ){var qd=1e9,qi=-1;for(var i=0;i<qk.length;i++){var c=qk[i],d=Math.hypot(c[0]-p.x,c[1]-p.y)-c[2];if(d<=tol&&d<qd){qd=d;qi=i;}}if(qi>=0)best={t:'q',i:qi};}
      if(!best){clear();return;}
      if(best.t==='v'){
        var v=best.v,i=D.v[v.id]||{},name=v.nm||v.id;
        var h='<b class="t">'+esc(name)+'</b><span class="s">Volcán · '+esc(i.c||'')+(i.t?' · '+esc(i.t):'')+'</span><br>';
        if(i.h&&+i.h)h+='Altura: '+(+i.h).toLocaleString('es-ES')+' m<br>';
        if(i.y!=null)h+='Última erupción significativa: '+anio(i.y)+'<br>';
        if(i.n)h+='Erupciones significativas registradas: '+i.n+'<br>';
        if(i.v!=null)h+='Mayor explosividad (VEI): '+i.v+' <span class="s">(escala de 0 a 8)</span><br>';
        h+='<span class="f">Datos: NOAA</span>';
        show(h,ev.clientX,ev.clientY,[v.x,v.y,v.r]);
      } else {
        var q=D.q[best.i];
        if(!q){clear();return;}
        var pr=q[2]<70?'superficial':q[2]<300?'intermedio':'profundo';
        var c=qk[best.i];
        show('<b class="t">Terremoto de magnitud '+mag(q[0])+'</b><span class="s">'+fecha(q[1])+'</span><br>Profundidad: '+q[2]+' km <span class="s">('+pr+')</span><br><span class="s">'+esc(q[3])+'</span><span class="f">Datos: USGS</span>',ev.clientX,ev.clientY,c);
      }
    });
  }
  svg.addEventListener('click',onClick);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')clear();});
  /* al mover o ampliar el mapa, la ficha se cierra */
  new MutationObserver(clear).observe(svg,{attributes:true,attributeFilter:['viewBox']});
  /* ocultar capas o jugar también la cierra */
  document.addEventListener('change',function(e){if(e.target&&e.target.matches&&e.target.matches('[data-layer]'))clear();});
})();
