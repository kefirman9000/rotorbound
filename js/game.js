'use strict';
// ---------------- steam ----------------
let steamPts=null;const STEAM_PER=22,STEAM_LIFE=3.2;
if(steamVents.length){const n=steamVents.length*STEAM_PER,pos=new Float32Array(n*3);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const tex=canvasTex(64,64,(c)=>{const gr=c.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gr;c.fillRect(0,0,64,64);});
  steamPts=new THREE.Points(g,new THREE.PointsMaterial({map:tex,color:0xdfe5ec,size:3.2,transparent:true,opacity:0.45,depthWrite:false}));steamPts.frustumCulled=false;scene.add(steamPts);}
function updSteam(t){if(!steamPts)return;const a=steamPts.geometry.attributes.position.array;let k=0;
  for(const v of steamVents)for(let i=0;i<STEAM_PER;i++,k++){const age=((t+v.ph+i*STEAM_LIFE/STEAM_PER)%STEAM_LIFE),f=age/STEAM_LIFE;
    a[k*3]=v.x+Math.sin(i*7.3+t*0.8)*0.4*f+wind.x*age*0.3;a[k*3+1]=v.y+age*1.6;a[k*3+2]=v.z+Math.cos(i*5.1+t*0.7)*0.4*f+wind.z*age*0.3;}
  steamPts.geometry.attributes.position.needsUpdate=true;}

// ---------------- collision grid ----------------
const GS=16,grid=new Map(),bigCols=[];let stampN=0;
for(const c of colliders){const i0=Math.floor(c.min.x/GS),i1=Math.floor(c.max.x/GS),j0=Math.floor(c.min.z/GS),j1=Math.floor(c.max.z/GS);if((i1-i0+1)*(j1-j0+1)>600){bigCols.push(c);continue;}for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const k=i*100003+j;let a=grid.get(k);if(!a){a=[];grid.set(k,a);}a.push(c);}}
const nearList=[];
function gatherNear(px,pz,rad){nearList.length=0;stampN++;const i0=Math.floor((px-rad)/GS),i1=Math.floor((px+rad)/GS),j0=Math.floor((pz-rad)/GS),j1=Math.floor((pz+rad)/GS);for(let i=i0;i<=i1;i++)for(let j=j0;j<=j1;j++){const a=grid.get(i*100003+j);if(a)for(const c of a)if(c.st!==stampN){c.st=stampN;nearList.push(c);}}for(const c of bigCols)nearList.push(c);for(const c of dynCols)nearList.push(c);return nearList;}

// ---------------- tracks & gates ----------------
const SPAWN_PLAZA=MAPDEF.spawn;
const TRACKS=MAPDEF.tracks;
const TRACK_IDS=Object.keys(TRACKS);
if(!TRACKS[S.track])S.track=TRACK_IDS[0];
const GATE_R=3.0;
const gateGeo=new THREE.TorusGeometry(3.3,0.3,10,40);
let gates=[];
const beacon=new THREE.Mesh(new THREE.CylinderGeometry(0.25,0.25,80,8,1,true),basic(0x39ff88,{transparent:true,opacity:.25,depthWrite:false}));scene.add(beacon);
let nextGate=0,lapStart=null,lastLap=null,best=null,ghostData=null,rec=[];
function buildGates(){
  gates.forEach(g=>{scene.remove(g.mesh);g.mat.dispose();});gates=[];
  if(S.activity!=='race')return;
  const pts=TRACKS[S.track].pts,n=pts.length;
  gates=pts.map((p,k)=>{
    const c=new V3(p[0],p[1],p[2]),s=p[3]||1;
    const pr=pts[(k-1+n)%n],nx=pts[(k+1)%n];
    const a=c.clone().sub(new V3(pr[0],pr[1],pr[2])).normalize(),b=new V3(nx[0],nx[1],nx[2]).sub(c).normalize();
    const nrm=a.add(b);if(nrm.lengthSq()<1e-4)nrm.copy(b);nrm.normalize();
    const mat=basic(0xffffff,{transparent:true,opacity:.55});
    const m=new THREE.Mesh(gateGeo,mat);m.position.copy(c);m.scale.setScalar(s);m.lookAt(c.clone().add(nrm));scene.add(m);
    return {c,n:nrm,s,mesh:m,mat};
  });
}
function paintGates(){if(!gates.length)return;gates.forEach((g,k)=>{if(k===nextGate){g.mat.color.set(0x39ff88);g.mat.opacity=1;}else if(k===(nextGate+1)%gates.length){g.mat.color.set(0xffd23f);g.mat.opacity=.85;}else{g.mat.color.set(0xffffff);g.mat.opacity=.45;}});}
let raceLine=null;
function buildRacingLine(){if(raceLine){scene.remove(raceLine);raceLine.geometry.dispose();raceLine=null;}
  if(S.activity!=='race'||!S.racingLine||!ghostData||ghostData.f.length<7*8)return;
  const f=ghostData.f,pts=[];for(let i=0;i<f.length;i+=7*3)pts.push(new V3(f[i],f[i+1]-0.15,f[i+2]));
  const curve=new THREE.CatmullRomCurve3(pts);raceLine=new THREE.Mesh(new THREE.TubeGeometry(curve,pts.length*3,0.07,5,false),basic(0x3fc8ff,{transparent:true,opacity:0.45,depthWrite:false}));scene.add(raceLine);}
function loadTrackRecords(){best=store.get('best.'+S.track,null);ghostData=store.get('ghost.'+S.track,null);lastLap=null;buildRacingLine();}
function addToBoard(t){const k='board.'+S.track,b=store.get(k,[]);b.push({t:+t.toFixed(2),d:new Date().toISOString().slice(0,10)});b.sort((x,y)=>x.t-y.t);store.set(k,b.slice(0,10));}

const ghost=new THREE.Group();
ghost.add(new THREE.Mesh(new THREE.SphereGeometry(0.4,12,8),basic(0x3fc8ff,{transparent:true,opacity:.3,depthWrite:false})));
ghost.add(new THREE.Mesh(new THREE.BoxGeometry(0.34,0.04,0.34),basic(0x9fe6ff,{transparent:true,opacity:.6})));
ghost.visible=false;scene.add(ghost);
const _gq1=new QT(),_gq2=new QT();
function updGhost(){
  ghost.visible=false;
  if(S.activity!=='race'||!S.ghost||!ghostData||lapStart===null)return;
  const f=ghostData.f,frames=f.length/7,tt=(simT-lapStart)/GH_DT,i=Math.floor(tt);
  if(i<0||i+1>=frames)return;
  const a=i*7,b=a+7,u=tt-i;
  ghost.position.set(f[a]+(f[b]-f[a])*u,f[a+1]+(f[b+1]-f[a+1])*u,f[a+2]+(f[b+2]-f[a+2])*u);
  _gq1.set(f[a+3],f[a+4],f[a+5],f[a+6]);_gq2.set(f[b+3],f[b+4],f[b+5],f[b+6]);ghost.quaternion.copy(_gq1).slerp(_gq2,u);
  ghost.visible=true;
}
function recordFrame(){const k=Math.floor((simT-lapStart)/GH_DT);while(rec.length/7<=k){const p=D.pos,q=D.q;rec.push(+p.x.toFixed(2),+p.y.toFixed(2),+p.z.toFixed(2),+q.x.toFixed(3),+q.y.toFixed(3),+q.z.toFixed(3),+q.w.toFixed(3));}}

