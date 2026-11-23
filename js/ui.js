'use strict';
// ---------------- menu ----------------
let menuOpen=false,focus=1;
const ROWS=[
  {h:'PLAY'},
  {a:'resume',l:'▶ Resume'},
  {a:'pad',l:'📍 Start at'},{a:'garage',l:'🔧 Garage'},{a:'career',l:'🏆 Career & stats'},
  {k:'map',l:'Map',o:[['city','Rotor City'],['canyons','Neon Canyons'],['port','Port Yard'],['factory','Abandoned Factory'],['valley','Canyon Valley'],['ski','Ski Resort'],['mall','Mall & Airport']]},
  {k:'activity',l:'Activity',o:[['race','Race'],['courier','Courier jobs'],['free','Free flight, tricks & landings'],['war','Kamikaze war'],['film','Film gigs'],['build','Track builder']]},
  {k:'ai',l:'AI racers',o:[['off','Off'],['easy','Easy'],['medium','Medium'],['hard','Hard']]},
  {k:'track',l:'Track',o:TRACK_IDS.map(id=>[id,TRACKS[id].name])},
  {info:'board'},
  {k:'ghost',l:'Ghost of best lap',b:1},
  {k:'racingLine',l:'Racing line (from best lap)',b:1},
  {k:'weather',l:'Weather',o:[['auto','Map default'],['clear','Clear'],['fog','Fog'],['rain','Rain & storms'],['snow','Snow']]},
  {k:'tod',l:'Time of day',o:[['day','Day'],['sunset','Sunset'],['night','Night'],['cycle','Day/night cycle']]},
  {k:'wind',l:'Wind (courier & free)',o:[[0,'Off'],[1,'Light'],[2,'Strong']]},
  {k:'traffic',l:'Traffic',b:1},
  {k:'shadows',l:'Sun shadows (all maps except Rotor City)',b:1},
  {k:'respawn',l:'After a crash',o:[['safe','Respawn at last safe spot / gate'],['start','Restart from the start'],['section','Retry the section (practice, no lap time)']]},
  {k:'light',l:'Drone headlight',o:[['auto','Auto (dark)'],['on','On'],['off','Off']]},
  {a:'replay',l:'⏪ Replay last 30 seconds',game:1},{a:'photo',l:'📷 Photo mode',game:1},
  {h:'FLYING'},
  {k:'mode',l:'Flight mode',o:[['angle','Angle (self-level)'],['horizon','Horizon (level + flips)'],['acro','Acro (flips & rolls)']]},
  {k:'altHold',l:'Altitude hold (Angle/Horizon)',b:1},
  {k:'layout',l:'Throttle style',o:[['trigger','Trigger (RT)'],['hover','Stick · center = hover'],['stick','Stick / RC radio · full range']]},
  {k:'thrMid',l:'Throttle mid',min:0.2,max:0.8,st:0.05,f:v=>v.toFixed(2)},
  {k:'thrExpo',l:'Throttle expo',min:0,max:1,st:0.05,f:v=>v.toFixed(2)},
  {h:'RATES'},{info:'rates'},{k:'rollRc',l:'Roll RC rate',min:0.2,max:2.55,st:0.05,f:v=>v.toFixed(2)},{k:'rollSr',l:'Roll super rate',min:0,max:0.95,st:0.05,f:v=>v.toFixed(2)},{k:'rollEx',l:'Roll expo',min:0,max:1,st:0.05,f:v=>v.toFixed(2)},{k:'pitchRc',l:'Pitch RC rate',min:0.2,max:2.55,st:0.05,f:v=>v.toFixed(2)},{k:'pitchSr',l:'Pitch super rate',min:0,max:0.95,st:0.05,f:v=>v.toFixed(2)},{k:'pitchEx',l:'Pitch expo',min:0,max:1,st:0.05,f:v=>v.toFixed(2)},{k:'yawRc',l:'Yaw RC rate',min:0.2,max:2.55,st:0.05,f:v=>v.toFixed(2)},{k:'yawSr',l:'Yaw super rate',min:0,max:0.95,st:0.05,f:v=>v.toFixed(2)},{k:'yawEx',l:'Yaw expo',min:0,max:1,st:0.05,f:v=>v.toFixed(2)},
  {k:'angleMax',l:'Angle mode max tilt',min:20,max:80,st:5,f:v=>v+'°'},
  {k:'battery',l:'Realistic battery (sag, flight time)',b:1},
  {k:'signal',l:'Video signal range & failsafe',b:1},
  {k:'thrustRatio',l:'Power (thrust : weight)',min:2,max:8,st:0.5,f:v=>v.toFixed(1)+':1'},
  {a:'ctrl',l:'🎮 Controller setup, remap & calibrate'},
  {k:'propWash',l:'Prop wash wobble',b:1},
  {k:'invertPitch',l:'Invert pitch',b:1},
  {h:'CAMERA & SOUND'},
  {k:'view',l:'Camera',o:[['fpv','FPV'],['chase','Chase']]},
  {k:'tilt',l:'Camera uptilt',min:0,max:50,st:1,f:v=>v+'°'},
  {k:'fov',l:'Field of view',min:60,max:130,st:1,f:v=>v+'°'},
  {k:'fx',l:'Video feed effects',b:1},
  {k:'speedFx',l:'Speed lines, FOV stretch & slow-mo',b:1},
  {k:'rumble',l:'Controller rumble',b:1},
  {k:'trigRumble',l:'Trigger rumble (Xbox)',b:1},
  {k:'sound',l:'Sound',b:1},
  {k:'volume',l:'Volume',min:0,max:1,st:0.05,f:v=>Math.round(v*100)+'%'},
  {h:'SYSTEM'},
  {k:'dynRes',l:'Auto resolution (keeps the frame rate up)',b:1},
  {k:'quality',l:'Graphics quality (reloads)',o:[['low','Low · fastest'],['medium','Medium'],['high','High']]},
  {a:'shareTrack',l:'📋 Copy track share code'},{a:'importTrack',l:'📥 Import a track code'},
  {a:'help',l:'🎮 Controls & keys'},{a:'title',l:'⌂ Main menu',game:1},{a:'reset',l:'↺ Reset drone',game:1},{a:'clearGhost',l:'Clear best lap, ghost & leaderboard for this track'},{a:'defaults',l:'Restore default settings'},{a:'update',l:'⟳ Check for updates'},
  {a:'sponsor',l:'❤ Support Rotorbound on GitHub Sponsors'}
];
const skip=r=>('h' in r)||('info' in r)||(r.game&&!started)||(r.a==='pad'&&S.activity==='race');
const TABS=ROWS.filter(r=>'h' in r).map(r=>r.h),TABOF=[];{let t=-1;ROWS.forEach((r,i)=>{if('h' in r)t++;TABOF[i]=t;});}
let mTab=0;
function tabRows(){return ROWS.map((r,i)=>i).filter(i=>TABOF[i]===mTab&&!skip(ROWS[i]));}
function setTab(t){mTab=(t+TABS.length)%TABS.length;focus=tabRows()[0];renderMenu();}
function valText(r){const v=S[r.k];if(r.o){const o=r.o.find(x=>x[0]===v);return o?o[1]:String(v);}if(r.b)return v?'ON':'OFF';return r.f(v);}
function boardText(){const b=store.get('board.'+S.track,[]);if(!b.length)return '🏁 '+TRACKS[S.track].name+' leaderboard: no laps yet';return '🏁 '+TRACKS[S.track].name+' · top laps on this PC\n'+b.slice(0,5).map((e,i)=>`  ${i+1}. ${fmtT(e.t)}   ${e.d}`).join('\n');}
function renderMenu(){
  $('menuTabs').innerHTML='<span class="lbrb">LB</span>'+TABS.map((t,k)=>`<div class="tab${k===mTab?' on':''}" data-t="${k}">${t}</div>`).join('')+'<span class="lbrb">RB</span>';
  $('rows').innerHTML=ROWS.map((r,i)=>(TABOF[i]!==mTab||('h' in r)||(r.game&&!started)||(r.a==='pad'&&S.activity==='race'))?'':('info' in r)?(r.info==='rates'?`<div class="row info"><canvas id="rateCv" width="460" height="130" style="width:100%;max-width:460px"></canvas></div>`:`<div class="row info">${boardText()}</div>`):r.a?`<div class="row act${i===focus?' f':''}" data-i="${i}">${r.a==='pad'?'📍 Start at: '+(PADS||buildPads()||PADS)[padIdx()].n+' <span style="color:#8fa6c0;font-weight:normal">(A / ◀ ▶ to change)</span>':r.a==='resume'&&!started?'◀ Back to main menu':r.a==='sponsor'?`<a href="https://github.com/sponsors/kefirman9000" target="_blank" rel="noopener">${r.l}</a>`:r.l}</div>`:`<div class="row${i===focus?' f':''}" data-i="${i}"><span>${r.l}</span><span class="v"><span data-d="-1">◀</span>${valText(r)}<span data-d="1">▶</span></span></div>`).join('')+
    `<div class="sub" style="text-align:center;margin:8px 0 0;font-size:12px">${MAPDEF.name} · ${MAPDEF.vaults.length?(MAPDEF.vaults[0].open?'🔓 vault open':'🔒 find every ◆ to open the vault')+' · ':''}Rotorbound v${VERSION} · earnings ${fmtCash(cash)} · tokens ${gotTokens.size}/${tokens.length} · trick score ${T.total.toLocaleString()}</div>`;
  const el=$('rows').querySelector('.row.f');if(el)el.scrollIntoView({block:'nearest'});
  drawRates();
}
function drawRates(){const cv=$('rateCv');if(!cv)return;const g=cv.getContext('2d'),W=cv.width,H=cv.height;g.clearRect(0,0,W,H);
  const axes=[['roll','#ff2d95'],['pitch','#39ff88'],['yaw','#3fc8ff']],mx=Math.max(...axes.map(([a])=>rateOf(a,1)/DEG),200);
  g.strokeStyle='#2c3e55';g.lineWidth=1;for(let k=0;k<=4;k++){const y=H-12-(H-24)*k/4;g.beginPath();g.moveTo(30,y);g.lineTo(W-4,y);g.stroke();}
  g.fillStyle='#8fa6c0';g.font='10px Consolas,monospace';g.fillText(Math.round(mx)+'°/s',2,12);g.fillText('0',18,H-10);g.fillText('stick →',W-48,H-2);
  axes.forEach(([a,c],k)=>{g.strokeStyle=c;g.lineWidth=2;g.beginPath();for(let i=0;i<=60;i++){const x=i/60,y=rateOf(a,x)/DEG;const px=30+(W-34)*x,py=H-12-(H-24)*y/mx;i?g.lineTo(px,py):g.moveTo(px,py);}g.stroke();g.fillStyle=c;g.fillText(a.toUpperCase()+' '+Math.round(rateOf(a,1)/DEG)+'°/s',40+k*130,24);});}
