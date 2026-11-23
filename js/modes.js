'use strict';
// ---------------- loop ----------------
let started=false;
function startGame(){if(started)return;started=true;closeHelp();document.body.classList.remove('clean');$('start').style.display='none';initAudio();setupActivity();}
document.body.classList.add('clean');renderTitle();try{if(sessionStorage.getItem('rb.fly')){sessionStorage.removeItem('rb.fly');tFocus=0;renderTitle();toast(MAP_INFO[MAP].n+' loaded · press A / Enter to fly');}}catch(e){}
addEventListener('pointerdown',()=>initAudio());
let last=performance.now(),acc=0,rewinding=false,trigT=0;
// ================= v0.9: landing zones, kamikaze war, AI racers, film gigs, builder, battery, signal, career =================
const _x1=new V3(),_x2=new V3(),_x3=new V3();
function miniDrone(col,sc){const g=new THREE.Group(),m=lam(col),d=lam(0x15171b);
  g.add(new THREE.Mesh(new THREE.BoxGeometry(0.16,0.06,0.26),m));
  for(const a of[45,-45]){const arm=new THREE.Mesh(new THREE.BoxGeometry(0.48,0.02,0.045),d);arm.rotation.y=a*DEG;g.add(arm);}
  const pg=new THREE.CylinderGeometry(0.095,0.095,0.006,12),pm=basic(col,{transparent:true,opacity:.45});
  for(const[x,z]of[[.17,.17],[-.17,.17],[.17,-.17],[-.17,-.17]]){const p=new THREE.Mesh(pg,pm);p.position.set(x,0.035,z);g.add(p);}
  const led=new THREE.Mesh(new THREE.BoxGeometry(0.09,0.015,0.015),basic(col));led.position.set(0,0,0.14);g.add(led);
  g.scale.setScalar(sc||1.6);scene.add(g);return g;}
function textSprite(txt,col,size){const c=document.createElement('canvas');c.width=256;c.height=96;const x=c.getContext('2d');
  const draw=(t,cl)=>{x.clearRect(0,0,256,96);x.font='bold 54px Consolas,monospace';x.textAlign='center';x.textBaseline='middle';x.lineWidth=8;x.strokeStyle='rgba(0,0,0,.8)';x.strokeText(t,128,48);x.fillStyle=cl||col;x.fillText(t,128,48);tex.needsUpdate=true;};
  const tex=new THREE.CanvasTexture(c);const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false,transparent:true}));sp.scale.set(size*2.67,size,1);sp.renderOrder=5;sp.userData.draw=draw;draw(txt,col);scene.add(sp);return sp;}
function clearSpot(x,z,y,r,hgt){for(const c of gatherNear(x,z,r+1)){if(c.disabled||c.ramp)continue;if(x>c.min.x-r&&x<c.max.x+r&&z>c.min.z-r&&z<c.max.z+r&&c.max.y>y+0.1&&c.min.y<y+hgt)return false;}return true;}
function inSolid(p){for(const c of gatherNear(p.x,p.z,0.5)){if(c.disabled||c.ramp||c.soft)continue;if(p.x>c.min.x&&p.x<c.max.x&&p.y>c.min.y&&p.y<c.max.y&&p.z>c.min.z&&p.z<c.max.z)return true;}return p.y<groundH(p.x,p.z,p.y+0.5)-0.2;}
function losClear(a,b,step){const d=a.distanceTo(b),n=Math.min(40,Math.ceil(d/(step||6)));for(let i=1;i<n;i++){_x3.copy(a).lerp(b,i/n);if(inSolid(_x3))return false;}return true;}
const mapBounds=(()=>{let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const s of spots){x0=Math.min(x0,s.x);x1=Math.max(x1,s.x);z0=Math.min(z0,s.z);z1=Math.max(z1,s.z);}for(const t of MAPDEF.tokens){x0=Math.min(x0,t[0]);x1=Math.max(x1,t[0]);z0=Math.min(z0,t[2]);z1=Math.max(z1,t[2]);}return{x0,x1,z0,z1};})();
const groundAt=(x,z)=>MAPDEF.indoor?groundH(x,z,1):groundH(x,z,600);

// ---------------- stats & career ----------------
const STATS=Object.assign({time:0,dist:0,crashes:0,laps:0,tokens:0,deliveries:0,landings:0,perfect:0,kills:0,bestWave:0,filmBest:0,combos:0,aiWins:0,aiHardWins:0,built:0,maps:[]},store.get('stats',{}));
let statT=0;
function stat(k,v){if(k==='map'){if(!STATS.maps.includes(v))STATS.maps.push(v);}else if(k==='bestWave'||k==='filmBest')STATS[k]=Math.max(STATS[k]||0,v);else STATS[k]=(STATS[k]||0)+(v==null?1:v);}
const anyVault=()=>MAP_IDS.some(m=>store.get('vault.'+m,false));
const CAREER=[
 {id:'first',n:'First flight',d:'Fly for a minute',r:100,p:()=>[STATS.time,60]},
 {id:'laps5',n:'Lap it up',d:'Finish 5 race laps',r:250,p:()=>[STATS.laps,5]},
 {id:'aiwin',n:'Beat the bots',d:'Finish a lap in 1st place against AI racers',r:500,p:()=>[STATS.aiWins,1]},
 {id:'aihard',n:'Pro circuit',d:'Win a lap against Hard AI racers',r:1500,p:()=>[STATS.aiHardWins,1]},
 {id:'del5',n:'Courier',d:'Deliver 5 packages',r:300,p:()=>[STATS.deliveries,5]},
 {id:'del25',n:'Same-day shipping',d:'Deliver 25 packages',r:1500,p:()=>[STATS.deliveries,25]},
 {id:'tok50',n:'Token hunter',d:'Collect 50 tokens',r:500,p:()=>[STATS.tokens,50]},
 {id:'vault',n:'Safecracker',d:'Open any secret vault',r:1000,p:()=>[anyVault()?1:0,1]},
 {id:'land10',n:'Soft touch',d:'Score 10 landing zones',r:300,p:()=>[STATS.landings,10]},
 {id:'bull5',n:'Bullseye',d:'5 perfect landings (dead centre, feather soft)',r:800,p:()=>[STATS.perfect,5]},
 {id:'combo5k',n:'Stunt pilot',d:'Bank a 5,000-point combo',r:400,p:()=>[T.bestCombo,5000]},
 {id:'combo20k',n:'Freestyle legend',d:'Bank a 20,000-point combo',r:1500,p:()=>[T.bestCombo,20000]},
 {id:'maps',n:'Explorer',d:'Fly on all 7 maps',r:700,p:()=>[STATS.maps.length,7]},
 {id:'kill10',n:'Kamikaze',d:'Destroy 10 war targets',r:500,p:()=>[STATS.kills,10]},
 {id:'wave5',n:'Front line',d:'Reach wave 5 in a war mission',r:1500,p:()=>[STATS.bestWave,5]},
 {id:'film80',n:'Director',d:'Score 80% or better on a film gig',r:600,p:()=>[STATS.filmBest,80]},
 {id:'build',n:'Architect',d:'Save a track in the track builder',r:200,p:()=>[STATS.built,1]},
 {id:'hour',n:'Marathon',d:'Fly for an hour in total',r:2000,p:()=>[STATS.time,3600]},
 {id:'km100',n:'Long haul',d:'Fly 100 km in total',r:1500,p:()=>[STATS.dist/1000,100]},
 {id:'crash100',n:'Crash test pilot',d:'Crash 100 times. It happens.',r:100,p:()=>[STATS.crashes,100]}];
const careerDone=new Set(store.get('career',[]));
function careerCheck(){for(const c of CAREER){if(careerDone.has(c.id))continue;const[v,t]=c.p();if(v>=t){careerDone.add(c.id);store.set('career',[...careerDone]);addCash(c.r);sfxDing();setTimeout(()=>toast('🏆 '+c.n+' complete  +'+fmtCash(c.r)),600);}}}
const CA={open:false,tab:0};
function openCareer(){CA.open=true;$('career').style.display='flex';renderCareer();}
function closeCareer(){CA.open=false;$('career').style.display='none';if(!started)renderTitle();}
function renderCareer(){
  $('caTabs').innerHTML=['CAREER','STATS'].map((t,k)=>`<div class="tab${k===CA.tab?' on':''}" data-t="${k}">${t}</div>`).join('')+`<span class="lbrb" style="margin-left:auto">${careerDone.size}/${CAREER.length} done</span>`;
  if(CA.tab===0)$('caBody').innerHTML=CAREER.map(c=>{const[v,t]=c.p(),done=careerDone.has(c.id),pc=Math.min(1,v/t);
    return `<div class="row" style="display:block;${done?'opacity:.6':''}"><div style="display:flex;justify-content:space-between;gap:10px"><span>${done?'✅':'⬜'} <b>${c.n}</b></span><span class="v">${fmtCash(c.r)}</span></div><span class="gdesc">${c.d}${done?'':` · ${Math.floor(Math.min(v,t)*10)/10} / ${t}`}</span>${done?'':`<div class="bar" style="height:5px;background:#1d2a3a;border-radius:3px;margin-top:5px"><i style="display:block;height:5px;border-radius:3px;background:#3fc8ff;width:${pc*100}%"></i></div>`}</div>`;}).join('');
  else{const h=s=>{const m=Math.floor(s/60);return Math.floor(m/60)+'h '+(m%60)+'m';};
    const L=[['Total flight time',h(STATS.time)],['Distance flown',(STATS.dist/1000).toFixed(1)+' km'],['Crashes',STATS.crashes],['Race laps',STATS.laps],['Wins against AI',STATS.aiWins],['Packages delivered',STATS.deliveries],['Tokens collected',STATS.tokens],['Landing zones scored',STATS.landings+' ('+STATS.perfect+' perfect)'],['Best combo',T.bestCombo.toLocaleString()],['Combos banked',STATS.combos],['War targets destroyed',STATS.kills],['Best war wave',STATS.bestWave],['Best film gig',STATS.filmBest+'%'],['Tracks built',STATS.built],['Maps flown',STATS.maps.length+' / 7'],['Lifetime earnings now',fmtCash(cash)]];
    $('caBody').innerHTML=L.map(([a,b])=>`<div class="row"><span>${a}</span><span class="v">${b}</span></div>`).join('');}
}
$('caTabs').addEventListener('click',e=>{const t=e.target.closest('.tab');if(t){CA.tab=+t.dataset.t;renderCareer();}});
$('caClose').onclick=closeCareer;
function careerKey(k){if(k==='escape'||k==='enter'||k===' ')closeCareer();else if(k==='q'||k==='e'||k==='arrowleft'||k==='arrowright'||k==='tab'){CA.tab^=1;renderCareer();}else if(k==='arrowdown'||k==='s')$('caBody').scrollTop+=80;else if(k==='arrowup'||k==='w')$('caBody').scrollTop-=80;}