// ---------------- courier jobs ----------------
const spots=MAPDEF.spots;
const markGeo=new THREE.CylinderGeometry(2.2,2.2,0.08,28);
const markA=new THREE.Mesh(markGeo,basic(0xffd23f,{transparent:true,opacity:.85})),markB=new THREE.Mesh(markGeo,basic(0x39ff88,{transparent:true,opacity:.85}));
markA.visible=markB.visible=false;scene.add(markA);scene.add(markB);
const job={state:'none',from:null,to:null,t:0,par:0,m:0,pay:0,hold:0,doneT:0};
function fmtCash(v){return '$'+Math.round(v).toLocaleString();}
function newJob(){
  const dist=(a,x,z)=>Math.hypot(a.x-x,a.z-z);
  let fr=spots.filter(s=>{const d=dist(s,D.pos.x,D.pos.z);return d>25&&d<220;});if(!fr.length)fr=spots;
  const from=fr[Math.floor(Math.random()*fr.length)];
  let to=spots.filter(s=>{const d=dist(s,from.x,from.z);return d>90&&d<300;});if(!to.length)to=spots.filter(s=>s!==from);
  job.from=from;job.to=to[Math.floor(Math.random()*to.length)];
  const d=dist(job.to,from.x,from.z);
  job.m=0.25+Math.random()*0.5;job.par=Math.round(15+d/11);job.pay=Math.round(40+d*0.6+job.m*80);
  job.state='pickup';job.t=0;job.hold=0;job.doneT=0;
  markA.position.set(from.x,from.h+0.06,from.z);markB.position.set(job.to.x,job.to.h+0.06,job.to.z);
  markA.visible=true;markB.visible=false;
  toast('📦 New job: '+(job.m>0.55?'heavy':job.m>0.4?'medium':'light')+' package · '+fmtCash(job.pay));
}
function courierStep(dt){
  if(job.state==='deliver')job.t+=dt;
  if(job.state==='done'){job.doneT+=dt;if(job.doneT>2.5)newJob();return;}
  if(job.state!=='pickup'&&job.state!=='deliver')return;
  const t=job.state==='pickup'?job.from:job.to;
  const ok=D.grounded&&Math.hypot(D.pos.x-t.x,D.pos.z-t.z)<2.5&&Math.abs(D.pos.y-(t.h+R))<0.8&&D.vel.length()<2.5;
  job.hold=ok?job.hold+dt:0;
  if(job.hold<0.7)return;
  job.hold=0;
  if(job.state==='pickup'){job.state='deliver';job.t=0;markA.visible=false;markB.visible=true;pkg.visible=true;sfxDing();rumble(0.4,0.6,180);toast('Package loaded. Deliver within '+fmtT(job.par).slice(0,-3));}
  else{const late=job.t>job.par,pay=late?Math.round(job.pay*0.4):job.pay+Math.round((job.par-job.t)*3);addCash(pay);stat('deliveries');job.state='done';markB.visible=false;pkg.visible=false;sfxDing();rumble(0.6,0.8,250);toast((late?'⏱ Late delivery ':'✅ Delivered! ')+'+'+fmtCash(pay));}
}

// ---------------- hidden tokens ----------------
const tokenPts=MAPDEF.tokens;
let gotTokens=new Set(store.get(TOK_KEY,[]));
const tokenGeo=new THREE.OctahedronGeometry(0.7,0),tokenMat=basic(0xffd23f);
const tokens=tokenPts.map((p,i)=>{const m=new THREE.Mesh(tokenGeo,tokenMat);m.position.set(p[0],p[1],p[2]);m.visible=!gotTokens.has(i);scene.add(m);return m;});
function tokenStep(){for(let i=0;i<tokens.length;i++){const m=tokens[i];if(!m.visible)continue;if(m.position.distanceToSquared(D.pos)<2.6){m.visible=false;gotTokens.add(i);store.set(TOK_KEY,[...gotTokens]);addCash(75);stat('tokens');sfxDing();rumble(0.3,0.7,150);toast('◆ Token '+gotTokens.size+'/'+tokens.length+'  +$50');}}}

// ---------------- drone ----------------
const DRONE_MAT={};
function applyLook(){const g=c=>partOf(c,garage.eq[c]);if(DRONE_MAT.frame)DRONE_MAT.frame.color.setHex(g('paint').col);if(DRONE_MAT.led)DRONE_MAT.led.color.setHex(g('led').col);if(DRONE_MAT.prop)DRONE_MAT.prop.color.setHex(g('propc').col);document.documentElement.style.setProperty('--osd',g('osd').css);}
const drone=new THREE.Group();setTimeout(()=>drone.scale.setScalar(GAR.scale),0);
{const dark=DRONE_MAT.frame=lam(0x1b1d22);
 drone.add(new THREE.Mesh(new THREE.BoxGeometry(0.11,0.045,0.18),dark));
 for(const a of[45,-45]){const arm=new THREE.Mesh(new THREE.BoxGeometry(0.34,0.014,0.03),dark);arm.rotation.y=a*DEG;drone.add(arm);}
 const cam=new THREE.Mesh(new THREE.BoxGeometry(0.035,0.035,0.03),lam(0xff8a1f));cam.position.set(0,0.01,-0.1);drone.add(cam);
 const led=new THREE.Mesh(new THREE.BoxGeometry(0.06,0.01,0.01),DRONE_MAT.led=basic(0xff2d55));led.position.set(0,0,0.095);drone.add(led);
 const led2=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.01,0.01),basic(0xffffff));led2.position.set(0,-0.02,-0.095);drone.add(led2);}
const props=[];{const pg=new THREE.CylinderGeometry(0.065,0.065,0.004,16),pmat=DRONE_MAT.prop=basic(0x3fc8ff,{transparent:true,opacity:.35});
 for(const[x,z]of[[.12,.12],[-.12,.12],[.12,-.12],[-.12,-.12]]){const p=new THREE.Mesh(pg,pmat);p.position.set(x,0.025,z);drone.add(p);props.push(p);}}
