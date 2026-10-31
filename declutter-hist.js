/* Atlas Abierto · evita que las etiquetas de los mapas históricos se superpongan.
   Tras cada cambio de etapa, recoloca (con pequeños desplazamientos) las etiquetas
   de ciudades, hechos y regiones que chocan con otras etiquetas, estrellas o puntos. */
(function(){
  var svg=document.getElementById('mapsvg'); if(!svg||typeof window.show!=='function') return;
  function vis(e){ while(e&&e!==svg){ var cs=getComputedStyle(e); if(cs.display==='none'||cs.visibility==='hidden') return false; e=e.parentNode; } return true; }
  function rect(e){ var r=e.getBoundingClientRect(); return {x0:r.left,y0:r.top,x1:r.right,y1:r.bottom}; }
  function hit(a,b,p){ return a.x0<b.x1-p && a.x1>b.x0+p && a.y0<b.y1-p && a.y1>b.y0+p; }
  function local(e,dx,dy){ var m=e.getScreenCTM(); if(!m) return [0,0]; return [dx/Math.hypot(m.a,m.b), dy/Math.hypot(m.c,m.d)]; }
  function run(){
    var sv=svg.getBoundingClientRect(), s=sv.width/ (svg.viewBox.baseVal.width||sv.width) ;
    var texts=[].slice.call(svg.querySelectorAll('text')).filter(function(t){ return t.textContent.trim() && vis(t); });
    texts.forEach(function(t){ if(t.__o===undefined) t.__o=t.getAttribute('transform')||''; t.setAttribute('transform', t.__o); });
    var obst=[].slice.call(svg.querySelectorAll('.star, .cdot, circle.cdot, g.city.ev path.star')).filter(vis).map(rect);
    var placed=[], order=[];
    var pr=function(t){ var c=t.getAttribute('class')||''; if(/sea/.test(c)) return 0; if(/reg/.test(c)) return 1; if(/clabel/.test(c)) return 2; if(/evlabel/.test(c)) return 3; return 4; };
    texts.sort(function(a,b){ return pr(a)-pr(b); });
    var step=7*s*1.0, cand=[[0,-1],[0,1],[0,-2],[0,2],[1,0],[-1,0],[1,-1],[-1,-1],[1,1],[-1,1],[0,-3],[0,3],[2,0],[-2,0],[2,-1],[-2,-1],[2,1],[-2,1],[0,-4],[0,4],[3,0],[-3,0],[3,-2],[-3,-2],[3,2],[-3,2],[0,-6],[0,6],[4,0],[-4,0],[4,-3],[-4,-3],[4,3],[-4,3]];
    texts.forEach(function(t){
      var p=pr(t), r=rect(t);
      function bad(rr){ if(rr.x0<sv.left+1||rr.x1>sv.right-1||rr.y0<sv.top+1||rr.y1>sv.bottom-1) return true;
        for(var i=0;i<placed.length;i++) if(hit(rr,placed[i],1.5)) return true;
        if(p>=2) for(var j=0;j<obst.length;j++) if(hit(rr,obst[j],1)) return true; return false; }
      if(bad(r) && p>=1){
        var done=false;
        for(var k=0;k<cand.length&&!done;k++){
          var dx=cand[k][0]*step*2.2, dy=cand[k][1]*step;
          var rr={x0:r.x0+dx,x1:r.x1+dx,y0:r.y0+dy,y1:r.y1+dy};
          if(!bad(rr)){ var l=local(t,dx,dy); t.setAttribute('transform','translate('+l[0].toFixed(1)+' '+l[1].toFixed(1)+') '+t.__o); r=rr; done=true; }
        }
      }
      placed.push(r);
    });
  }
  var orig=window.show;
  window.show=function(){ var rv=orig.apply(this,arguments); try{ run(); }catch(e){} return rv; };
  window.addEventListener('load',function(){ try{ run(); }catch(e){} });
  window.__declutter=run;
})();
