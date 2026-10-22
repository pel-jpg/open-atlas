/* Atlas Abierto — modo juego "Localiza": el alumno señala en el mapa el elemento que se pregunta.
   Todo se calcula en el navegador; no se guarda ni se envía ningún dato. */
(function(){
  'use strict';
  var svg=document.querySelector('.map-frame-screen svg')||document.querySelector('.map-frame svg'),head=document.querySelector('.custom-panel-head'),panel=document.querySelector('.custom-panel');
  if(!svg||!head||!panel)return;
  var CATS=window.JUEGO_CATS||{river:{art:'el río',pl:'ríos',top:12},lake:{art:'el lago',pl:'lagos'}};
  var NS='http://www.w3.org/2000/svg';
  /* elementos jugables por categoría */
  var items={};
  Object.keys(CATS).forEach(function(c){
    items[c]=[].slice.call(svg.querySelectorAll('[data-cat="'+c+'"]')).filter(function(e){return e.tagName!=='text'&&e.getAttribute('data-name');});
  });
  var present=Object.keys(CATS).filter(function(c){return items[c].length;});
  if(!present.length)return;

  var css=document.createElement('style');css.textContent=
  '.game-start{font-family:"IBM Plex Mono",monospace;font-size:11.5px;background:#9a6a12;color:#fff;border:1px solid #9a6a12;padding:6px 14px;border-radius:999px;cursor:pointer;font-weight:600;margin-left:8px}'+
  '.game-start:hover{background:#7c540c}'+
  '.panel-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.panel-actions .game-start{margin-left:10px}'+
  '.game-bar{margin:14px 0 0;background:var(--paper);border:2px solid #9a6a12;border-radius:4px;padding:12px 18px;font-size:14px;position:sticky;top:6px;z-index:50;box-shadow:0 4px 14px rgba(0,0,0,.18)}'+
  '.game-top{display:flex;justify-content:space-between;align-items:center;gap:8px 16px;flex-wrap:wrap}'+
  '.game-actions{display:flex;gap:8px}'+
  '.juego-on .custom-panel{display:none}'+
  '.game-bar[hidden]{display:none}'+
  '.game-bar h3{font-family:"Fraunces",serif;font-size:17px;margin-bottom:6px}'+
  '.game-row{display:flex;flex-wrap:wrap;gap:8px 22px;align-items:center;margin:10px 0}'+
  '.game-row b{font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#9a6a12;margin-right:4px}'+
  '.game-row label{cursor:pointer;margin-right:12px;white-space:nowrap}'+
  '.game-btn{font-family:"IBM Plex Mono",monospace;font-size:12px;background:var(--ink);color:var(--paper);border:none;padding:8px 16px;border-radius:999px;cursor:pointer}'+
  '.game-btn.sec{background:transparent;color:var(--ink);border:1px solid var(--line-strong)}'+
  '.game-q{font-family:"Fraunces",serif;font-size:22px;font-weight:600;margin:2px 0}'+
  '.game-meta{font-family:"IBM Plex Mono",monospace;font-size:12px;color:var(--ink-soft)}'+
  '.game-msg{min-height:22px;font-size:15px;margin:4px 0 0;font-weight:500}'+
  '.game-msg.ok{color:#17803a}.game-msg.bad{color:#b3261e}'+
  '.game-fails{font-size:13.5px;color:var(--ink-soft);margin:6px 0 10px}'+
  '.juego-on .map-frame-screen svg,.juego-on .map-frame svg{cursor:crosshair}'+
  '.juego-on svg text:not(.reveal){display:none !important}'+
  '.juego-on svg .legend-block text,.juego-on svg .scale-bar text{display:block !important}'+
  '.juego-on svg text.reveal{display:block !important;font-weight:700;font-style:normal;fill:#0b2d4a;paint-order:stroke;stroke:#fff;stroke-width:3.2px;font-size:15px}'+
  '.juego-on svg .g-ok{stroke:#17a34a !important;stroke-width:3.4px !important;stroke-opacity:1 !important;filter:none !important}'+
  '.juego-on svg .g-bad{stroke:#d9480f !important;stroke-width:3.4px !important;stroke-opacity:1 !important;filter:none !important}'+
  '.juego-on svg .g-miss{stroke:#d9480f !important;stroke-width:3.4px !important;stroke-opacity:1 !important;filter:none !important}'+
  '.juego-on svg .lake.g-ok{fill:#17a34a}.juego-on svg .lake.g-miss,.juego-on svg .lake.g-bad{fill:#d9480f}'+
  '@media print{.game-bar,.game-start{display:none !important}}';
  document.head.appendChild(css);

  var btn=document.createElement('button');btn.type='button';btn.className='game-start';btn.textContent='▶ Jugar';
  btn.setAttribute('title','Modo juego: señala en el mapa lo que se te pregunta');
  var grp=document.createElement('div');grp.className='panel-actions';var pb=head.querySelector('.preset-btns');
  if(pb){head.appendChild(grp);grp.appendChild(pb);grp.appendChild(btn);}else head.appendChild(btn);
  var bar=document.createElement('div');bar.className='game-bar';bar.hidden=true;bar.setAttribute('aria-live','polite');
  panel.after(bar);

  var S={on:false,q:[],i:0,att:0,max:2,sc:{first:0,second:0},fails:[],cur:null,done:false,rings:[],tm:null};
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function checked(c,n){var cb=document.querySelector('[data-item-cat="'+c+'"][data-item-name="'+(window.CSS&&CSS.escape?CSS.escape(n):n)+'"]');return !cb||cb.checked;}

  /* ---------- pantalla de configuración ---------- */
  function setup(){
    var cp=document.querySelector('.preset-btns [data-preset="completo"]');if(cp&&document.querySelector('[data-item-cat]')&&!document.querySelector('[data-item-cat]:checked'))cp.click();
    clearMarks();document.body.classList.remove('juego-on');S.on=false;bar.hidden=false;
    var opts='';
    present.forEach(function(c,k){
      if(CATS[c].top&&items[c].length>CATS[c].top)opts+='<label><input type="radio" name="g-what" value="'+c+':top"'+(k===0?' checked':'')+'> '+CATS[c].pl.charAt(0).toUpperCase()+CATS[c].pl.slice(1)+' principales ('+CATS[c].top+')</label>';
      opts+='<label><input type="radio" name="g-what" value="'+c+':all"'+(k===0&&!(CATS[c].top&&items[c].length>CATS[c].top)?' checked':'')+'> Todos los '+CATS[c].pl+' ('+items[c].length+')</label>';
    });
    if(present.length>1)opts+='<label><input type="radio" name="g-what" value="*:all"> Todo mezclado</label>';
    bar.innerHTML='<h3>Modo juego: localiza en el mapa</h3><p>Te preguntaré por un elemento y tú lo señalas con un clic o un toque. Los nombres del mapa se ocultan mientras juegas.</p>'+
      '<div class="game-row"><b>Qué</b>'+opts+'</div>'+
      '<div class="game-row"><b>Preguntas</b><label><input type="radio" name="g-n" value="10" checked> 10</label><label><input type="radio" name="g-n" value="20"> 20</label><label><input type="radio" name="g-n" value="0"> Todas</label>'+
      '<b>Intentos</b><label><input type="radio" name="g-a" value="2" checked> 2 por pregunta</label><label><input type="radio" name="g-a" value="1"> 1</label></div>'+
      '<div class="game-row"><button type="button" class="game-btn" id="g-go">Empezar</button><button type="button" class="game-btn sec" id="g-exit">Cancelar</button></div>';
    bar.querySelector('#g-go').onclick=start;bar.querySelector('#g-exit').onclick=exit;
  }
  function val(n){var e=bar.querySelector('input[name="'+n+'"]:checked');return e?e.value:null;}
  function pool(spec){
    var p=spec.split(':'),cats=p[0]==='*'?present:[p[0]],out=[];
    cats.forEach(function(c){
      var list=items[c].slice(),seen={},names=[];
      list.forEach(function(e){var n=e.getAttribute('data-name');if(!seen[n]){seen[n]=1;names.push(n);}});
      var avail=names.filter(function(n){return checked(c,n);});if(!avail.length)avail=names;
      if(p[1]==='top')avail=avail.slice(0,CATS[c].top);
      avail.forEach(function(n){out.push({c:c,n:n});});
    });return out;
  }
  function start(){
    var spec=val('g-what')||(present[0]+':all'),n=parseInt(val('g-n')||'10',10);S.max=parseInt(val('g-a')||'2',10);
    var p=shuffle(pool(spec));if(n&&p.length>n)p=p.slice(0,n);
    begin(p);
  }
  function begin(p){bar.scrollIntoView({block:'start'});S.q=p;S.i=0;S.sc={first:0,second:0};S.fails=[];S.on=true;document.body.classList.add('juego-on');ask();}

  /* ---------- preguntas ---------- */
  function els(c,n){return items[c].filter(function(e){return e.getAttribute('data-name')===n;});}
  function labels(n){return [].slice.call(svg.querySelectorAll('text')).filter(function(t){return t.getAttribute('data-name')===n&&!t.closest('.legend-block');});}
  function clearMarks(){
    svg.querySelectorAll('.g-ok,.g-bad,.g-miss').forEach(function(e){e.classList.remove('g-ok','g-bad','g-miss');});
    svg.querySelectorAll('text.reveal').forEach(function(e){e.classList.remove('reveal');});
    S.rings.forEach(function(r){r.remove();});S.rings=[];clearTimeout(S.tm);
  }
  function ring(e){
    var b=e.getBBox(),r=Math.max(14,Math.min(Math.max(b.width,b.height)/2+8,40)),c=document.createElementNS(NS,'circle');
    c.setAttribute('cx',b.x+b.width/2);c.setAttribute('cy',b.y+b.height/2);c.setAttribute('r',r);c.setAttribute('fill','none');c.setAttribute('stroke','#d9480f');c.setAttribute('stroke-width','2.6');c.setAttribute('stroke-dasharray','5 3');
    var par=e.parentNode;par.appendChild(c);S.rings.push(c);
  }
  function ask(){
    clearMarks();S.cur=S.q[S.i];S.att=0;S.done=false;
    var q=S.cur;
    bar.innerHTML='<div class="game-top"><div><div class="game-meta">Pregunta '+(S.i+1)+' de '+S.q.length+' · Aciertos: '+(S.sc.first+S.sc.second)+'</div>'+
      '<div class="game-q">¿Dónde está '+CATS[q.c].art+' <span style="color:#9a6a12">'+esc(q.n)+'</span>?</div></div>'+
      '<div class="game-actions"><button type="button" class="game-btn" id="g-next" hidden>Siguiente ▶</button><button type="button" class="game-btn sec" id="g-skip">Saltar</button><button type="button" class="game-btn sec" id="g-exit">Salir</button></div></div>'+
      '<div class="game-msg" id="g-msg">Haz clic (o toca) sobre el mapa.'+(S.max>1?' Tienes '+S.max+' intentos.':'')+'</div>';
    bar.querySelector('#g-next').onclick=next;bar.querySelector('#g-skip').onclick=function(){miss(true);};bar.querySelector('#g-exit').onclick=exit;
  }
  function msg(t,k){var m=bar.querySelector('#g-msg');if(m){m.className='game-msg '+(k||'');m.innerHTML=t;}}
  function finishQ(){
    S.done=true;var nx=bar.querySelector('#g-next'),sk=bar.querySelector('#g-skip');
    if(sk)sk.hidden=true;if(nx){nx.hidden=false;nx.textContent=S.i+1>=S.q.length?'Ver resultado ▶':'Siguiente ▶';nx.focus();}
  }
  function reveal(q,cls){els(q.c,q.n).forEach(function(e){e.classList.add(cls);if(e.tagName!=='path'||e.getAttribute('class')&&e.getAttribute('class').indexOf('lake')>=0)ring(e);});labels(q.n).forEach(function(t){t.classList.add('reveal');});}
  function miss(skipped){
    var q=S.cur;S.fails.push(q);reveal(q,'g-miss');
    msg((skipped?'Saltada. ':'No era ahí. ')+'Era <b>'+esc(q.n)+'</b>, marcado en naranja.','bad');finishQ();
  }
  function next(){S.i++;if(S.i>=S.q.length)end();else ask();}

  /* ---------- detección de clics ---------- */
  function localPt(e,ev){var p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;var m=e.getScreenCTM();return m?p.matrixTransform(m.inverse()):p;}
  function inShape(e,ev,w){
    var old=e.style.strokeWidth,old2=e.style.strokeOpacity,pt=localPt(e,ev),ok=false;
    e.style.strokeWidth=w+'px';
    try{ok=e.isPointInStroke(pt)||(e.getAttribute('class')||'').indexOf('lake')>=0&&e.isPointInFill(pt);}catch(x){}
    e.style.strokeWidth=old;return ok;
  }
  function judge(ev){
    var coarse=(ev.pointerType==='touch')||(window.matchMedia&&matchMedia('(pointer:coarse)').matches);
    var W=coarse?[8,18,30]:[5,11,19],q=S.cur,all=[];
    present.forEach(function(c){items[c].forEach(function(e){if(getComputedStyle(e).display!=='none')all.push({e:e,n:e.getAttribute('data-name'),c:c});});});
    for(var k=0;k<W.length;k++){
      var hits=all.filter(function(o){return inShape(o.e,ev,W[k]);});
      if(hits.some(function(o){return o.n===q.n&&o.c===q.c;}))return {ok:true};
      if(hits.length)return {ok:false,what:hits[0]};
    }
    return {ok:false,what:null};
  }
  svg.addEventListener('click',function(ev){
    if(!S.on||S.done||!S.cur)return;
    var r=judge(ev),q=S.cur;S.att++;
    if(r.ok){
      if(S.att===1)S.sc.first++;else S.sc.second++;
      reveal(q,'g-ok');msg('¡Correcto! Es <b>'+esc(q.n)+'</b>.'+(S.att>1?' (a la segunda)':''),'ok');
      var m=bar.querySelector('.game-meta');if(m)m.textContent='Pregunta '+(S.i+1)+' de '+S.q.length+' · Aciertos: '+(S.sc.first+S.sc.second);
      finishQ();return;
    }
    var left=S.max-S.att,what=r.what?'Has señalado '+CATS[r.what.c].art+' <b>'+esc(r.what.n)+'</b>.':'Ahí no hay ningún elemento de los que se preguntan.';
    if(left>0){
      if(r.what){els(r.what.c,r.what.n).forEach(function(e){e.classList.add('g-bad');});clearTimeout(S.tm);S.tm=setTimeout(function(){svg.querySelectorAll('.g-bad').forEach(function(e){e.classList.remove('g-bad');});},1100);}
      msg('No es ahí. '+what+' Te queda '+left+' intento'+(left>1?'s':'')+'.','bad');
    } else {
      S.fails.push(q);reveal(q,'g-miss');msg('No era ahí. '+what+' Era <b>'+esc(q.n)+'</b>, marcado en naranja.','bad');finishQ();
    }
  });

  /* ---------- final ---------- */
  function end(){
    clearMarks();var n=S.q.length,ok=S.sc.first+S.sc.second,f=S.fails.length;
    var tone=ok===n?'¡Perfecto!':ok/n>=.7?'¡Muy bien!':ok/n>=.5?'Vas por buen camino.':'A repasar un poco.';
    bar.innerHTML='<h3>'+tone+' Has acertado '+ok+' de '+n+'</h3><p class="game-meta">'+S.sc.first+' a la primera'+(S.max>1?' · '+S.sc.second+' a la segunda':'')+'</p>'+
      (f?'<p class="game-fails"><b>Para repasar:</b> '+S.fails.map(function(q){return esc(q.n);}).join(', ')+'.</p>':'')+
      '<div class="game-row">'+(f?'<button type="button" class="game-btn" id="g-rep">Repasar los fallados</button>':'')+'<button type="button" class="game-btn'+(f?' sec':'')+'" id="g-again">Jugar otra vez</button><button type="button" class="game-btn sec" id="g-exit">Salir</button></div>';
    S.on=false;
    var rep=bar.querySelector('#g-rep');if(rep)rep.onclick=function(){begin(shuffle(S.fails.slice()));};
    bar.querySelector('#g-again').onclick=setup;bar.querySelector('#g-exit').onclick=exit;
  }
  function exit(){clearMarks();S.on=false;document.body.classList.remove('juego-on');bar.hidden=true;bar.innerHTML='';}
  btn.addEventListener('click',function(){if(bar.hidden||!S.on&&!bar.querySelector('#g-go'))setup();else bar.scrollIntoView({behavior:'smooth',block:'nearest'});});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&!bar.hidden)exit();
    if(e.key==='Enter'&&S.on&&S.done){var nx=bar.querySelector('#g-next');if(nx&&document.activeElement!==nx){e.preventDefault();next();}}
  });
})();
