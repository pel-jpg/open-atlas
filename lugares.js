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
   +'.lg-hint{}@media print{.lg-p,.lg-hint{display:none!important}}';
  document.head.appendChild(css);
  var NS='http://www.w3.org/2000/svg', STAR='M0,0 l2.4,5 5.4,.8 -3.9,3.8 .9,5.4 -4.8,-2.6 -4.8,2.6 .9,-5.4 -3.9,-3.8 5.4,-.8z';
  var css2=document.createElement('style');
  css2.textContent='.lg-hint{display:flex;align-items:center;gap:10px;margin:0 0 10px;padding:9px 16px;background:#FFF6D6;border:1.5px solid #B8862B;border-radius:999px;font-family:"IBM Plex Sans",sans-serif;font-size:15px;font-weight:600;color:#3a2a08;line-height:1.35}'
   +'.lg-hint svg{flex:none}.lg-hint span{font-weight:400}'
   +'#mapsvg .star.cstar{fill:#241b12;stroke:#ECE4D2;stroke-width:.7;vector-effect:non-scaling-stroke}#mapsvg .star.cstar.cap{fill:#fff;stroke:#241b12;stroke-width:1.3}'
   +'#mapsvg g:has(> path.cstar) > .evlabel{font-family:"IBM Plex Sans",sans-serif!important;font-style:normal!important;font-weight:700!important}'
   +'#mapsvg g.city{cursor:pointer}@media print{.lg-hint-row{display:none}}';
  document.head.appendChild(css2);
  var fr=document.getElementById('frame');
  if(fr){var h=document.createElement('p');h.className='lg-hint';
    h.innerHTML='<svg width="22" height="22" viewBox="-9 -1 18 17" aria-hidden="true"><path d="'+STAR+'" fill="#fff" stroke="#241b12" stroke-width="1.2"/></svg><b>Pulsa cualquier estrella del mapa</b><span>para leer su ficha con más información.</span>';
    fr.parentNode.insertBefore(h,fr);}
  /* Todo punto clicable se dibuja como estrella */
  function star(cx,cy,k,cls){var p=document.createElementNS(NS,'path');p.setAttribute('d',STAR);p.setAttribute('class',cls);p.setAttribute('transform','translate('+cx+','+cy+') scale('+k+') translate(0,-8)');return p;}
  [].forEach.call(svg.querySelectorAll('g.city'),function(g){
    var t=g.querySelector('text.clabel,text.evlabel'); if(!t||!L[t.textContent.trim()]||g.querySelector('path.star')) return;
    var cs=g.querySelectorAll('circle'), rc=g.querySelector('rect.fort'), a, cx, cy, k, cap=false;
    if(cs.length){a=cs[0]; cx=+a.getAttribute('cx'); cy=+a.getAttribute('cy'); var r=+a.getAttribute('r')||2.6; cap=/\bcap\b/.test(a.getAttribute('class')||'');
      k=g.classList.contains('ev')?1:Math.max(.6,r*.27);
      for(var i=1;i<cs.length;i++) cs[i].remove();
    } else if(rc){a=rc; cx=+rc.getAttribute('x')+(+rc.getAttribute('width'))/2; cy=+rc.getAttribute('y')+(+rc.getAttribute('height'))/2; k=.6;
    } else return;
    var st=star(cx,cy,k,g.classList.contains('ev')?'star':'star cstar'+(cap?' cap':''));
    a.replaceWith(st);
  });
  function fixLegend(){
    var lg=document.getElementById('lgsvg'); if(!lg||lg.querySelector('.lg-hint-row')) return;
    [].forEach.call(lg.querySelectorAll('circle'),function(c){var p=star(+c.getAttribute('cx'),+c.getAttribute('cy'),Math.max(.5,(+c.getAttribute('r')||3)*.22),'');
      p.setAttribute('fill',c.getAttribute('fill')||'#241b12'); p.setAttribute('stroke','#ECE4D2'); p.setAttribute('stroke-width','.6'); c.replaceWith(p);});
    [].forEach.call(lg.querySelectorAll('rect[width="22"]'),function(rc){ if(rc.getAttribute('fill')!=='#241b12') return;
      var p=star(+rc.getAttribute('x')+11,+rc.getAttribute('y')+6.5,.6,''); p.setAttribute('fill','#241b12'); p.setAttribute('stroke','#ECE4D2'); p.setAttribute('stroke-width','.6'); rc.replaceWith(p);});
    var bg=lg.querySelector('rect'); if(!bg) return;
    var x0=+bg.getAttribute('x'), h0=+bg.getAttribute('height'), y=+bg.getAttribute('y')+h0-4;
    bg.setAttribute('height',h0+19);
    var row=document.createElementNS(NS,'g'); row.setAttribute('class','lg-hint-row');
    var p=star(x0+21,y+6.5,.9,''); p.setAttribute('fill','#fff'); p.setAttribute('stroke','#241b12'); p.setAttribute('stroke-width','1'); row.appendChild(p);
    var te=document.createElementNS(NS,'text'); te.setAttribute('x',x0+40); te.setAttribute('y',y+10.5); te.setAttribute('font-size','11.5'); te.setAttribute('font-weight','600'); te.setAttribute('fill','#1b1409'); te.setAttribute('font-family',"'IBM Plex Sans',sans-serif");
    te.textContent='Pulsa una estrella para ver su ficha'; row.appendChild(te); lg.appendChild(row);
  }
  fixLegend();
  function close(){ if(panel){panel.remove();panel=null;} }
  function open(keys){
    close(); panel=document.createElement('div'); panel.className='lg-p'; panel.setAttribute('role','dialog');
    var in_=document.createElement('div'); in_.className='in';
    keys.forEach(function(key,i){
      var d=L[key], sec=document.createElement('div'); if(i) sec.style.cssText='margin-top:12px;padding-top:12px;border-top:1px solid rgba(34,48,31,.2)';
      var h3=document.createElement('h3'); h3.textContent=d.n||key; var sm=document.createElement('small'); sm.textContent=d.k||'';
      var p=document.createElement('p'); p.textContent=d.t; sec.appendChild(h3); sec.appendChild(sm); sec.appendChild(p); in_.appendChild(sec);
    });
    var b=document.createElement('button'); b.textContent='×'; b.setAttribute('aria-label','Cerrar'); b.onclick=close;
    in_.appendChild(b); panel.appendChild(in_); document.body.appendChild(panel);
  }
  function r(e){var q=e.getBoundingClientRect();return {x0:q.left,y0:q.top,x1:q.right,y1:q.bottom}}
  function dist(q,x,y){var dx=Math.max(q.x0-x,0,x-q.x1),dy=Math.max(q.y0-y,0,y-q.y1);return Math.hypot(dx,dy)}
  svg.addEventListener('click',function(ev){
    if(document.body.classList.contains('pr-pinmode')) return;
    var c=[],x=ev.clientX,y=ev.clientY, tol=14;
    [].forEach.call(svg.querySelectorAll('g.city'),function(g){
      var t=g.querySelector('text.clabel,text.evlabel'); if(!t) return;
      var key=t.textContent.trim(); if(!L[key]) return;
      var m=g.querySelector('path.star,circle,rect,path:not(.ldr)'); if(!m) return;
      var tr=r(t), mr=r(m); if(tr.x1-tr.x0===0||mr.x1-mr.x0===0) return;
      var d=Math.min(dist(tr,x,y),dist(mr,x,y)); if(d<=tol) c.push({k:key,d:d});
    });
    if(!c.length){close();return;}
    c.sort(function(a,b){return a.d-b.d;});
    var keys=[],seen={}; c.forEach(function(e){ if(e.d<=c[0].d+6&&keys.length<3&&!seen[e.k]){seen[e.k]=1;keys.push(e.k);} });
    open(keys);
  });
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
  var o=window.show; if(typeof o==='function') window.show=function(){close();var v=o.apply(this,arguments);fixLegend();return v;};
})();