// ---------------- battery & signal ----------------
const BAT={e:1,warn:0},SIG={q:1,t:0,home:new V3(),fs:false,lost:0,jam:0};
function batK(){if(SIG.fs)return 0;if(!S.battery)return 1;return BAT.e<=0?0:0.82+0.18*Math.min(1,BAT.e*3);}
function batVolt(){const c=GAR.cells;if(!S.battery)return c*4.2-D.motor*0.37*c*GAR.drain-Math.min(0.3*c,flightT/600*0.3*c*GAR.drain/GAR.cap);return Math.max(c*3.0,c*(3.35+0.85*Math.pow(Math.max(0,BAT.e),0.6))-D.motor*0.45*c*GAR.drain*(1.25-BAT.e*0.5));}
function sigStep(dt){SIG.t-=dt;if(SIG.t>0)return;SIG.t=0.2;
  let jam=0;if(S.activity==='war')for(const t of WAR.targets)if(t.alive&&t.type==='jam'){const d=t.g.position.distanceTo(D.pos);if(d<75)jam=Math.max(jam,1-d/75);}SIG.jam=jam;
  if(!S.signal){SIG.q=1-jam*0.7;SIG.fs=false;return;}
  const d=D.pos.distanceTo(SIG.home);let occ=0;const n=Math.min(30,Math.ceil(d/8));_x1.copy(SIG.home);_x1.y+=1.5;
  for(let i=1;i<n;i++){_x2.copy(_x1).lerp(D.pos,i/n);if(inSolid(_x2))occ++;}
  SIG.q=Math.max(0,Math.min(1,1-Math.pow(d/650,2)-Math.min(0.75,occ*0.09)-encl*0.12-jam*0.7));
  if(SIG.q<0.06&&!D.crashed){SIG.lost+=0.2;if(SIG.lost>0.8&&!SIG.fs){SIG.fs=true;toast('📡 FAILSAFE · signal lost');rumble(0.8,0.8,300);}}else{SIG.lost=0;if(SIG.fs&&SIG.q>0.2){SIG.fs=false;toast('📡 Signal back');}}}
function extStatic(){return(SIG.q<0.6?(0.6-SIG.q)*1.25:0)+(SIG.fs?0.5:0)+(BAT.e<=0&&S.battery?0.1:0);}

// ---------------- speed fx & slow motion ----------------
const SM={t:0};function slowMo(t){if(S.speedFx)SM.t=Math.max(SM.t,t);}
function timeScale(){return SM.t>0?0.35:1;}
const sfc=$('speedfx'),sfx2=sfc.getContext('2d');let sfxLines=[];
function updSpeedFx(dt){SM.t=Math.max(0,SM.t-dt);
  const sp=D.vel.length(),on=S.speedFx&&S.view==='fpv'&&started&&!D.crashed&&!PH.on&&!RB.on,a=on?Math.min(0.5,Math.max(0,(sp-22)/40)):0;
  sfc.style.opacity=a.toFixed(2);if(a<=0.01){return;}
  const W=sfc.width=innerWidth/2|0,H=sfc.height=innerHeight/2|0;sfx2.clearRect(0,0,W,H);sfx2.strokeStyle='rgba(255,255,255,.55)';sfx2.lineWidth=1;
  const n=Math.round(20+a*60);for(let i=0;i<n;i++){const ang=Math.random()*TAU,r0=(0.35+Math.random()*0.4)*Math.max(W,H)*0.6,len=20+Math.random()*60*a*2;sfx2.beginPath();sfx2.moveTo(W/2+Math.cos(ang)*r0,H/2+Math.sin(ang)*r0);sfx2.lineTo(W/2+Math.cos(ang)*(r0+len),H/2+Math.sin(ang)*(r0+len));sfx2.stroke();}}
function fovNow(){if(!S.speedFx||S.view!=='fpv')return S.fov;const sp=D.vel.length();return S.fov+Math.min(14,Math.max(0,(sp-15)*0.35));}

// ---------------- landing zones (free flight) ----------------
const LZ={list:[],hold:0,air:0,touch:0,cur:null};
function buildLZ(){if(LZ.built)return;LZ.built=true;
  if(!PADS)buildPads();const used=PADS.map(q=>q.p);const far=(s,arr,d)=>arr.every(q=>Math.hypot(s.x-q[0],s.z-q[2])>d);
  const cand=spots.filter(s=>clearSpot(s.x,s.z,s.h,1.2,3)).map(s=>({x:s.x,z:s.z,h:s.h}));
  // extra candidates: flat tops of solid boxes (roofs, containers, towers) with headroom
  const cs=colliders.filter(c=>!c.soft&&!c.ramp&&c.max.x-c.min.x>=3.6&&c.max.z-c.min.z>=3.6&&c.max.y>1.5).sort(()=>Math.random()-.5);
  for(const c of cs.slice(0,500)){const x=(c.min.x+c.max.x)/2,z=(c.min.z+c.max.z)/2,h=c.max.y;if(h-groundAt(x,z)<2)continue;if(clearSpot(x,z,h,1.4,4))cand.push({x,z,h});}
  {const b=mapBounds;for(let k=0;k<400;k++){const x=b.x0+Math.random()*(b.x1-b.x0),z=b.z0+Math.random()*(b.z1-b.z0),h=groundAt(x,z);if(MAPDEF.terrain&&Math.abs(groundAt(x+2,z)-groundAt(x-2,z))+Math.abs(groundAt(x,z+2)-groundAt(x,z-2))>0.8)continue;if(isWater(x,z,h))continue;if(clearSpot(x,z,h,2,4))cand.push({x,z,h});}}
  const ok=cand.filter(s=>far(s,used,15)).sort(()=>Math.random()-.5);const pick=[];
  const hi=ok.filter(s=>s.h-groundAt(s.x,s.z)>8).sort((a,b)=>b.h-a.h),lo=ok.filter(s=>s.h-groundAt(s.x,s.z)<=8);
  for(const s of hi){if(pick.length>=6)break;if(far(s,pick.map(q=>[q.x,0,q.z]),45))pick.push(s);}
  for(const s of lo.concat(hi)){if(pick.length>=11)break;if(far(s,pick.map(q=>[q.x,0,q.z]),40))pick.push(s);}
  const ringG=new THREE.RingGeometry(1.8,2.1,40).rotateX(-Math.PI/2),eyeG=new THREE.RingGeometry(0.35,0.6,24).rotateX(-Math.PI/2),beamG=new THREE.CylinderGeometry(0.22,0.22,40,8,1,true);
  for(const s of pick){const ground=s.h-groundAt(s.x,s.z),tight=!clearSpot(s.x,s.z,s.h,4,3),bull=ground>30;
    const base=Math.round((60+Math.min(ground,70)*2.4+(tight?80:0))*(bull?1.5:1)/10)*10;
    const mat=basic(bull?0xff3d7f:0xff9f1c,{transparent:true,opacity:.95,side:THREE.DoubleSide,depthTest:false});
    const g=new THREE.Group();g.position.set(s.x,s.h+0.08,s.z);{const r1=new THREE.Mesh(ringG,mat),r2=new THREE.Mesh(eyeG,mat);r1.renderOrder=r2.renderOrder=4;g.add(r1,r2);}
    const beam=new THREE.Mesh(beamG,basic(bull?0xff3d7f:0xff9f1c,{transparent:true,opacity:.3,depthWrite:false}));beam.position.y=20;g.add(beam);scene.add(g);
    const lab=textSprite((bull?'◎ ':'')+'$'+base,bull?'#ff6fa3':'#ffb547',1.6);lab.position.set(s.x,s.h+3.2,s.z);
    LZ.list.push({s,base,bull,g,lab,mat,done:false});}}
