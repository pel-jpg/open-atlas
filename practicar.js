/* Atlas Abierto · Practicar: test y flashcards sobre la etapa del mapa que se está viendo.
   Necesita window.QUIZ = {tests:[{s,q,o:[...],a,e}], cards:[{s,f,b}]} (s = índice de etapa).
   No guarda nada: ni cookies ni almacenamiento local. */
(function(){
  var Q=window.QUIZ; if(!Q||typeof META==='undefined') return;
  var css=document.createElement('style'); css.textContent=
  '.pr-ov{position:fixed;inset:0;background:rgba(20,28,18,.62);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px}'+
  '.pr-box{background:#F4EEDF;color:#22301F;width:min(680px,100%);max-height:92vh;overflow:auto;border-radius:6px;border:1px solid rgba(34,48,31,.35);box-shadow:0 18px 60px rgba(0,0,0,.4);font-family:"IBM Plex Sans",sans-serif}'+
  '.pr-h{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding:18px 22px 10px;border-bottom:1px solid rgba(34,48,31,.18)}'+
  '.pr-h h2{font-family:"Fraunces",serif;font-size:20px;margin:0}.pr-h small{display:block;font-family:"IBM Plex Mono",monospace;font-size:11px;color:#4B5A45;margin-top:4px}'+
  '.pr-x{background:none;border:0;font-size:26px;line-height:1;cursor:pointer;color:#22301F;padding:0 4px}'+
  '.pr-bar{display:flex;flex-wrap:wrap;gap:8px;padding:12px 22px 0}'+
  '.pr-bar button{font-family:"IBM Plex Mono",monospace;font-size:12px;background:transparent;border:1px solid rgba(34,48,31,.35);color:#22301F;padding:6px 13px;border-radius:999px;cursor:pointer}'+
  '.pr-bar button.on{background:#22301F;color:#ECE4D2;border-color:#22301F}'+
  '.pr-bar .sp{flex:1}'+
  '.pr-b{padding:16px 22px 22px}.pr-n{font-family:"IBM Plex Mono",monospace;font-size:11px;color:#4B5A45;margin-bottom:8px}'+
  '.pr-q{font-family:"Fraunces",serif;font-size:19px;line-height:1.35;margin:0 0 14px}'+
  '.pr-o{display:block;width:100%;text-align:left;font:inherit;font-size:15px;background:#fff;border:1px solid rgba(34,48,31,.3);border-radius:4px;padding:10px 13px;margin-bottom:8px;cursor:pointer;color:#22301F}'+
  '.pr-o:hover:not(:disabled){border-color:#22301F}.pr-o:disabled{cursor:default}'+
  '.pr-o.ok{background:#DCEBD0;border-color:#4E8C4A}.pr-o.ko{background:#F3D7D0;border-color:#B5402C}'+
  '.pr-e{font-size:14px;line-height:1.55;color:#4B5A45;margin:6px 0 12px}'+
  '.pr-go{font-family:"IBM Plex Mono",monospace;font-size:12.5px;background:#22301F;color:#ECE4D2;border:0;padding:9px 18px;border-radius:3px;cursor:pointer}'+
  '.pr-go.alt{background:transparent;color:#22301F;border:1px solid rgba(34,48,31,.4)}'+
  '.pr-card{min-height:190px;display:flex;align-items:center;justify-content:center;text-align:center;background:#fff;border:1px solid rgba(34,48,31,.3);border-radius:6px;padding:22px;font-size:19px;line-height:1.4;cursor:pointer;font-family:"Fraunces",serif;margin-bottom:12px}'+
  '.pr-card.back{background:#ECE4D2;font-family:"IBM Plex Sans",sans-serif;font-size:17px}'+
  '.pr-row{display:flex;gap:8px;flex-wrap:wrap;align-items:center}.pr-sc{font-family:"Fraunces",serif;font-size:30px;margin:4px 0 8px}'+
  '.pr-tag{display:block;font-family:"IBM Plex Mono",monospace;font-size:11px;letter-spacing:1px;text-transform:uppercase;color:#B8862B;margin-bottom:10px}'+
  '.pr-hint{font-size:12px;color:#4B5A45;margin-top:10px}'+
  '.pr-ov.dock{background:none;pointer-events:none;align-items:flex-end;padding:0 12px 12px}'+
  '.pr-ov.dock .pr-box{pointer-events:auto;width:min(620px,100%);max-height:46vh}'+
  '.pr-ov.dock .pr-b{padding:10px 22px 16px}.pr-ov.dock .pr-q{font-size:17px;margin-bottom:8px}.pr-ov.dock .pr-h{padding:10px 22px 6px}.pr-ov.dock .pr-bar{padding-top:8px}'+
  'body.pr-pinmode #mapsvg .clabel,body.pr-pinmode #mapsvg .evlabel,body.pr-pinmode #mapsvg g.city,body.pr-pinmode #mapsvg .star{display:none}body.pr-pinmode #mapsvg{cursor:crosshair}'+
  '@media print{.pr-ov,.pr-open{display:none!important}}';
  document.head.appendChild(css);
  var tools=document.querySelector('.tools'); if(!tools) return;
  var open=document.createElement('button'); open.className='print-btn pr-open'; open.textContent='Practicar'; open.style.marginRight='8px';
  open.setAttribute('aria-haspopup','dialog'); tools.insertBefore(open,tools.firstChild);
  var ov,box,mode='test',scope='etapa',items=[],idx=0,score=0,answered=false,flip=false,lastFocus;
  function sh(a){a=a.slice();for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
  function esc(s){return String(s).replace(/[&<>]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;'}[c];});}
  function pool(){var src=mode==='test'?Q.tests:mode==='pins'?(Q.pins||[]):Q.cards;return src.filter(function(x){return scope==='todo'||x.s===cur;});}
  function start(){items=sh(pool()); if(mode==='test') items=items.map(function(t){var ord=sh(t.o.map(function(_,i){return i;}));return{q:t.q,e:t.e,o:ord.map(function(i){return t.o[i];}),a:ord.indexOf(t.a)};}); idx=0;score=0;answered=false;flip=false;clearMk();draw();}
  function bar(){return '<div class="pr-bar" role="tablist">'+
    '<button data-m="test" class="'+(mode==='test'?'on':'')+'">Test</button><button data-m="cards" class="'+(mode==='cards'?'on':'')+'">Flashcards</button><button data-m="pins" class="'+(mode==='pins'?'on':'')+'">En el mapa</button><span class="sp"></span>'+
    '<button data-s="etapa" class="'+(scope==='etapa'?'on':'')+'">Esta etapa</button><button data-s="todo" class="'+(scope==='todo'?'on':'')+'">Todo el mapa</button></div>';}
  function draw(){
    var st=META[cur], h='<div class="pr-h"><div><h2>Practicar</h2><small>'+esc(META[cur].year)+' · '+esc(META[cur].title)+'</small></div><button class="pr-x" aria-label="Cerrar">×</button></div>'+bar()+'<div class="pr-b">';
    if(!items.length){ h+='<p class="pr-e">No hay preguntas para esta etapa todavía. Prueba con «Todo el mapa».</p>'; }
    else if(mode==='pins'){
      if(idx>=items.length){ clearMk(); h+='<div class="pr-n">Resultado</div><div class="pr-sc">'+score+' / '+items.length+'</div><p class="pr-e">'+(score===items.length?'¡Perfecto!':score>=items.length*0.6?'Muy bien. Repasa las que has fallado.':'Mira de nuevo el mapa y vuelve a intentarlo.')+'</p><button class="pr-go" data-a="again">Repetir</button>'; }
      else { var t=items[idx]; h+='<div class="pr-n">Pregunta '+(idx+1)+' de '+items.length+(answered?'':' · toca en el mapa')+'</div><p class="pr-q">'+esc(t.q)+'</p>';
        if(answered){ h+='<p class="pr-e">'+(t.ok?'<b>¡Correcto!</b> ':'<b>Te has quedado a '+t.d+' km aprox.</b> ')+esc(t.e||'')+'</p><button class="pr-go" data-a="next">'+(idx+1<items.length?'Siguiente':'Ver resultado')+'</button>'; }
        else h+='<p class="pr-hint">Las ciudades, los nombres y las estrellas del mapa se ocultan mientras practicas. Toca el lugar donde crees que está.</p>'; }
    }
    else if(mode==='test'){
      if(idx>=items.length){ h+='<div class="pr-n">Resultado</div><div class="pr-sc">'+score+' / '+items.length+'</div><p class="pr-e">'+(score===items.length?'¡Perfecto!':score>=items.length*0.6?'Muy bien. Repasa las que has fallado.':'Lee de nuevo el texto de la etapa y vuelve a intentarlo.')+'</p><div class="pr-row"><button class="pr-go" data-a="again">Repetir</button></div>'; }
      else { var t=items[idx]; h+='<div class="pr-n">Pregunta '+(idx+1)+' de '+items.length+'</div><p class="pr-q">'+esc(t.q)+'</p>';
        t.o.forEach(function(o,i){ var c=''; if(answered){c=i===t.a?' ok':(i===t.sel?' ko':'');} h+='<button class="pr-o'+c+'" data-o="'+i+'"'+(answered?' disabled':'')+'>'+esc(o)+'</button>'; });
        if(answered){ h+='<p class="pr-e">'+(t.sel===t.a?'<b>¡Correcto!</b> ':'<b>No exactamente.</b> ')+esc(t.e||'')+'</p><button class="pr-go" data-a="next">'+(idx+1<items.length?'Siguiente':'Ver resultado')+'</button>'; } }
    } else {
      var c=items[Math.min(idx,items.length-1)]; h+='<div class="pr-n">Tarjeta '+(idx+1)+' de '+items.length+' · toca la tarjeta para ver la '+(flip?'pregunta':'respuesta')+'</div><div class="pr-card'+(flip?' back':'')+'" data-a="flip" tabindex="0" role="button" aria-label="Girar tarjeta"><div><span class="pr-tag">'+(flip?'Respuesta':'Pregunta')+'</span>'+esc(flip?c.b:c.f)+'</div></div>'+
        '<div class="pr-row"><button class="pr-go alt" data-a="prev">Anterior</button><button class="pr-go" data-a="nextc">Siguiente</button></div><p class="pr-hint">Teclado: ← → para moverte, espacio para girar.</p>';
    }
    box.innerHTML=h+'</div>';
    ov.classList.toggle('dock',mode==='pins'); document.body.classList.toggle('pr-pinmode',mode==='pins'); if(mode!=='pins') clearMk();
    if(mode==='pins'&&items.length&&idx<items.length&&!answered){ var sv=document.getElementById('mapsvg'); var rc=sv.getBoundingClientRect(); if(rc.top<0||rc.bottom>innerHeight*0.55) sv.scrollIntoView({block:'start',behavior:'smooth'}); }
    var f=box.querySelector('.pr-card,.pr-o:not(:disabled),.pr-go'); if(f&&mode==='cards') f.focus();
  }
  var NS='http://www.w3.org/2000/svg';
  function clearMk(){var g=document.getElementById('pr-mk'); if(g) g.remove();}
  function mapClick(e){
    if(!ov||mode!=='pins'||answered||idx>=items.length) return;
    var sv=document.getElementById('mapsvg'), pt=sv.createSVGPoint(); pt.x=e.clientX; pt.y=e.clientY; var m=sv.getScreenCTM(); if(!m) return; var q=pt.matrixTransform(m.inverse());
    var t=items[idx], d=Math.hypot(q.x-t.x,q.y-t.y); t.ok=d<=t.r; t.d=Math.round(d*5.3/10)*10; /* ≈ 5,3 km por unidad del mapa */
    if(t.ok) score++; answered=true; clearMk();
    var g=document.createElementNS(NS,'g'); g.id='pr-mk'; g.setAttribute('pointer-events','none');
    function el(n,a){var x=document.createElementNS(NS,n); for(var k in a) x.setAttribute(k,a[k]); g.appendChild(x);}
    var col=t.ok?'#3E8B3A':'#B5402C';
    el('circle',{cx:t.x,cy:t.y,r:t.r,fill:'rgba(62,139,58,.18)',stroke:'#3E8B3A','stroke-width':1.6,'stroke-dasharray':'4 3'});
    el('circle',{cx:t.x,cy:t.y,r:3.2,fill:'#3E8B3A'});
    if(!t.ok) el('line',{x1:q.x,y1:q.y,x2:t.x,y2:t.y,stroke:col,'stroke-width':1.2,'stroke-dasharray':'3 3'});
    el('circle',{cx:q.x,cy:q.y,r:4.5,fill:col,stroke:'#fff','stroke-width':1.5});
    var tx=document.createElementNS(NS,'text'); tx.setAttribute('x',t.x+t.r+4); tx.setAttribute('y',t.y+4); tx.setAttribute('font-size','11'); tx.setAttribute('font-weight','700'); tx.setAttribute('fill','#22301F'); tx.setAttribute('stroke','#fff'); tx.setAttribute('stroke-width','3'); tx.setAttribute('paint-order','stroke'); tx.textContent=(t.q.match(/¿Dónde está ([^,?]+)/)||[])[1]||''; g.appendChild(tx);
    sv.appendChild(g); draw();
  }
  function close(){ if(ov){ document.removeEventListener('keydown',key); ov.remove(); ov=null; clearMk(); document.body.classList.remove('pr-pinmode'); document.getElementById('mapsvg').removeEventListener('click',mapClick); if(lastFocus) lastFocus.focus(); } }
  function key(e){
    if(e.key==='Escape'){close();return;}
    if(mode==='cards'&&items.length){ if(e.key==='ArrowRight'){idx=(idx+1)%items.length;flip=false;draw();} else if(e.key==='ArrowLeft'){idx=(idx-1+items.length)%items.length;flip=false;draw();} else if(e.key===' '&&document.activeElement.classList.contains('pr-card')){e.preventDefault();flip=!flip;draw();} }
  }
  open.onclick=function(){
    lastFocus=document.activeElement; ov=document.createElement('div'); ov.className='pr-ov';
    box=document.createElement('div'); box.className='pr-box'; box.setAttribute('role','dialog'); box.setAttribute('aria-modal','true'); box.setAttribute('aria-label','Practicar'); ov.appendChild(box); document.body.appendChild(ov);
    ov.addEventListener('click',function(e){
      var t=e.target; if(t===ov){close();return;} var b=t.closest('button,.pr-card'); if(!b) return;
      if(b.classList.contains('pr-x')){close();return;}
      if(b.dataset.m){mode=b.dataset.m;start();return;} if(b.dataset.s){scope=b.dataset.s;start();return;}
      if(b.dataset.o!==undefined&&!answered){var it=items[idx];it.sel=+b.dataset.o;answered=true;if(it.sel===it.a)score++;draw();return;}
      var a=b.dataset.a; if(a==='next'){idx++;answered=false;clearMk();draw();} else if(a==='again'){clearMk();start();}
      else if(a==='flip'){flip=!flip;draw();} else if(a==='nextc'){idx=(idx+1)%items.length;flip=false;draw();} else if(a==='prev'){idx=(idx-1+items.length)%items.length;flip=false;draw();}
    });
    document.addEventListener('keydown',key); document.getElementById('mapsvg').addEventListener('click',mapClick); start();
  };
})();