$('rows').addEventListener('click',e=>{const row=e.target.closest('.row');if(!row||row.dataset.i==null)return;focus=+row.dataset.i;const d=e.target.dataset.d;if(d)change(ROWS[focus],+d);else if(ROWS[focus].a!=='sponsor')menuActivate();renderMenu();});
function change(r,d){
  if(r.a==='pad'){cyclePad(d);resetDrone();renderMenu();return;}
  if(r.a||skip(r))return;
  if(r.o){const i=r.o.findIndex(x=>x[0]===S[r.k]);S[r.k]=r.o[((i<0?0:i)+d+r.o.length)%r.o.length][0];}
  else if(r.b)S[r.k]=!S[r.k];
  else S[r.k]=Math.round(Math.max(r.min,Math.min(r.max,S[r.k]+d*r.st))*1000)/1000;
  if(r.k==='mode'&&S.mode==='angle')syncHeading();
  if(r.k==='layout'){if(S.layout==='trigger'&&S.bind.thr.t!=='b')S.bind.thr={t:'b',i:7,inv:false};if(S.layout!=='trigger'&&S.bind.thr.t==='b')S.bind.thr={t:'a',i:1,inv:true};}
  if(r.k==='racingLine')buildRacingLine();
  if(r.k==='ai')setupActivity();
  if(r.k==='quality'){save();showLoading(MAP);return;}
  if(r.k==='dynRes'&&!S.dynRes){DR.scale=1;renderer.setPixelRatio(DR.base);renderer.setSize(innerWidth,innerHeight);}
  if(r.k==='map'||r.k==='shadows'){if(r.k==='map'&&S.map==='canyons'&&S.tod==='day')S.tod='sunset';save();showLoading(S.map);return;}
  if(r.k==='activity'||r.k==='track'){if(r.k==='track'&&S.activity!=='race')S.activity='race';setupActivity();}
  save();renderMenu();
}
function menuNav(dir,side){if(dir){const tr=tabRows();if(!tr.length)return;const k=tr.indexOf(focus);focus=tr[k<0?0:(k+dir+tr.length)%tr.length];renderMenu();}else if(side)change(ROWS[focus],side);}
$('menuTabs').addEventListener('click',e=>{const t=e.target.closest('.tab');if(t)setTab(+t.dataset.t);});
function menuActivate(){
  const r=ROWS[focus];if(skip(r))return;
  if(!r.a){change(r,1);return;}
  if(r.a==='resume')closeMenu();
  else if(r.a==='reset'){resetDrone();closeMenu();}
  else if(r.a==='replay'){closeMenu();enterReplay();}
  else if(r.a==='ctrl'){closeMenu();openCtrl();}
  else if(r.a==='photo'){closeMenu();enterPhoto();}
  else if(r.a==='clearGhost'){store.set('best.'+S.track,null);store.set('ghost.'+S.track,null);store.set('board.'+S.track,[]);loadTrackRecords();renderMenu();toast('Cleared records for '+TRACKS[S.track].name);}
  else if(r.a==='defaults'){S=Object.assign({},DEFAULTS);save();setupActivity();renderMenu();toast('Defaults restored');}
  else if(r.a==='update')checkUpdate(true);
  else if(r.a==='help'){closeMenu();openHelp();}
  else if(r.a==='garage'){closeMenu();openGarage();}
  else if(r.a==='career'){closeMenu();openCareer();}
  else if(r.a==='shareTrack')shareTrack();
  else if(r.a==='importTrack')importTrack();
  else if(r.a==='pad'){cyclePad(1);resetDrone();renderMenu();}
  else if(r.a==='title')toTitle();
  else if(r.a==='sponsor'){const a=$('rows').querySelector('a');if(a)a.click();}
}
function openMenu(){if(RB.on)exitReplay();if(PH.on)exitPhoto();menuOpen=true;if(started)mTab=0;if(TABOF[focus]!==mTab||skip(ROWS[focus]))focus=tabRows()[0];$('menu').style.display='flex';renderMenu();}
function closeMenu(){menuOpen=false;$('menu').style.display='none';if(!started){tMap=MAP;renderTitle();}}

