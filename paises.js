/* Atlas Abierto — al pulsar un país del mapa político se muestra su ficha (bandera, capital, población…). Todo en el navegador. */
(function(){
  'use strict';
  var me=document.currentScript;
  var frame=document.querySelector('.map-frame-screen')||document.querySelector('.map-frame');
  var svg=frame&&frame.querySelector('svg');
  if(!svg||!me)return;
  var URL_=me.getAttribute('data-paises')||'datos-paises.json';
  var NS='http://www.w3.org/2000/svg';
  var css=document.createElement('style');css.textContent=
   '.pais-pop{position:absolute;z-index:30;width:330px;max-width:calc(100% - 16px);max-height:calc(100% - 16px);overflow:auto;background:var(--paper,#f4efe0);color:var(--ink,#22301F);border:1px solid var(--line-strong,#8a8f7d);border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,.28);padding:12px 30px 11px 14px;font-size:13.5px;line-height:1.5;font-family:"IBM Plex Sans",sans-serif}'+
   '.pais-pop .cab{display:flex;align-items:center;gap:11px;margin-bottom:8px}'+
   '.pais-pop .cab img{width:54px;height:40.5px;object-fit:cover;border:1px solid rgba(0,0,0,.35);border-radius:2px;flex:none;background:#fff}'+
   '.pais-pop b.t{font-family:"Fraunces",serif;font-size:17px;line-height:1.2}'+
   '.pais-pop dl{margin:0;display:grid;grid-template-columns:104px 1fr;column-gap:8px;row-gap:4px}.pais-pop dt{font-size:12px;color:var(--ink-soft,#4B5A45);padding-top:1px}.pais-pop dd{margin:0}'+
   '.pais-pop .s{color:var(--ink-soft,#4B5A45)}.pais-pop .f{display:block;margin-top:9px;font-size:11px;color:var(--ink-soft,#4B5A45);font-family:"IBM Plex Mono",monospace}'+
   '.pais-pop button{position:absolute;top:4px;right:6px;border:none;background:none;font-size:20px;line-height:1;cursor:pointer;color:var(--ink,#22301F)}'+
   '.pais-hint{margin:10px 0 -14px;font-size:13px;color:var(--ink-soft,#4B5A45)}body.juego-on .pais-hint{display:none}'+
   '.map-frame svg [data-cat="country"]{cursor:pointer}body.juego-on .map-frame svg [data-cat="country"]{cursor:default}'+
   '@media print{.pais-pop,.pais-hint{display:none !important}}';
  document.head.appendChild(css);
  if(getComputedStyle(frame).position==='static')frame.style.position='relative';
  var hint=document.createElement('p');hint.className='pais-hint';hint.textContent='Pulsa sobre un país para ver su ficha: bandera, capital, población y más datos.';
  frame.parentNode.insertBefore(hint,frame);
  var pop=null,marks=[],D=null,loading=false,items=null;
  function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function clear(){if(pop){pop.remove();pop=null;}marks.forEach(function(m){m.remove();});marks=[];}
  function load(cb){
    if(D){cb();return;}
    if(loading)return;loading=true;
    fetch(URL_).then(function(r){return r.json();}).then(function(d){D=d;loading=false;cb();}).catch(function(){loading=false;D={};cb();});
  }
  function num(n,dec){return n.toLocaleString('es-ES',{maximumFractionDigits:dec||0});}
  function poblacion(n){
    if(n>=1e6)return num(n/1e6,n>=1e7?0:1)+' millones';
    return num(n);
  }
  function lista(a){return a.map(esc).join(', ');}
  function build(name,d){
    var h='<div class="cab"><img src="banderas/'+d.i+'.svg" alt="Bandera de '+esc(name)+'" width="54" height="40"><b class="t">'+esc(name)+'</b></div><dl>';
    h+='<dt>'+(d.cap.length>1?'Capitales':'Capital')+'</dt><dd>'+lista(d.cap)+'</dd>';
    h+='<dt>Población</dt><dd>'+poblacion(d.pop)+' <span class="s">(est. '+d.py+')</span></dd>';
    if(d.area){
      var dens=d.pop/d.area;
      h+='<dt>Superficie</dt><dd>'+num(d.area,d.area<10?2:0)+' km²</dd>';
      h+='<dt>Densidad</dt><dd>'+num(dens,dens<10?1:0)+' hab./km²</dd>';
    }
    h+='<dt>'+(d.cur.length>1?'Monedas':'Moneda')+'</dt><dd>'+lista(d.cur)+'</dd>';
    h+='<dt>'+(d.len.length>1?'Idiomas oficiales':'Idioma oficial')+'</dt><dd>'+lista(d.len)+'</dd>';
    if(!d.mar)h+='<dt>Mar</dt><dd>Sin salida al mar</dd>';
    h+='</dl><span class="f">Datos: Natural Earth, mledoze/countries · Banderas: flag-icons</span>';
    return h;
  }
  function geom(){
    if(items)return items;
    items=[].slice.call(svg.querySelectorAll('path[data-cat="country"]')).map(function(p){var b=p.getBBox();return {el:p,n:p.getAttribute('data-name'),x:b.x,y:b.y,w:b.width,h:b.height};});
    return items;
  }
  function find(ev,p,tol){
    var els=document.elementsFromPoint(ev.clientX,ev.clientY);
    for(var i=0;i<els.length;i++){var e=els[i];if(svg.contains(e)&&e.getAttribute&&e.getAttribute('data-cat')==='country'&&e.getAttribute('data-name'))return e.getAttribute('data-name');}
    /* islas pequeñas: se acepta un pulso cercano */
    var best=null,bd=1e9;
    geom().forEach(function(g){
      if(g.w>tol*4||g.h>tol*4)return;
      var dx=Math.max(g.x-p.x,0,p.x-g.x-g.w),dy=Math.max(g.y-p.y,0,p.y-g.y-g.h),d=Math.hypot(dx,dy);
      if(d<=tol&&d<bd){bd=d;best=g.n;}
    });
    return best;
  }
  function show(name,d,ev,u){
    clear();
    pop=document.createElement('div');pop.className='pais-pop';pop.setAttribute('role','status');
    pop.innerHTML='<button type="button" aria-label="Cerrar">×</button>'+build(name,d);
    frame.appendChild(pop);
    pop.querySelector('button').onclick=clear;
    var fr=frame.getBoundingClientRect(),w=pop.offsetWidth,h=pop.offsetHeight;
    var px=ev.clientX-fr.left+14,py=ev.clientY-fr.top+14;
    if(px+w>fr.width-8)px=ev.clientX-fr.left-w-14;if(px<8)px=8;
    if(py+h>fr.height-8)py=ev.clientY-fr.top-h-14;if(py<8)py=8;
    pop.style.left=px+'px';pop.style.top=py+'px';
    geom().forEach(function(g){
      if(g.n!==name)return;
      var c=g.el.cloneNode(false);
      ['class','style','fill','data-cat','data-name','id'].forEach(function(a){c.removeAttribute(a);});
      c.setAttribute('fill','none');c.setAttribute('stroke','#0b4f9c');c.setAttribute('stroke-width',2.4*u);c.setAttribute('stroke-linejoin','round');c.setAttribute('pointer-events','none');
      svg.appendChild(c);marks.push(c);
    });
  }
  svg.addEventListener('click',function(ev){
    if(document.body.classList.contains('juego-on'))return;
    var m=svg.getScreenCTM();if(!m)return;
    var p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;p=p.matrixTransform(m.inverse());
    var u=1/m.a,name=find(ev,p,11*u);
    if(!name){clear();return;}
    load(function(){var d=D[name];if(!d){clear();return;}show(name,d,ev,u);});
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')clear();});
  new MutationObserver(clear).observe(svg,{attributes:true,attributeFilter:['viewBox']});
  new MutationObserver(function(){if(document.body.classList.contains('juego-on'))clear();}).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
