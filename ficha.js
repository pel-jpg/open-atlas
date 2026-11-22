/* Fichas: al pulsar una estructura se abre una ficha con detalle y función. Datos en <script id="fichas-data" type="application/json"> */
(function(){
  var dEl=document.getElementById('fichas-data');if(!dEl)return;
  var svg=document.getElementById('mapa');if(!svg)return;
  var data;try{data=JSON.parse(dEl.textContent);}catch(e){return;}
  var css='.fichas-on svg#mapa .organo{cursor:pointer}.fichas-on.juego-on svg#mapa .organo,.fichas-on.juego-setup svg#mapa .organo{cursor:inherit}'+
  '.ficha-ov{position:fixed;inset:0;background:rgba(30,22,14,.55);display:flex;align-items:center;justify-content:center;padding:16px;z-index:9999}'+
  '.ficha-ov[hidden]{display:none}'+
  '.ficha{background:#fbf7ef;border:1px solid #cdbfa8;border-radius:6px;box-shadow:0 18px 50px rgba(0,0,0,.35);max-width:820px;width:100%;max-height:92vh;overflow:auto;display:grid;grid-template-columns:minmax(0,320px) 1fr;position:relative}'+
  '.ficha-img{background:#f5efe4;display:flex;align-items:center;justify-content:center;border-right:1px solid #e3d8c4}'+
  '.ficha-img img{display:block;width:100%;height:auto;aspect-ratio:1/1}'+
  '.ficha-body{padding:22px 26px 24px}'+
  '.ficha-body h2{font-family:Fraunces,Georgia,serif;font-size:26px;margin:0 0 4px;color:#2e2014;font-weight:600}'+
  '.ficha-grp{font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8a7358;margin:0 0 12px}'+
  '.ficha-body p{font-size:15.5px;line-height:1.6;color:#2e2014;margin:0 0 12px}'+
  '.ficha-dato{background:#f1e6d0;border-left:3px solid #b08a4e;padding:9px 12px;font-size:14px !important;border-radius:2px}'+
  '.ficha-x{position:absolute;top:8px;right:10px;width:34px;height:34px;border:none;background:rgba(251,247,239,.9);border-radius:50%;font-size:22px;line-height:1;cursor:pointer;color:#2e2014}'+
  '.ficha-x:hover{background:#efe3cb}'+
  '@media (max-width:640px){.ficha{grid-template-columns:1fr}.ficha-img{border-right:none;border-bottom:1px solid #e3d8c4;max-height:46vh}.ficha-img img{max-height:46vh;width:auto;margin:0 auto}.ficha-body{padding:16px 18px 20px}.ficha-body h2{font-size:23px}}'+
  '@media print{.ficha-ov{display:none !important}}';
  var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  document.body.classList.add('fichas-on');
  var ov=document.createElement('div');ov.className='ficha-ov';ov.hidden=true;
  ov.innerHTML='<div class="ficha" role="dialog" aria-modal="true" aria-labelledby="ficha-t"><button class="ficha-x" aria-label="Cerrar ficha">×</button><div class="ficha-img"><img alt=""></div><div class="ficha-body"><h2 id="ficha-t"></h2><p class="ficha-grp"></p><p class="ficha-txt"></p><p class="ficha-dato"></p></div></div>';
  document.body.appendChild(ov);
  var img=ov.querySelector('img'),tt=ov.querySelector('h2'),gp=ov.querySelector('.ficha-grp'),tx=ov.querySelector('.ficha-txt'),dt=ov.querySelector('.ficha-dato'),xb=ov.querySelector('.ficha-x');
  var back=null;
  function open(n){var f=data[n];if(!f)return;
    img.src=f.img;img.alt='Detalle: '+n.toLowerCase();tt.textContent=n;gp.textContent=f.grupo||'';tx.textContent=f.txt;
    if(f.dato){dt.textContent='Dato: '+f.dato;dt.style.display='';}else dt.style.display='none';
    back=document.activeElement;ov.hidden=false;xb.focus();}
  function close(){ov.hidden=true;if(back&&back.focus)try{back.focus();}catch(e){}}
  xb.addEventListener('click',close);
  ov.addEventListener('click',function(e){if(e.target===ov)close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&!ov.hidden)close();});
  var down=null;
  svg.addEventListener('pointerdown',function(e){down=[e.clientX,e.clientY];});
  svg.addEventListener('click',function(e){
    var b=document.body.classList;if(b.contains('juego-on')||b.contains('juego-setup')||b.contains('mudo'))return;
    if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])>8)return;
    var els=document.elementsFromPoint(e.clientX,e.clientY);
    for(var i=0;i<els.length;i++){var el=els[i];if(el.classList&&(el.classList.contains('organo')||el.classList.contains('olabel'))){var n=el.getAttribute('data-name');if(data[n]){open(n);return;}}}
  });
})();