function lzShow(v){for(const z of LZ.list){z.g.visible=v&&!z.done;z.lab.visible=v&&!z.done;}}
function lzStep(dt){if(S.activity!=='free'||!LZ.list.length)return;
  if(!D.grounded){LZ.air+=dt;if(D.vel.y<0)LZ.touch=-D.vel.y;LZ.hold=0;LZ.cur=null;return;}
  let hit=null;for(const z of LZ.list){if(z.done)continue;const d=Math.hypot(D.pos.x-z.s.x,D.pos.z-z.s.z);if(d<2.3&&Math.abs(D.pos.y-(z.s.h+R))<0.8){hit=z;z.dd=d;break;}}
  if(!hit||D.vel.length()>1.5||LZ.air<1.5){LZ.hold=0;LZ.cur=null;if(!hit)LZ.air=0;return;}
  LZ.cur=hit;LZ.hold+=dt;if(LZ.hold<1)return;
  const prec=Math.max(0.5,1-hit.dd/2.3*0.5),soft=LZ.touch<0.9?1.25:LZ.touch<2?1:0.8,pts=Math.round(hit.base*prec*soft),perfect=hit.dd<0.6&&LZ.touch<0.9;
  addCash(pts);stat('landings');if(perfect)stat('perfect');sfxDing();rumble(0.4,0.6,200);
  toast((perfect?'🎯 PERFECT LANDING ':'🛬 Landed ')+'+'+fmtCash(pts)+'  (aim '+Math.round(prec*100)+'%, '+(soft>1?'butter soft':soft<1?'hard touchdown':'smooth')+')');
  hit.done=true;hit.g.visible=hit.lab.visible=false;LZ.hold=0;LZ.air=0;LZ.cur=null;
  if(LZ.list.every(z=>z.done)){addCash(300);toast('🛬 Every landing zone done! +$300 · they reset');setTimeout(()=>{LZ.list.forEach(z=>z.done=false);lzShow(S.activity==='free');},3000);}}

// ---------------- AI racers & film subject (shared curve follower) ----------------
function makeCurve(pts,speedTop,alat){const N=pts.length,P=pts.map(p=>new V3(p[0],p[1],p[2]));const c=new THREE.CatmullRomCurve3(P,true,'centripetal');
  const M=N*24,smp=[];for(let i=0;i<M;i++)smp.push(c.getPoint(i/M));
  // keep the line out of walls: pull blocked samples toward the straight gate-to-gate line, then search around it
  const free=p=>!inSolid(p)&&!inSolid(_x1.set(p.x+0.9,p.y,p.z))&&!inSolid(_x1.set(p.x-0.9,p.y,p.z))&&!inSolid(_x1.set(p.x,p.y,p.z+0.9))&&!inSolid(_x1.set(p.x,p.y,p.z-0.9))&&!inSolid(_x1.set(p.x,p.y+0.8,p.z))&&!inSolid(_x1.set(p.x,p.y-0.6,p.z));
  const fixed=new Array(M).fill(false);
  for(let i=0;i<M;i++){const p=smp[i];if(free(p))continue;const u=i/M*N,k=Math.floor(u),f=u-k,A=P[k%N],B=P[(k+1)%N];const S0=new V3().lerpVectors(A,B,f);let got=null;
    for(const t of[0.35,0.6,0.85,1]){const q=new V3().lerpVectors(p,S0,t);if(free(q)){got=q;break;}}
    if(!got){const dir=new V3().subVectors(B,A).setY(0).normalize(),side=new V3(-dir.z,0,dir.x);
      outer:for(const r of[1.5,3,4.5,6,8])for(const o of[[0,1],[1,0],[-1,0],[0,-0.6],[1,1],[-1,1]]){const q=S0.clone().addScaledVector(side,o[0]*r).add(_x2.set(0,o[1]*r,0));if(free(q)){got=q;break outer;}}}
    if(got){smp[i]=got;fixed[i]=true;}}
  for(let it=0;it<3;it++)for(let i=0;i<M;i++){if(!fixed[i]&&!fixed[(i+1)%M]&&!fixed[(i-1+M)%M])continue;const q=new V3().addVectors(smp[(i-1+M)%M],smp[(i+1)%M]).multiplyScalar(0.5).lerp(smp[i],0.4);if(free(q))smp[i]=q;}
  const seg=smp.map((p,i)=>p.distanceTo(smp[(i+1)%M])),v=[];
  for(let i=0;i<M;i++){const a=smp[(i-1+M)%M],b=smp[i],d=smp[(i+1)%M];const t1=_x1.copy(b).sub(a).normalize(),t2=_x2.copy(d).sub(b).normalize();const ang=Math.acos(Math.max(-1,Math.min(1,t1.dot(t2)))),ds=(seg[i]+seg[(i-1+M)%M])/2;const k=ang/Math.max(0.01,ds);v.push(Math.min(speedTop,Math.sqrt(alat/Math.max(1e-4,k))));}
  for(let i=0;i<M;i++)if(fixed[i])v[i]=Math.min(v[i],speedTop*0.7);
  for(let r=0;r<2;r++)for(let i=M-1;i>=0;i--){const j=(i+1)%M;v[i]=Math.min(v[i],Math.sqrt(v[j]*v[j]+2*20*seg[i]));}
  return{c,M,smp,seg,v,len:seg.reduce((a,b)=>a+b,0)};}
function followStep(f,C,dt,mul){let left=dt;while(left>0){const i=Math.floor(f.s)%C.M,sp=Math.max(4,C.v[i]*mul),ds=sp*left,rem=(1-(f.s-Math.floor(f.s)))*C.seg[i];if(ds<rem){f.s+=ds/C.seg[i];left=0;}else{left-=rem/sp;f.s=Math.floor(f.s)+1;if(f.s>=C.M*(f.lap+1))f.lap++;}f.v=sp;}
  const i=Math.floor(f.s)%C.M,u=f.s-Math.floor(f.s);f.p.copy(C.smp[i]).lerp(C.smp[(i+1)%C.M],u);}
function orientMini(g,f,C,off){const i=Math.floor(f.s)%C.M,tan=_x1.copy(C.smp[(i+1)%C.M]).sub(C.smp[i]).normalize();g.position.copy(f.p).add(off||_x3.set(0,0,0));
  const yaw=Math.atan2(-tan.x,-tan.z),pitch=-0.25-Math.min(0.5,f.v/80);g.rotation.set(0,0,0);g.rotation.order='YXZ';g.rotation.y=yaw;g.rotation.x=pitch;g.children.forEach((c,k)=>{if(k>=3&&k<=6)c.rotation.y+=0.9;});}
const AI={list:[],C:null,run:false,on:false};
const AI_LV={easy:[24,18,0.82],medium:[31,26,0.92],hard:[38,34,1]};
function aiSetup(){AI.list.forEach(a=>scene.remove(a.g));AI.list=[];AI.run=false;AI.on=S.activity==='race'&&S.ai&&S.ai!=='off'&&gates.length>2;if(!AI.on)return;
  const L=AI_LV[S.ai]||AI_LV.medium;AI.C=makeCurve(TRACKS[S.track].pts,L[0],L[1]);
  [[0xff3b3b,1.0,'RED'],[0xffd23f,0.97,'YLW'],[0xb06bff,0.94,'PRP']].forEach(([col,sk,n],k)=>{const g=miniDrone(col);AI.list.push({g,f:{s:0,lap:0,p:new V3(),v:0},sk:sk*L[2],n,off:new V3((k-1)*1.6,0,0)});});
  aiPark();}
function aiPark(){if(!AI.on)return;AI.run=false;const sp=TRACKS[S.track].spawn;AI.list.forEach((a,k)=>{a.f.s=0;a.f.lap=0;a.g.position.set(sp.p[0]+(k-1)*2.2+Math.sin(sp.h)*-2,sp.p[1]+R+0.1,sp.p[2]+Math.cos(sp.h)*2);a.g.rotation.set(0,sp.h,0);});}
function aiStart(){if(!AI.on||AI.run)return;AI.run=true;AI.list.forEach(a=>{a.f.s=0;a.f.lap=0;});}
function aiStep(dt){if(!AI.on||!AI.run)return;for(const a of AI.list){followStep(a.f,AI.C,dt,a.sk);orientMini(a.g,a.f,AI.C,_x2.copy(a.off).multiplyScalar(Math.max(0,1-a.f.s/(AI.C.M*0.15))));}}
let raceLaps=0;
function playerProgress(){const N=gates.length;if(!N)return 0;const g=gates[nextGate],pg=gates[(nextGate-1+N)%N],seg=g.c.distanceTo(pg.c)||1,fr=Math.max(0,Math.min(1,1-D.pos.distanceTo(g.c)/seg));const k=nextGate===0?N:nextGate;return raceLaps*N+(k-1)+fr;}
function aiPos(){if(!AI.on||!AI.run)return 0;const N=gates.length,pp=playerProgress();let ahead=0;for(const a of AI.list){const ap=(a.f.s/AI.C.M)*N;if(ap>pp)ahead++;}return 1+ahead;}