const pkg=new THREE.Mesh(new THREE.BoxGeometry(0.13,0.1,0.13),lam(0xb5834a));pkg.position.set(0,-0.09,0);pkg.visible=false;drone.add(pkg);
scene.add(drone);applyLook();
const headlight=new THREE.SpotLight(0xfff4e0,0,120,0.45,0.6,1);scene.add(headlight);scene.add(headlight.target);

const D={pos:new V3(),prev:new V3(),vel:new V3(),q:new QT(),w:new V3(),motor:0,heading:0,crashed:false,crashT:0,grounded:true,spin:new V3(),near:99,grace:0};
const SAFE={buf:[],t:0};let lastGatePt=null;
let simT=0,worldT=0,flightT=0;
let PADS=null;
function buildPads(){const sp=MAPDEF.spawn,pads=[{n:'Main pad',p:sp.p,h:sp.h||0}];
  const dirn=(x,z)=>['N','NE','E','SE','S','SW','W','NW'][(Math.round(Math.atan2(x,-z)/TAU*8)+8)%8];
  const far=(s)=>pads.every(q=>Math.hypot(s.x-q.p[0],s.z-q.p[2])>45);
  const clear=s=>{for(const c of gatherNear(s.x,s.z,2)){if(c.disabled||c.ramp)continue;if(s.x>c.min.x-0.9&&s.x<c.max.x+0.9&&s.z>c.min.z-0.9&&s.z<c.max.z+0.9&&c.max.y>s.h+0.15&&c.min.y<s.h+2.5)return false;}return true;};
  const cand=spots.filter(s=>Math.hypot(s.x-sp.p[0],s.z-sp.p[2])>25&&clear(s));
  const hi=cand.filter(s=>s.h-groundH(s.x,s.z,0)>6).sort((a,b)=>b.h-a.h),lo=cand.filter(s=>s.h-groundH(s.x,s.z,0)<=6);
  const add=(s,roof)=>{const base=(roof?(MAPDEF.terrain?'High point ':'Rooftop '):'Ground ')+dirn(s.x,s.z)+(roof?' · '+Math.round(s.h-groundH(s.x,s.z,0))+' m':'');let n=base,k=2;while(pads.some(q=>q.n===n))n=base+' '+k++;pads.push({n,p:[s.x,s.h,s.z],h:Math.atan2(s.x,s.z)});};
  for(const s of hi){if(pads.length>=4)break;if(far(s))add(s,true);}
  for(const s of lo){if(pads.length>=7)break;if(far(s))add(s,false);}
  PADS=pads;
  const ring=new THREE.RingGeometry(1.05,1.3,4,1).rotateZ(Math.PI/4).rotateX(-Math.PI/2),pm=new THREE.MeshBasicMaterial({color:0x39ff88,side:THREE.DoubleSide,fog:true});
  for(const q of pads){const m=new THREE.Mesh(ring,pm);m.position.set(q.p[0],q.p[1]+0.04,q.p[2]);scene.add(m);}}
const padIdx=()=>Math.min(PADS.length-1,Math.max(0,store.get('pad.'+MAP,0)));
function spawnPoint(){if(S.activity==='race')return TRACKS[S.track].spawn;if(S.activity==='film'&&typeof filmTrack==='function')return TRACKS[filmTrack()].spawn;if(!PADS)buildPads();return PADS[padIdx()];}
function cyclePad(d){if(!PADS)buildPads();store.set('pad.'+MAP,(padIdx()+d+PADS.length)%PADS.length);}
function resetDrone(){_resetDrone0();if(typeof extReset==='function')extReset();}
function _resetDrone0(){
  const sp=spawnPoint();
  D.pos.set(sp.p[0],sp.p[1]+R+0.02,sp.p[2]);D.prev.copy(D.pos);D.vel.set(0,0,0);D.q.setFromAxisAngle(UP,sp.h);D.w.set(0,0,0);D.motor=0;D.heading=sp.h;D.crashed=false;D.crashT=0;
  kb.thr=0;touch.thr=0;placeKnob('L',0,1);staticLvl=0;$('banner').textContent='';flightT=0;pkg.visible=false;
  nextGate=0;lapStart=null;rec=[];paintGates();resetTricks();D.grace=0;SAFE.buf.length=0;lastGatePt=null;
  chasePos.copy(D.pos).add(new V3(Math.sin(sp.h)*2.4,1,Math.cos(sp.h)*2.4));
  if(S.activity==='courier')newJob();
}
function respawnAfterCrash(){
  if(S.activity==='war'){if(!WAR.over&&WAR.respawnT<=0)resetDrone();return;}
  _respawnAfterCrash0();
  if(S.respawn==='section'&&S.activity==='race'&&lastGatePt){lapStart=null;rec=[];toast('🔁 Practice: retry from gate '+nextGate+' · lap timer off');}
  if(S.activity!=='race')extReset();
}
function _respawnAfterCrash0(){
  if(S.respawn==='start'){resetDrone();return;}
  let p=null,h=0;
  if(S.activity==='race'&&lastGatePt){p=lastGatePt.p;h=Math.atan2(-lastGatePt.n.x,-lastGatePt.n.z);}
  else for(let i=SAFE.buf.length-1;i>=0;i--){if(SAFE.buf[i].t<simT-1.5){p=SAFE.buf[i].p;h=SAFE.buf[i].h;break;}}
  if(!p){resetDrone();return;}
  D.pos.copy(p);D.prev.copy(p);D.vel.set(0,0,0);D.w.set(0,0,0);D.q.setFromAxisAngle(UP,h);D.heading=h;D.crashed=false;D.crashT=0;D.motor=hoverThr();D.grace=2;
  kb.thr=hoverThr();staticLvl=0.6;$('banner').textContent='';resetTricks();
  if(S.activity==='courier'&&job.state==='failed')newJob();
  chasePos.copy(D.pos).add(new V3(Math.sin(h)*2.4,1,Math.cos(h)*2.4));toast('Respawned at your last safe spot');
}
function setupActivity(){buildGates();loadTrackRecords();if(S.activity!=='courier'){job.state='none';markA.visible=markB.visible=false;}resetDrone();extSetup();}

