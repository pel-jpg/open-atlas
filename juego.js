/* Atlas Abierto — modo juego "Localiza": el alumno señala en el mapa el elemento que se pregunta.
   Todo se calcula en el navegador; no se guarda ni se envía ningún dato. */
(function(){
  'use strict';
  var svg=document.querySelector('.map-frame-screen svg')||document.querySelector('.map-frame svg'),head=document.querySelector('.custom-panel-head'),panel=document.querySelector('.custom-panel');
  if(!svg||!head||!panel)return;
  var NS='http://www.w3.org/2000/svg';
  var SMALL={de:1,del:1,la:1,las:1,los:1,el:1,y:1,e:1,en:1};
  function nice(n){
    if(n.length>3&&n===n.toUpperCase()){return n.toLowerCase().split(' ').map(function(w,i){return (i>0&&SMALL[w])?w:w.charAt(0).toUpperCase()+w.slice(1);}).join(' ');}
    return n;
  }
  /* categorías conocidas: nombre plural, cómo se formula la pregunta y tipo de zona de clic */
  var CATS={
    river:{pl:'ríos',q:function(n){return 'el río '+n;},top:12,kind:'stroke'},
    lake:{pl:'lagos',q:function(n){return 'el lago '+n;},kind:'fill'},
    country:{pl:'países',q:function(n){return n;},kind:'fill'},
    capital:{pl:'capitales',q:function(n){return n+' (capital)';},kind:'point'},
    ccaa:{pl:'comunidades autónomas',q:function(n){return n;},kind:'fill'},
    capccaa:{pl:'capitales autonómicas',q:function(n){return n+' (capital)';},kind:'point'},
    state:{pl:'estados',q:function(n){return n;},kind:'fill'},
    capstate:{pl:'capitales de estado',q:function(n){return n+' (capital)';},kind:'point'},
    prov:{pl:'provincias',q:function(n){return n;},kind:'fill'},
    capprov:{pl:'capitales de provincia',q:function(n){return n+' (capital)';},kind:'point'},
    peak:{pl:'picos',q:function(n){return 'el pico '+n;},kind:'point'},
    mountain:{pl:'cordilleras y montañas',q:function(n){return n;},kind:'box',tol:[8,24,42]},
    region:{pl:'regiones naturales',q:function(n){return n;},kind:'box',tol:[30,70,120]},
    feature:{pl:'accidentes costeros',q:function(n){return n;},kind:'point'},
    cape:{pl:'cabos',q:function(n){return n;},kind:'point'},
    gulf:{pl:'golfos y bahías',q:function(n){return n;},kind:'box',tol:[16,40,70]},
    strait:{pl:'estrechos y canales',q:function(n){return n;},kind:'box',tol:[14,34,56]},
    island:{pl:'islas',q:function(n){return n;},kind:'point'},
    peninsula:{pl:'penínsulas',q:function(n){return n;},kind:'box',tol:[14,34,56]},
    plate:{pl:'placas tectónicas',q:function(n){return 'la placa '+n;},kind:'fill'},
    volcano:{pl:'volcanes',q:function(n){return 'el volcán '+n;},kind:'point'},
    tect:{pl:'dorsales, fosas y cordilleras',q:function(n){return n;},kind:'box',tol:[14,34,56]},
    quake:{pl:'grandes terremotos',q:function(n){return 'el terremoto de '+n;},kind:'point'},
    sea:{pl:'mares y océanos',q:function(n){return n;},kind:'box',tol:[30,70,120]}
  };
  var ORDER=['river','lake','country','capital','ccaa','capccaa','state','capstate','prov','capprov','peak','mountain','region','feature','cape','gulf','strait','island','peninsula','sea','plate','volcano','tect','quake'];
  var SHAPE={path:1,circle:1,polygon:1,polyline:1,ellipse:1,rect:1};

  /* ---------- objetivos jugables ---------- */
  var T={},present=[];
  ORDER.forEach(function(c){
    var map={},order=[];
    [].slice.call(svg.querySelectorAll('[data-cat="'+c+'"]')).forEach(function(e){
      if(!SHAPE[e.tagName.toLowerCase()])return;var n=e.getAttribute('data-name');if(!n)return;
      if(!map[n]){map[n]={n:n,els:[],boxes:[]};order.push(n);}map[n].els.push(e);
    });
    var kind=CATS[c].kind;
    if(!order.length){
      [].slice.call(svg.querySelectorAll('text[data-cat="'+c+'"]')).forEach(function(e){
        var n=e.getAttribute('data-name');if(!n)return;if(!map[n]){map[n]={n:n,els:[],boxes:[],texts:[]};order.push(n);}map[n].texts=map[n].texts||[];map[n].texts.push(e);
      });
      if(order.length)kind='box';
    } else if(kind==='box'){kind='point';}
    if(order.length){T[c]={kind:kind,list:order.map(function(n){return map[n];}),by:map};present.push(c);}
  });
  if(!present.length)return;

  var css=document.createElement('style');css.textContent=
  '.game-start{font-family:"IBM Plex Mono",monospace;font-size:11.5px;background:#9a6a12;color:#fff;border:1px solid #9a6a12;padding:6px 14px;border-radius:999px;cursor:pointer;font-weight:600;margin-left:8px}'+
  '.game-start:hover{background:#7c540c}'+
  '.custom-panel-head{margin-bottom:12px !important}.custom-panel-title{display:none}'+
  '.plate-head{padding-bottom:10px !important}.custom-panel{margin-top:6px !important;padding:12px 16px !important}.custom-panel-head{margin-bottom:8px !important}.cat-toggles{padding-bottom:10px !important}.cat-lists:empty{margin:0 !important}@media screen{.custom-panel{padding-bottom:4px !important}.map-frame{margin:16px 0 !important}}.print-btn svg{width:14px;height:14px;vertical-align:-2px;margin-right:6px}'+
  '.panel-actions{display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:8px 12px;flex-wrap:wrap;width:100%}.panel-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:flex-start}.panel-print .print-btn{margin-left:0;border-radius:999px;padding:6px 14px;font-size:11.5px;background:var(--ink,#22301F);color:var(--paper,#f4efe0);border:1px solid var(--ink,#22301F)}.panel-print .print-btn:hover{background:#3a4d34}@media print{.panel-print{display:none !important}}'+
  '.panel-actions-x{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.panel-actions .game-start{margin-left:10px}'+
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
  '@media (min-width:700px){.juego-on .map-frame-screen svg,.juego-on .map-frame svg{max-height:calc(100vh - 150px);min-height:340px}}'+
  '.juego-on svg text:not(.reveal){display:none !important}'+
  '.juego-on svg .legend-block text,.juego-on svg .scale-bar text{display:block !important}'+
  '.juego-on svg text.reveal{display:block !important;font-weight:700;font-style:normal;fill:#0b2d4a;paint-order:stroke;stroke:#fff;stroke-width:5px;font-size:24px}'+
  '.juego-on svg .g-ok{stroke:#17a34a !important;stroke-width:3.4px !important;stroke-opacity:1 !important;filter:none !important}'+
  '.juego-on svg .g-bad,.juego-on svg .g-miss{stroke:#d9480f !important;stroke-width:3.4px !important;stroke-opacity:1 !important;filter:none !important}'+
  '.juego-on svg .g-fill.g-ok,.juego-on svg circle.g-ok{fill:#17a34a !important;fill-opacity:.6 !important}'+
  '.juego-on svg .g-fill.g-bad,.juego-on svg .g-fill.g-miss,.juego-on svg circle.g-bad,.juego-on svg circle.g-miss{fill:#d9480f !important;fill-opacity:.6 !important}'+
  '@media print{.game-bar,.game-start{display:none !important}}';
  document.head.appendChild(css);

  var btn=document.createElement('button');btn.type='button';btn.className='game-start';btn.textContent='▶ Jugar';
  btn.setAttribute('title','Modo juego: señala en el mapa lo que se te pregunta');
  var grp=document.createElement('div');grp.className='panel-actions';var pb=head.querySelector('.preset-btns');
  if(pb){head.appendChild(grp);var cb=pb.querySelector('[data-preset=completo]'),mb=pb.querySelector('[data-preset=mudo]');if(cb&&mb)pb.insertBefore(cb,mb);
    var r1=document.createElement('div');r1.className='panel-row';r1.appendChild(pb);r1.appendChild(btn);grp.appendChild(r1);
    var pr=document.querySelector('.print-btn');if(pr){pr.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><rect x="3" y="9" width="18" height="8" rx="2"/><path d="M7 14h10v7H7z"/></svg>Imprimir en A4 horizontal';var r2=document.createElement('div');r2.className='panel-row panel-print';r2.appendChild(pr);grp.appendChild(r2);}}else head.appendChild(btn);
  var bar=document.createElement('div');bar.className='game-bar';bar.hidden=true;bar.setAttribute('aria-live','polite');
  panel.after(bar);

  var S={on:false,cat:null,q:[],i:0,att:0,max:2,sc:{first:0,second:0},fails:[],cur:null,done:false,rings:[],tm:null,at:null};
  function shuffle(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function esc(t){return String(t).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});}
  function checked(c,n){var cb=document.querySelector('[data-item-cat="'+c+'"][data-item-name="'+(window.CSS&&CSS.escape?CSS.escape(n):n)+'"]');return !cb||cb.checked;}
  function cap(s){return s.charAt(0).toUpperCase()+s.slice(1);}
  function shown(e){return getComputedStyle(e).display!=='none';}

  /* durante el juego se quitan los <title> del mapa: si no, el navegador muestra el nombre al pasar el ratón */
  var held=[];
  function hideTips(){if(held.length)return;[].slice.call(svg.querySelectorAll('title')).forEach(function(t){if(t.parentNode===svg)return;held.push([t.parentNode,t]);t.parentNode.removeChild(t);});}
  function showTips(){held.forEach(function(h){h[0].insertBefore(h[1],h[0].firstChild);});held=[];}
  /* ---------- pantalla de configuración ---------- */
  function setup(){
    clearTimeout(S.at);
    var cp=document.querySelector('.preset-btns [data-preset="completo"]');var act=document.querySelector('.preset-btns .active');if(cp&&((act&&act.dataset.preset==='mudo')||(document.querySelector('[data-item-cat]')&&!document.querySelector('[data-item-cat]:checked'))))cp.click();
    clearMarks();showTips();document.body.classList.remove('juego-on');S.on=false;bar.hidden=false;
    var opts='',first=true;
    present.forEach(function(c){
      refresh(c);var k=CATS[c],n=T[c].list.filter(function(t){return t.ok;}).length;if(!n)return;
      if(k.top&&n>k.top){opts+='<label><input type="radio" name="g-what" value="'+c+':top"'+(first?' checked':'')+'> '+cap(k.pl)+' principales ('+k.top+')</label>';first=false;}
      opts+='<label><input type="radio" name="g-what" value="'+c+':all"'+(first?' checked':'')+'> '+(k.top?'Todos los '+k.pl:cap(k.pl))+' ('+n+')</label>';first=false;
    });
    bar.innerHTML='<h3>Modo juego: localiza en el mapa</h3><p>Te preguntaré por un elemento y tú lo señalas con un clic o un toque. Los nombres del mapa se ocultan mientras juegas.</p>'+
      '<div class="game-row"><b>Qué</b>'+opts+'</div>'+
      '<div class="game-row"><b>Preguntas</b><label><input type="radio" name="g-n" value="10" checked> 10</label><label><input type="radio" name="g-n" value="20"> 20</label><label><input type="radio" name="g-n" value="0"> Todas</label>'+
      '<b>Intentos</b><label><input type="radio" name="g-a" value="2" checked> 2 por pregunta</label><label><input type="radio" name="g-a" value="1"> 1</label></div>'+
      '<div class="game-row"><button type="button" class="game-btn" id="g-go">Empezar</button><button type="button" class="game-btn sec" id="g-exit">Cancelar</button></div>';
    bar.querySelector('#g-go').onclick=start;bar.querySelector('#g-exit').onclick=exit;
  }
  function val(n){var e=bar.querySelector('input[name="'+n+'"]:checked');return e?e.value:null;}
  function start(){
    var spec=(val('g-what')||(present[0]+':all')).split(':'),c=spec[0],n=parseInt(val('g-n')||'10',10);S.max=parseInt(val('g-a')||'2',10);
    S.cat=c;refresh(c);
    var list=T[c].list.filter(function(t){return t.ok!==false;});
    var avail=list.filter(function(t){return checked(c,t.n);});if(!avail.length)avail=list;
    if(spec[1]==='top')avail=avail.slice(0,CATS[c].top);
    var p=shuffle(avail);if(n&&p.length>n)p=p.slice(0,n);
    begin(p);
  }
  function begin(p){hideTips();S.q=p;S.i=0;S.sc={first:0,second:0};S.fails=[];S.on=true;document.body.classList.add('juego-on');ask();var y=bar.getBoundingClientRect().top+window.pageYOffset-6;window.scrollTo(0,Math.max(0,y));}

  /* medir las etiquetas (zonas de clic) antes de ocultarlas */
  function toSvg(r){
    var m=svg.getScreenCTM();if(!m)return null;var inv=m.inverse(),a=svg.createSVGPoint(),b=svg.createSVGPoint();
    a.x=r.left;a.y=r.top;b.x=r.right;b.y=r.bottom;a=a.matrixTransform(inv);b=b.matrixTransform(inv);
    return {x:Math.min(a.x,b.x),y:Math.min(a.y,b.y),w:Math.abs(b.x-a.x),h:Math.abs(b.y-a.y)};
  }
  function refresh(c){
    var box=T[c].kind==='box';
    T[c].list.forEach(function(t){
      if(box){t.boxes=[];(t.texts||[]).forEach(function(e){if(!shown(e))return;var r=e.getBoundingClientRect();if(r.width>0&&r.height>0){var b=toSvg(r);if(b)t.boxes.push(b);}});t.ok=t.boxes.length>0;}
      else t.ok=t.els.some(shown);
    });
  }

  /* ---------- preguntas ---------- */
  function labels(c,n){return [].slice.call(svg.querySelectorAll('text')).filter(function(t){var tc=t.getAttribute('data-cat');return t.getAttribute('data-name')===n&&(!tc||tc===c)&&!t.closest('.legend-block');});}
  function clearMarks(){
    svg.querySelectorAll('.g-ok,.g-bad,.g-miss,.g-fill').forEach(function(e){e.classList.remove('g-ok','g-bad','g-miss','g-fill');});
    svg.querySelectorAll('text.reveal').forEach(function(e){e.classList.remove('reveal');});
    S.rings.forEach(function(r){r.remove();});S.rings=[];clearTimeout(S.tm);
  }
  function addRing(x,y,r){var c=document.createElementNS(NS,'circle');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r',r);c.setAttribute('fill','none');c.setAttribute('stroke','#d9480f');c.setAttribute('stroke-width','2.6');c.setAttribute('stroke-dasharray','5 3');c.setAttribute('pointer-events','none');svg.appendChild(c);S.rings.push(c);}
  function addRect(b){var r=document.createElementNS(NS,'rect');r.setAttribute('x',b.x-6);r.setAttribute('y',b.y-5);r.setAttribute('width',b.w+12);r.setAttribute('height',b.h+10);r.setAttribute('rx',6);r.setAttribute('fill','none');r.setAttribute('stroke','#d9480f');r.setAttribute('stroke-width','2.6');r.setAttribute('stroke-dasharray','5 3');r.setAttribute('pointer-events','none');svg.appendChild(r);S.rings.push(r);}
  function mark(t,cls){
    var k=T[S.cat].kind;
    t.els.forEach(function(e){
      e.classList.add(cls);if(k==='fill')e.classList.add('g-fill');
      if(k==='point'||(k==='fill'&&e.getBBox().width<30&&e.getBBox().height<30)){var b=toSvg(e.getBoundingClientRect());if(b)addRing(b.x+b.w/2,b.y+b.h/2,Math.max(13,Math.min(Math.max(b.w,b.h)/2+9,38)));}
    });
    if(k==='box')t.boxes.forEach(addRect);
    labels(S.cat,t.n).forEach(function(l){l.classList.add('reveal');});
    var f=t.els[0]||(t.boxes&&t.boxes[0]);
    if(f){var rr=t.els[0]?t.els[0].getBoundingClientRect():null;if(!rr&&t.texts&&t.texts[0])rr=t.texts[0].getBoundingClientRect();
      if(rr){var top=bar.getBoundingClientRect().bottom+30,cy=rr.top+rr.height/2;if(cy<top||cy>innerHeight-30)window.scrollBy({top:cy-(top+innerHeight)/2,behavior:'smooth'});}}
  }
  function ask(){
    clearMarks();S.cur=S.q[S.i];S.att=0;S.done=false;
    var q=S.cur;
    bar.innerHTML='<div class="game-top"><div><div class="game-meta">Pregunta '+(S.i+1)+' de '+S.q.length+' · Aciertos: '+(S.sc.first+S.sc.second)+'</div>'+
      '<div class="game-q">¿Dónde está <span style="color:#9a6a12">'+esc(CATS[S.cat].q(nice(q.n)))+'</span>?</div></div>'+
      '<div class="game-actions"><button type="button" class="game-btn" id="g-next" hidden>Siguiente ▶</button><button type="button" class="game-btn sec" id="g-skip">Saltar</button><button type="button" class="game-btn sec" id="g-exit">Salir</button></div></div>'+
      '<div class="game-msg" id="g-msg">Haz clic (o toca) sobre el mapa.'+(S.max>1?' Tienes '+S.max+' intentos.':'')+'</div>';
    bar.querySelector('#g-next').onclick=next;bar.querySelector('#g-skip').onclick=function(){miss(true);};bar.querySelector('#g-exit').onclick=exit;
  }
  function msg(t,k){var m=bar.querySelector('#g-msg');if(m){m.className='game-msg '+(k||'');m.innerHTML=t;}}
  function finishQ(good){
    S.done=true;clearTimeout(S.at);S.at=setTimeout(function(){if(S.on&&S.done)next();},good?1100:2800);
    var nx=bar.querySelector('#g-next'),sk=bar.querySelector('#g-skip');
    if(sk)sk.hidden=true;if(nx){nx.hidden=false;nx.textContent=S.i+1>=S.q.length?'Ver resultado ▶':'Siguiente ▶';}
  }
  function miss(skipped){
    var q=S.cur;S.fails.push(q);mark(q,'g-miss');
    msg((skipped?'Saltada. ':'No era ahí. ')+'Era <b>'+esc(nice(q.n))+'</b>, marcado en naranja.','bad');finishQ();
  }
  function next(){clearTimeout(S.at);S.i++;if(S.i>=S.q.length)end();else ask();}

  /* ---------- detección de clics ---------- */
  function localPt(e,ev){var p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;var m=e.getScreenCTM();return m?p.matrixTransform(m.inverse()):p;}
  function strokeHit(e,ev,w){
    var old=e.style.strokeWidth,pt=localPt(e,ev),ok=false;e.style.strokeWidth=w+'px';
    try{ok=e.isPointInStroke(pt);}catch(x){}e.style.strokeWidth=old;return ok;
  }
  function level(t,ev,coarse){
    var kind=T[S.cat].kind;
    if(kind==='stroke'){
      var W=coarse?[8,18,30]:[5,11,19];
      for(var k=0;k<3;k++){if(t.els.some(function(e){return shown(e)&&strokeHit(e,ev,W[k]);}))return k;}return 9;
    }
    if(kind==='fill'){
      var best=9;
      t.els.forEach(function(e){
        if(!shown(e))return;
        var pt=localPt(e,ev),inside=false;try{inside=e.isPointInFill(pt);}catch(x){}
        if(inside){best=0;return;}
        var W=coarse?[8,18,30]:[4,9,16];for(var k=0;k<3&&k<best;k++){if(strokeHit(e,ev,W[k]))best=k;}
      });return best;
    }
    if(kind==='point'){
      var D=coarse?[20,36,54]:[12,24,38],bd=1e9;
      t.els.forEach(function(e){if(!shown(e))return;var r=e.getBoundingClientRect(),dx=ev.clientX-(r.left+r.width/2),dy=ev.clientY-(r.top+r.height/2),d=Math.hypot(dx,dy)-Math.min(Math.max(r.width,r.height)/2,10);if(d<bd)bd=d;});
      for(var j=0;j<3;j++)if(bd<=D[j])return j;return 9;
    }
    /* box */
    var m=svg.getScreenCTM();if(!m)return 9;var p=svg.createSVGPoint();p.x=ev.clientX;p.y=ev.clientY;p=p.matrixTransform(m.inverse());
    var tol=(CATS[S.cat].tol||[14,34,56]).slice();if(coarse)tol=tol.map(function(x){return x*1.3;});
    var d=1e9;t.boxes.forEach(function(b){var dx=Math.max(b.x-p.x,0,p.x-(b.x+b.w)),dy=Math.max(b.y-p.y,0,p.y-(b.y+b.h));d=Math.min(d,Math.hypot(dx,dy));});
    for(var q=0;q<3;q++)if(d<=tol[q])return q;return 9;
  }
  function judge(ev){
    var coarse=(ev.pointerType==='touch')||(window.matchMedia&&matchMedia('(pointer:coarse)').matches),q=S.cur;
    var all=T[S.cat].list.filter(function(t){return t.ok!==false;}),lv=all.map(function(t){return level(t,ev,coarse);});
    var qi=all.indexOf(q),best=Math.min.apply(null,lv.concat([9]));
    if(qi>=0&&lv[qi]<9&&lv[qi]<=best)return {ok:true};
    if(best<9)return {ok:false,what:all[lv.indexOf(best)]};
    /* tolerancia amplia: ¿el objetivo está dentro de su zona aunque otro quede más cerca? */
    return {ok:false,what:null};
  }
  svg.addEventListener('click',function(ev){
    if(!S.on||S.done||!S.cur)return;
    var r=judge(ev),q=S.cur;S.att++;
    if(r.ok){
      if(S.att===1)S.sc.first++;else S.sc.second++;
      mark(q,'g-ok');msg('¡Correcto! Es <b>'+esc(nice(q.n))+'</b>.'+(S.att>1?' (a la segunda)':''),'ok');
      var m=bar.querySelector('.game-meta');if(m)m.textContent='Pregunta '+(S.i+1)+' de '+S.q.length+' · Aciertos: '+(S.sc.first+S.sc.second);
      finishQ(true);return;
    }
    var left=S.max-S.att,what=r.what?'Has señalado <b>'+esc(nice(r.what.n))+'</b>.':'Ahí no hay nada de lo que se pregunta.';
    if(left>0){
      if(r.what){r.what.els.forEach(function(e){e.classList.add('g-bad');if(T[S.cat].kind==='fill')e.classList.add('g-fill');});clearTimeout(S.tm);S.tm=setTimeout(function(){svg.querySelectorAll('.g-bad').forEach(function(e){e.classList.remove('g-bad','g-fill');});},1100);}
      msg('No es ahí. '+what+' Te queda '+left+' intento'+(left>1?'s':'')+'.','bad');
    } else {
      S.fails.push(q);mark(q,'g-miss');msg('No era ahí. '+what+' Era <b>'+esc(nice(q.n))+'</b>, marcado en naranja.','bad');finishQ();
    }
  });

  /* ---------- final ---------- */
  function end(){
    clearMarks();var n=S.q.length,ok=S.sc.first+S.sc.second,f=S.fails.length;
    var tone=ok===n?'¡Perfecto!':ok/n>=.7?'¡Muy bien!':ok/n>=.5?'Vas por buen camino.':'A repasar un poco.';
    bar.innerHTML='<h3>'+tone+' Has acertado '+ok+' de '+n+'</h3><p class="game-meta">'+S.sc.first+' a la primera'+(S.max>1?' · '+S.sc.second+' a la segunda':'')+'</p>'+
      (f?'<p class="game-fails"><b>Para repasar:</b> '+S.fails.map(function(q){return esc(nice(q.n));}).join(', ')+'.</p>':'')+
      '<div class="game-row">'+(f?'<button type="button" class="game-btn" id="g-rep">Repasar los fallados</button>':'')+'<button type="button" class="game-btn'+(f?' sec':'')+'" id="g-again">Jugar otra vez</button><button type="button" class="game-btn sec" id="g-exit">Salir</button></div>';
    S.on=false;
    var rep=bar.querySelector('#g-rep');if(rep)rep.onclick=function(){begin(shuffle(S.fails.slice()));};
    bar.querySelector('#g-again').onclick=setup;bar.querySelector('#g-exit').onclick=exit;
  }
  function exit(){clearTimeout(S.at);clearMarks();showTips();S.on=false;document.body.classList.remove('juego-on');bar.hidden=true;bar.innerHTML='';}
  btn.addEventListener('click',function(){if(bar.hidden||!S.on&&!bar.querySelector('#g-go'))setup();else bar.scrollIntoView({behavior:'smooth',block:'nearest'});});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&!bar.hidden)exit();
    if(e.key==='Enter'&&S.on&&S.done){var nx=bar.querySelector('#g-next');if(nx&&document.activeElement!==nx){e.preventDefault();next();}}
  });
})();