// ---------------- film gigs ----------------
const FILM={kind:null,tag:null,band:[5,16],forceKind:null,sub:null,f:{s:0,lap:0,p:new V3(),v:0},C:null,state:'idle',t:0,q:0,n:0,lost:0,dur:45,trackId:null,wait:0,res:0};
function filmTrack(){if(!FILM.trackId||!TRACKS[FILM.trackId])FILM.trackId=TRACK_IDS[Math.floor(Math.random()*TRACK_IDS.length)];return FILM.trackId;}
function carPos(k,out){const c=cars[k];const x=c.axis==='x'?c.p:c.line+c.lane,z=c.axis==='x'?c.line+c.lane:c.p;return out.set(x,c.y0+1.4,z);}
function filmSetup(){if(FILM.sub){scene.remove(FILM.sub);FILM.sub=null;}if(FILM.tag)FILM.tag.visible=false;if(S.activity!=='film')return;
  const kinds=['pilot','pilot'];if(S.traffic&&cars.length)kinds.push('car','car');if(aircraft.some(a=>a.kind==='heli'))kinds.push('heli');if(aircraft.some(a=>a.kind==='blimp'))kinds.push('blimp');
  FILM.kind=FILM.forceKind||kinds[Math.floor(Math.random()*kinds.length)];FILM.forceKind=null;
  FILM.state='ready';FILM.t=0;FILM.q=0;FILM.n=0;FILM.lost=0;FILM.wait=0;FILM.res=0;
  if(!FILM.tag){FILM.tag=textSprite('▼','#ff8a1f',0.9);}FILM.tag.visible=FILM.kind!=='pilot';
  if(FILM.kind==='pilot'){FILM.C=makeCurve(TRACKS[filmTrack()].pts,22,16);FILM.sub=miniDrone(0xff8a1f,2.2);
    {const sp=spawnPoint().p;let bi=0,bd=1e9;FILM.C.smp.forEach((q,i)=>{const d=Math.hypot(q.x-sp[0],q.z-sp[2])+Math.abs(q.y-sp[1])*0.5;if(d<bd){bd=d;bi=i;}});FILM.f.s=bi;FILM.f.lap=0;}
    FILM.f.p.copy(FILM.C.smp[Math.floor(FILM.f.s)]);orientMini(FILM.sub,FILM.f,FILM.C);FILM.band=[5,16];FILM.desc='chase-cam a pro pilot (orange drone)';}
  else if(FILM.kind==='car'){let bi=0,bd=1e9;for(let k=0;k<cars.length;k++){const d=carPos(k,_x1).distanceTo(D.pos);if(d<bd&&d>15){bd=d;bi=k;}}FILM.car=bi;carPos(bi,FILM.f.p);FILM.band=[4,14];FILM.desc='follow the car for a commercial';}
  else{const L=aircraft.filter(a=>a.kind===FILM.kind);FILM.air=L[Math.floor(Math.random()*L.length)];FILM.f.p.copy(FILM.air.g.position);FILM.band=FILM.kind==='blimp'?[14,45]:[8,28];FILM.desc=FILM.kind==='blimp'?'film the blimp for a sponsor':'shoot the news helicopter';}
  FILM.dur=FILM.kind==='pilot'?45:40;
  toast('🎬 Film gig: '+FILM.desc+'. Get close to start.');}
function filmPos(dt){if(FILM.kind==='pilot'){followStep(FILM.f,FILM.C,dt,0.8);orientMini(FILM.sub,FILM.f,FILM.C);}else if(FILM.kind==='car')carPos(FILM.car,FILM.f.p);else FILM.f.p.copy(FILM.air.g.position);
  if(FILM.tag&&FILM.tag.visible)FILM.tag.position.copy(FILM.f.p).add(_x3.set(0,FILM.kind==='blimp'?9:FILM.kind==='heli'?4:3.2,0));}
function filmStep(dt){if(S.activity!=='film'||!FILM.kind)return;
  if(FILM.state==='ready'){if(FILM.kind!=='pilot')filmPos(dt);const d=D.pos.distanceTo(FILM.f.p);if(d<FILM.band[1]+12&&!D.grounded){FILM.state='roll';FILM.t=-3;toast('🎬 3… 2… 1… ACTION!');}return;}
  if(FILM.state==='done'){FILM.t+=dt;if(FILM.t>4){FILM.trackId=null;filmSetup();}return;}
  FILM.t+=dt;if(FILM.kind!=='pilot'||FILM.t>=0)filmPos(dt);if(FILM.t<0)return;
  const cf=camera.getWorldDirection(_x1),to=_x2.copy(FILM.f.p).sub(camera.position),d=to.length();to.normalize();const[b0,b1]=FILM.band;
  const ang=Math.acos(Math.max(-1,Math.min(1,cf.dot(to))))/DEG,frame=ang<10?1:ang<32?1-(ang-10)/22:0,dist=d<b0*0.4?0:d<b0?(d-b0*0.4)/(b0*0.6):d<b1?1:d<b1*2.2?1-(d-b1)/(b1*1.2):0,smooth=Math.max(0,1-Math.max(0,D.w.length()-3)/6);
  const q=D.crashed?0:frame*dist*(0.6+0.4*smooth);FILM.q+=q*dt;FILM.n+=dt;FILM.cur=q;
  if(frame<0.05||dist<0.05)FILM.lost+=dt;else FILM.lost=Math.max(0,FILM.lost-dt*0.5);
  if(FILM.lost>5||FILM.t>=FILM.dur){const pc=Math.round(FILM.q/Math.max(1,FILM.n)*100),fail=FILM.lost>5;FILM.res=pc;
    const pay=fail?Math.round(pc):Math.round(pc*4+(pc>=80?150:0));addCash(pay);if(!fail)stat('filmBest',pc);
    toast(fail?'🎬 Lost the shot · '+pc+'% · +'+fmtCash(pay):'🎬 That\'s a wrap! Shot quality '+pc+'%  +'+fmtCash(pay));FILM.state='done';FILM.t=0;}}
// ---------------- track builder ----------------
const TB={pts:[],marks:[],prev:null};
function tbSetup(){TB.marks.forEach(m=>scene.remove(m));TB.marks=[];TB.pts=[];if(TB.prev){scene.remove(TB.prev);TB.prev=null;}if(S.activity!=='build')return;
  TB.prev=new THREE.Mesh(gateGeo,basic(0x3fc8ff,{transparent:true,opacity:.35,depthWrite:false}));scene.add(TB.prev);}
function tbStep(){if(S.activity!=='build'||!TB.prev)return;_e.setFromQuaternion(D.q,'YXZ');const h=_e.y;TB.prev.position.copy(D.pos);TB.prev.rotation.set(0,h,0);TB.prev.visible=!D.crashed;}
function tbPlace(){if(S.activity!=='build')return;if(D.grounded){toast('Take off first. Gates go where you fly.');return;}if(TB.pts.length>=40){toast('40 gates max');return;}
  const p=[+D.pos.x.toFixed(1),+D.pos.y.toFixed(1),+D.pos.z.toFixed(1)];if(TB.pts.length&&Math.hypot(p[0]-TB.pts[TB.pts.length-1][0],p[2]-TB.pts[TB.pts.length-1][2],p[1]-TB.pts[TB.pts.length-1][1])<8){toast('Too close to the last gate');return;}
  TB.pts.push(p);const m=new THREE.Mesh(gateGeo,basic(0xffd23f,{transparent:true,opacity:.8}));m.position.set(p[0],p[1],p[2]);_e.setFromQuaternion(D.q,'YXZ');m.rotation.set(0,_e.y,0);scene.add(m);
  const lb=textSprite(String(TB.pts.length),'#ffd23f',1.2);lb.position.set(p[0],p[1]+4.3,p[2]);TB.marks.push(m,lb);sfxDing();toast('Gate '+TB.pts.length+' placed');}
function tbUndo(){if(S.activity!=='build'||!TB.pts.length)return;TB.pts.pop();scene.remove(TB.marks.pop());scene.remove(TB.marks.pop());toast('Removed gate '+(TB.pts.length+1));}
function customList(){return store.get('custom.'+MAP,[]);}
function addCustomTrack(c,save){const id='my_'+c.id;TRACKS[id]={name:c.name,spawn:c.spawn,pts:c.pts,custom:true};if(!TRACK_IDS.includes(id)){TRACK_IDS.push(id);const r=ROWS.find(x=>x.k==='track');if(r)r.o.push([id,c.name]);}
  if(save){const L=customList().filter(x=>x.id!==c.id);L.push(c);store.set('custom.'+MAP,L);}return id;}
function tbSave(){if(S.activity!=='build')return;if(TB.pts.length<3){toast('Place at least 3 gates first');return;}
  const pad=PADS[padIdx()],g0=TB.pts[0],c={id:Date.now().toString(36),name:'My track '+(customList().length+1),pts:TB.pts.slice(),spawn:{p:pad.p.slice(),h:Math.atan2(pad.p[0]-g0[0],pad.p[2]-g0[2])}};
  const id=addCustomTrack(c,true);stat('built');toast('💾 Saved "'+c.name+'". Race it: Mode → Race, Track → '+c.name);S.track=id;save();tbSetup();}