// ---------------- tricks ----------------
const T={rp:0,rr:0,ry:0,combo:[],pts:0,timer:0,prox:0,apex:0,diving:false,total:store.get('trickTotal',0),bestCombo:store.get('bestCombo',0),cd:new Map()};
function inPark(p){return !!PARK&&p.x>PARK.x0&&p.x<PARK.x1&&p.z>PARK.z0&&p.z<PARK.z1;}
function resetTricks(){T.rp=T.rr=T.ry=0;T.combo=[];T.pts=0;T.timer=0;T.prox=0;T.diving=false;T.apex=D.pos.y;}
function addTrick(name,pts){T.combo.push(name);if(T.combo.length>=3&&T.combo.length%2)slowMo(0.5);T.pts+=pts;T.timer=2.6;sfxTrick(T.combo.length);rumble(0.15,0.4,70);}
function bankCombo(){
  const mult=T.combo.length,park=inPark(D.pos)?2:1,score=T.pts*mult*park;
  T.total+=score;stat('combos');store.set('trickTotal',T.total);const pay=Math.round(score/10);addCash(pay);
  const nb=score>T.bestCombo;if(nb){T.bestCombo=score;store.set('bestCombo',score);}
  toast((nb?'🏆 NEW BEST ':'')+'COMBO ×'+mult+(park>1?' · PARK ×2':'')+'  '+score.toLocaleString()+' pts  +'+fmtCash(pay));
  T.combo=[];T.pts=0;
}
const _tp=new V3(),_tp2=new V3();
function trickStep(dt){
  if(S.activity!=='free')return;
  const air=!D.grounded&&D.pos.y-groundH(D.pos.x,D.pos.z,D.pos.y)>1.2,sp=D.vel.length();
  T.rp+=D.w.x*dt;T.rr+=D.w.z*dt;T.ry+=D.w.y*dt;
  if(Math.abs(D.w.x)<1)T.rp*=1-1.5*dt;if(Math.abs(D.w.z)<1)T.rr*=1-1.5*dt;if(Math.abs(D.w.y)<1)T.ry*=1-1.5*dt;
  if(air){
    if(Math.abs(T.rp)>=TAU){addTrick(sp>14?'POWER LOOP':(T.rp<0?'FRONTFLIP':'BACKFLIP'),sp>14?250:120);T.rp=0;}
    if(Math.abs(T.rr)>=TAU){const cork=Math.abs(T.rp)>2;addTrick(cork?'CORKSCREW':'ROLL',cork?220:100);T.rr=0;}
    if(Math.abs(T.ry)>=TAU){addTrick('360',60);T.ry=0;}
  }else{T.rp=T.rr=T.ry=0;}
  if(air&&D.near<1.6&&sp>12){T.prox+=dt;}else{if(T.prox>0.4)addTrick('PROXIMITY '+T.prox.toFixed(1)+'s',Math.round(T.prox*90));T.prox=0;}
  if(D.vel.y>0.5||D.grounded){T.apex=D.pos.y;T.diving=false;}
  if(D.vel.y<-12)T.diving=true;
  if(T.diving&&D.vel.y>-2&&air){const drop=T.apex-D.pos.y;if(drop>25)addTrick('DIVE '+drop.toFixed(0)+'m',Math.round(drop*5));T.diving=false;T.apex=D.pos.y;}
  for(const z of gapZones){const d0=_tp.copy(D.prev).sub(z.c).dot(z.n),d1=_tp2.copy(D.pos).sub(z.c).dot(z.n);if(d0*d1<0){const t=d0/(d0-d1);_tp.copy(D.prev).lerp(D.pos,t);if(z.test(_tp)&&(T.cd.get(z)||0)<simT){T.cd.set(z,simT+2);addTrick(z.name,z.pts);}}}
  if(T.combo.length){T.timer-=dt;if(T.timer<=0)bankCombo();}
}