// ---------------- garage ----------------
const GA={open:false,focus:0,sel:null,msg:''};
function openGarage(){GA.open=true;GA.focus=0;GA.sel=Object.assign({},garage.eq);GA.msg='';$('garage').style.display='flex';renderGarage();}
function closeGarage(){GA.open=false;applyLook();$('garage').style.display='none';store.set('garage',garage);if(!started)renderTitle();}
function statRows(st){return[['Thrust : weight',S.thrustRatio*st.thr,10,v=>v.toFixed(1)+':1'],['Agility',st.resp,1.6,v=>Math.round(v*100)+'%'],['Top speed',(()=>{const T=S.thrustRatio*st.thr*G,F=Math.sqrt(Math.max(0,T*T-G*G))/st.drag,a=0.013,b=0.06;return(-b+Math.sqrt(b*b+4*a*F))/(2*a)*3.6;})(),260,v=>Math.round(v)+' km/h'],['Toughness',st.tough,2,v=>Math.round(v*100)+'%'],['Carry',1/st.cargo,2.6,v=>Math.round(v*100)+'%'],['Endurance',st.cap/st.drain,1.6,v=>Math.round(v*100)+'%']];}
function renderGarage(){
  $('gCash').textContent=fmtCash(cash);
  $('gRows').innerHTML=PART_CATS.map((c,i)=>{const p=partOf(c,GA.sel[c]),own=garage.own.includes(p.id)||!p.cost,eq=partOf(c,garage.eq[c]).id===p.id,k=PARTS[c].p.indexOf(p)+1;
    const tag=eq?'<span class="gtag eq">EQUIPPED</span>':own?'<span class="gtag own">OWNED · A to equip</span>':cash>=p.cost?`<span class="gtag buy">${fmtCash(p.cost)} · A to buy</span>`:`<span class="gtag no">${fmtCash(p.cost)}</span>`;
    return `<div class="row${i===GA.focus?' f':''}" data-i="${i}" style="display:block"><div style="display:flex;justify-content:space-between;gap:10px"><span>${PARTS[c].l} <span style="color:#55677d;font-size:11px">${k}/${PARTS[c].p.length}</span></span><span class="v"><span data-d="-1">◀</span>${p.n}<span data-d="1">▶</span></span></div><span class="gdesc">${p.d} ${tag}</span></div>`;}).join('')+
    `<div class="row act${GA.focus===PART_CATS.length?' f':''}" data-i="${PART_CATS.length}">✔ Done</div>`;
  const a=statRows(GAR),b=statRows(buildStats(GA.sel));
  $('gStats').innerHTML='<div class="gst">'+b.map((r,k)=>{const cur=a[k][1],nv=r[1],w=Math.min(100,nv/r[2]*100),wc=Math.min(100,cur/r[2]*100),dl=nv-cur,col=Math.abs(dl)<1e-6?'#cfe3f7':dl>0?'#39ff88':'#ff6b8a';
    return `<span>${r[0]}</span><span class="bar"><i style="width:${w}%;background:${col==='#cfe3f7'?'#3fc8ff':col}"></i><b style="left:${wc}%"></b></span><span class="n" style="color:${col}">${r[3](nv)}</span>`;}).join('')+'</div>';
  $('gMsg').textContent=GA.msg;
  const el=$('gRows').querySelector('.row.f');if(el)el.scrollIntoView({block:'nearest'});}