function trackCode(id){const t=TRACKS[id];return 'RB1:'+MAP+':'+btoa(unescape(encodeURIComponent(JSON.stringify({n:t.name,s:t.spawn,p:t.pts}))));}
function shareTrack(){const id=TRACKS[S.track]&&TRACKS[S.track].custom?S.track:TRACK_IDS.filter(x=>TRACKS[x].custom).pop();if(!id){toast('Build a track first (Mode → Track builder)');return;}
  const code=trackCode(id);(navigator.clipboard?navigator.clipboard.writeText(code):Promise.reject()).then(()=>toast('📋 Share code for "'+TRACKS[id].name+'" copied'),()=>{prompt('Copy this share code:',code);});}
function importTrack(){const code=(prompt('Paste a Rotorbound track code:')||'').trim();if(!code)return;
  try{const[tag,m,b]=code.split(':');if(tag!=='RB1')throw 0;if(m!==MAP){toast('That track is for '+(MAP_INFO[m]?MAP_INFO[m].n:m)+'. Load that map first.');return;}
    const o=JSON.parse(decodeURIComponent(escape(atob(b))));if(!Array.isArray(o.p)||o.p.length<3)throw 0;
    const c={id:Date.now().toString(36),name:String(o.n||'Imported').slice(0,30),pts:o.p.slice(0,40).map(p=>p.slice(0,4).map(Number)),spawn:o.s};const id=addCustomTrack(c,true);S.track=id;save();toast('✅ Imported "'+c.name+'"');renderMenu();}
  catch(e){toast('That code didn\'t work');}}
for(const c of customList())addCustomTrack(c,false);

// ---------------- kamikaze war ----------------
const WAR={wave:0,drones:0,score:0,targets:[],shots:[],fx:[],respawnT:0,hp:100,over:false,det:false,lock:0,beepT:0,nextT:0,boom:0};
const wOlive=lam(0x4b5a2c),wSand=lam(0x9c8a5a),wSteel=lam(0x56606b),wRedM=lam(0xb3261e),wWreckM=lam(0x1d1b19);
const TDEF={tank:{r:3.0,pts:500,hp:[2.6,1.1,1.6]},truck:{r:3.0,pts:250,hp:[1.3,1.4,3.1]},aa:{r:2.2,pts:400,hp:[1.6,1.2,1.6]},radar:{r:2.6,pts:600,hp:[1.6,2.4,1.6]},fuel:{r:3.4,pts:300,hp:[3.4,2,1.8],blast:13},jam:{r:3.0,pts:450,hp:[1.3,1.6,3]}};
const CAMO=[[0x4b5a2c,0x3b4724],[0x9c8a5a,0x7d6d45],[0x5d646b,0x474d53]].map(([a,b])=>[lam(a),lam(b)]);
function tModel(type){const g=new THREE.Group(),[cA,cB]=CAMO[Math.floor(Math.random()*CAMO.length)],trk=lam(0x1b1c1e);
  const B=(w,h,d,m,x,y,z,par)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);o.castShadow=SHADOWS;(par||g).add(o);return o;};
  const C=(r,h,m,x,y,z,rx,rz,seg,par)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,seg||10),m);o.position.set(x,y,z);o.rotation.set(rx||0,0,rz||0);o.castShadow=SHADOWS;(par||g).add(o);return o;};
  if(type==='tank'){for(const s of[-1,1]){B(0.8,1.0,6.2,trk,s*1.55,0.55,0);for(let k=0;k<5;k++)C(0.38,0.25,cB,s*1.98,0.5,-2.2+k*1.1,0,Math.PI/2,8);B(0.9,0.12,6.0,cB,s*1.55,1.12,0);}
    B(2.6,0.9,5.6,cA,0,1.2,0);B(2.4,0.35,1.2,cB,0,1.5,-2.5);const t=new THREE.Group();t.position.set(0,1.95,0.3);g.add(t);B(2.2,0.85,2.8,cA,0,0,0,t);B(1.6,0.4,1.2,cB,0,0.1,1.7,t);
    const br=C(0.13,4.2,wSteel,0,0.05,-3.2,Math.PI/2,0,8,t);C(0.2,0.6,wSteel,0,0.05,-5.2,Math.PI/2,0,8,t);C(0.38,0.22,cB,0.55,0.53,0.4,0,0,10,t);C(0.03,2.2,trk,-0.8,1.4,0.9,0,0,4,t);g.userData.turret=t;}
  else if(type==='truck'||type==='jam'){B(2.4,1.6,2.2,cA,0,1.25,-2.4);B(2.3,0.6,0.1,lam(0x1c2a33),0,1.6,-3.52);B(2.5,0.35,6.6,trk,0,0.75,-0.2);
    for(const z of[-2.3,0.3,1.9])for(const x of[-1.2,1.2])C(0.52,0.42,trk,x,0.52,z,0,Math.PI/2,12);
    if(type==='truck'){B(2.5,0.25,4.2,cB,0,1.05,0.9);const cv=lam(0x6b6a4a);B(2.5,1.9,4.2,cv,0,2.1,0.9);for(const z of[-1,0.9,2.8])B(2.6,0.12,0.12,cB,0,3.08,z);}
    else{B(2.5,2,4.2,lam(0x3c4a3a),0,2.0,0.9);C(0.06,5,wSteel,0,5.3,1.4);for(let k=0;k<3;k++)B(1.6,0.05,0.05,wSteel,0,4.0+k*0.9,1.4);const l=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,6),basic(0xff2d55));l.position.set(0,7.85,1.4);g.add(l);C(0.7,0.12,wSteel,0,3.2,-0.6,0.5,0,14);}}
  else if(type==='aa'){C(1.7,0.5,wSteel,0,0.25,0,0,0,12);for(const a of[0,1,2,3]){const o=B(3.6,0.18,0.3,cB,0,0.15,0);o.rotation.y=a*Math.PI/4;}
    const t=new THREE.Group();t.position.y=1.0;g.add(t);B(1.6,1.0,1.6,cA,0,0,0,t);B(0.5,0.5,0.8,cB,0.9,0.1,0.2,t);const dish=C(0.5,0.08,wSteel,0,0.9,0.5,0.5,0,12,t);
    const p=new THREE.Group();p.position.y=0.35;t.add(p);for(const x of[-0.38,0.38]){C(0.08,2.6,wSteel,x,0,-1.3,Math.PI/2,0,6,p);C(0.13,0.3,trk,x,0,-2.6,Math.PI/2,0,6,p);}B(1.1,0.5,0.9,cA,0,0,0,p);g.userData.turret=t;g.userData.pitch=p;}
  else if(type==='radar'){B(2.2,1.6,2.2,cA,0,0.8,0);B(1.4,0.6,1.4,cB,0,1.9,0);C(0.15,1.2,wSteel,0,2.6,0);const t=new THREE.Group();t.position.y=3.2;g.add(t);
    const dish=new THREE.Mesh(new THREE.CylinderGeometry(1.8,0.35,0.5,16,1,true).rotateX(Math.PI/2.4),lam(0xd8dde3));dish.material.side=THREE.DoubleSide;t.add(dish);C(0.05,1.4,wSteel,0,0.2,-0.8,Math.PI/2.4,0,4,t);g.userData.spin=t;}
  else if(type==='fuel'){B(8,0.3,4.6,lam(0x8a867c),0,0.15,0);for(const x of[-1.9,1.9]){C(1.55,3.8,lam(0xc9c3b5),x,2.2,0,0,0,18);C(1.57,0.4,wRedM,x,3.0,0,0,0,18);C(0.12,1.4,wSteel,x,4.7,0.6);}
    B(4.2,0.18,0.18,wSteel,0,4.2,0);C(0.15,3.6,wSteel,0,0.6,1.9,0,Math.PI/2,6);}
  g.traverse(o=>{if(o.isMesh)o.receiveShadow=SHADOWS;});scene.add(g);return g;}
function warCandidates(){const out=[];const pad=PADS?PADS[padIdx()].p:MAPDEF.spawn.p;const ok=(x,z,y)=>Math.hypot(x-pad[0],z-pad[2])>55;
  for(const s of spots)if(ok(s.x,s.z,s.h)&&clearSpot(s.x,s.z,s.h,3,3.5)&&!isWater(s.x,s.z,s.h))out.push({x:s.x,z:s.z,y:s.h,roof:s.h-groundAt(s.x,s.z)>4});
  const b=mapBounds;for(let k=0;k<500&&out.length<80;k++){const x=b.x0+Math.random()*(b.x1-b.x0),z=b.z0+Math.random()*(b.z1-b.z0),y=groundAt(x,z);
    if(!ok(x,z,y)||!clearSpot(x,z,y,3.5,4))continue;if(isWater(x,z,y))continue;if(MAPDEF.terrain&&Math.abs(groundAt(x+3,z)-groundAt(x-3,z))+Math.abs(groundAt(x,z+3)-groundAt(x,z-3))>3)continue;out.push({x,z,y,roof:false});}
  return out;}