// ---------------- input ----------------
const inp={thr:0,yaw:0,pitch:0,roll:0};
let source='keyboard';
const kb={thr:0,keys:new Set(),yaw:0,pitch:0,roll:0};
const touch={thr:0,yaw:0,pitch:0,roll:0};
function dzv(v,d){const a=Math.abs(v);return a<d?0:Math.sign(v)*(a-d)/(1-d);}
function dz(v){return dzv(v,S.dzL);}
function axisRaw(ax,i){let v=ax[i]||0;const c=S.cal;if(c&&c.c&&c.c[i]!=null){const ctr=c.c[i],mn=c.mn[i],mx=c.mx[i];v=v>=ctr?(v-ctr)/Math.max(0.05,(mx??1)-ctr):(v-ctr)/Math.max(0.05,ctr-(mn??-1));}return Math.max(-1,Math.min(1,v));}
function axisN(ax,i){return dzv(axisRaw(ax,i),i<2?S.dzL:S.dzR);}
let gpIndex=null,prevBtn=[],gpName='';
addEventListener('gamepadconnected',e=>{gpIndex=e.gamepad.index;gpName=e.gamepad.id;toast('🎮 Controller connected');updPad();});
addEventListener('gamepaddisconnected',e=>{if(gpIndex===e.gamepad.index){gpIndex=null;toast('Controller disconnected');updPad();}});
function updPad(){$('padState').innerHTML=gpIndex!==null?'🎮 <b style="color:#39ff88">'+(gpName.replace(/\(.*?\)/g,'').trim()||'Controller')+'</b> connected':'🎮 No controller · plug in or pair one and press any button';}
function getPad(){const pads=navigator.getGamepads?navigator.getGamepads():[];if(gpIndex!==null&&pads[gpIndex])return pads[gpIndex];for(const p of pads)if(p&&p.connected){gpIndex=p.index;gpName=p.id;updPad();return p;}return null;}
function rumble(strong,weak,ms){if(!S.rumble)return;const p=getPad();const a=p&&p.vibrationActuator;if(a&&a.playEffect)a.playEffect('dual-rumble',{duration:ms,strongMagnitude:strong,weakMagnitude:weak}).catch(()=>{});}
const hoverThr=()=>1/(S.thrustRatio*GAR.thr);
function restartOrNewJob(){if(S.activity==='war'){warSetup();resetDrone();return;}if(S.activity==='film'){FILM.trackId=null;resetDrone();filmSetup();return;}if(S.activity==='courier')newJob();else if(S.activity==='race'){nextGate=0;lapStart=null;rec=[];paintGates();toast('Lap restarted');}}
const pad={lx:0,ly:0,rx:0,ry:0,lt:0,rt:0};
let navHold={dir:0,t:0},viewHold=0,rewindHeld=false,kbRewind=false,turtleHeld=false;
function pollPad(dt){
  const p=getPad();if(!p){pad.lx=pad.ly=pad.rx=pad.ry=pad.lt=pad.rt=0;return;}
  const ax=p.axes,b=p.buttons;const bv=i=>b[i]?(b[i].value||(b[i].pressed?1:0)):0;
  const pressed=i=>bv(i)>0.5&&!(prevBtn[i]>0.5);
  pad.lx=axisN(ax,0);pad.ly=axisN(ax,1);pad.rx=axisN(ax,2);pad.ry=axisN(ax,3);pad.lt=bv(6);pad.rt=bv(7);
  if(CT.open){ctrlPoll(p,dt,pressed,bv);prevBtn=b.map(x=>x?(x.value||(x.pressed?1:0)):0);return;}
  if(CA.open){if(pressed(0)||pressed(1)||pressed(9))closeCareer();if(pressed(4)||pressed(5)||pressed(14)||pressed(15)){CA.tab^=1;renderCareer();}if(bv(13)>.5||ax[1]>.6)$('caBody').scrollTop+=12;if(bv(12)>.5||ax[1]<-.6)$('caBody').scrollTop-=12;prevBtn=b.map(x=>x?(x.value||(x.pressed?1:0)):0);return;}
  if(GA.open){let dir=0;if(bv(12)>.5||ax[1]<-.6)dir=-1;else if(bv(13)>.5||ax[1]>.6)dir=1;let side=0;if(bv(14)>.5||ax[0]<-.6)side=-1;else if(bv(15)>.5||ax[0]>.6)side=1;const code=dir*10+side;
    if(code!==0){if(navHold.dir!==code){navHold={dir:code,t:0.35};garageNav(dir,side);}else{navHold.t-=dt;if(navHold.t<=0){navHold.t=0.14;garageNav(dir,side);}}}else navHold.dir=0;
    if(pressed(0))garageActivate();if(pressed(1)||pressed(9))closeGarage();prevBtn=b.map(x=>x?(x.value||(x.pressed?1:0)):0);return;}
  if(menuOpen){
    let dir=0;if(bv(12)>.5||ax[1]<-.6)dir=-1;else if(bv(13)>.5||ax[1]>.6)dir=1;
    let side=0;if(bv(14)>.5||ax[0]<-.6)side=-1;else if(bv(15)>.5||ax[0]>.6)side=1;
    const code=dir*10+side;
    if(code!==0){if(navHold.dir!==code){navHold={dir:code,t:0.35};menuNav(dir,side);}else{navHold.t-=dt;if(navHold.t<=0){navHold.t=0.11;menuNav(dir,side);}}}else navHold.dir=0;
    if(pressed(0))menuActivate();
    if(pressed(4))setTab(mTab-1);if(pressed(5))setTab(mTab+1);
    if(pressed(1)||pressed(9))closeMenu();
  }else if(helpOpen){
    if(pressed(0)||pressed(1)||pressed(9))closeHelp();
  }else if(!started){
    let dir=0;if(bv(12)>.5||ax[1]<-.6)dir=-1;else if(bv(13)>.5||ax[1]>.6)dir=1;
    let side=0;if(bv(14)>.5||ax[0]<-.6)side=-1;else if(bv(15)>.5||ax[0]>.6)side=1;
    const code=dir*10+side;
    if(code!==0){if(navHold.dir!==code){navHold={dir:code,t:0.35};tNav(dir,side);}else{navHold.t-=dt;if(navHold.t<=0){navHold.t=0.11;tNav(dir,side);}}}else navHold.dir=0;
    if(pressed(0))tActivate();if(pressed(9))openMenu();
    if(pressed(4)||pressed(5))tChange(TROWS[1],pressed(4)?-1:1);
  }else if(PH.on){
    if(Math.abs(pad.lx)+Math.abs(pad.ly)+Math.abs(pad.rx)+Math.abs(pad.ry)+pad.lt+pad.rt>0.05)source='controller';
    if(pressed(0))takePhoto();if(pressed(1)||pressed(11)||pressed(9))exitPhoto();if(pressed(4))cycleTod(-1);if(pressed(5))cycleTod(1);
  }else if(RB.on){
    if(pressed(1))RB.cam=(RB.cam+1)%4;if(pressed(0)||pressed(10)||pressed(9))exitReplay();if(pressed(2))RB.paused=!RB.paused;
  }else{
    const B=S.bind,val=bd=>bd.t==='b'?bv(bd.i):axisN(ax,bd.i)*(bd.inv?-1:1),btn=a=>B.btn[a];
    const tv=val(B.thr);let thr;
    if(S.layout==='trigger')thr=Math.max(0,tv);
    else if(S.layout==='stick')thr=(tv+1)/2;
    else{const h=hoverThr();thr=tv>=0?h+tv*(1-h):h*(1+tv);}
    const yaw=val(B.yaw),roll=val(B.roll),pitch=val(B.pitch);
    const active=Math.abs(yaw)+Math.abs(roll)+Math.abs(pitch)+(S.layout==='trigger'?thr:Math.abs(tv))>0.05||b.some(x=>x&&x.pressed);
    if(active)source='controller';
    if(source==='controller'){inp.thr=Math.max(0,Math.min(1,thr));inp.yaw=yaw;inp.roll=roll;inp.pitch=pitch*(S.invertPitch?-1:1);}
    // view button: tap = camera, hold = rewind
    const vb=bv(btn('view'))>0.5;
    if(vb){viewHold+=dt;if(viewHold>0.3)rewindHeld=true;}else{if(viewHold>0&&viewHold<=0.3)toggleView();viewHold=0;rewindHeld=kbRewind;}
    turtleHeld=bv(btn('turtle'))>0.5||K('g')===1;
    if(pressed(btn('respawn'))&&D.crashed)respawnAfterCrash();
    if(pressed(btn('mode')))toggleMode();
    if(pressed(btn('lap')))restartOrNewJob();
    if(pressed(btn('tiltDn')))setTilt(S.tilt-5);
    if(pressed(btn('tiltUp')))setTilt(S.tilt+5);
    if(pressed(btn('reset')))resetDrone();
    if(pressed(btn('menu')))openMenu();
    if(pressed(btn('replay')))enterReplay();
    if(pressed(btn('photo')))enterPhoto();
    if(S.activity==='build'){if(pressed(12))tbPlace();if(pressed(13))tbUndo();if(pressed(15))tbSave();}
  }
  prevBtn=b.map(x=>x?(x.value||(x.pressed?1:0)):0);
}
addEventListener('keydown',e=>{
  const k=e.key.toLowerCase();
  if(['arrowup','arrowdown','arrowleft','arrowright',' ','backspace','tab'].includes(k))e.preventDefault();
  if(CT.open){ctrlKey(k);return;}
  if(GA.open){garageKey(k);return;}
  if(CA.open){careerKey(k);return;}
  if(menuOpen){if(k==='arrowup'||k==='w')menuNav(-1,0);else if(k==='arrowdown'||k==='s')menuNav(1,0);else if(k==='arrowleft'||k==='a')menuNav(0,-1);else if(k==='arrowright'||k==='d')menuNav(0,1);else if(k==='enter'||k===' ')menuActivate();else if(k==='q'||(k==='tab'&&e.shiftKey))setTab(mTab-1);else if(k==='e'||k==='tab')setTab(mTab+1);else if(k==='escape'||k==='p')closeMenu();return;}
  if(helpOpen){if(k==='escape'||k==='enter'||k===' ')closeHelp();return;}
  if(!started){if(k==='arrowup'||k==='w')tNav(-1,0);else if(k==='arrowdown'||k==='s')tNav(1,0);else if(k==='arrowleft'||k==='a')tNav(0,-1);else if(k==='arrowright'||k==='d')tNav(0,1);else if(k==='enter'||k===' ')tActivate();else if(k==='escape')openMenu();return;}
  kb.keys.add(k);
  if(e.repeat)return;
  if(PH.on){source='keyboard';if(k==='enter'||k==='p')takePhoto();else if(k==='f'||k==='escape')exitPhoto();else if(k==='['||k==='z')cycleTod(-1);else if(k===']'||k==='x')cycleTod(1);return;}
  if(RB.on){if(k==='c')RB.cam=(RB.cam+1)%4;else if(k===' ')RB.paused=!RB.paused;else if(k==='t'||k==='escape'||k==='enter')exitReplay();return;}
  source='keyboard';
  if(k==='r')resetDrone();else if(k==='c')toggleView();else if(k==='m')toggleMode();else if(k==='q')setTilt(S.tilt-5);else if(k==='e')setTilt(S.tilt+5);
  else if(k===' ')kb.thr=hoverThr();else if(k==='l')restartOrNewJob();else if(k==='t')enterReplay();else if(k==='f')enterPhoto();
  else if(k==='escape'||k==='p')openMenu();else if(k==='enter'&&D.crashed)respawnAfterCrash();else if(k==='b')tbPlace();else if(k==='n')tbUndo();else if(k==='k')tbSave();else if(k==='backspace'){kbRewind=true;rewindHeld=true;}
});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();kb.keys.delete(k);if(k==='backspace'){kbRewind=false;rewindHeld=false;}});
addEventListener('blur',()=>kb.keys.clear());
const K=k=>kb.keys.has(k)?1:0;
function pollKeyboard(dt){
  if(source==='keyboard')turtleHeld=K('g')===1;
  if(source!=='keyboard')return;
  kb.thr=Math.max(0,Math.min(1,kb.thr+(K('w')-K('s'))*0.8*dt));
  const ease=(cur,tgt)=>cur+(tgt-cur)*Math.min(1,dt*7);
  kb.yaw=ease(kb.yaw,K('d')-K('a'));kb.pitch=ease(kb.pitch,K('arrowup')-K('arrowdown'));kb.roll=ease(kb.roll,K('arrowright')-K('arrowleft'));
  inp.thr=kb.thr;inp.yaw=kb.yaw;inp.pitch=kb.pitch;inp.roll=kb.roll;
}
const isTouch=('ontouchstart' in window)||matchMedia('(pointer:coarse)').matches;
function placeKnob(side,x,y){const k=$('st'+side).firstElementChild;k.style.transform=`translate(${x*47}px,${y*47}px)`;}
function bindStick(side){
  const el=$('st'+side);let id=null;
  const upd=e=>{const r=el.getBoundingClientRect();let x=(e.clientX-r.left-r.width/2)/(r.width/2),y=(e.clientY-r.top-r.height/2)/(r.height/2);const l=Math.hypot(x,y);if(l>1){x/=l;y/=l;}placeKnob(side,x,y);source='touch';if(side==='L'){touch.yaw=x;touch.thr=(1-y)/2;}else{touch.roll=x;touch.pitch=-y;}};
  el.addEventListener('pointerdown',e=>{id=e.pointerId;el.setPointerCapture(id);upd(e);if(!started)startGame();});
  el.addEventListener('pointermove',e=>{if(e.pointerId===id)upd(e);});
  const end=e=>{if(e.pointerId!==id)return;id=null;if(side==='L'){touch.yaw=0;placeKnob('L',0,1-touch.thr*2);}else{touch.roll=0;touch.pitch=0;placeKnob('R',0,0);}};
  el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);
}
if(isTouch){$('stL').style.display=$('stR').style.display='block';bindStick('L');bindStick('R');placeKnob('L',0,1);}
function pollTouch(){if(source!=='touch')return;inp.thr=touch.thr;inp.yaw=touch.yaw;inp.pitch=touch.pitch;inp.roll=touch.roll;}
$('bMenu').onclick=()=>openMenu();$('bView').onclick=()=>toggleView();$('bMode').onclick=()=>toggleMode();$('bReset').onclick=()=>D.crashed?respawnAfterCrash():resetDrone();$('bReplay').onclick=()=>RB.on?exitReplay():enterReplay();$('bPhoto').onclick=()=>PH.on?takePhoto():enterPhoto();