function garageNav(dir,side){setTimeout(()=>{const c=PART_CATS[GA.focus];if(c&&(PARTS[c].p[0].col!=null||c==='osd')){const sv=garage.eq[c];garage.eq[c]=GA.sel[c];applyLook();garage.eq[c]=sv;}},0);const n=PART_CATS.length+1;if(dir){GA.focus=(GA.focus+dir+n)%n;GA.msg='';}else if(side&&GA.focus<PART_CATS.length){const c=PART_CATS[GA.focus],L=PARTS[c].p,k=L.indexOf(partOf(c,GA.sel[c]));GA.sel[c]=L[(k+side+L.length)%L.length].id;GA.msg='';}renderGarage();}
function garageActivate(){if(GA.focus>=PART_CATS.length){closeGarage();return;}const c=PART_CATS[GA.focus],p=partOf(c,GA.sel[c]);
  if(partOf(c,garage.eq[c]).id===p.id){GA.msg=p.n+' is already fitted.';}
  else if(garage.own.includes(p.id)||!p.cost){garage.eq[c]=p.id;GA.msg='Fitted '+p.n+'.';}
  else if(cash>=p.cost){cash-=p.cost;store.set('cash',cash);garage.own.push(p.id);garage.eq[c]=p.id;GA.msg='Bought and fitted '+p.n+'.';sfxDing();}
  else GA.msg='Need '+fmtCash(p.cost-cash)+' more. Earn it with races, courier jobs, tricks and tokens.';
  GAR=buildStats(garage.eq);drone.scale.setScalar(GAR.scale);applyLook();store.set('garage',garage);renderGarage();}