function newWave(){WAR.wave++;WAR.targets.forEach(t=>{scene.remove(t.g);scene.remove(t.lab);});WAR.targets=[];
  const C=warCandidates().sort(()=>Math.random()-.5),used=[];const pick=(roofPref)=>{let i=C.findIndex(c=>(roofPref==null||c.roof===roofPref)&&used.every(u=>Math.hypot(u.x-c.x,u.z-c.z)>14));if(i<0)i=C.findIndex(c=>used.every(u=>Math.hypot(u.x-c.x,u.z-c.z)>10));if(i<0)return null;const c=C.splice(i,1)[0];used.push(c);return c;};
  const n=4+WAR.wave*2,nAA=Math.min(1+WAR.wave,7),types=[];for(let k=0;k<nAA;k++)types.push('aa');types.push('radar');if(WAR.wave>=2)types.push('jam');if(WAR.wave>=1)types.push('fuel');while(types.length<n)types.push(Math.random()<0.5?'tank':'truck');
  for(const type of types){const c=pick(type==='aa'||type==='radar'?true:type==='tank'||type==='truck'||type==='fuel'||type==='jam'?false:null)||pick(null);if(!c)continue;
    const g=tModel(type);g.position.set(c.x,c.y,c.z);g.rotation.y=Math.random()*TAU;const t={type,g,alive:true,base:new V3(c.x,c.y,c.z),def:TDEF[type],fire:Math.random()*2,burst:0,move:null,smoke:0};
    if((type==='tank'||type==='truck'||type==='jam')&&!c.roof){for(let k=0;k<8;k++){const a=Math.random()*TAU,L=25+Math.random()*30,x2=c.x+Math.sin(a)*L,z2=c.z+Math.cos(a)*L,y2=groundAt(x2,z2);if(Math.abs(y2-c.y)>1.5)continue;let ok=true;for(let s=1;s<=8&&ok;s++){const u=s/8,xx=c.x+(x2-c.x)*u,zz=c.z+(z2-c.z)*u,yy=groundAt(xx,zz);if(!clearSpot(xx,zz,yy,3,3.5)||Math.abs(yy-c.y)>1.5||isWater(xx,zz,yy))ok=false;}if(ok){t.move={a:new V3(c.x,c.y,c.z),b:new V3(x2,y2,z2),u:0,dir:1,len:L,sp:type==='tank'?3:5};break;}}}
    t.lab=textSprite('▼','#ff4b4b',1.1);t.lab.visible=false;WAR.targets.push(t);}
  WAR.drones+=WAR.wave>1?2:0;WAR.nextT=0;stat('bestWave',WAR.wave);
  toast('⚔️ WAVE '+WAR.wave+' · '+WAR.targets.length+' targets'+(WAR.wave>1?' · +2 drones':''));}
function warSetup(){WAR.targets.forEach(t=>{scene.remove(t.g);scene.remove(t.lab);});WAR.targets=[];WAR.shots.forEach(s=>s.m.visible=false);
  if(S.activity!=='war')return;WAR.wave=0;WAR.drones=8;WAR.score=0;WAR.over=false;WAR.hp=100;newWave();}
const shotGeo=new THREE.BoxGeometry(0.09,0.09,2.4),shotMat=basic(0xffb347);
function aaFire(t,dt){if(D.crashed||WAR.respawnT>0)return;const tp=t.g.userData.turret,gp=_x1.copy(t.g.position);gp.y+=1.6;const d=gp.distanceTo(D.pos);if(d>170){t.burst=0;return;}
  const aim=_x2.copy(D.pos).addScaledVector(D.vel,d/150*(0.6+Math.min(0.35,WAR.wave*0.06))).sub(gp);const yaw=Math.atan2(-aim.x,-aim.z)-t.g.rotation.y,pit=Math.atan2(aim.y,Math.hypot(aim.x,aim.z));
  tp.rotation.y+=(((yaw-tp.rotation.y+Math.PI)%TAU+TAU)%TAU-Math.PI)*Math.min(1,dt*3);t.g.userData.pitch.rotation.x=pit;
  t.fire-=dt;if(t.fire>0)return;
  if(t.burst<=0){if(!losClear(gp,D.pos,6)){t.fire=0.5;return;}t.burst=1.1;WAR.lock=1;}
  t.burst-=0.075;t.fire=t.burst<=0?1.4+Math.random():0.075;
  let s=WAR.shots.find(x=>!x.m.visible);if(!s){if(WAR.shots.length>90)return;s={m:new THREE.Mesh(shotGeo,shotMat),v:new V3(),life:0};scene.add(s.m);WAR.shots.push(s);}
  const sp=(1.6-Math.min(0.8,WAR.wave*0.12))*DEG;s.v.copy(aim).normalize();s.v.x+=(Math.random()-.5)*sp*2;s.v.y+=(Math.random()-.5)*sp*2;s.v.z+=(Math.random()-.5)*sp*2;s.v.normalize().multiplyScalar(150);
  s.m.position.copy(gp);s.m.lookAt(_x3.copy(gp).add(s.v));s.m.visible=true;s.life=1.4;sfxShot(d);}
function shotsStep(dt){for(const s of WAR.shots){if(!s.m.visible)continue;s.life-=dt;if(s.life<=0){s.m.visible=false;continue;}
  const a=_x1.copy(s.m.position);s.m.position.addScaledVector(s.v,dt);const b=s.m.position;
  if(!D.crashed){const ab=_x2.copy(b).sub(a),t=Math.max(0,Math.min(1,_x3.copy(D.pos).sub(a).dot(ab)/ab.lengthSq())),cp=_x3.copy(a).addScaledVector(ab,t);
    if(cp.distanceTo(D.pos)<0.9){s.m.visible=false;WAR.hp-=26;shake=Math.max(shake,1.2);staticLvl=Math.max(staticLvl,0.5);rumble(0.7,0.9,160);sfxGraze();D.w.x+=(Math.random()-.5)*8;D.w.z+=(Math.random()-.5)*8;
      if(WAR.hp<=0){toast('💥 Shot down!');crash();}}}}}
const fireM=basic(0xffa21f,{transparent:true,opacity:1,depthWrite:false,blending:THREE.AdditiveBlending}),flashM=basic(0xfff3c4,{transparent:true,opacity:1,depthWrite:false}),smokeM=lam(0x2b2b2b,{transparent:true,opacity:.7,depthWrite:false});
const sphG=new THREE.SphereGeometry(1,12,8),boomLight=new THREE.PointLight(0xffa040,0,90,2);scene.add(boomLight);
const ringFlatG=new THREE.RingGeometry(0.8,1,40).rotateX(-Math.PI/2),waveM=basic(0xffe2a8,{transparent:true,opacity:1,depthWrite:false,side:THREE.DoubleSide,blending:THREE.AdditiveBlending});
function fxPuff(kind,p,s0,s1,life,vy){let f=WAR.fx.find(x=>!x.m.visible&&x.kind===kind);if(!f){if(WAR.fx.length>220)return;f={kind,m:new THREE.Mesh(kind==='ring'?ringFlatG:sphG,(kind==='fire'?fireM:kind==='flash'?flashM:kind==='ring'?waveM:smokeM).clone())};scene.add(f.m);WAR.fx.push(f);}
  f.m.position.copy(p);f.s0=s0;f.s1=s1;f.life=f.L=life;f.vy=vy||0;f.m.visible=true;f.m.scale.setScalar(s0);return f;}
const CH=[],chunkG=new THREE.BoxGeometry(1,1,1);
function chunks(p,n,mats){for(let k=0;k<n;k++){let c=CH.find(x=>!x.m.visible);if(!c){if(CH.length>90)return;c={m:new THREE.Mesh(chunkG,wWreckM),v:new V3(),av:new V3(),t:0};c.m.castShadow=SHADOWS;scene.add(c.m);CH.push(c);}
  c.m.material=mats[k%mats.length];const s=0.15+Math.random()*0.5;c.m.scale.set(s*1.3,s*0.5,s);c.m.position.copy(p);c.v.set((Math.random()-.5)*18,5+Math.random()*13,(Math.random()-.5)*18);c.av.set(Math.random()*12,Math.random()*12,Math.random()*12);c.t=5;c.m.visible=true;}}
function chunkStep(dt){for(const c of CH){if(!c.m.visible)continue;c.t-=dt;if(c.t<=0){c.m.visible=false;continue;}c.v.y-=G*dt;c.m.position.addScaledVector(c.v,dt);c.m.rotation.x+=c.av.x*dt;c.m.rotation.y+=c.av.y*dt;c.m.rotation.z+=c.av.z*dt;
  const g=groundH(c.m.position.x,c.m.position.z,c.m.position.y+1);if(c.m.position.y<g+0.1){c.m.position.y=g+0.1;c.v.y*=-0.3;c.v.x*=0.55;c.v.z*=0.55;c.av.multiplyScalar(0.4);}}}
const _fc1=new THREE.Color(0xffe58a),_fc2=new THREE.Color(0x5a1503);
function fxStep(dt){for(const f of WAR.fx){if(!f.m.visible)continue;f.life-=dt;if(f.life<=0){f.m.visible=false;continue;}const u=1-f.life/f.L;
    if(f.kind==='ring'){f.m.scale.setScalar(f.s0+(f.s1-f.s0)*Math.pow(u,0.6));f.m.material.opacity=1-u;continue;}
    f.m.scale.setScalar(f.s0+(f.s1-f.s0)*Math.sqrt(u));f.m.position.y+=f.vy*dt;
    if(f.kind==='fire'){f.m.material.color.copy(_fc1).lerp(_fc2,Math.max(0,(u-0.3)/0.7));f.m.material.opacity=1-u*u;}else f.m.material.opacity=(f.kind==='smoke'?0.7*Math.min(1,u*3):1)*(1-u*u);}
  boomLight.intensity=Math.max(0,boomLight.intensity-dt*60);chunkStep(dt);
  for(const t of WAR.targets)if(!t.alive){t.smoke-=dt;t.burn=(t.burn||0)-dt;
    if(t.burnN>0&&t.burn<=0){t.burn=0.12+Math.random()*0.1;t.burnN--;fxPuff('fire',_x1.copy(t.g.position).add(_x2.set((Math.random()-.5)*2.4,1.2+Math.random(),(Math.random()-.5)*2.4)),0.35,1.1+Math.random()*0.6,0.6,2.5);}
    if(t.smoke<=0&&t.smokeN>0){t.smoke=0.3;t.smokeN--;fxPuff('smoke',_x1.copy(t.g.position).add(_x2.set((Math.random()-.5)*2,2.2,(Math.random()-.5)*2)),1,4,3.4,2.6);}}}