function toggleView(){S.view=S.view==='fpv'?'chase':'fpv';save();toast(S.view==='fpv'?'FPV camera':'Chase camera');}
function toggleMode(){S.mode=S.mode==='angle'?'horizon':S.mode==='horizon'?'acro':'angle';if(S.mode==='angle')syncHeading();save();toast({acro:'ACRO mode (flips & rolls)',horizon:'HORIZON mode (levels at center stick, flips at full stick)',angle:'ANGLE mode (self-level)'}[S.mode]);rumble(0,0.3,80);}
function setTilt(t){S.tilt=Math.max(0,Math.min(50,t));save();toast('Camera uptilt '+S.tilt+'°');}
const _e=new THREE.Euler();
function syncHeading(){_e.setFromQuaternion(D.q,'YXZ');D.heading=_e.y;}

// ---------------- wind ----------------
const wind=new V3();
function updWind(){
  if(S.activity==='race'||!S.wind){wind.set(0,0,0);return;}
  const t=simT,base=3.5+2.5*Math.sin(t*0.05),ang=t*0.03+1.3;
  const gust=Math.max(0,Math.sin(t*0.7)*Math.sin(t*0.23+1))*7;
  const hf=Math.min(1,Math.max(0,D.pos.y)/40);
  const mag=(base+gust)*(0.3+0.7*hf)*(S.wind===2?1.8:1);
  wind.set(Math.cos(ang)*mag,0,Math.sin(ang)*mag);
}

