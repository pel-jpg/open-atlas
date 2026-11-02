/* Atlas Abierto · ficha de lugar al pulsar una ciudad, símbolo o acontecimiento del mapa.
   Los textos están en lugares/<mapa>.js como window.LUGARES = { "Etiqueta": {k:"tipo", t:"texto"} } */
(function(){
  var svg=document.getElementById('mapsvg'); if(!svg||!window.LUGARES) return;
  var L=window.LUGARES, panel=null;
  var css=document.createElement('style');
  css.textContent='.lg-p{position:fixed;left:0;right:0;bottom:0;z-index:900;background:#F4EEDF;border-top:2px solid #241b12;box-shadow:0 -6px 24px rgba(0,0,0,.25);padding:14px 18px 18px;max-height:42vh;overflow:auto;font-family:"IBM Plex Sans",sans-serif;color:#22301F}'
   +'.lg-p .in{max-width:760px;margin:0 auto;position:relative;padding-right:34px}.lg-p h3{font-family:"Fraunces",serif;font-size:20px;margin:0 0 2px}'
   +'.lg-p small{display:block;font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#B8862B;margin-bottom:8px}'
   +'.lg-p p{font-size:14.5px;line-height:1.6;color:#4B5A45;margin:0}.lg-p button{position:absolute;right:0;top:0;border:1px solid rgba(34,48,31,.35);background:transparent;border-radius:999px;width:28px;height:28px;font-size:16px;cursor:pointer;color:#22301F}'
   +'.lg-hint{font-family:"IBM Plex Mono",monospace;font-size:11.5px;color:#4B5A45;margin:6px 0 0}@media print{.lg-p,.lg-hint{display:none!important}}';
  document.head.appendChild(css);
  var fr=document.getElementById('frame');
  if(fr){var h=document.createElement('p');h.className='lg-hint';h.textContent='Toca una ciudad, un símbolo o una estrella del mapa para ver su ficha.';fr.parentNode.insertBefore(h,fr.nextSibling);}
  function close(){ if(panel){panel.remove();panel=null;} }
  function open(key){
    close(); var d=L[key]; panel=document.createElement('div'); panel.className='lg-p'; panel.setAttribute('role','dialog');
    var in_=document.createElement('div'); in_.className='in';
    var h3=document.createElement('h3'); h3.textContent=d.n||key; var sm=document.createElement('small'); sm.textContent=d.k||'';
    var p=document.createElement('p'); p.textContent=d.t; var b=document.createElement('button'); b.textContent='×'; b.setAttribute('aria-label','Cerrar'); b.onclick=close;
    in_.appendChild(h3); in_.appendChild(sm); in_.appendChild(p); in_.appendChild(b); panel.appendChild(in_); document.body.appendChild(panel);
  }
  function r(e){var q=e.getBoundingClientRect();return {x0:q.left,y0:q.top,x1:q.right,y1:q.bottom}}
  function dist(q,x,y){var dx=Math.max(q.x0-x,0,x-q.x1),dy=Math.max(q.y0-y,0,y-q.y1);return Math.hypot(dx,dy)}
  svg.addEventListener('click',function(ev){
    if(document.body.classList.contains('pr-pinmode')) return;
    var best=null,bd=1e9,x=ev.clientX,y=ev.clientY, tol=14;
    [].forEach.call(svg.querySelectorAll('g.city'),function(g){
      var t=g.querySelector('text.clabel,text.evlabel'); if(!t) return;
      var key=t.textContent.trim(); if(!L[key]) return;
      var m=g.querySelector('path.star,circle.cdot,path:not(.ldr)'); if(!m) return;
      var tr=r(t), mr=r(m); if(tr.x1-tr.x0===0||mr.x1-mr.x0===0) return;
      var d=Math.min(dist(tr,x,y),dist(mr,x,y)); if(d<=tol&&d<bd){bd=d;best=key;}
    });
    if(best) open(best); else close();
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  var o=window.show; if(typeof o==='function') window.show=function(){close();return o.apply(this,arguments);};
})();