function explode(p,big){const k=big?1.5:1;fxPuff('flash',p,0.5,7*k,0.2);fxPuff('ring',_x1.copy(p).setY(groundH(p.x,p.z,p.y+1)+0.3),1,(big?30:20),0.55);
  for(let i=0;i<(big?16:11);i++)fxPuff('fire',_x1.copy(p).add(_x2.set((Math.random()-.5)*3.5*k,Math.random()*2.5*k,(Math.random()-.5)*3.5*k)),0.6,(3+Math.random()*2)*k,0.6+Math.random()*0.5,1.8+Math.random()*2);
  for(let i=0;i<4;i++)fxPuff('fire',_x1.copy(p).add(_x2.set((Math.random()-.5)*1.5,1+i*1.6,(Math.random()-.5)*1.5)),0.5,(2.2-i*0.3)*k,0.9,4+i);
  for(let i=0;i<(big?10:7);i++)fxPuff('smoke',_x1.copy(p).add(_x2.set((Math.random()-.5)*5,1+Math.random()*3,(Math.random()-.5)*5)),1.2,(6+Math.random()*3)*k,3+Math.random()*2,2.8);
  boomLight.position.copy(p);boomLight.position.y+=2;boomLight.intensity=big?60:38;chunks(p,big?18:12,[wWreckM,wSteel,CAMO[0][0],CAMO[1][1]]);
  const d=camera.position.distanceTo(p);shake=Math.max(shake,Math.max(0.3,3-d/35));rumble(Math.min(1,30/(d+5)),Math.min(1,40/(d+5)),400);sfxBoom(d,big);if(d<45)slowMo(0.5);}
function killTarget(t,why){if(!t.alive)return;t.alive=false;t.lab.visible=false;t.g.traverse(o=>{if(o.isMesh)o.material=wWreckM;});if(t.g.userData.turret&&t.type==='tank'){const tu=t.g.userData.turret;tu.position.y+=0.6;tu.rotation.z=0.5;tu.rotation.x=0.3;}
  t.g.rotation.z=(Math.random()-.5)*0.25;t.g.position.y-=0.2;t.smokeN=60;t.smoke=0;t.burnN=150;t.burn=0;
  const pts=t.def.pts*(why==='direct'?1:0.7)|0;WAR.score+=pts;addCash(Math.round(pts/4));stat('kills');explode(_x1.copy(t.g.position).add(_x2.set(0,1.5,0)),t.type==='fuel');
  const nb=WAR.targets.filter(x=>x.alive&&x!==t&&x.g.position.distanceTo(t.g.position)<(t.def.blast||0));setTimeout(()=>nb.forEach(x=>killTarget(x,'chain')),250);
  toast((why==='direct'?'🎯 DIRECT HIT ':why==='chain'?'🔥 CHAIN REACTION ':'💥 SPLASH ')+t.type.toUpperCase()+' +'+pts);}
function detonate(p){if(WAR.det)return;WAR.det=true;let hit=0;for(const t of WAR.targets){if(!t.alive)continue;const d=t.g.position.distanceTo(p)-t.def.r;if(d<1.2){killTarget(t,'direct');hit++;}else if(d<6){killTarget(t,'splash');hit++;}}
  if(!hit)explode(p,false);WAR.drones--;WAR.respawnT=2.3;
  if(WAR.drones<=0&&WAR.targets.some(t=>t.alive)){WAR.over=true;const b=Math.max(store.get('warBest',0),WAR.score);store.set('warBest',b);setTimeout(()=>toast('☠️ MISSION OVER · wave '+WAR.wave+' · score '+WAR.score.toLocaleString()+' · best '+b.toLocaleString()),900);}}
function warStep(dt){if(S.activity!=='war')return;
  if(WAR.respawnT>0){WAR.respawnT-=dt;if(WAR.respawnT<=0){if(!WAR.over){resetDrone();}else{$('banner').textContent='MISSION OVER\nscore '+WAR.score.toLocaleString()+'\n'+(source==='controller'?'X':'L')+' for a new mission';}}}
  if(!D.crashed&&WAR.respawnT<=0){const sp=D.vel.length();for(const t of WAR.targets){if(!t.alive)continue;const c=_x1.copy(t.g.position);c.y+=t.def.hp[1];if(c.distanceTo(D.pos)<t.def.r+0.8&&sp>5){crash();break;}}}
  WAR.lock=Math.max(0,WAR.lock-dt*0.8);WAR.beepT-=dt;if(WAR.lock>0.2&&WAR.beepT<=0){WAR.beepT=0.28;tone(1400,1400,0.07,0.08,'square');}
  if(WAR.targets.length&&WAR.targets.every(t=>!t.alive)&&!WAR.over){WAR.nextT+=dt;if(WAR.nextT>3){addCash(150*WAR.wave);toast('✅ Wave cleared! +'+fmtCash(150*WAR.wave));newWave();}}
  shotsStep(dt);}
function warWorld(t,wdt){if(S.activity!=='war')return;
  for(const x of WAR.targets){const g=x.g;
    if(x.alive&&x.move&&wdt>0){const m=x.move;m.u+=m.dir*m.sp*wdt/m.len;if(m.u>1||m.u<0){m.dir*=-1;m.u=Math.max(0,Math.min(1,m.u));}g.position.lerpVectors(m.a,m.b,m.u);const dx=m.b.x-m.a.x,dz=m.b.z-m.a.z;g.rotation.y=Math.atan2(-dx*m.dir,-dz*m.dir);}
    if(x.alive&&g.userData.spin)g.userData.spin.rotation.y+=wdt*1.6;
    if(x.alive&&x.type==='aa'&&wdt>0&&started)aaFire(x,wdt);
    const h=x.def.hp;dynBox(g.position.x,g.position.y+h[1],g.position.z,Math.max(h[0],h[2]),h[1],Math.max(h[0],h[2]));
    x.lab.position.set(g.position.x,g.position.y+h[1]*2+3,g.position.z);}}
MAPDEF.updaters.push(warWorld);
function sfxBoom(d,big){if(!AC||!noiseBuf)return;const t=AC.currentTime,v=Math.min(1,(big?1.2:0.9)/(1+d/30)),s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseBuf;s.playbackRate.value=0.5;f.type='lowpass';f.frequency.setValueAtTime(900,t);f.frequency.exponentialRampToValueAtTime(90,t+2);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(0.001,t+2.6);s.connect(f);f.connect(g);g.connect(master);s.start(t+Math.min(0.4,d/340));s.stop(t+3.2);tone(70,32,1.2,v*0.6,'sine');}
function sfxShot(d){if(!AC||Math.random()<0.5)return;tone(220,120,0.05,Math.min(0.08,2.5/(5+d)),'square');}

// ---------------- hooks called by the core game ----------------
function extSetup(){buildLZ();lzShow(S.activity==='free');aiSetup();filmSetup();tbSetup();warSetup();raceLaps=0;stat('map',MAP);}
function extReset(){BAT.e=1;BAT.warn=0;SIG.home.copy(D.pos);SIG.fs=false;SIG.lost=0;WAR.hp=100;WAR.det=false;raceLaps=0;aiPark();LZ.air=0;LZ.hold=0;}
function extCrash(){stat('crashes');if(S.activity==='war')detonate(D.pos.clone());}
function extLap(t){const p=AI.on&&AI.run?aiPos():0;raceLaps++;stat('laps');{const pay=gates.length*12+(t<=(best||1e9)+0.001?100:0)+(p===1?150:p===2?80:p===3?40:0);addCash(pay);setTimeout(()=>toast('💵 Lap pay +'+fmtCash(pay)),900);}if(AI.on&&AI.run){toast(['','🥇 P1','🥈 P2','🥉 P3','P4'][p]+' · lap '+fmtT(t));if(p===1){stat('aiWins');if(S.ai==='hard')stat('aiHardWins');}}}
function extGate(){if(nextGate===1&&AI.on&&!AI.run)aiStart();}
function extStep(dt){if(S.battery&&!D.crashed&&!(D.grounded&&D.motor<0.05)){BAT.e-=(0.0018+0.0125*Math.pow(D.motor,1.35))*GAR.drain/GAR.cap*dt;
    if(BAT.e<0.2&&BAT.warn===0){BAT.warn=1;toast('🔋 Low battery · land soon');tone(900,900,0.25,0.15,'square');}if(BAT.e<=0&&BAT.warn<2){BAT.warn=2;toast('🔋 Battery dead');}}
  lzStep(dt);}