// ---------------- physics ----------------
const _v=new V3(),_v2=new V3(),_q=new QT(),_q2=new QT(),_tgtW=new V3(),_rel=new V3();
// Betaflight "actual" rates: RC rate, super rate, expo per axis
function bfRate(x,rc,sr,ex){const a=Math.abs(x),xe=x*a*a*a*ex+x*(1-ex);let r=200*rc*xe;if(sr>0)r/=Math.max(0.01,1-Math.abs(xe)*sr);return Math.max(-1998,Math.min(1998,r))*DEG;}
function rateOf(ax,x){return bfRate(x,S[ax+'Rc'],S[ax+'Sr'],S[ax+'Ex']);}
function thrCurve(x){const m=S.thrMid,e=S.thrExpo,t=x-m,rng=t>0?1-m:m,n=rng>0?t/rng:0;return Math.max(0,Math.min(1,m+t*(1-e+e*n*n)));}
function crash(){
  if(D.crashed)return;D.crashed=true;D.crashT=0;D.spin.set((Math.random()-.5)*20,(Math.random()-.5)*20,(Math.random()-.5)*20);staticLvl=1;rumble(1,1,350);sfxCrash();
  if(S.activity==='courier'&&job.state==='deliver'){job.state='failed';markB.visible=false;pkg.visible=false;toast('💥 Package destroyed');}
  if(T.combo.length){toast('💥 COMBO LOST ('+T.combo.length+' tricks)');T.combo=[];T.pts=0;}
  $('banner').textContent=S.activity==='war'?'💥 BOOM':'CRASHED\n'+(source==='controller'?'A respawn · hold LT turtle · View restart':source==='touch'?'tap ↺ to respawn':'Enter respawn · hold G turtle · R restart');
  extCrash();
}
function collide(){
  D.grounded=false;D.near=99;
  {const gh=groundH(D.pos.x,D.pos.z,D.pos.y);let gnx=0,gny=1,gnz=0;
   if(MAPDEF.terrain&&onTerrain(D.pos.x,D.pos.z,D.pos.y)){const T2=MAPDEF.terrain,e=0.6;gnx=-(T2(D.pos.x+e,D.pos.z)-T2(D.pos.x-e,D.pos.z))/(2*e);gnz=-(T2(D.pos.x,D.pos.z+e)-T2(D.pos.x,D.pos.z-e))/(2*e);const L=Math.hypot(gnx,1,gnz);gnx/=L;gny=1/L;gnz/=L;}
   const gd=(D.pos.y-gh)*gny;if(gd-R<D.near)D.near=Math.max(0,gd-R);
   if(gd<R){const push=R-gd;D.pos.x+=gnx*push;D.pos.y+=gny*push;D.pos.z+=gnz*push;const vn=D.vel.x*gnx+D.vel.y*gny+D.vel.z*gnz;
     if(vn<0){if(!D.crashed&&(-vn>CRASH_V*GAR.tough||(gny>0.9&&Math.hypot(D.vel.x,D.vel.z)>16)))crash();D.vel.x-=gnx*vn*1.15;D.vel.y-=gny*vn*1.15;D.vel.z-=gnz*vn*1.15;}D.vel.x*=0.9;D.vel.z*=0.9;D.grounded=true;}}
  const list=gatherNear(D.pos.x,D.pos.z,2.4);
  for(let i=0;i<list.length;i++){const c=list[i];
    if(c.disabled)continue;
    if(c.ramp){rampCollide(c);continue;}
    const cx=Math.max(c.min.x,Math.min(D.pos.x,c.max.x)),cy=Math.max(c.min.y,Math.min(D.pos.y,c.max.y)),cz=Math.max(c.min.z,Math.min(D.pos.z,c.max.z));
    const dx=D.pos.x-cx,dy=D.pos.y-cy,dzz=D.pos.z-cz,d2=dx*dx+dy*dy+dzz*dzz;
    if(d2<5.76){const dd=Math.sqrt(d2)-R;if(dd<D.near)D.near=dd;}
    if(d2>=R*R)continue;
    let nx,ny,nz;const dist=Math.sqrt(d2);
    if(dist<1e-5){
      const pen=[[D.pos.x-c.min.x,-1,0,0],[c.max.x-D.pos.x,1,0,0],[D.pos.y-c.min.y,0,-1,0],[c.max.y-D.pos.y,0,1,0],[D.pos.z-c.min.z,0,0,-1],[c.max.z-D.pos.z,0,0,1]].sort((a,b)=>a[0]-b[0])[0];
      nx=pen[1];ny=pen[2];nz=pen[3];D.pos.x+=nx*(pen[0]+R);D.pos.y+=ny*(pen[0]+R);D.pos.z+=nz*(pen[0]+R);
    }else{nx=dx/dist;ny=dy/dist;nz=dzz/dist;D.pos.set(cx+nx*R,cy+ny*R,cz+nz*R);}
    const vn=D.vel.x*nx+D.vel.y*ny+D.vel.z*nz;
    if(vn<0){if(c.soft&&!D.crashed){graze(-vn);D.vel.x-=nx*vn;D.vel.y-=ny*vn;D.vel.z-=nz*vn;D.vel.multiplyScalar(0.84);}
      else{if(!D.crashed&&-vn>CRASH_V*GAR.tough)crash();D.vel.x-=nx*vn*1.25;D.vel.y-=ny*vn*1.25;D.vel.z-=nz*vn*1.25;D.vel.multiplyScalar(ny>0.7?0.9:0.94);}}
    if(ny>0.7)D.grounded=true;
  }
}
let lastGraze=-9,washF=0;
function graze(sp){if(simT-lastGraze>0.18){rumble(0.25,0.55,90);sfxGraze();if(sp>4)toast('Clipped it!');}lastGraze=simT;shake=Math.max(shake,0.7);
  D.w.x+=(Math.random()-.5)*7;D.w.z+=(Math.random()-.5)*7;if(S.mode!=='acro'){_e.set((Math.random()-.5)*0.25,0,(Math.random()-.5)*0.25);_q2.setFromEuler(_e);D.q.multiply(_q2);}}
function rampCollide(c){const r=c.ramp;if(D.pos.x<c.min.x-R||D.pos.x>c.max.x+R||D.pos.z<c.min.z-R||D.pos.z>c.max.z+R)return;
  const a=r.axis==='x'?D.pos.x:D.pos.z,t=Math.max(0,Math.min(1,(a-r.a0)/(r.a1-r.a0))),y=r.h0+(r.h1-r.h0)*t,sl=(r.h1-r.h0)/(r.a1-r.a0);
  const nx=r.axis==='x'?-sl:0,nz=r.axis==='z'?-sl:0,inv=1/Math.hypot(nx,1,nz),NX=nx*inv,NY=inv,NZ=nz*inv;
  const d=(D.pos.y-y)*NY;if(d>2.6||d<-1.5)return;if(d-R<D.near)D.near=Math.max(0,d-R);if(d>=R)return;
  const push=R-d;D.pos.x+=NX*push;D.pos.y+=NY*push;D.pos.z+=NZ*push;
  const vn=D.vel.x*NX+D.vel.y*NY+D.vel.z*NZ;if(vn<0){if(!D.crashed&&-vn>CRASH_V*GAR.tough)crash();D.vel.x-=NX*vn*1.1;D.vel.y-=NY*vn*1.1;D.vel.z-=NZ*vn*1.1;D.vel.multiplyScalar(0.92);}
  D.grounded=true;}