$('gRows').addEventListener('click',e=>{const row=e.target.closest('.row');if(!row)return;GA.focus=+row.dataset.i;const d=e.target.dataset.d;if(d)garageNav(0,+d);else garageActivate();});
function garageKey(k){if(k==='arrowup'||k==='w')garageNav(-1,0);else if(k==='arrowdown'||k==='s')garageNav(1,0);else if(k==='arrowleft'||k==='a')garageNav(0,-1);else if(k==='arrowright'||k==='d')garageNav(0,1);else if(k==='enter'||k===' ')garageActivate();else if(k==='escape')closeGarage();}

// ---------------- main menu (title screen) ----------------
const MAP_INFO={city:{n:'Rotor City',d:'A big sprawling city with a stunt park, a stadium, the Skyfair theme park, a river and an elevated train.',tk:30,tr:6},
  canyons:{n:'Neon Canyons',d:'A compact, vertical neon city: street canyons, skybridges, rooftops, a subway, a spinner tower and a canal.',tk:30,tr:3},
  port:{n:'Port Yard',d:'Container canyons, moving gantry cranes and two cargo ships you can fly straight through.',tk:25,tr:2},
  factory:{n:'Abandoned Factory',d:'A dark hall of catwalks and conveyors, smokestacks, silos and a pitch-black tunnel.',tk:25,tr:2},
  valley:{n:'Canyon Valley',d:'Real terrain: a river, a waterfall with a cave behind it, a dam spillway, bridges and a rock arch.',tk:28,tr:2},
  ski:{n:'Ski Resort',d:'A snowy mountain with a chairlift, a gondola, a ski jump, slalom flags and a lodge.',tk:30,tr:2},
  mall:{n:'Mall & Airport',d:'A three-floor atrium, a food court, an airport terminal, jet bridges and taxiing planes.',tk:26,tr:2}};
let tMap=MAP,tFocus=0,helpOpen=false;
const TROWS=[{a:'fly'},{k:'map',l:'Map'},{k:'activity',l:'Mode'},{k:'track',l:'Track'},{k:'pad',l:'Start at'},{k:'weather',l:'Weather'},{k:'tod',l:'Time of day'},{a:'garage',l:'🔧 Garage'},{a:'career',l:'🏆 Career & stats'},{a:'settings',l:'⚙ Settings'},{a:'help',l:'🎮 Controls & keys'}];
const rowDef=k=>ROWS.find(r=>r.k===k);
const tHidden=r=>(r.k==='track'&&(S.activity!=='race'||tMap!==MAP))||(r.k==='pad'&&(S.activity==='race'||S.activity==='film'||tMap!==MAP));
function tVal(r){if(r.k==='map')return MAP_INFO[tMap].n;if(r.k==='pad'){if(!PADS)buildPads();return PADS[padIdx()].n;}const d=rowDef(r.k),o=d.o.find(x=>x[0]===S[r.k]);return o?o[1]:String(S[r.k]);}
function showLoading(m){$('menu').style.display='flex';$('menu').innerHTML='<div class="panel" style="font-size:20px;padding:30px 40px">Loading '+MAP_INFO[m].n+'…</div>';setTimeout(()=>location.reload(),50);}
function renderTitle(){
  const tk=id=>store.get(id==='city'?'tokens':'tokens.'+id,[]).length;
  $('tMenu').innerHTML=TROWS.map((r,i)=>tHidden(r)?'':r.a==='fly'?`<div class="row fly${i===tFocus?' f':''}" data-i="${i}">▶ ${tMap===MAP?'FLY':'LOAD &amp; FLY'}</div>`:r.a?`<div class="row act${i===tFocus?' f':''}" data-i="${i}">${r.l}</div>`:
    `<div class="row${i===tFocus?' f':''}" data-i="${i}"><span>${r.l}</span><span class="v"><span data-d="-1">◀</span>${tVal(r)}<span data-d="1">▶</span></span></div>`).join('');
  const I=MAP_INFO[tMap];$('tImg').src='img/maps/'+tMap+'.jpg';$('tName').textContent=I.n;$('tDesc').textContent=I.d;
  const got=tk(tMap),tot=tMap===MAP?tokens.length:I.tk,st=[`◆ ${got}/${tot} tokens`,store.get('vault.'+tMap,false)?'🏆 vault found':got>=tot?'🔓 vault open':'🔒 vault locked',`🏁 ${I.tr} tracks`];
  if(tMap===MAP&&S.activity==='race'&&TRACKS[S.track]){const b=store.get('best.'+S.track,null);st.push('⏱ best '+(b?fmtT(b.t!=null?b.t:b):'—'));}
  if(tMap!==MAP)st.push('loads when you fly');
  $('tStats').innerHTML=st.map(x=>`<span>${x}</span>`).join('');
  $('tStrip').innerHTML=MAP_IDS.map(id=>`<div class="${id===tMap?'sel':''}${id===MAP?' cur':''}" data-m="${id}" title="${MAP_INFO[id].n}"><img src="img/maps/${id}.jpg" alt="${MAP_INFO[id].n}"></div>`).join('');
  $('tCash').textContent='earnings '+fmtCash(cash);
}
function tNav(dir,side){const vis=TROWS.map((r,i)=>i).filter(i=>!tHidden(TROWS[i]));if(dir){const k=vis.indexOf(tFocus);tFocus=vis[k<0?0:(k+dir+vis.length)%vis.length];renderTitle();}else if(side)tChange(TROWS[tFocus],side);}
function tChange(r,d){if(r.a)return;if(r.k==='pad'){cyclePad(d);resetDrone();}else if(r.k==='map'){const k=MAP_IDS.indexOf(tMap);tMap=MAP_IDS[(k+d+MAP_IDS.length)%MAP_IDS.length];}else change(rowDef(r.k),d);renderTitle();}
function tActivate(){const r=TROWS[tFocus];if(!r.a){tChange(r,1);return;}
  if(r.a==='fly'){if(tMap!==MAP){S.map=tMap;save();try{sessionStorage.setItem('rb.fly','1');}catch(e){}showLoading(tMap);}else startGame();}
  else if(r.a==='settings')openMenu();else if(r.a==='help')openHelp();else if(r.a==='garage')openGarage();else if(r.a==='career')openCareer();}