function extFrame(dt){const sp=D.vel.length();if(!D.crashed&&!(D.grounded&&D.motor<0.05)){STATS.time+=dt;STATS.dist+=sp*dt;}
  statT+=dt;if(statT>3){statT=0;store.set('stats',STATS);careerCheck();}
  sigStep(dt);aiStep(dt);filmStep(dt);tbStep();warStep(dt);}
const tgtUI=$('tgtUI'),tgtPool=[],_sv=new V3();let tgtArrow=null;
function warUI(){const on=S.activity==='war'&&started&&!PH.on&&!RB.on&&!menuOpen;let used=0,near=null,nd=1e9;
  if(on){const W=innerWidth,H=innerHeight;for(const t of WAR.targets){if(!t.alive)continue;const c=_sv.copy(t.g.position);c.y+=t.def.hp[1];const d=c.distanceTo(camera.position);if(d<nd){nd=d;near=t;}
      c.project(camera);if(c.z>1||Math.abs(c.x)>1.05||Math.abs(c.y)>1.05){t.onscr=false;continue;}t.onscr=true;
      let el=tgtPool[used];if(!el){el=document.createElement('div');el.className='tbox';el.innerHTML='<i></i><b></b>';tgtUI.appendChild(el);tgtPool.push(el);}used++;
      const sz=Math.max(22,Math.min(110,1400/d));el.style.display='block';el.style.left=((c.x+1)/2*W)+'px';el.style.top=((1-c.y)/2*H)+'px';el.style.width=el.style.height=sz+'px';el.lastChild.textContent=t.type.toUpperCase()+' '+Math.round(d)+'m';el.firstChild.style.display=t===near?'block':'none';}}
  for(let i=used;i<tgtPool.length;i++)tgtPool[i].style.display='none';
  if(!tgtArrow){tgtArrow=document.createElement('div');tgtArrow.className='tarr';tgtUI.appendChild(tgtArrow);}
  if(on&&near&&!near.onscr){const c=_sv.copy(near.g.position).project(camera);let x=c.x,y=c.y;if(c.z>1){x=-x;y=-y;}const a=Math.atan2(y,x),W=innerWidth,H=innerHeight,r=Math.min(W,H)*0.42;
    tgtArrow.style.display='block';tgtArrow.style.left=(W/2+Math.cos(a)*r*W/Math.min(W,H)*0.9)+'px';tgtArrow.style.top=(H/2-Math.sin(a)*r)+'px';tgtArrow.style.transform='translate(-50%,-50%) rotate('+(-a+Math.PI/2)+'rad)';tgtArrow.dataset.d=Math.round(nd)+'m';}
  else tgtArrow.style.display='none';}
function extVisual(dt){fxStep(dt);updSpeedFx(dt);warUI();dynRes(dt);
  for(const z of LZ.list)if(z.g.visible)z.g.children[2].material.opacity=0.22+0.1*Math.sin(worldT*3);}
// ---------------- performance: dynamic resolution, merged statics ----------------
const DR={t:0,n:0,scale:1,base:renderer.getPixelRatio()};
function dynRes(dt){if(!S.dynRes||!started){DR.t=0;DR.n=0;return;}DR.t+=dt;DR.n++;if(DR.t<2)return;const fps=DR.n/DR.t;DR.t=0;DR.n=0;let s=DR.scale;
  if(fps<45&&s>0.55)s=Math.max(0.55,s-0.1);else if(fps>57&&s<1)s=Math.min(1,s+0.05);if(s!==DR.scale){DR.scale=s;renderer.setPixelRatio(DR.base*s);renderer.setSize(innerWidth,innerHeight);}}
function mergeStatic(){if(!MERGE_CAND)return;const groups=new Map();let removed=0;
  for(const c of MERGE_CAND){const o=c.o;if(o.parent!==scene||!o.visible)continue;o.updateMatrixWorld();if(!o.matrixWorld.equals(c.m))continue;
    const mats=Array.isArray(o.material)?o.material:[o.material];if(mats.some(m=>m.transparent||m.isShaderMaterial||m.isPointsMaterial))continue;
    const at=Object.keys(o.geometry.attributes).filter(a=>a==='position'||a==='normal'||a==='uv').sort().join(',');if(!at.includes('normal'))continue;
    const key=mats.map(m=>m.uuid).join(',')+'|'+at+'|'+(Array.isArray(o.material)?'A':'S')+(o.castShadow?1:0)+(o.receiveShadow?1:0);let g=groups.get(key);if(!g){g=[];groups.set(key,g);}g.push(o);}
  for(const list of groups.values()){if(list.length<3)continue;const o0=list[0],arr=Array.isArray(o0.material),nm=arr?o0.material.length:1,attrs=Object.keys(o0.geometry.attributes).filter(a=>a==='position'||a==='normal'||a==='uv');
    const geos=list.map(o=>{const g=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();g.applyMatrix4(o.matrixWorld);return g;});
    const ranges=[];for(let mi=0;mi<nm;mi++)for(const g of geos){if(arr&&g.groups.length){for(const gr of g.groups)if(gr.materialIndex===mi)ranges.push([g,gr.start,Math.min(gr.count,g.attributes.position.count-gr.start),mi]);}else if(mi===0)ranges.push([g,0,g.attributes.position.count,0]);}
    const total=ranges.reduce((a,r)=>a+r[2],0);if(total>600000)continue;const out=new THREE.BufferGeometry();
    for(const a of attrs){const it=geos[0].attributes[a].itemSize,buf=new Float32Array(total*it);let off=0;for(const[g,st,cnt]of ranges){buf.set(g.attributes[a].array.subarray(st*it,(st+cnt)*it),off);off+=cnt*it;}out.setAttribute(a,new THREE.BufferAttribute(buf,it));}
    if(arr){let base=0,cur=-1,start=0;for(const r of ranges){if(r[3]!==cur){if(cur>=0)out.addGroup(start,base-start,cur);cur=r[3];start=base;}base+=r[2];}out.addGroup(start,base-start,cur);}
    const m=new THREE.Mesh(out,o0.material);m.castShadow=o0.castShadow;m.receiveShadow=o0.receiveShadow;m.matrixAutoUpdate=false;scene.add(m);
    for(const o of list){scene.remove(o);removed++;}geos.forEach(g=>g.dispose());}
  MERGE_CAND=null;window.__rbMerged=removed;}
function extTarget(){if(S.activity==='war'){let best=null,bd=1e9;for(const t of WAR.targets){if(!t.alive)continue;const d=t.g.position.distanceTo(D.pos);if(d<bd){bd=d;best=t;}}return best?_p.copy(best.g.position).setY(best.g.position.y+2):null;}
  if(S.activity==='film'&&FILM.sub)return _p.copy(FILM.f.p).setY(FILM.f.p.y-3.5);
  return null;}
function extOSD(tc,tr){
  if(S.activity==='war'){tc='⚔️ KAMIKAZE · WAVE '+WAR.wave+'  SCORE '+WAR.score.toLocaleString()+'\nDRONES '+'▮'.repeat(Math.max(0,WAR.drones))+(WAR.over?'  · MISSION OVER':'')+'\n'+(D.crashed?'':'ARMED  HP '+'▮'.repeat(Math.max(0,Math.ceil(WAR.hp/25))))+(WAR.lock>0.2?'  ⚠ AA LOCK':'')+(SIG.jam>0.05?'  ⚠ JAMMED':'');
    tr='TARGETS '+WAR.targets.filter(t=>t.alive).length+'/'+WAR.targets.length;}
  else if(S.activity==='film'){const st=FILM.state==='ready'?'GET CLOSE TO THE PILOT (orange)':FILM.state==='done'?'WRAP · '+FILM.res+'%':FILM.t<0?'ROLLING IN '+Math.ceil(-FILM.t):'SHOT '+Math.round((FILM.cur||0)*100)+'%  AVG '+Math.round(FILM.q/Math.max(0.01,FILM.n)*100)+'%  '+Math.max(0,FILM.dur-FILM.t).toFixed(0)+'s'+(FILM.lost>1.5?'  ⚠ LOST':'');
    tc='🎬 FILM GIG  '+fmtCash(cash)+'\n'+st+'\nkeep them centred, 5–15 m away, fly smooth';tr='';}
  else if(S.activity==='build'){const k=source==='controller';tc='🛠 TRACK BUILDER · '+TB.pts.length+' gates\n'+(k?'D-pad ↑ place · ↓ undo · → save':'B place gate · N undo · K save')+'\nfly where each gate should be';tr='';}
  else if(S.activity==='free'&&LZ.cur)tc+='\nLANDING '+'▮'.repeat(Math.ceil(LZ.hold*5))+'▯'.repeat(Math.max(0,5-Math.ceil(LZ.hold*5)));
  if(S.activity==='race'&&AI.on)tr+='\nPOS '+(AI.run?aiPos():1)+'/'+(AI.list.length+1);
  if(S.battery){tr+=(tr?'\n':'')+'🔋 '+Math.max(0,Math.round(BAT.e*100))+'%';if(BAT.e<0.2&&Math.floor(worldT*3)%2)tc+='\nLAND NOW';}
  if(S.signal||SIG.jam>0)tr+=(tr?'\n':'')+'RSSI '+Math.round(SIG.q*99)+(SIG.fs?' FAILSAFE':'');
  return[tc,tr];}

