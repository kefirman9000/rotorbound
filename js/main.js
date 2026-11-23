'use strict';
let _shF=0;
function frame(now){
  requestAnimationFrame(frame);
  const dt=Math.min(0.1,(now-last)/1000);last=now;
  pollPad(dt);
  const live=started&&!menuOpen&&!GA.open&&!CA.open&&!helpOpen&&!RB.on&&!PH.on&&!window.__rbHold;
  const frozen=menuOpen||GA.open||CA.open||(helpOpen&&started)||window.__rbFreezeWorld,wdt=frozen?0:dt;
  worldT+=wdt;
  dynCols.length=0;updCranes(worldT);if(updTrain)updTrain(worldT);updTraffic(worldT,wdt);updFans(worldT);updSteam(worldT);for(const f of MAPDEF.updaters)f(worldT,wdt);updDebris(dt,live);updAircraft(worldT,dt,live);updWeather(dt);updFireworks(dt);updSearch(worldT);if(updParkRides)updParkRides(worldT,wdt);
  for(const m of tokens)if(m.visible)m.rotation.y=worldT*2;
  if(live&&rewindHeld&&RB.buf.length>2){
    pollKeyboard(dt);
    const n=Math.max(1,Math.round(dt*45));for(let k=0;k<n&&RB.buf.length>2;k++)RB.buf.pop();
    const f=RB.buf[RB.buf.length-1],g=RB.buf[RB.buf.length-2];D.pos.set(f[0],f[1],f[2]);D.prev.copy(D.pos);D.q.set(f[3],f[4],f[5],f[6]);D.motor=f[7];
    D.vel.set((f[0]-g[0])*30,(f[1]-g[1])*30,(f[2]-g[2])*30);D.w.set(0,0,0);if(D.crashed){D.crashed=false;$('banner').textContent='';}syncHeading();D.grace=0.6;rewinding=true;
    staticLvl=Math.max(staticLvl,0.25);
  }else if(live){
    if(rewinding){rewinding=false;SAFE.buf.length=0;}
    pollKeyboard(dt);pollTouch();updWind();
    if(SHADOWS&&S.quality==='medium'){renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=(++_shF%2===0);}
  acc+=dt*timeScale();while(acc>=STEP){physics(STEP);acc-=STEP;}
    tokenStep();recordReplay(dt);updSegments(dt);updVaults(dt);extFrame(dt);
    SAFE.t+=dt;if(SAFE.t>0.5){SAFE.t=0;if(!D.crashed&&D.near>2.5&&D.pos.y-groundH(D.pos.x,D.pos.z,D.pos.y)>1.5&&D.vel.length()<28){_e.setFromQuaternion(D.q,'YXZ');SAFE.buf.push({p:D.pos.clone(),h:_e.y,t:simT});if(SAFE.buf.length>30)SAFE.buf.shift();}}
    if(!D.crashed&&!(D.grounded&&D.motor<0.05))flightT+=dt;
  }else acc=0;
  applyTod();
  const tg=started?currentTarget():null;
  beacon.visible=!!tg&&!PH.on&&!RB.on;if(tg)beacon.position.set(tg.x,tg.y+3.5+40,tg.z);
  if(RB.on){updReplay(dt);ghost.visible=false;}else if(PH.on)updPhoto(dt);else{updCamera(dt);updGhost();}
  {const fv=fovNow();if(Math.abs(camera.fov-fv)>0.05){camera.fov+=(fv-camera.fov)*Math.min(1,dt*6);camera.updateProjectionMatrix();}}
  extVisual(dt);
  // trigger rumble: RT hums with motor load, LT pulses while turtling
  trigT+=dt;if(trigT>0.12){trigT=0;if(S.trigRumble&&S.rumble&&started){const p=getPad(),a=p&&p.vibrationActuator;if(a&&a.playEffect&&(!a.effects||a.effects.includes('trigger-rumble'))){const r=live&&!D.crashed&&S.bind.thr.t==='b'?Math.min(1,D.motor*0.35+washF*0.4):0,l=turtleHeld&&D.crashed?0.6:0;if(r>0.02||l>0)a.playEffect('trigger-rumble',{duration:150,startDelay:0,leftTrigger:l,rightTrigger:r,strongMagnitude:0,weakMagnitude:0}).catch(()=>{});}}}
  $('banner').style.display=rewinding?'block':'';if(rewinding)$('banner').textContent='◀◀ REWIND';else if($('banner').textContent==='◀◀ REWIND')$('banner').textContent='';
  updHeadlight();updOSD();updFx(dt);updAudio();
  renderer.render(scene,camera);
}
buildGates();loadTrackRecords();resetDrone();
if(SHADOWS)scene.traverse(o=>{if(!o.isMesh||o===sky)return;const m=Array.isArray(o.material)?o.material[0]:o.material;if(!m||m.transparent||m.isShaderMaterial)return;o.castShadow=true;o.receiveShadow=!m.isMeshBasicMaterial;});
function __check(){const out={};const near=(p,r)=>{const l=gatherNear(p.x,p.z,r+1);let md=99;for(const c of l){if(dynCols.includes(c)||c.disabled)continue;if(c.ramp&&p.x>=c.min.x&&p.x<=c.max.x&&p.z>=c.min.z&&p.z<=c.max.z){const R2=c.ramp,u=((R2.axis==='x'?p.x:p.z)-R2.a0)/(R2.a1-R2.a0),h=R2.h0+(R2.h1-R2.h0)*u;md=Math.min(md,p.y>=h?p.y-h:0);continue;}const cx=Math.max(c.min.x,Math.min(p.x,c.max.x)),cy=Math.max(c.min.y,Math.min(p.y,c.max.y)),cz=Math.max(c.min.z,Math.min(p.z,c.max.z));md=Math.min(md,Math.hypot(p.x-cx,p.y-cy,p.z-cz));}return Math.min(md,p.y-groundH(p.x,p.z,p.y));};
  for(const id of TRACK_IDS){const pts=TRACKS[id].pts,iss=[];pts.forEach((q,k)=>{const c=new V3(q[0],q[1],q[2]),r=GATE_R*(q[3]||1);const d=near(c,r);if(d<Math.min(1.2,r*0.5))iss.push('gate '+k+' blocked d='+d.toFixed(2));const nq=pts[(k+1)%pts.length],e=new V3(nq[0],nq[1],nq[2]),len=c.distanceTo(e);for(let t=0;t<=len;t+=0.7){const p=c.clone().lerp(e,t/len);const dd=near(p,0.6);if(dd<0.45){iss.push('seg '+k+'->'+((k+1)%pts.length)+' hits at '+p.toArray().map(v=>v.toFixed(1)).join(','));break;}}});out[id]=iss;}
  out.tokens=tokenPts.map((q,i)=>[i,near(new V3(q[0],q[1],q[2]),1)]).filter(a=>a[1]<0.5).map(a=>'token '+a[0]+' at '+tokenPts[a[0]].join(',')+' d='+a[1].toFixed(2));
  out.spawn=near(new V3(SPAWN_PLAZA.p[0],SPAWN_PLAZA.p[1]+R+0.05,SPAWN_PLAZA.p[2]),0.3);if(!PADS)buildPads();out.pads=PADS.map(q=>{const v=new V3(q.p[0],q.p[1]+R+0.6,q.p[2]);return q.n+' '+near(v,1).toFixed(2)+(groundH(q.p[0],q.p[2],q.p[1]+1)>q.p[1]+0.3?' BURIED':'');});out.counts={colliders:colliders.length,buildings:buildings.length,spots:spots.length,tokens:tokenPts.length,cars:cars.length};return out;}
window.__rotorbound={scene,isWater:(x,z,y)=>isWater(x,z,y),aiBlocked:(tr)=>{const out={};for(const id of (tr||TRACK_IDS)){const C=makeCurve(TRACKS[id].pts,30,26);out[id]=C.smp.filter(p=>inSolid(p)).length+"/"+C.M;}return out;},check:__check,alleys,MAPDEF,D,S,job,chasePos,pkg,markB,renderer,setupActivity,startGame,newJob,save,addTrick,WAR,FILM,AI,LZ,TB,BAT,SIG,STATS,PADS:()=>PADS,detonate,tbPlace,tbSave,aiStart,crash,resetDrone,openGarage,openCareer,careerCheck,get oTC(){return $("oTC").textContent+" | "+$("oTR").textContent},get worldT(){return worldT},set worldT(v){worldT=v}};
requestAnimationFrame(frame);
updPad();
setTimeout(()=>checkUpdate(false),2500);