$('tMenu').addEventListener('click',e=>{const row=e.target.closest('.row');if(!row)return;tFocus=+row.dataset.i;const d=e.target.dataset.d;if(d)tChange(TROWS[tFocus],+d);else tActivate();renderTitle();});
$('tStrip').addEventListener('click',e=>{const c=e.target.closest('[data-m]');if(!c)return;if(tMap===c.dataset.m){tFocus=0;tActivate();return;}tMap=c.dataset.m;tFocus=1;renderTitle();});
function openHelp(){helpOpen=true;$('help').style.display='flex';}
function closeHelp(){helpOpen=false;$('help').style.display='none';}
$('helpClose').onclick=closeHelp;$('help').addEventListener('click',e=>{if(e.target===$('help'))closeHelp();});
function toTitle(){closeMenu();if(RB.on)exitReplay();if(PH.on)exitPhoto();started=false;tMap=MAP;tFocus=0;document.body.classList.add('clean');$('start').style.display='flex';renderTitle();}

// ---------------- controller setup / remap / calibration ----------------
const CT={open:false,focus:0,cap:null,calStep:0,cal:null,nav:{dir:0,t:0}};
const AX_ACTS=[['thr','Throttle','push the throttle stick UP (or press the trigger)'],['yaw','Yaw','push yaw RIGHT'],['pitch','Pitch','push pitch FORWARD / UP'],['roll','Roll','push roll RIGHT']];
const BTN_ACTS=[['respawn','Respawn after crash'],['view','Camera (tap) / Rewind (hold)'],['mode','Flight mode'],['lap','Restart lap / new job'],['tiltDn','Camera tilt −'],['tiltUp','Camera tilt +'],['turtle','Turtle mode (hold)'],['reset','Reset to start'],['menu','Settings'],['replay','Replay'],['photo','Photo mode']];
const BTN_NAMES=['A','B','X','Y','LB','RB','LT','RT','View','Menu','L3','R3','D↑','D↓','D←','D→','Guide'];
function ctrlRowsDef(){return [...AX_ACTS.map(([k,l])=>({type:'axis',k,l})),{type:'dz',k:'dzL',l:'Left stick deadzone'},{type:'dz',k:'dzR',l:'Right stick deadzone'},{type:'act',k:'cal',l:'⊕ Calibrate sticks (for RC radios / drifting sticks)'},{type:'act',k:'clearcal',l:'Clear calibration'},...BTN_ACTS.map(([k,l])=>({type:'btn',k,l})),{type:'act',k:'defaults',l:'Restore default mapping'},{type:'act',k:'close',l:'✔ Done'}];}
function bindText(bd){return bd.t==='b'?(BTN_NAMES[bd.i]||'Button '+bd.i):'Axis '+bd.i+(bd.inv?' (inverted)':'');}
function openCtrl(){CT.open=true;CT.focus=0;CT.cap=null;CT.calStep=0;$('ctrl').style.display='flex';$('ctrlMsg').textContent='';renderCtrl();}
function closeCtrl(){CT.open=false;CT.cap=null;$('ctrl').style.display='none';save();}
function renderCtrl(){const rows=ctrlRowsDef();$('ctrlRows').innerHTML=rows.map((r,i)=>{const f=i===CT.focus?' f':'';
  if(r.type==='axis')return `<div class="row${f}" data-i="${i}"><span>${r.l}</span><span class="v">${CT.cap&&CT.cap.k===r.k?'… waiting':bindText(S.bind[r.k])}</span></div>`;
  if(r.type==='btn')return `<div class="row${f}" data-i="${i}"><span>${r.l}</span><span class="v">${CT.cap&&CT.cap.k===r.k?'… press a button':(BTN_NAMES[S.bind.btn[r.k]]||'Button '+S.bind.btn[r.k])}</span></div>`;
  if(r.type==='dz')return `<div class="row${f}" data-i="${i}"><span>${r.l}</span><span class="v"><span data-d="-1">◀</span>${S[r.k].toFixed(2)}<span data-d="1">▶</span></span></div>`;
  return `<div class="row act${f}" data-i="${i}">${r.l}</div>`;}).join('');
  const el=$('ctrlRows').querySelector('.row.f');if(el)el.scrollIntoView({block:'nearest'});}
