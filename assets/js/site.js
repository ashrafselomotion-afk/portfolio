/* always open at the top (the hero video) - never restore the last scroll position */
if('scrollRestoration' in history){ history.scrollRestoration = 'manual'; }
window.scrollTo(0,0);
window.addEventListener('load', function(){ window.scrollTo(0,0); });
/* ============ PRELOADER + FRAME SEQUENCE ============ */
(function(){
  const TOTAL = 120;
  // portrait screens get the native 9:16 frame set (full-bleed), wide screens the 16:9 one
  const FRAME_DIR = window.matchMedia('(max-aspect-ratio: 4/5)').matches ? 'assets/frames-m/' : 'assets/frames/';
  const pad = n => String(n).padStart(3,'0');
  const imgs = new Array(TOTAL);
  let loaded = 0;
  const pct = document.getElementById('lpct');
  const loader = document.getElementById('loader');
  const canvas = document.getElementById('frames');
  const ctx = canvas.getContext('2d');

  // ---- funny GSAP loader: bouncing dots (squash & stretch) + rotating quips ----
  (function loaderFX(){
    if(!window.gsap) return;                         // CSS keyframe bounce is the fallback
    const dots = gsap.utils.toArray('#loader .load-dots i');
    dots.forEach(d => d.style.animation = 'none');    // hand the bounce over to GSAP
    // epic choreographed bounce: each dot launches high, flares a colored glow, then settles elastically
    dots.forEach((d,i)=>{
      const m = (getComputedStyle(d).backgroundColor.match(/\d+/g) || [200,200,200]);
      const glow = a => '0 0 26px rgba('+m[0]+','+m[1]+','+m[2]+','+a+')';
      gsap.set(d, {transformOrigin:'50% 100%'});
      gsap.timeline({repeat:-1, delay:i*0.14, repeatDelay:0.04})
        .to(d, { y:-58, scaleX:0.74, scaleY:1.34, rotate:'-=8', boxShadow:glow(0.85), duration:0.36, ease:'power3.out' })   // launch + stretch + flare
        .to(d, { y:0,   scaleX:1.36, scaleY:0.64, rotate:'+=8', boxShadow:glow(0.35), duration:0.22, ease:'power3.in' })    // slam + squash
        .to(d, { scaleX:1, scaleY:1, boxShadow:glow(0), duration:0.78, ease:'elastic.out(1,0.38)' });                       // elastic settle, glow fades
    });
    // the whole trio breathes + sways for extra drama
    gsap.to('#loader .load-dots', { rotate:5, x:4, duration:1.4, ease:'sine.inOut', yoyo:true, repeat:-1, transformOrigin:'50% 100%' });
    const QUIPS = [
      'Waking up the pixels…',
      'Bribing the render farm…',
      'Untangling the rope…',
      'Convincing the AI to behave…',
      'Adding one more keyframe…',
      'Caffeinating the designer…',
      'Rendering at 1 fps (kidding)…',
      'Making it pop…',
      'Almost famous…'
    ];
    const msg = document.getElementById('loadMsg');
    if(!msg) return;
    let qi = 0;
    (function cycle(){
      gsap.delayedCall(1.25, ()=>{
        qi = (qi+1) % QUIPS.length;
        gsap.to(msg, { opacity:0, y:-8, duration:0.24, ease:'power1.in', onComplete:()=>{
          msg.textContent = QUIPS[qi];
          gsap.fromTo(msg, {opacity:0, y:8}, {opacity:1, y:0, duration:0.34, ease:'power2.out'});
          cycle();
        }});
      });
    })();
  })();

  // device pixel sizing
  function fit(){
    const w = canvas.clientWidth, h = canvas.clientHeight;
    const dpr = Math.min(window.devicePixelRatio||1, 2);
    canvas.width = w*dpr; canvas.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    draw(currentFrame);
  }
  function drawCover(img){
    if(!img || !img.complete) return;
    const cw = canvas.clientWidth, ch = canvas.clientHeight;
    const ir = img.width/img.height, cr = cw/ch;
    ctx.clearRect(0,0,cw,ch);
    if(cr < 0.9 && ir > 1.2){
      // portrait screen stuck with a LANDSCAPE frame set (fallback only, e.g. desktop window squeezed):
      // cover would crop ~2/3 of the frame. Show the full frame width as a cinematic strip instead.
      const w = cw, h = cw/ir, y = (ch-h)/2;
      const g = ctx.createLinearGradient(0,0,0,ch);
      g.addColorStop(0,'#e9e8ec'); g.addColorStop(1,'#f2f1f4');
      ctx.fillStyle = g; ctx.fillRect(0,0,cw,ch);
      ctx.drawImage(img,0,y,w,h);
      return;
    }
    if(ir <= 1.2 && cr < ir){
      // portrait frames on an even-taller screen: never clip the artwork's width.
      // Pass 1: zoomed cover fill (seamless backdrop) · Pass 2: full frame fit to width, centered.
      const bw = ch*ir;
      ctx.drawImage(img,(cw-bw)/2,0,bw,ch);
      const h2 = cw/ir;
      ctx.drawImage(img,0,(ch-h2)/2,cw,h2);
      return;
    }
    let w,h,x,y;
    if(ir > cr){ h = ch; w = ch*ir; x = (cw-w)/2; y = 0; }
    else { w = cw; h = cw/ir; x = 0; y = (ch-h)/2; }
    ctx.drawImage(img,x,y,w,h);
  }
  let currentFrame = 0;
  function draw(i){
    i = Math.max(0,Math.min(TOTAL-1, i|0));
    currentFrame = i;
    drawCover(imgs[i]);
  }

  function onload(){
    loaded++;
    const p = loaded/TOTAL;
    pct.textContent = Math.round(p*100)+'%';
    if(loaded===TOTAL) start();
  }
  for(let i=0;i<TOTAL;i++){
    const im = new Image();
    im.onload = onload; im.onerror = onload;
    im.src = FRAME_DIR+'f_'+pad(i+1)+'.jpg';
    imgs[i]=im;
  }

  let started=false;
  function start(){
    if(started) return; started=true;
    window.scrollTo(0,0);
    fit(); draw(0);
    if(window.gsap){
      gsap.killTweensOf('#loader .load-dots i');
      const tl = gsap.timeline({ delay:0.2, onComplete:()=>loader.classList.add('done') });
      tl.to('#loader .load-dots i', { y:-70, opacity:0, scale:1.5, duration:0.5, ease:'back.in(2.2)', stagger:0.07 })
        .to('#loader .load-pct, #loader .load-msg', { opacity:0, y:-16, duration:0.32, ease:'power2.in' }, '-=0.28');
      setTimeout(()=>loader.classList.add('done'), 1600);   // safety: always hide
    } else {
      setTimeout(()=>{ loader.classList.add('done'); }, 350);
    }
    document.body.classList.add('ready');
    bindScroll();
  }
  // safety: don't hang forever if an image stalls
  setTimeout(()=>{ if(!started) start(); }, 9000);

  window.addEventListener('resize', fit);

  /* ============ SCROLL → FRAME + UI ============ */
  const hero = document.getElementById('hero');
  const heroTop = document.querySelector('.hero-top');
  const discTrack = document.getElementById('discTrack');
  const scrubPct = document.getElementById('scrubPct');
  const scrubRing = document.getElementById('scrubRing');
  let ticking=false, lastP=0;

  function heroProgress(){
    const rect = hero.getBoundingClientRect();
    const total = hero.offsetHeight - window.innerHeight;
    if(total <= 0) return 0;
    const p = Math.min(1, Math.max(0, -rect.top/total));
    return p;
  }
  function render(){
    ticking=false;
    const p = heroProgress();
    lastP = p;
    draw(Math.round(p*(TOTAL-1)));
    // fade the name out as you scroll so the character is revealed cleanly
    if(heroTop) heroTop.style.opacity = String(Math.min(1, Math.max(0, 1 - (p-0.22)/0.36)));
    // rotating discipline word (4 items)
    const idx = Math.min(3, Math.floor(p*3.999));
    discTrack.style.transform = 'translateY(-'+(idx*1.2)+'em)';
    // meter
    const pp = Math.round(p*100);
    if(scrubPct) scrubPct.textContent = String(pp).padStart(2,'0');
    const chip=document.getElementById('scrubChip');
    if(chip) chip.textContent = String(currentFrame+1).padStart(3,'0')+' · 120';
    if(scrubRing) scrubRing.style.setProperty('--p', pp+'%');
  }
  function bindScroll(){
    window.addEventListener('scroll', ()=>{
      if(!ticking){ requestAnimationFrame(render); ticking=true; }
    }, {passive:true});
    render();
  }
})();

