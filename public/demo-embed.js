(()=>{
  if(window.__cactusByte60sDemo)return; window.__cactusByte60sDemo=true;
  const script=document.currentScript||document.querySelector('script[data-cactusbyte-demo]');
  const app=(script&&script.dataset.cactusbyteDemo)||document.documentElement.dataset.cactusbyteDemo;
  if(!app)return;
  const base='https://cactusbyte-studios.vercel.app/demos/';
  const src=base+encodeURIComponent(app)+'-60-second-demo.mp4';
  const names={
    'cactusbyte-studios':'Cactus🌵Byte Studios™','no-problem-pressure-washing-matrix':'No Problem Pressure Washing Matrix™','machzero':'MachZero™','rapid-takeoff':'Rapid Takeoff™','acelynn-pro':'Acelynn Pro™','pocketstomp':'PocketStomp™','ghostlane':'GhostLane™','first-bearing':'First Bearing™','fantasy-football-matrix':'Fantasy Football Matrix™','acelynn-scouttrace':'Acelynn’s ScoutTrace™','terraflow-matrix':'TerraFlow Matrix™','orbitgather':'OrbitGather™','shadownex-prime':'ShadowNex Prime™'
  };
  const name=names[app]||app;
  const css=`
  .cb60-btn{position:fixed;right:16px;bottom:76px;z-index:9996;border:1px solid rgba(55,220,235,.5);background:rgba(4,13,20,.95);color:#eaffff;border-radius:14px;padding:11px 14px;font:800 13px system-ui,-apple-system,sans-serif;box-shadow:0 12px 32px rgba(0,0,0,.5);cursor:pointer;min-height:44px}
  .cb60-back{position:fixed;inset:0;z-index:10050;background:rgba(0,0,0,.82);display:none;align-items:center;justify-content:center;padding:14px}.cb60-back.open{display:flex}
  .cb60-panel{width:min(94vw,520px);max-height:94dvh;overflow:auto;background:#071017;border:1px solid rgba(55,220,235,.42);border-radius:22px;padding:14px;color:#eefcff;box-shadow:0 30px 90px rgba(0,0,0,.72)}
  .cb60-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px}.cb60-head b{font:900 16px system-ui,-apple-system,sans-serif}.cb60-close{width:40px;height:40px;border-radius:50%;border:1px solid #28404a;background:#0c1720;color:#fff;font-size:22px;cursor:pointer}
  .cb60-video{display:block;width:100%;max-height:72dvh;background:#000;border-radius:16px;object-fit:contain}.cb60-foot{padding:10px 2px 0;color:#91a9b2;font:600 11px/1.45 system-ui,-apple-system,sans-serif;text-align:center}
  @media(max-width:560px){.cb60-back{align-items:flex-end;padding:0}.cb60-panel{width:100%;max-width:none;border-radius:24px 24px 0 0;padding:14px 12px calc(14px + env(safe-area-inset-bottom))}.cb60-btn{right:12px;bottom:74px}}
  `;
  const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
  const btn=document.createElement('button');btn.type='button';btn.className='cb60-btn';btn.textContent='▶ 60s Demo';btn.setAttribute('aria-label','Play '+name+' 60 second demo');
  const back=document.createElement('div');back.className='cb60-back';back.innerHTML=`<section class="cb60-panel" role="dialog" aria-modal="true" aria-label="${name} demo"><div class="cb60-head"><b>${name} · 60 Second Demo</b><button class="cb60-close" type="button" aria-label="Close">×</button></div><video class="cb60-video" controls playsinline preload="metadata"><source src="${src}" type="video/mp4">Your browser could not play the demo video.</video><div class="cb60-foot">${name} · Cactus🌵Byte Studios™ · All Rights Reserved</div></section>`;
  document.body.append(btn,back);
  const video=back.querySelector('video');
  const close=()=>{back.classList.remove('open');try{video.pause()}catch{}};
  btn.onclick=()=>{back.classList.add('open');};
  back.querySelector('.cb60-close').onclick=close;
  back.addEventListener('click',e=>{if(e.target===back)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&back.classList.contains('open'))close()});
})();