$('ctrlRows').addEventListener('click',e=>{const row=e.target.closest('.row');if(!row)return;CT.focus=+row.dataset.i;const d=e.target.dataset.d;if(d)ctrlChange(+d);else ctrlActivate();});
function ctrlChange(d){const r=ctrlRowsDef()[CT.focus];if(r.type==='dz'){S[r.k]=Math.round(Math.max(0,Math.min(0.4,S[r.k]+d*0.01))*100)/100;save();renderCtrl();}}
function ctrlActivate(){const r=ctrlRowsDef()[CT.focus];const msg=$('ctrlMsg');
  if(CT.calStep){ctrlCalNext();return;}
  if(r.type==='axis'){const p=getPad();if(!p){msg.textContent='Connect a controller first.';return;}CT.cap={k:r.k,type:'axis',base:p.axes.map((v,i)=>axisRaw(p.axes,i)),bbase:p.buttons.map(x=>x?x.value:0),t:0};msg.textContent='Now '+AX_ACTS.find(a=>a[0]===r.k)[2]+'…';renderCtrl();}
  else if(r.type==='btn'){if(!getPad()){msg.textContent='Connect a controller first.';return;}CT.cap={k:r.k,type:'btn',t:0,armed:false};msg.textContent='Press the button you want for: '+r.l;renderCtrl();}
  else if(r.k==='cal'){if(!getPad()){msg.textContent='Connect a controller first.';return;}CT.calStep=1;msg.textContent='Step 1/2: let go of all sticks (throttle stick at its LOWEST on a radio), then press A / Enter.';}
  else if(r.k==='clearcal'){S.cal=null;save();msg.textContent='Calibration cleared.';}
  else if(r.k==='defaults'){S.bind=JSON.parse(JSON.stringify(DEFAULT_BIND));if(S.layout!=='trigger')S.bind.thr={t:'a',i:1,inv:true};save();renderCtrl();msg.textContent='Default mapping restored.';}
  else if(r.k==='close')closeCtrl();}
function ctrlCalNext(){const p=getPad(),msg=$('ctrlMsg');if(!p)return;
  if(CT.calStep===1){CT.cal={c:p.axes.map(v=>v),mn:p.axes.map(v=>v),mx:p.axes.map(v=>v)};
    // a radio throttle rests at one end; treat axes resting near ±1 as centred in the middle of their range later
    CT.calStep=2;msg.textContent='Step 2/2: move every stick to all its edges (full circles, throttle fully up and down), then press A / Enter.';}
  else{const c=CT.cal;c.c=c.c.map((v,i)=>Math.abs(v)>0.85?(c.mn[i]+c.mx[i])/2:v);S.cal=c;CT.calStep=0;save();msg.textContent='✅ Calibrated '+c.c.length+' axes.';}}