function physics(dt){
  simT+=dt;D.prev.copy(D.pos);
  if(D.crashed&&turtleHeld&&(D.grounded||D.turtling)&&D.crashT>0.4){D.turtling=true;
    const up=_v.copy(UP).applyQuaternion(D.q);
    if(up.y>0.8){D.turtling=false;D.crashed=false;D.spin.set(0,0,0);D.w.set(0,0,0);syncHeading();$('banner').textContent='';staticLvl=0.3;toast('🐢 Turtle flip! Back in the air');return;}
    const axv=_v2.copy(up).cross(UP);if(axv.lengthSq()<1e-6)axv.set(1,0,0);axv.normalize();_q.setFromAxisAngle(axv,4*dt);D.q.premultiply(_q).normalize();
    D.vel.multiplyScalar(0.9);D.motor=0.35;collide();return;
  }
  if(D.crashed){
    D.crashT+=dt;D.turtling=false;
    if(!D.grounded){const s=D.spin.length();if(s>1e-4){_q.setFromAxisAngle(_v.copy(D.spin).divideScalar(s),s*dt);D.q.multiply(_q);}}else D.spin.multiplyScalar(0.9);
    D.motor+=(0-D.motor)*Math.min(1,dt*6);
    D.vel.y-=G*dt;D.vel.multiplyScalar(1-0.4*dt);D.pos.addScaledVector(D.vel,dt);collide();
    if(S.activity==='courier')courierStep(dt);
    extStep(dt);
    return;
  }
  const cargo=S.activity==='courier'&&job.state==='deliver'?job.m:S.activity==='war'?0.25:0;
  if(S.mode==='acro'||S.mode==='horizon'){
    _tgtW.set(-rateOf('pitch',inp.pitch),-rateOf('yaw',inp.yaw),-rateOf('roll',inp.roll));
    if(S.mode==='horizon'){const str=Math.max(0,1-Math.max(Math.abs(inp.pitch),Math.abs(inp.roll))*1.3);if(str>0){_q2.copy(D.q).invert();const bu=_v2.copy(UP).applyQuaternion(_q2);_tgtW.x+=bu.z*7*str;_tgtW.z+=-bu.x*7*str;}}
    D.w.lerp(_tgtW,1-Math.exp(-30*GAR.resp/(1+2*cargo*GAR.cargo)*dt));
    const s=D.w.length();if(s>1e-6){_q.setFromAxisAngle(_v.copy(D.w).divideScalar(s),s*dt);D.q.multiply(_q).normalize();}
  }else{
    D.heading+=-inp.yaw*Math.abs(inp.yaw)*220*DEG*dt;
    _e.set(-inp.pitch*S.angleMax*DEG,D.heading,-inp.roll*S.angleMax*DEG,'YXZ');
    _q2.setFromEuler(_e);D.q.slerp(_q2,1-Math.exp(-9/(1+cargo)*dt));D.w.set(0,0,0);
  }
  const up=_v.copy(UP).applyQuaternion(D.q);
  if(D.grace>0)D.grace-=dt;
  let tIn=thrCurve(inp.thr);
  if(S.altHold&&S.mode!=='acro'){const mid=S.layout==='hover'?hoverThr():0.5,cmd=inp.thr>=mid?(inp.thr-mid)/(1-mid):(inp.thr-mid)/mid;const vzT=cmd*7;tIn=Math.max(0,Math.min(1,(G+4.5*(vzT-D.vel.y))*(1+cargo*GAR.cargo)/(S.thrustRatio*GAR.thr*G)/Math.max(0.35,up.y)));}
  if(D.grace>0)tIn=Math.max(tIn,hoverThr());
  const chop=D.motor-tIn;
  D.motor+=(tIn-D.motor)*(1-Math.exp(-14*GAR.resp*dt));
  // prop wash: descending into your own wash, or chopping throttle hard, shakes the quad
  if(S.propWash){let pw=(D.vel.y<-3&&D.motor>0.12)?Math.min(1,(-D.vel.y-3)/8)*(0.5+D.motor):0;if(chop>0.3)pw+=0.4;
    if(pw>0.02){if(S.mode==='angle'){_e.set((Math.random()-.5)*0.06*pw,0,(Math.random()-.5)*0.06*pw);_q2.setFromEuler(_e);D.q.multiply(_q2);}else{D.w.x+=(Math.random()-.5)*pw*1.6;D.w.z+=(Math.random()-.5)*pw*1.6;}}washF=pw;}
  const thrust=D.motor*S.thrustRatio*GAR.thr*batK()*G/(1+cargo*GAR.cargo);
  _rel.copy(D.vel).sub(wind);const rs=_rel.length();
  _v2.copy(up).multiplyScalar(thrust);_v2.y-=G;
  _v2.addScaledVector(_rel,(-0.06-0.013*rs)*GAR.drag);
  D.vel.addScaledVector(_v2,dt);
  D.pos.addScaledVector(D.vel,dt);
  collide();
  if(D.grounded&&thrust*up.y<G){_e.setFromQuaternion(D.q,'YXZ');_q2.setFromAxisAngle(UP,_e.y);D.q.slerp(_q2,1-Math.exp(-6*dt));if(S.mode==='angle')D.heading=_e.y;}
  if(S.activity==='race'&&gates.length){
    if(lapStart!==null)recordFrame();
    const g=gates[nextGate];const d0=_v.copy(D.prev).sub(g.c).dot(g.n),d1=_v2.copy(D.pos).sub(g.c).dot(g.n);
    if(d0<0&&d1>=0){const t=d0/(d0-d1);_v.copy(D.prev).lerp(D.pos,t);if(_v.distanceTo(g.c)<GATE_R*g.s)passGate();}
  }
  if(S.activity==='courier')courierStep(dt);
  trickStep(dt);extStep(dt);
}
function fmtT(t){if(t==null)return '--:--.--';const m=Math.floor(t/60),s=t-m*60;return m+':'+(s<10?'0':'')+s.toFixed(2);}
function passGate(){
  if(nextGate===0){
    if(lapStart!==null){
      lastLap=simT-lapStart;const nb=best==null||lastLap<best;addToBoard(lastLap);
      if(nb){best=lastLap;store.set('best.'+S.track,best);recordFrame();ghostData={t:lastLap,f:rec};store.set('ghost.'+S.track,ghostData);buildRacingLine();}
      toast((nb?'🏆 NEW BEST ':'LAP ')+fmtT(lastLap));rumble(0.6,0.8,250);extLap(lastLap);
    }
    lapStart=simT;rec=[];
  }else rumble(0.2,0.5,90);
  {const g=gates[nextGate];lastGatePt={p:g.c.clone().addScaledVector(g.n,2.5),n:g.n.clone()};}
  sfxDing();nextGate=(nextGate+1)%gates.length;paintGates();extGate();
}