/* ============ REVEAL ON SCROLL (fallback when GSAP absent) ============ */
(function(){
  if(window.gsap && window.ScrollTrigger) return;   // GSAP handles reveals below
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target);} });
  }, {threshold:.16, rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
})();

/* ============ COUNT-UP STAT NUMBERS (fallback when GSAP absent) ============ */
(function(){
  if(window.gsap && window.ScrollTrigger) return;   // GSAP handles count-up below
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nums = document.querySelectorAll('#about .stat .n');
  function run(el){
    const m = el.textContent.trim().match(/^(\d+)(\D*)$/);
    if(!m) return;                         // leave non-numeric (∞) alone
    const target = parseInt(m[1],10), suffix = m[2];
    if(reduce){ el.textContent = target + suffix; return; }
    const dur = 1500, t0 = performance.now();
    function tick(now){
      const p = Math.min(1, (now - t0)/dur);
      const eased = 1 - Math.pow(1 - p, 3);     // easeOutCubic
      el.textContent = Math.round(eased * target) + suffix;
      if(p < 1) requestAnimationFrame(tick);
    }
    el.textContent = '0' + suffix;
    requestAnimationFrame(tick);
  }
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ run(e.target); io.unobserve(e.target);} });
  }, {threshold:.7});
  nums.forEach(n=>io.observe(n));
})();

/* ============ CLIENTS MARQUEE ============ */
(function(){
  const rowA = ["PepsiCo · Mo Salah","Almarai · Anchor","BEEAH Group","Edge Group","Dubai Airshow","Genesis F1 2025","Duty Free (DDF)","EWEC"];
  const rowB = ["SHUROOQ","Invest in Sharjah","IGCF","Sharjah Entrepreneurship Festival","SIBF","House of Wisdom","Arab Youth Center","SPC Free Zone"];
  const rowC = ["Messe Frankfurt","MRO Middle East","AIME Exhibitions","Xposure Festival","Les Misérables · Abu Dhabi","The Big Heart Foundation","Hope Makers","IUCN · Abu Dhabi"];
  function build(el, arr){
    if(!el) return;
    el.textContent='';
    for(let pass=0;pass<2;pass++){                  // duplicate for seamless loop
      arr.forEach(t=>{
        const m=document.createElement('span'); m.className='m'; m.textContent=t;
        const d=document.createElement('span'); d.className='dotm'; d.textContent='✦';
        el.append(m,d);
      });
    }
  }
  build(document.getElementById('marq1'), rowA);
  build(document.getElementById('marq2'), rowB);
  build(document.getElementById('marq3'), rowC);
})();

/* ============ NAV HIDE ON SCROLL DOWN ============ */
(function(){
  const nav = document.querySelector('header.nav');
  let last=0;
  window.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    if(y>last && y>600) nav.style.transform='translateY(-110%)';
    else nav.style.transform='translateY(0)';
    last=y;
  }, {passive:true});
})();

/* ============ EXPERIENCE - HORIZONTAL TIMELINE SCROLL ============ */
(function(){
  const xp = document.getElementById('xp');
  const track = document.getElementById('xpTrack');
  const bar = document.getElementById('xpBar');
  const line = track ? track.querySelector('.xp-line') : null;
  if(!xp || !track) return;
  function setLine(){
    if(!line) return;
    const nodes = track.querySelectorAll('.xp-card:not(.xp-final) .xp-node');
    if(!nodes.length) return;
    const tr = track.getBoundingClientRect();
    const a = nodes[0].getBoundingClientRect();
    const b = nodes[nodes.length-1].getBoundingClientRect();   // Freelance (last role) dot
    const x1 = a.left + a.width/2 - tr.left;
    const x2 = b.left + b.width/2 - tr.left;
    line.style.left = x1 + 'px';
    line.style.right = 'auto';
    line.style.width = Math.max(0, x2 - x1) + 'px';
  }
  let ticking=false;
  function render(){
    ticking=false;
    const total = xp.offsetHeight - window.innerHeight;
    if(total<=0) return;
    const p = Math.min(1, Math.max(0, -xp.getBoundingClientRect().top/total));
    const max = Math.max(0, track.scrollWidth - window.innerWidth);
    track.style.transform = 'translate3d(' + (-p*max).toFixed(1) + 'px,0,0)';
    if(bar) bar.style.width = (p*100).toFixed(1) + '%';
  }
  window.addEventListener('scroll', ()=>{ if(!ticking){ requestAnimationFrame(render); ticking=true; } }, {passive:true});
  window.addEventListener('resize', ()=>{ setLine(); render(); });
  window.addEventListener('load', setLine);
  document.fonts && document.fonts.ready && document.fonts.ready.then(setLine);
  setLine(); render();
})();

/* ============ WORK TILES - CMS DRIVEN + LAZY PLAY ============ */
/* Each tile reads content/work.json (edited via /ashrafiko). Empty tiles keep the
   styled placeholder; a Vimeo/YouTube link or uploaded file fills the tile.
   Videos play only while in view (pause off-screen) for performance. */
