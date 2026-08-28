(()=>{
  if(window.__cactusByte60sDemo)return;
  window.__cactusByte60sDemo=true;

  const script=document.currentScript||document.querySelector('script[data-cactusbyte-demo]');
  const app=(script&&script.dataset.cactusbyteDemo)||document.documentElement.dataset.cactusbyteDemo;
  if(!app)return;

  const names={
    'cactusbyte-studios':'Cactus🌵Byte Studios™',
    'no-problem-pressure-washing-matrix':'No Problem Pressure Washing Matrix™',
    'machzero':'MachZero™',
    'rapid-takeoff':'Rapid Takeoff™',
    'acelynn-pro':'Acelynn Pro™',
    'pocketstomp':'PocketStomp™',
    'ghostlane':'GhostLane™',
    'first-bearing':'First Bearing™',
    'fantasy-football-matrix':'Fantasy Football Matrix™',
    'acelynn-scouttrace':'Acelynn’s ScoutTrace™',
    'terraflow-matrix':'TerraFlow Matrix™',
    'orbitgather':'OrbitGather™',
    'shadownex-prime':'ShadowNex Prime™'
  };
  const tracks={
    'cactusbyte-studios':[
      {title:'Open the App Matrix',copy:'Apps is the launchpad for the complete CactusByte lineup.',target:'apps',activate:true},
      {title:'Find the right app',copy:'Search and category filters narrow the registry without hiding the important plan and capability details.',target:'Search',activate:false},
      {title:'Build in Idea Forge',copy:'Idea Forge keeps product ideas, research, and support votes connected to the studio.',target:'Idea Forge',activate:true},
      {title:'Send useful feedback',copy:'Feedback keeps app-specific reports tied to your CactusByte identity when you are signed in.',target:'feedback',activate:true},
      {title:'Review releases',copy:'Releases is the quick view of current versions and recent updates across the ecosystem.',target:'releases',activate:true},
      {title:'Personalize the hub',copy:'My CactusByte controls favorites, hidden apps, compact layout, color, and other local preferences.',target:'My CactusByte',activate:true}
    ],
    machzero:[
      {title:'Start with the item',copy:'Tap Snap Item to photograph the item you want priced.',target:'SNAP ITEM'},
      {title:'Add useful angles',copy:'Add Photos lets you include extra views when condition or markings matter.',target:'ADD PHOTOS'},
      {title:'Let MachZero identify it',copy:'MachZero reads the visible item details, condition, and resale signals from the photos.',target:'Snap it. MachZero does the rest.'},
      {title:'Review the price decision',copy:'The result explains a realistic resale range and the factors behind it.',target:'Analysis starts automatically'},
      {title:'Use the selling guidance',copy:'Follow the marketplace and listing guidance to decide where and how to sell.',target:'MachZero settings'},
      {title:'Scan, price, decide',copy:'That is the full loop: capture the item, review the evidence, and make a smarter resale decision.',target:'MachZero™'}
    ],
    'first-bearing':[
      {title:'Choose your Matrix',copy:'Use the Matrix button to switch between Recovery, Sponsor, and Family and Friends support.',target:'Matrix',activate:false},
      {title:'Check in for today',copy:'Daily Bearing is the short private check-in for mood, cravings, stress, sleep, and connection.',target:'Check-In',activate:true},
      {title:'Stay connected',copy:'Connect keeps meetings, your sponsor, support people, and recovery resources close.',target:'Connect',activate:true},
      {title:'Use SOS when it matters',copy:'SOS opens fast actions for calling, texting, grounding, delaying an impulse, or finding a meeting.',target:'SOS',activate:true},
      {title:'See your direction',copy:'Progress reflects your own check-ins and patterns back to you without pretending to diagnose or predict relapse.',target:'Progress',activate:true},
      {title:'Return to today',copy:'The goal is one useful next action, one degree, and one day at a time.',target:'Today',activate:true}
    ],
    ghostlane:[
      {title:'Start Live Radar',copy:'Start Radar uses location only when you choose to look for nearby road intelligence.',target:'START RADAR'},
      {title:'Read the privacy picture',copy:'The live screen keeps speed, heading, privacy score, and cameras in range together.',target:'PRIVACY SCORE'},
      {title:'Focus a nearby node',copy:'The target control centers the nearest available surveillance node for inspection.',target:'Focus nearest surveillance node'},
      {title:'Compare the route',copy:'Shadow Route helps compare a destination with the available camera intelligence.',target:'Shadow Route'},
      {title:'Review the ledger',copy:'Ledger keeps the supporting node information available for verification.',target:'Ledger'},
      {title:'Contribute responsibly',copy:'Log Node is for verified corrections without sensitive personal information.',target:'Log Node'}
    ],
    'no-problem-pressure-washing-matrix':[
      {title:'Build the quote',copy:'Quote Matrix is the estimating workspace for the customer, property, scope, photos, and price.',target:'Quote Matrix',activate:true},
      {title:'Choose the exact service',copy:'Select only the surfaces the customer wants priced, such as the driveway or house wash.',target:'Driveway',activate:false},
      {title:'Capture organized evidence',copy:'Add Photos opens the guided evidence slots for wide views, problem areas, access, and protection.',target:'Add photos',activate:false},
      {title:'Run Matrix Sight',copy:'The scan turns the photos and field note into an evidence-based scope, crew plan, and quote inputs.',target:'Run Matrix Sight',activate:false},
      {title:'Prepare the crew',copy:'Crew Command carries the approved scope, safety boundaries, and proof-photo plan into the field.',target:'Crew command',activate:true},
      {title:'Prepare supplies',copy:'Supply Matrix organizes the chemicals, equipment, and inventory needed for the approved job.',target:'Supply Matrix',activate:true}
    ],
    'rapid-takeoff':[
      {title:'Choose the trade',copy:'Start by choosing the trade so quantities, materials, systems, and labor are scoped correctly.',target:'General Contractor'},
      {title:'Enter known facts',copy:'Add ceiling height, project type, drawing scale, floors, location, and labor rate when they are known.',target:'Ceiling Height'},
      {title:'Capture the plans',copy:'Take Blueprint Pics uses the camera for plan sheets in the field.',target:'Take Blueprint Pics'},
      {title:'Upload plan files',copy:'Upload Files accepts the drawings and PDFs that belong to this takeoff.',target:'Upload Files'},
      {title:'Run the Matrix',copy:'Rapid Matrix Engine analyzes the plan evidence only after the required inputs and sheets are ready.',target:'Run Rapid Matrix Engine'},
      {title:'Review before bidding',copy:'Use confidence, ProofTrace, SheetLink, and Conflict Radar before committing quantities or price.',target:'Rapid Matrix Engine'}
    ],
    'acelynn-pro':[
      {title:'Choose the source',copy:'Use Live Microphone for the room or Audio File for a recorded track.',target:'Live microphone',activate:true},
      {title:'Start listening',copy:'Start Live Analysis begins the real-time mix and room check.',target:'Start live analysis'},
      {title:'Choose a listening profile',copy:'The listening profile changes the target balance for the kind of mix you are checking.',target:'Listening profile'},
      {title:'Read the spectrum',copy:'The live frequency spectrum shows where the energy is reaching the listener.',target:'LIVE FREQUENCY SPECTRUM'},
      {title:'Follow the next move',copy:'Acelynn turns the measurements into a few specific places to listen instead of a wall of numbers.',target:'Your next move'},
      {title:'Keep the result',copy:'Save the current check or export a session report after audio has been analyzed.',target:'Export session report'}
    ],
    pocketstomp:[
      {title:'Calibrate your ride',copy:'The three-step calibration teaches PocketStomp your push, pop, airtime, and landing patterns.',target:'START 3-STEP CALIBRATION'},
      {title:'Choose coaching depth',copy:'Use Tricks or Full Coach to control how much live feedback you hear.',target:'FULL COACH',activate:true},
      {title:'Pick the coach style',copy:'Personality changes the tone while keeping the same session measurements.',target:'PERSONALITY'},
      {title:'Check local conditions',copy:'Local conditions helps you review the session environment before skating.',target:'CHECK LOCAL CONDITIONS'},
      {title:'Start the session',copy:'Start Session begins speed, run time, vertical, and trick tracking.',target:'START SESSION'},
      {title:'Review the trick log',copy:'The trick log keeps height, airtime, confidence, and landing results together.',target:'Trick log'}
    ],
    'fantasy-football-matrix':[
      {title:'Start with Draft',copy:'Draft ranks the best move for the current pick using production, opportunity, floor, upside, and roster context.',target:'Draft',activate:true},
      {title:'Filter the board',copy:'Position, draft round, and player search narrow the live board to the decision in front of you.',target:'Position'},
      {title:'Compare finalists',copy:'Compare puts the strongest candidates side by side before the clock runs out.',target:'Compare',activate:true},
      {title:'Work waivers',copy:'Waivers applies the same decision framework to available-player pickups.',target:'Waivers',activate:true},
      {title:'Evaluate a trade',copy:'Trade helps compare the roster value moving in both directions.',target:'Trade',activate:true},
      {title:'Reset for the next draft',copy:'Reset Drafted Players clears local availability when you start a new board.',target:'Reset drafted players'}
    ],
    'acelynn-scouttrace':[
      {title:'Run a magnetic sweep',copy:'Magnetic Sweep uses the device magnetometer when the hardware exposes it.',target:'Magnetic Sweep'},
      {title:'Inspect with the camera',copy:'Lens Sweep opens a rear-camera visual inspection and cleans up the camera when you leave.',target:'Lens Sweep'},
      {title:'Check a suspicious link',copy:'Digital Sweep performs local link checks and SHA-256 file fingerprinting.',target:'Digital Sweep'},
      {title:'Review a QR destination',copy:'QR Threat Check decodes the destination for review before anything opens.',target:'QR Threat Check'},
      {title:'Review past scans',copy:'Scan History keeps completed checks together on this device.',target:'Scan History'},
      {title:'Share the toolkit',copy:'Share ScoutTrace sends the app without exposing scan information.',target:'Share ScoutTrace'}
    ],
    'terraflow-matrix':[
      {title:'Start a quick quote',copy:'Quick Quote builds a field estimate with live ProfitGuard margin feedback.',target:'Start Quick Quote'},
      {title:'Capture the property',copy:'TerraScan organizes photos, conditions, measurements, and a quote-ready scope.',target:'Run TerraScan'},
      {title:'Diagnose irrigation',copy:'Irrigation Diagnostic Matrix moves from test to diagnosis, parts, labor, and price.',target:'Irrigation Diagnostic Matrix'},
      {title:'Map the system',copy:'HydroTrace creates a persistent zone-by-zone irrigation map.',target:'HydroTrace'},
      {title:'Protect the margin',copy:'ProfitGuard shows cost, gross profit, margin risk, and target selling price before commitment.',target:'ProfitGuard Matrix'},
      {title:'Deliver the proposal',copy:'Customer Proposal System turns the approved quote into a branded, PDF-ready customer handoff.',target:'Customer Proposal System'}
    ],
    orbitgather:[
      {title:'Choose the trade',copy:'Select the construction trade or specialty that matches the work you want.',target:'Trade 107'},
      {title:'Set the service area',copy:'Enter a ZIP, city, or service area and choose the useful search radius.',target:'ZIP / service areas'},
      {title:'Scan opportunities',copy:'Scan Opportunities searches the configured public datasets for matching contractor leads.',target:'Scan opportunities'},
      {title:'Rank the results',copy:'Sort by fit, freshness, distance, value, or contactability for the current sales goal.',target:'Best fit'},
      {title:'Work the pipeline',copy:'Pipeline keeps qualified, contacted, estimate-sent, won, and lost opportunities organized.',target:'Pipeline',activate:true},
      {title:'Verify the source',copy:'Open each promising lead and verify the originating public record before acting.',target:'Ranked opportunities'}
    ],
    'shadownex-prime':[
      {title:'Choose intelligence layers',copy:'NexVision controls which available public-source layers appear on the globe.',target:'NEXVISION'},
      {title:'Change the analysis lens',copy:'ShadowLens switches between Normal, NVG, Thermal, and CRT visualization modes.',target:'THERMAL',activate:true},
      {title:'Mark and measure',copy:'NexDraw can mark points, build routes, define areas, and measure on the globe.',target:'MEASURE',activate:true},
      {title:'Direct the scene',copy:'SceneDirector can orbit a contact, sweep the world, or play a saved route.',target:'WORLD SWEEP'},
      {title:'Use command navigation',copy:'NexCommand accepts fast navigation, layer, lens, and briefing commands.',target:'NEXCOMMAND'},
      {title:'Check feed health',copy:'NexPulse shows when public data sources are healthy, delayed, or unavailable.',target:'NEXPULSE'}
    ]
  };
  const name=names[app]||app;
  const track=tracks[app]||[];
  if(!track.length)return;

  const css=String.raw`
  .cb60-btn{position:fixed;right:14px;bottom:74px;z-index:9996;border:1px solid rgba(93,235,245,.58);background:rgba(4,13,20,.46);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);color:#efffff;border-radius:15px;padding:10px 13px;font:800 13px system-ui,-apple-system,sans-serif;box-shadow:0 10px 30px rgba(0,0,0,.28);cursor:pointer;min-height:44px}
  .cb60-btn:hover,.cb60-btn:focus-visible{background:rgba(7,27,37,.76);outline:2px solid rgba(93,235,245,.45);outline-offset:2px}
  .cb60-cursor{position:fixed;left:50%;top:50%;z-index:10070;width:26px;height:34px;pointer-events:none;filter:drop-shadow(0 3px 5px rgba(0,0,0,.7));transition:left .72s cubic-bezier(.22,.8,.22,1),top .72s cubic-bezier(.22,.8,.22,1);transform:translate(-4px,-3px)}
  .cb60-cursor svg{width:100%;height:100%;display:block}.cb60-cursor.clicking::after{content:'';position:absolute;left:-9px;top:-9px;width:28px;height:28px;border:3px solid #5debf5;border-radius:50%;animation:cb60pulse .62s ease-out}
  @keyframes cb60pulse{from{transform:scale(.25);opacity:1}to{transform:scale(1.8);opacity:0}}
  .cb60-caption{position:fixed;left:50%;bottom:22px;z-index:10065;width:min(92vw,620px);transform:translateX(-50%);background:rgba(4,13,20,.88);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:1px solid rgba(93,235,245,.48);border-radius:18px;padding:13px 46px 13px 15px;color:#efffff;box-shadow:0 18px 54px rgba(0,0,0,.5);font-family:system-ui,-apple-system,sans-serif}
  .cb60-caption small{display:block;color:#5debf5;font-size:10px;font-weight:900;letter-spacing:.13em;text-transform:uppercase;margin-bottom:4px}.cb60-caption strong{display:block;font-size:16px;line-height:1.2}.cb60-caption p{margin:5px 0 0;color:#d8e7eb;font-size:13px;line-height:1.42}
  .cb60-stop{position:absolute;right:8px;top:8px;width:36px;height:36px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(0,0,0,.3);color:#fff;font-size:19px;cursor:pointer}
  .cb60-highlight{outline:3px solid #5debf5!important;outline-offset:5px!important;box-shadow:0 0 0 8px rgba(93,235,245,.15)!important;border-radius:10px!important}
  @media(max-width:560px){.cb60-btn{right:12px;bottom:74px}.cb60-caption{bottom:16px;padding-right:44px}.cb60-caption p{font-size:12px}}
  @media(prefers-reduced-motion:reduce){.cb60-cursor{transition:none}}
  `;
  const style=document.createElement('style');style.textContent=css;document.head.appendChild(style);
  const button=document.createElement('button');button.type='button';button.className='cb60-btn';button.textContent='▶ 60s Demo';button.setAttribute('aria-label','Play '+name+' 60 second demo');
  document.body.appendChild(button);

  let cursor=null,caption=null,timer=null,index=0,running=false,highlight=null;
  const docs=()=>{
    const list=[{doc:document,offsetX:0,offsetY:0}];
    document.querySelectorAll('iframe').forEach(frame=>{
      try{
        const doc=frame.contentDocument;
        if(doc){const r=frame.getBoundingClientRect();list.push({doc,offsetX:r.left,offsetY:r.top});}
      }catch(_){}
    });
    return list;
  };
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim().toLowerCase();
  function resolveTarget(needle){
    const wanted=clean(needle);
    for(const ctx of docs()){
      const candidates=[...ctx.doc.querySelectorAll('button,a,[role="button"],input,select,textarea,[aria-label],h1,h2,h3,strong')];
      const exact=candidates.find(el=>clean(el.getAttribute('aria-label'))===wanted||clean(el.textContent)===wanted);
      const partial=exact||candidates.find(el=>clean(el.getAttribute('aria-label')).includes(wanted)||clean(el.textContent).includes(wanted));
      if(partial&&partial.getBoundingClientRect().width&&partial.getBoundingClientRect().height)return {el:partial,ctx};
    }
    return null;
  }
  function chooseVoice(){
    const voices=speechSynthesis.getVoices();
    const score=v=>{
      const n=(v.name+' '+v.lang).toLowerCase();
      if(n.includes('google us english'))return 100;
      if(n.includes('microsoft')&&(n.includes('natural')||n.includes('aria')||n.includes('guy')))return 90;
      if(n.includes('samsung')&&n.includes('english'))return 80;
      if(n.includes('english')&&n.includes('united states'))return 70;
      if((v.lang||'').toLowerCase().startsWith('en-us'))return 60;
      return 0;
    };
    return voices.sort((a,b)=>score(b)-score(a))[0]||null;
  }
  function speak(text){
    if(!('speechSynthesis'in window))return;
    speechSynthesis.cancel();
    const u=new SpeechSynthesisUtterance(text);u.lang='en-US';u.rate=.94;u.pitch=.98;
    const v=chooseVoice();if(v)u.voice=v;speechSynthesis.speak(u);
  }
  function clearHighlight(){
    if(highlight){highlight.classList.remove('cb60-highlight');highlight=null;}
  }
  function targetPoint(found){
    if(!found)return {x:innerWidth*.5,y:innerHeight*.42};
    const r=found.el.getBoundingClientRect();
    return {x:found.ctx.offsetX+r.left+Math.min(r.width*.7,Math.max(18,r.width-16)),y:found.ctx.offsetY+r.top+r.height*.55};
  }
  function showStep(){
    if(!running)return;
    clearHighlight();
    const step=track[index];
    caption.querySelector('small').textContent=(index+1)+' / '+track.length+' · '+name;
    caption.querySelector('strong').textContent=step.title;
    caption.querySelector('p').textContent=step.copy;
    const found=resolveTarget(step.target);
    if(found){
      try{found.el.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});}catch(_){}
      setTimeout(()=>{
        if(!running)return;
        const fresh=resolveTarget(step.target)||found;
        const point=targetPoint(fresh);
        cursor.style.left=point.x+'px';cursor.style.top=point.y+'px';
        fresh.el.classList.add('cb60-highlight');highlight=fresh.el;
        setTimeout(()=>{
          if(!running)return;
          cursor.classList.add('clicking');
          setTimeout(()=>cursor&&cursor.classList.remove('clicking'),650);
          if(step.activate){try{fresh.el.click();}catch(_){}}
        },760);
      },420);
    }
    speak(step.copy);
    timer=setTimeout(()=>{index++;if(index>=track.length)stop();else showStep();},10000);
  }
  function start(){
    if(running)return;
    running=true;index=0;button.style.display='none';
    cursor=document.createElement('div');cursor.className='cb60-cursor';cursor.setAttribute('aria-hidden','true');cursor.innerHTML='<svg viewBox="0 0 28 36"><path d="M3 2l20 20-10 1 5 10-5 2-5-10-7 7z" fill="#fff" stroke="#061219" stroke-width="2"/></svg>';
    caption=document.createElement('section');caption.className='cb60-caption';caption.setAttribute('role','status');caption.innerHTML='<small></small><strong></strong><p></p><button class="cb60-stop" type="button" aria-label="Stop demo">×</button>';
    document.body.append(cursor,caption);caption.querySelector('.cb60-stop').onclick=stop;showStep();
  }
  function stop(){
    running=false;clearTimeout(timer);clearHighlight();
    try{speechSynthesis.cancel()}catch(_){}
    cursor&&cursor.remove();caption&&caption.remove();cursor=caption=null;button.style.display='';
  }
  button.onclick=start;
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&running)stop()});
})();