function ctrlPoll(p,dt,pressed,bv){
  // live view
  let h='';p.axes.forEach((v,i)=>{const n=axisRaw(p.axes,i);h+=`A${i} <span class="axbar"><i style="left:${n<0?50+n*50:50}%;width:${Math.abs(n)*50}%"></i></span>${n.toFixed(2)}${i%2?'<br>':' &nbsp; '}`;});
  h+='<div>'+p.buttons.map((x,i)=>`<span class="chip${x&&x.value>0.5?' on':''}">${BTN_NAMES[i]||i}</span>`).join('')+'</div>';$('ctrlLive').innerHTML=h;
  if(CT.calStep===2&&CT.cal){p.axes.forEach((v,i)=>{CT.cal.mn[i]=Math.min(CT.cal.mn[i],v);CT.cal.mx[i]=Math.max(CT.cal.mx[i],v);});}
  if(CT.cap){CT.cap.t+=dt;
    if(CT.cap.type==='btn'){const any=p.buttons.some(x=>x&&x.value>0.5);if(!CT.cap.armed){if(!any)CT.cap.armed=true;return;}const i=p.buttons.findIndex(x=>x&&x.value>0.5);if(i>=0){S.bind.btn[CT.cap.k]=i;CT.cap=null;save();$('ctrlMsg').textContent='Assigned '+(BTN_NAMES[i]||'Button '+i)+'.';renderCtrl();}return;}
    let best=-1,bd=0.6,sign=1;p.axes.forEach((v,i)=>{const d=axisRaw(p.axes,i)-CT.cap.base[i];if(Math.abs(d)>bd){bd=Math.abs(d);best=i;sign=Math.sign(d);}});
    if(best>=0){S.bind[CT.cap.k]={t:'a',i:best,inv:sign<0};if(CT.cap.k==='thr'&&S.layout==='trigger')S.layout='stick';CT.cap=null;save();$('ctrlMsg').textContent='Assigned axis '+best+(sign<0?' (inverted)':'')+'.';renderCtrl();return;}
    if(CT.cap.k==='thr'){const i=p.buttons.findIndex((x,k)=>x&&x.value-(CT.cap.bbase[k]||0)>0.6);if(i>=0){S.bind.thr={t:'b',i,inv:false};S.layout='trigger';CT.cap=null;save();$('ctrlMsg').textContent='Throttle on '+(BTN_NAMES[i]||'Button '+i)+' (trigger style).';renderCtrl();}}
    if(CT.cap&&CT.cap.t>8){CT.cap=null;$('ctrlMsg').textContent='Timed out.';renderCtrl();}
    return;}
  let dir=0;if(bv(12)>.5)dir=-1;else if(bv(13)>.5)dir=1;let side=0;if(bv(14)>.5)side=-1;else if(bv(15)>.5)side=1;const code=dir*10+side;
  if(code){if(CT.nav.dir!==code){CT.nav={dir:code,t:0.35};ctrlNav(dir,side);}else{CT.nav.t-=dt;if(CT.nav.t<=0){CT.nav.t=0.11;ctrlNav(dir,side);}}}else CT.nav.dir=0;
  if(pressed(0))ctrlActivate();if(pressed(1)&&!CT.calStep)closeCtrl();
}
function ctrlNav(dir,side){const n=ctrlRowsDef().length;if(dir){CT.focus=(CT.focus+dir+n)%n;renderCtrl();}else if(side)ctrlChange(side);}
function ctrlKey(k){if(CT.cap)return;if(k==='arrowup')ctrlNav(-1,0);else if(k==='arrowdown')ctrlNav(1,0);else if(k==='arrowleft')ctrlNav(0,-1);else if(k==='arrowright')ctrlNav(0,1);else if(k==='enter'||k===' ')ctrlActivate();else if(k==='escape'){CT.calStep=0;closeCtrl();}}

// ---------------- updater (asks before updating) ----------------
function cmpVer(a,b){const x=String(a).split('.').map(Number),y=String(b).split('.').map(Number);for(let i=0;i<3;i++){if((x[i]||0)!==(y[i]||0))return (x[i]||0)>(y[i]||0)?1:-1;}return 0;}
async function checkUpdate(manual){
  try{const r=await fetch(`https://raw.githubusercontent.com/${REPO}/main/version.json?t=${Date.now()}`,{cache:'no-store'});const j=await r.json();
    if(cmpVer(j.version,VERSION)>0)showUpdate(j);else if(manual)toast('You have the latest version (v'+VERSION+')');}catch(e){if(manual)toast("Couldn't check for updates");}
}
function showUpdate(j){
  const u=$('upd'),local=location.protocol==='file:';
  u.innerHTML=`<b>Update available: v${j.version}</b><div style="font-size:13px;color:#8fa6c0;margin-top:4px">${(j.notes||'').replace(/</g,'&lt;')}</div>`+
    (local?`<div style="font-size:13px;margin-top:6px">Close the game and run <b>Rotorbound.bat</b>. It will ask before installing.</div><button id="uLater" style="background:#3fc8ff">OK</button>`
          :`<button id="uNow" style="background:#39ff88">Update now</button><button id="uLater" style="background:#555;color:#fff">Later</button>`);
  u.style.display='block';$('uLater').onclick=()=>u.style.display='none';
  if($('uNow'))$('uNow').onclick=()=>location.replace(location.origin+location.pathname+'?v='+encodeURIComponent(j.version));
}