(function(){
  function vimeoId(v){ const m=String(v).match(/(?:vimeo\.com\/(?:video\/)?)?(\d{6,})/); return m?m[1]:null; }
  function youtubeId(v){ const m=String(v).match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m?m[1]:(/^[\w-]{11}$/.test(v)?v:null); }

  // CMS data is untrusted: only same-origin asset paths or https media from the site itself are allowed.
  function safeMediaUrl(raw){
    const s=String(raw||'').trim();
    if(!s || /[\s<>"'`]/.test(s)) return null;
    if(/^(?!\/\/)(?![a-z][a-z0-9+.-]*:)[\w./-]+$/i.test(s) && !/(^|\/)\.\.(\/|$)/.test(s) && /^assets\//.test(s)) return s;   // relative, inside assets/
    try{ const u=new URL(s); if(u.protocol==='https:' && (u.hostname==='ashrafselo.com' || u.hostname==='www.ashrafselo.com')) return u.href; }catch(e){}
    return null;
  }
  function fillTile(tile, item){
    if(!item) return;
    const tag = tile.querySelector('.wtag');
    if(tag && item.label) tag.textContent = String(item.label).slice(0,80);
    const type = (item.type||'none').toLowerCase();
    const src = (item.src||'').trim();
    if(type==='none' || !src) return;            // keep placeholder

    function mkEmbed(srcUrl, allow){
      const f=document.createElement('iframe');
      f.src=srcUrl; f.allow=allow; f.loading='lazy';
      const w=document.createElement('div'); w.className='embed'; w.appendChild(f); return w;
    }
    let node=null, embed=false;
    const drive = src.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?[^"']*id=)([\w-]{20,})/);

    if(drive){                                   // Google Drive link → Drive player
      node = mkEmbed('https://drive.google.com/file/d/'+drive[1]+'/preview', 'autoplay'); embed=true;
    } else if(type==='vimeo' || /vimeo\.com/.test(src)){
      const id=vimeoId(src); if(!id) return;
      node = mkEmbed('https://player.vimeo.com/video/'+id+'?background=1&autoplay=1&muted=1&loop=1&autopause=0', 'autoplay; fullscreen'); embed=true;
    } else if(type==='youtube' || /youtu\.?be/.test(src)){
      const id=youtubeId(src); if(!id) return;
      node = mkEmbed('https://www.youtube-nocookie.com/embed/'+id+'?autoplay=1&mute=1&loop=1&playlist='+id+'&controls=0&modestbranding=1&playsinline=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0&cc_load_policy=0', 'autoplay; encrypted-media; fullscreen'); embed=true;
    } else if(type==='image' || /\.(jpe?g|png|webp|gif|avif)(\?|#|$)/i.test(src)){
      const safe=safeMediaUrl(src); if(!safe) return;
      const im=document.createElement('img');
      im.src=safe; im.loading='lazy'; im.className='cover'; im.alt=String(item.label||'');
      if(!item.ar) im.addEventListener('load',()=>{ if(im.naturalWidth){ tile.dataset.ar = im.naturalWidth/im.naturalHeight; window.__relayoutTile && window.__relayoutTile(tile); } });
      node=im;
    } else if(type==='file'){
      if(/^https?:\/\//i.test(src) && !/\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(src)) return;  // unknown URL → keep placeholder
      const safe=safeMediaUrl(src); if(!safe) return;
      const v=document.createElement('video');
      v.src=safe; v.muted=true; v.loop=true; v.playsInline=true; v.preload='none';
      v.setAttribute('playsinline','');
      if(!item.ar) v.addEventListener('loadedmetadata',()=>{ if(v.videoWidth){ tile.dataset.ar = v.videoWidth/v.videoHeight; window.__relayoutTile && window.__relayoutTile(tile); } });
      node=v;
    }
    if(!node) return;
    tile.querySelectorAll('.ph-glow,.ph-play').forEach(e=>e.remove());
    tile.classList.remove('ph-tile');
    tile.insertBefore(node, tile.firstChild);
  }

  function lazyPlay(){
    const vids=document.querySelectorAll('.wtile video');
    if(!vids.length) return;
    const io=new IntersectionObserver(es=>es.forEach(e=>{ const v=e.target;
      if(e.isIntersecting){ if(v.preload==='none'){v.preload='auto';v.load();} const p=v.play(); if(p&&p.catch)p.catch(()=>{}); }
      else v.pause(); }), {threshold:0.2});
    vids.forEach(v=>io.observe(v));
  }

  fetch('content/work.json',{cache:'no-store'})
    .then(r=>r.ok?r.json():null)
    .then(data=>{
      if(data){
        const GL=['gl-1','gl-2','gl-3','gl-4'];
        const imgIcon=()=>{ const NS='http://www.w3.org/2000/svg'; const svg=document.createElementNS(NS,'svg');
          [['class','ph-icon'],['viewBox','0 0 24 24'],['fill','none'],['stroke','currentColor'],['stroke-width','1.4'],['stroke-linecap','round'],['stroke-linejoin','round']].forEach(([k,v])=>svg.setAttribute(k,v));
          const r=document.createElementNS(NS,'rect'); [['x','3'],['y','4.5'],['width','18'],['height','15'],['rx','2.5']].forEach(([k,v])=>r.setAttribute(k,v));
          const c=document.createElementNS(NS,'circle'); [['cx','8.5'],['cy','10'],['r','1.7']].forEach(([k,v])=>c.setAttribute(k,v));
          const p=document.createElementNS(NS,'path'); p.setAttribute('d','M4 17l4.5-4.5 3.5 3.5 3-3 5 5');
          svg.append(r,c,p); return svg; };
        document.querySelectorAll('.disc-grid[data-section]').forEach(grid=>{
          const section=grid.getAttribute('data-section');
          const sec=data[section]; if(!sec) return;
          // accept an array of clips, or legacy {t1,t2,...}
          const items = Array.isArray(sec) ? sec : Object.keys(sec).sort().map(k=>sec[k]);
          const isImg = section==='social';
          grid.replaceChildren();
          items.forEach((item,i)=>{
            const tile=document.createElement('div');
            tile.className='wtile ph-tile';
            { const glow=document.createElement('span'); glow.className='ph-glow '+GL[i%4];
              const mid = isImg ? imgIcon() : Object.assign(document.createElement('span'),{className:'ph-play'});
              const tag=document.createElement('span'); tag.className='wtag';
              tile.append(glow, mid, tag); }
            if(item && item.ar){ const ar=arNum(item.ar); if(ar) tile.dataset.ar=ar; }
            grid.appendChild(tile);
            if(item) fillTile(tile, item);
          });
        });
        layoutAll();
        window.__tilesFX && window.__tilesFX();   // bind the pop-in now that tiles exist
        window.ScrollTrigger && ScrollTrigger.refresh();   // tile grids changed the page height → recompute trigger positions
      }
      lazyPlay();
    })
    .catch(lazyPlay);

  // ---- balanced masonry: drop each tile into the shortest column → no gaps, even bottom ----
  const GAP=16;
  function arNum(s){ const m=String(s).split('/'); const a=parseFloat(m[0]), b=parseFloat(m[1]); return (a>0&&b>0)? a/b : 0; }
  function colCount(w){ return w<=620?2 : w<=1000?3 : 4; }   // container width, not window — immune to late innerWidth updates
  function layoutGrid(grid){
    const W=grid.clientWidth; if(!W) return;
    const cols=colCount(W);
    const colW=(W-GAP*(cols-1))/cols;
    const wide=cols>=2;   // landscape tiles get a double slot in every grid — same height as the squares
    const tiles=[...grid.querySelectorAll('.wtile')].map(t=>{
      const ar=parseFloat(t.dataset.ar)||(9/16);
      const span=(wide && ar>1.3) ? 2 : 1;
      const w=span===2 ? colW*2+GAP : colW;
      return { t, w, span, h: w/ar };
    });
    // LPT (tallest first) → shortest column: balances the bottom edge so there are no empty corners
    tiles.sort((a,b)=>b.h-a.h);
    const colH=new Array(cols).fill(0);
    tiles.forEach(({t,w,span,h})=>{
      let c=0;
      if(span===2){
        let best=Infinity;
        for(let i=0;i<=cols-2;i++){ const m=Math.max(colH[i],colH[i+1]); if(m<best-0.5){ best=m; c=i; } }
        const top=Math.max(colH[c],colH[c+1]);
        t.style.width=w+'px'; t.style.height=h+'px';
        t.style.left=(c*(colW+GAP))+'px'; t.style.top=top+'px';
        colH[c]=colH[c+1]=top+h+GAP;
      } else {
        for(let i=1;i<cols;i++){ if(colH[i]<colH[c]-0.5) c=i; }   // shortest column
        t.style.width=w+'px'; t.style.height=h+'px';
        t.style.left=(c*(colW+GAP))+'px'; t.style.top=colH[c]+'px';
        colH[c]+=h+GAP;
      }
    });
    grid.style.height=Math.max(0, Math.max.apply(null,colH)-GAP)+'px';
  }
  function layoutAll(){ document.querySelectorAll('.disc-grid[data-section]').forEach(layoutGrid); }
  let rT; window.addEventListener('resize', ()=>{ clearTimeout(rT); rT=setTimeout(layoutAll, 120); });
  window.addEventListener('load', layoutAll);
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(layoutAll);
  window.__relayoutTile=function(tile){ const g=tile.closest('.disc-grid'); if(g) layoutGrid(g); };   // re-pack when media reveals its true ratio
})();

/* ============ GSAP - SCROLL ANIMATIONS ============ */
(function(){
  if(!(window.gsap && window.ScrollTrigger)) return;   // vanilla fallbacks handle it
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('gsap-on');   // disables CSS .reveal transitions
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Display headlines get a cinematic masked line reveal (SplitText);
  // everything else keeps the block fade-up. If SplitText fails to load,
  // the headlines simply stay in the block-reveal batch.
  const canSplit = !!window.SplitText && !reduce;
  const revealSel = canSplit ? '.reveal:not([data-split])' : '.reveal';
  const reveals = gsap.utils.toArray(revealSel);
  if(reduce){
    gsap.set('.reveal', {opacity:1, y:0});
  } else {
    gsap.set(reveals, {opacity:0, y:40});
    ScrollTrigger.batch(revealSel, {
      start: 'top 88%',
      once: true,
      onEnter: batch => gsap.to(batch, {opacity:1, y:0, duration:1, ease:'power3.out', stagger:0.1, overwrite:true})
    });
  }
  if(canSplit){
    gsap.registerPlugin(SplitText);
    const initSplit = ()=>{
      gsap.utils.toArray('[data-split]').forEach(el=>{
        gsap.set(el, {opacity:1, y:0});
        let split = null;
        try{ split = new SplitText(el, {type:'lines', mask:'lines'}); }catch(e){}
        if(!split || !split.lines || !split.lines.length){
          gsap.from(el, {opacity:0, y:40, duration:1, ease:'power3.out',
            scrollTrigger:{trigger:el, start:'top 88%', once:true}});
          return;
        }
        gsap.from(split.lines, {
          yPercent:115, duration:1.05, ease:'power4.out', stagger:0.085,
          scrollTrigger:{trigger:el, start:'top 86%', once:true},
          onComplete:()=>split.revert()   // restore clean DOM: descenders, gradient spans, resize-safe
        });
      });
      ScrollTrigger.refresh();
    };
    (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(initSplit);
  }

  // Stat numbers count up when the profile section enters
  gsap.utils.toArray('#about .stat .n').forEach(el=>{
    const m = el.textContent.trim().match(/^(\d+)(\D*)$/); if(!m) return;
    const target = +m[1], suf = m[2];
    if(reduce){ el.textContent = target + suf; return; }
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: ()=>{
      const o = {v:0};
      gsap.to(o, {v:target, duration:1.6, ease:'power2.out', onUpdate:()=>{ el.textContent = Math.round(o.v) + suf; }});
    }});
  });

  // Work tiles pop in with a stagger as each grid scrolls in.
  // Tiles are injected async from content/work.json, so the fill code re-calls this once they exist.
  window.__tilesFX = function(){
    if(reduce) return;
    gsap.utils.toArray('.disc-grid').forEach(grid=>{
      const tiles = grid.querySelectorAll('.wtile:not(.fx-bound)');
      if(!tiles.length) return;
      tiles.forEach(t=>t.classList.add('fx-bound'));
      gsap.from(tiles, {
        opacity:0, scale:0.9, y:24, duration:0.7, ease:'power3.out', stagger:0.08,
        scrollTrigger:{ trigger: grid, start: 'top 82%', once:true }
      });
    });
  };
  window.__tilesFX();

  // Profile (01) - layered parallax: headline + kicker drift up, the big numbers float at staggered rates
  const aboutEl = document.getElementById('about');
  if(aboutEl && !(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)){
    const mk = ()=>({ trigger: aboutEl, start:'top bottom', end:'bottom top', scrub:0.7 });
    gsap.to('#about .kicker',       { yPercent:-30, ease:'none', scrollTrigger: mk() });
    gsap.to('#about .lead',         { yPercent:-18, ease:'none', scrollTrigger: mk() });
    gsap.to('#about .about-grid p', { yPercent:9,   ease:'none', scrollTrigger: mk() });
    const offs=[28,-8,20];
    gsap.utils.toArray('#about .stat').forEach((s,i)=> gsap.to(s, { yPercent: offs[i]!=null?offs[i]:12, ease:'none', scrollTrigger: mk() }));
  }

  // recompute trigger positions once images/fonts settle
  window.addEventListener('load', ()=>ScrollTrigger.refresh());
  if(document.fonts && document.fonts.ready) document.fonts.ready.then(()=>ScrollTrigger.refresh());
})();

/* ============ CLIENT JOURNEY - SCROLL-DRAWN PATH + VIGNETTES ============ */
(function(){
  const flow=document.getElementById('jrFlow'); if(!flow) return;
  const svg=document.getElementById('jrSvg');
  const path=document.getElementById('jrPath');
  const ghost=document.getElementById('jrGhost');
  const comet=document.getElementById('jrComet');
  const stages=[...flow.querySelectorAll('.jr-stage')];
  const nodes=stages.map(s=>s.querySelector('.jr-node'));
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGsap=!!(window.gsap&&window.ScrollTrigger);
  let L=0, lastP=0;

  // build a smooth S-curve through the node centers (recomputed on resize)
  function build(){
    const fr=flow.getBoundingClientRect();
    if(!fr.width||!fr.height) return;
    svg.setAttribute('viewBox','0 0 '+fr.width+' '+fr.height);
    const pts=nodes.map(n=>{const r=n.getBoundingClientRect();return{x:r.left+r.width/2-fr.left,y:r.top+r.height/2-fr.top};});
    // keep the curve inside the center corridor plus whatever space the text columns don't use
    const nw=flow.querySelector('.jr-node-wrap');
    const centerW=nw ? nw.getBoundingClientRect().width : 110;
    const room=Math.max(0,(fr.width-centerW)/2 - 480);
    const bulge=window.innerWidth<=860 ? 10 : Math.min(150, centerW*0.5+room);
    let d='M'+pts[0].x+' '+Math.max(0,pts[0].y-46)+' L'+pts[0].x+' '+pts[0].y;
    for(let i=1;i<pts.length;i++){
      const a=pts[i-1], b=pts[i], dir=(i%2? 1:-1), dy=b.y-a.y;
      d+=' C '+(a.x+dir*bulge)+' '+(a.y+dy*0.34)+', '+(b.x+dir*bulge)+' '+(b.y-dy*0.34)+', '+b.x+' '+b.y;
    }
    path.setAttribute('d',d); ghost.setAttribute('d',d);
    L=path.getTotalLength();
    path.style.strokeDasharray=L;
  }
  function draw(p){
    lastP=p;
    if(!L) return;
    path.style.strokeDashoffset=String(L*(1-p));
    const pt=path.getPointAtLength(Math.max(0.01, L*p));
    comet.style.transform='translate('+pt.x+'px,'+pt.y+'px)';
    comet.classList.toggle('on', p>0.004 && p<0.996);
  }

  // active stop highlight: stage lights up while it crosses the middle of the screen
  const io=new IntersectionObserver(es=>es.forEach(e=>e.target.classList.toggle('on', e.isIntersecting)),
    {rootMargin:'-35% 0px -45% 0px', threshold:0});
  stages.forEach(s=>io.observe(s));

  build();
  if(hasGsap && !reduce){
    draw(0);
    ScrollTrigger.create({
      trigger:flow, start:'top 58%', end:'bottom 60%', scrub:0.5,
      onUpdate:s=>draw(s.progress),
      onRefresh:s=>{ build(); draw(s.progress); }
    });
  } else {
    draw(1);                       // no GSAP / reduced motion → path fully drawn
    comet.style.display='none';
  }
  let rT; window.addEventListener('resize',()=>{ clearTimeout(rT); rT=setTimeout(()=>{ build(); draw(lastP); },150); });
  window.addEventListener('load',()=>{ build(); draw(lastP); });
  window.addEventListener('pageshow',e=>{ if(e.persisted){ build(); draw(lastP); } });
  if(document.fonts&&document.fonts.ready) document.fonts.ready.then(()=>{ build(); draw(lastP); });
  // rebuild whenever the container itself changes size (rotation, zoom, late layout shifts)
  if(window.ResizeObserver){
    let roT; new ResizeObserver(()=>{ clearTimeout(roT); roT=setTimeout(()=>{ build(); draw(lastP); },120); }).observe(flow);
  }

  // per-stop vignettes (CSS holds the finished state, so no-GSAP/reduced-motion needs nothing)
  if(hasGsap && !reduce){
    stages.forEach(st=>{
      const kind=st.getAttribute('data-vig');
      const vigEl=st.querySelector('.jr-vig')||st;               // on mobile the vignette sits below the card
      const trg=()=>({trigger:vigEl, start:'top 80%', once:true});
      if(kind==='spark'){
        gsap.from(st.querySelectorAll('.vd-line'),{scaleX:0,transformOrigin:'0 50%',duration:.6,ease:'power3.out',stagger:.13,scrollTrigger:trg()});
        gsap.from(st.querySelector('.vd-spark'),{scale:0,rotation:-140,duration:1.2,ease:'elastic.out(1,.45)',delay:.5,scrollTrigger:trg()});
      } else if(kind==='world'){
        gsap.from(st.querySelectorAll('.vw-fan i'),{x:0,y:0,rotation:0,scale:.55,opacity:0,duration:1.05,ease:'elastic.out(1,.5)',stagger:.07,scrollTrigger:trg()});
      } else if(kind==='board'){
        gsap.fromTo(st.querySelectorAll('.vb-shot svg *'),{strokeDashoffset:1},{strokeDashoffset:0,duration:1.1,ease:'power2.inOut',stagger:.18,scrollTrigger:trg()});
        gsap.from(st.querySelectorAll('.vb-tc'),{opacity:0,y:6,duration:.5,stagger:.18,delay:.5,scrollTrigger:trg()});
      } else if(kind==='film'){
        gsap.from(st.querySelector('.vf-play'),{scale:0,duration:1,ease:'elastic.out(1,.5)',delay:.3,scrollTrigger:trg()});
        gsap.from(st.querySelector('.vf-fill'),{scaleX:0,transformOrigin:'0 50%',duration:1.5,ease:'power2.inOut',scrollTrigger:trg()});
        gsap.from(st.querySelector('.vf-dot'),{opacity:0,scale:0,duration:.5,delay:1.3,scrollTrigger:trg()});
      }
    });
  }
})();

/* ============ CLIENT JOURNEY - INTERACTIONS (tap · drag · play) ============ */
(function(){
  const flow=document.getElementById('jrFlow'); if(!flow) return;
  const reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(!(window.gsap&&window.ScrollTrigger)||reduce) return;   // interactions are pure delight — skip in degraded modes
  if(window.Draggable){ gsap.registerPlugin(Draggable); if(window.InertiaPlugin) gsap.registerPlugin(InertiaPlugin); }
  const PALETTE=['#f4b9c8','#a8c9e8','#c9a87d','#ffffff'];

  // --- stop titles: letters cascade up the first time each stop lights up
  const stages=[...flow.querySelectorAll('.jr-stage')];
  stages.forEach(st=>{
    const h=st.querySelector('.jr-title'); if(!h) return;
    const txt=h.textContent;
    h.setAttribute('aria-label',txt); h.textContent='';
    const chars=[];
    txt.split(' ').forEach((word,wi,arr)=>{
      const w=document.createElement('span'); w.className='chw'; w.setAttribute('aria-hidden','true');
      for(const ch of word){
        const s=document.createElement('span'); s.className='ch'; s.textContent=ch;
        w.appendChild(s); chars.push(s);
      }
      h.appendChild(w);
      if(wi<arr.length-1) h.appendChild(document.createTextNode(' '));   // words wrap only at real spaces
    });
    ScrollTrigger.create({trigger:st, start:'top 62%', once:true,
      onEnter:()=>gsap.from(chars,{y:'0.85em',opacity:0,rotation:5,duration:.55,ease:'power3.out',stagger:.035})});
  });

  // --- the comet sheds a fading sparkle trail while the thread draws
  const comet=document.getElementById('jrComet');
  let lx=0, ly=0, live=0, tick=false;
  function trail(){
    tick=false;
    if(!comet || !comet.classList.contains('on') || live>22) return;
    const m=(getComputedStyle(comet).transform.match(/matrix\(([^)]+)\)/)||[])[1];
    if(!m) return;
    const v=m.split(','), x=parseFloat(v[4]), y=parseFloat(v[5]);
    if(Math.hypot(x-lx,y-ly)<26) return;
    lx=x; ly=y; live++;
    const d=document.createElement('i'); d.className='jr-trail';
    flow.appendChild(d);
    gsap.set(d,{x:x+(Math.random()-.5)*8, y:y+(Math.random()-.5)*8});
    gsap.to(d,{opacity:0, scale:.2, y:'+='+(6+Math.random()*14), duration:.9+Math.random()*.5, ease:'power1.out',
      onComplete:()=>{ d.remove(); live--; }});
  }
  window.addEventListener('scroll',()=>{ if(!tick){ tick=true; requestAnimationFrame(trail); } },{passive:true});

  // small colored burst, used by the brief spark + the premiere stamp
  function burst(host, n, ox, oy, spread){
    for(let i=0;i<n;i++){
      const b=document.createElement('i'); b.className='vf-burst';
      b.style.background=PALETTE[i%4]; b.style.left=ox; b.style.top=oy;
      host.appendChild(b);
      gsap.timeline({onComplete:()=>b.remove()})
        .to(b,{x:(Math.random()-.5)*spread, y:-(20+Math.random()*80), rotation:Math.random()*400, duration:.5, ease:'power2.out'})
        .to(b,{y:'+=140', opacity:0, duration:.7, ease:'power1.in'});
    }
  }

  // --- stop 01: tap the brief → it retypes, the spark celebrates
  (function(){
    const doc=flow.querySelector('.vig-doc'); if(!doc) return;
    const lines=doc.querySelectorAll('.vd-line');
    const spark=doc.querySelector('.vd-spark');
    let busy=false;
    doc.addEventListener('click',()=>{
      if(busy) return; busy=true;
      gsap.timeline({onComplete:()=>{ busy=false; }})
        .fromTo(lines,{scaleX:0},{scaleX:1,transformOrigin:'0 50%',duration:.5,ease:'power3.out',stagger:.11,overwrite:'auto'})
        .fromTo(spark,{scale:.3,rotation:-100},{scale:1,rotation:0,duration:.9,ease:'elastic.out(1,.4)',overwrite:'auto'},'-=.25');
      burst(doc, 10, 'calc(100% - 10px)', '-4px', 130);
    });
  })();

  // --- stop 02: the moodboard is real — drag, toss, double-tap to re-fan
  (function(){
    const cards=[...flow.querySelectorAll('.vw-fan i')];
    if(!cards.length || !window.Draggable) return;
    const home=cards.map(c=>({x:gsap.getProperty(c,'x'), y:gsap.getProperty(c,'y'), r:gsap.getProperty(c,'rotation')}));
    const zone=flow.querySelector('[data-vig="world"] .jr-vig');
    Draggable.create(cards,{
      type:'x,y', bounds:zone, inertia:!!window.InertiaPlugin, edgeResistance:.78,
      onDragStart:function(){
        this.target.classList.add('dragging');
        cards.forEach(c=>c.style.zIndex = c===this.target ? 6 : '');
        gsap.to(this.target,{scale:1.1, boxShadow:'0 26px 50px -18px rgba(0,0,0,.9)', duration:.25, ease:'power2.out'});
      },
      onRelease:function(){
        this.target.classList.remove('dragging');
        gsap.to(this.target,{scale:1, boxShadow:'0 14px 34px -14px rgba(0,0,0,.75)', duration:.5, ease:'power2.out'});
      }
    });
    flow.querySelector('.vw-fan').addEventListener('dblclick',()=>{
      cards.forEach((c,i)=>gsap.to(c,{x:home[i].x, y:home[i].y, rotation:home[i].r, duration:.75, ease:'elastic.out(1,.6)', delay:i*.04, overwrite:'auto'}));
    });
  })();

  // --- stop 03: tap the boards → "action!" — frames redraw, timecodes run
  (function(){
    const board=flow.querySelector('.vig-board'); if(!board) return;
    const frames=[...board.querySelectorAll('.vb-frame')];
    const SECS=[0,4,12];
    let busy=false;
    board.addEventListener('click',()=>{
      if(busy) return; busy=true;
      const tl=gsap.timeline({onComplete:()=>{ busy=false; }});
      frames.forEach((fr,i)=>{
        const t=i*.5;
        tl.fromTo(fr.querySelectorAll('svg *'),{strokeDashoffset:1},{strokeDashoffset:0,duration:.7,ease:'power2.inOut',overwrite:'auto'},t);
        tl.fromTo(fr.querySelector('.vb-shot'),{borderColor:'rgba(244,185,200,.75)'},{borderColor:'rgba(255,255,255,.10)',duration:.7,ease:'power1.out'},t);
        const tc=fr.querySelector('.vb-tc'), o={v:0};
        tl.to(o,{v:SECS[i],duration:.7,ease:'power1.inOut',onUpdate:()=>{ tc.textContent='00:'+String(Math.round(o.v)).padStart(2,'0'); }},t);
      });
    });
  })();

  // --- stop 04: press play → the film premieres scene by scene
  (function(){
    const player=flow.querySelector('.vf-player'); if(!player) return;
    const q=s=>player.querySelector(s);
    const play=q('.vf-play'), badge=q('.vf-badge'), flash=q('.vf-flash'), stamp=q('.vf-stamp'),
          fill=q('.vf-fill'), dot=q('.vf-dot'), bar=q('.vf-bar'), eq=q('.vf-eq'), screen=q('.vf-screen');
    const scenes=[q('.vf-scene.s1'), q('.vf-scene.s2'), q('.vf-scene.s3')];
    if(!(play&&badge&&flash&&stamp&&fill&&dot&&bar&&screen)) return;
    gsap.set(stamp,{xPercent:-50, yPercent:-50, scale:0});
    const BADGE0=badge.textContent;
    const CUTS=[[.25,'SC 01 · The Spark',0],[1.35,'SC 02 · The World',1],[2.45,'SC 03 · The Blueprint',2],[3.55,'SC 04 · The Premiere',-1]];
    const DUR=4.4, END=.25+DUR;
    let busy=false;
    player.addEventListener('click',()=>{
      if(busy) return; busy=true;
      eq.classList.add('hot');
      const barW=Math.max(0, bar.clientWidth-6);
      const tl=gsap.timeline({onComplete:()=>{
        eq.classList.remove('hot'); badge.textContent=BADGE0;
        gsap.set([fill,dot],{clearProps:'all'}); busy=false;
      }});
      tl.to(play,{scale:0,opacity:0,duration:.26,ease:'back.in(2)'},0)
        .set(fill,{width:'100%',scaleX:0,transformOrigin:'0 50%'},0)
        .set(dot,{left:3},0)
        .to(fill,{scaleX:1,duration:DUR,ease:'none',overwrite:'auto'},.25)
        .to(dot,{x:barW,duration:DUR,ease:'none'},.25);
      CUTS.forEach(cut=>{
        const t=cut[0], label=cut[1], idx=cut[2];
        tl.call(()=>{ badge.textContent=label; },null,t)
          .set(scenes,{opacity:0},t);
        if(idx>=0) tl.set(scenes[idx],{opacity:1},t);
        tl.fromTo(flash,{opacity:.75},{opacity:0,duration:.14,ease:'power1.out'},t);
      });
      tl.fromTo(flash,{opacity:1},{opacity:0,duration:.3},END)
        .set(scenes,{opacity:0},END)
        .to(stamp,{scale:1,duration:.8,ease:'elastic.out(1,.5)',autoAlpha:1},END)
        .call(()=>{ burst(screen, 14, '50%', '45%', 220); },null,END+.05)
        .to(stamp,{scale:0,autoAlpha:0,duration:.3,ease:'back.in(1.8)'},END+1.7)
        .to(play,{scale:1,opacity:1,duration:.7,ease:'elastic.out(1,.55)'},END+1.85);
    });
  })();

  // --- the CTA is magnetic (fine pointers only)
  (function(){
    if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
    const cta=document.querySelector('.jr-cta'); if(!cta) return;
    const qx=gsap.quickTo(cta,'x',{duration:.4,ease:'power3.out'});
    const qy=gsap.quickTo(cta,'y',{duration:.4,ease:'power3.out'});
    const zone=cta.closest('.jr-end')||cta;
    zone.addEventListener('mousemove',e=>{
      const r=cta.getBoundingClientRect();
      const dx=e.clientX-(r.left+r.width/2), dy=e.clientY-(r.top+r.height/2);
      if(Math.hypot(dx,dy)<180){ qx(dx*.18); qy(dy*.18); } else { qx(0); qy(0); }
    });
    zone.addEventListener('mouseleave',()=>{ qx(0); qy(0); });
  })();
})();

/* ============ THREE.JS - 3D PARTICLE FIELD (cinematic depth) ============ */
(function(){
  if(!window.THREE) return;
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const host = document.createElement('div'); host.className='three-bg'; host.setAttribute('aria-hidden','true');
  document.body.appendChild(host);

  let W = innerWidth, H = innerHeight;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(62, W/H, 1, 2000);
  camera.position.z = 460;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({alpha:true, antialias:true}); }
  catch(e){ host.remove(); return; }                 // no WebGL → keep CSS aurora only
  renderer.setPixelRatio(Math.min(devicePixelRatio||1, 2));
  renderer.setSize(W, H);
  host.appendChild(renderer.domElement);

  const N = W < 760 ? 700 : 1500;
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(N*3), col = new Float32Array(N*3);
  const palette = [[0.957,0.725,0.784],[0.659,0.788,0.910],[0.788,0.659,0.49]]; // pink, blue, rope
  for(let i=0;i<N;i++){
    pos[i*3]   = (Math.random()-0.5)*1000;
    pos[i*3+1] = (Math.random()-0.5)*680;
    pos[i*3+2] = (Math.random()-0.5)*680;
    const c = palette[i%palette.length];
    col[i*3]=c[0]; col[i*3+1]=c[1]; col[i*3+2]=c[2];
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  geo.setAttribute('color', new THREE.BufferAttribute(col,3));
  const mat = new THREE.PointsMaterial({ size:2.6, vertexColors:true, transparent:true, opacity:0.65,
    depthWrite:false, blending:THREE.AdditiveBlending, sizeAttenuation:true });
  const points = new THREE.Points(geo, mat);
  scene.add(points);

  let tx=0, ty=0, mx=0, my=0;
  window.addEventListener('mousemove', e=>{ tx = e.clientX/W - 0.5; ty = e.clientY/H - 0.5; }, {passive:true});
  function onResize(){ W=innerWidth||document.documentElement.clientWidth; H=innerHeight||document.documentElement.clientHeight; camera.aspect=W/H; camera.updateProjectionMatrix(); renderer.setSize(W,H); }
  window.addEventListener('resize', onResize);
  window.addEventListener('load', onResize);

  let raf=null, running=false;
  function frame(){
    raf = requestAnimationFrame(frame);
    points.rotation.y += 0.0006;
    points.rotation.x += 0.00022;
    points.rotation.z = (window.scrollY||0) * 0.00004;
    mx += (tx-mx)*0.04; my += (ty-my)*0.04;
    camera.position.x = mx*70; camera.position.y = -my*46;
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
  }
  function start(){ if(!running){ running=true; frame(); } }
  function stop(){ running=false; if(raf) cancelAnimationFrame(raf); raf=null; }
  document.addEventListener('visibilitychange', ()=>{ document.hidden ? stop() : (!reduce && start()); });
  if(reduce){ renderer.render(scene, camera); } else { start(); }
})();

/* ============ GSAP - "LET'S TALK" PLAYFUL BOUNCE ============ */
(function(){
  if(!window.gsap) return;
  const link = document.querySelector('.contact-big a'); if(!link) return;
  const txt = link.textContent;
  link.textContent = '';
  const chars = [];
  for(const ch of txt){
    const s = document.createElement('span');
    s.className = 'lt-ch';
    if(ch === ' '){ s.textContent = '\u00A0'; }
    else { s.textContent = ch; chars.push(s); }
    link.appendChild(s);
  }
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce) return;

  // letters spring up when the contact section scrolls into view
  if(window.ScrollTrigger){
    gsap.from(chars, { y:90, opacity:0, duration:1.1, ease:'elastic.out(1,0.55)', stagger:0.05,
      scrollTrigger:{ trigger: link, start:'top 90%', once:true } });
  }

  // bouncy elastic wave on hover
  let busy = false;
  link.addEventListener('mouseenter', ()=>{
    if(busy) return; busy = true;
    gsap.to(chars, {
      keyframes:[
        { y:-34, scaleY:1.22, scaleX:0.82, duration:0.2, ease:'power2.out' },
        { y:0,   scaleY:1,    scaleX:1,    duration:1.0, ease:'elastic.out(1,0.38)' }
      ],
      stagger:0.035, overwrite:'auto',
      onComplete:()=>{ busy = false; }
    });
  });
})();

/* ============ MAGNETIC MICRO-PHYSICS (fine pointers only) ============ */
(function(){
  if(!window.gsap) return;
  if(!window.matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.querySelectorAll('.xp-final-in').forEach(el=>{
    const qx=gsap.quickTo(el,'x',{duration:.45,ease:'power3.out'});
    const qy=gsap.quickTo(el,'y',{duration:.45,ease:'power3.out'});
    el.addEventListener('mousemove',e=>{
      const r=el.getBoundingClientRect();
      qx((e.clientX-(r.left+r.width/2))*.22); qy((e.clientY-(r.top+r.height/2))*.22);
    });
    el.addEventListener('mouseleave',()=>{ qx(0); qy(0); });
  });
})();

/* ============ X-O EASTER EGG — "the best work is still ahead" ============ */
(function(){
  const open=document.getElementById('xoOpen');
  const overlay=document.getElementById('xoModal');
  if(!open||!overlay) return;
  const board=overlay.querySelector('.xo-board');
  const statusEl=overlay.querySelector('.xo-status');
  const again=overlay.querySelector('.xo-again');
  const closeBtn=overlay.querySelector('.xo-close');
  const yEl=document.getElementById('xoY'), dEl=document.getElementById('xoD'), cEl=document.getElementById('xoC');
  const LINES=[[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  let b, over, cells=[];
  const score={you:0,draw:0,cpu:0};
  function loadScore(){ try{ const s=JSON.parse(localStorage.getItem('xo-score')||'null'); if(s){ score.you=s.you|0; score.draw=s.draw|0; score.cpu=s.cpu|0; } }catch(e){} }
  function saveScore(){ try{ localStorage.setItem('xo-score', JSON.stringify(score)); }catch(e){} }
  function renderScore(){ yEl.textContent=score.you; dEl.textContent=score.draw; cEl.textContent=score.cpu; }
  function build(){ board.replaceChildren(); cells=[]; for(let i=0;i<9;i++){ const c=document.createElement('button'); c.type='button'; c.className='xo-cell'; c.setAttribute('aria-label','cell '+(i+1)); c.addEventListener('click',()=>play(i)); board.appendChild(c); cells.push(c); } }
  function reset(){ b=Array(9).fill(''); over=false; cells.forEach(c=>{c.textContent='';c.className='xo-cell';c.disabled=false;}); statusEl.textContent='You are X · your move'; }
  function winner(bd){ for(const L of LINES){ const [a,c,d]=L; if(bd[a]&&bd[a]===bd[c]&&bd[a]===bd[d]) return {p:bd[a],L}; } return null; }
  function paint(i){ cells[i].textContent=b[i]; cells[i].classList.add(b[i].toLowerCase()); }
  function finish(res){ over=true; cells.forEach(c=>c.disabled=true);
    if(res){ res.L.forEach(i=>cells[i].classList.add('win'));
      if(res.p==='X'){ score.you++; statusEl.textContent='You win! ✦'; board.classList.remove('flash'); void board.offsetWidth; board.classList.add('flash'); celebrate(); }
      else { score.cpu++; statusEl.textContent='Good game · rematch? ✦'; }
    } else { score.draw++; statusEl.textContent='Draw · nicely played'; }
    saveScore(); renderScore(); }
  // minimax → plays perfectly, with a rare slip so a win is still within reach
  function minimax(bd, who, depth){
    const w=winner(bd);
    if(w) return {s: w.p==='O' ? 10-depth : depth-10};
    const empty=bd.map((v,i)=>v?-1:i).filter(i=>i>=0);
    if(!empty.length) return {s:0};
    let best = who==='O' ? {s:-Infinity} : {s:Infinity};
    for(const i of empty){ bd[i]=who; const r=minimax(bd, who==='O'?'X':'O', depth+1); bd[i]='';
      if(who==='O'){ if(r.s>best.s) best={s:r.s,m:i}; } else { if(r.s<best.s) best={s:r.s,m:i}; } }
    return best; }
  function ai(bd){ const empty=bd.map((v,i)=>v?-1:i).filter(i=>i>=0); if(!empty.length) return -1;
    if(Math.random()<0.4) return empty[Math.floor(Math.random()*empty.length)];   // friendly: slips often, easy to beat
    const r=minimax(bd.slice(),'O',0); return (r.m!=null)? r.m : empty[0]; }
  function celebrate(){ const host=overlay.querySelector('.xo-modal'); const cols=['#f4b9c8','#8fb8e8','#a9854f','#ffffff'];
    for(let i=0;i<36;i++){ const p=document.createElement('i'); p.className='xo-confetti'; p.style.background=cols[i%cols.length]; host.appendChild(p);
      if(window.gsap){ gsap.set(p,{x:0,y:0,opacity:1});
        gsap.timeline({onComplete:()=>p.remove()})
          .to(p,{x:(Math.random()-0.5)*300, y:-(60+Math.random()*150), rotation:Math.random()*460, duration:0.5+Math.random()*0.2, ease:'power2.out'})
          .to(p,{y:'+=300', opacity:0, duration:0.85+Math.random()*0.4, ease:'power1.in'});
      } else { setTimeout(()=>p.remove(),1300); } } }
  function play(i){ if(over||b[i]) return; b[i]='X'; paint(i);
    let w=winner(b); if(w){finish(w);return;} if(b.every(Boolean)){finish(null);return;}
    statusEl.textContent='Thinking…';
    setTimeout(()=>{ const m=ai(b); if(m>=0){ b[m]='O'; paint(m); } const w2=winner(b); if(w2){finish(w2);return;} if(b.every(Boolean)){finish(null);return;} statusEl.textContent='Your move'; }, 380); }
  function show(){ build(); reset(); renderScore(); overlay.classList.add('on'); }
  function hide(){ overlay.classList.remove('on'); }
  loadScore(); renderScore();
  open.addEventListener('click',show);
  open.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); show(); } });
  again.addEventListener('click',reset);
  closeBtn.addEventListener('click',hide);
  overlay.addEventListener('click',e=>{ if(e.target===overlay) hide(); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&overlay.classList.contains('on')) hide(); });
})();
