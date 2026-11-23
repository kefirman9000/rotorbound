'use strict';
// ---------------- replay (last 30 s) ----------------
const RB={buf:[],max:900,acc:0,on:false,i:0,cam:0,paused:false,tripod:new V3()};
const RB_CAMS=['Chase','Orbit','FPV','Tripod'];
function recordReplay(dt){RB.acc+=dt;while(RB.acc>=1/30){RB.acc-=1/30;RB.buf.push([D.pos.x,D.pos.y,D.pos.z,D.q.x,D.q.y,D.q.z,D.q.w,D.motor]);if(RB.buf.length>RB.max)RB.buf.shift();}}
function enterReplay(){if(RB.buf.length<45){toast('Fly a bit first: nothing to replay yet');return;}RB.on=true;RB.i=0;RB.paused=false;const f=RB.buf[0];RB.tripod.set(f[0]+8,f[1]+4,f[2]+8);chasePos.set(f[0],f[1]+2,f[2]+4);document.body.classList.add('clean');showHint();}
function exitReplay(){RB.on=false;document.body.classList.remove('clean');$('hint').style.display='none';}
function showHint(){const h=$('hint');h.style.display='block';
  if(RB.on)h.textContent='⏪ REPLAY · camera: '+RB_CAMS[RB.cam]+(RB.paused?' · paused':'')+'\n'+(source==='controller'?'B camera · X pause · A exit':'C camera · Space pause · T exit');
  else if(PH.on)h.textContent='📷 PHOTO MODE\n'+(source==='controller'?'Sticks move/look · LT/RT down/up · LB/RB time of day · A save · B exit':'WASD move · arrows look · Q/E down/up · Z/X time of day · Enter save · F exit');}
const _rq=new QT(),_rq2=new QT(),_rp=new V3();
function updReplay(dt){
  const b=RB.buf,n=b.length;if(!RB.paused)RB.i+=dt*30;if(RB.i>=n-1)RB.i=0;
  const i=Math.floor(RB.i),u=RB.i-i,f=b[i],g=b[Math.min(n-1,i+1)];
  _rp.set(f[0]+(g[0]-f[0])*u,f[1]+(g[1]-f[1])*u,f[2]+(g[2]-f[2])*u);_rq.set(f[3],f[4],f[5],f[6]);_rq2.set(g[3],g[4],g[5],g[6]);_rq.slerp(_rq2,u);
  drone.visible=RB.cam!==2;drone.position.copy(_rp);drone.quaternion.copy(_rq);props.forEach((p,k)=>p.rotation.y+=(k%2?1:-1)*(0.5+f[7]*60)*dt);
  if(RB.cam===0){_hf.set(0,0,1).applyQuaternion(_rq);_hf.y=0;if(_hf.lengthSq()<1e-4)_hf.set(0,0,1);_hf.normalize();_v.copy(_rp).addScaledVector(_hf,3);_v.y+=1.2;chasePos.lerp(_v,1-Math.exp(-5*dt));camera.position.copy(chasePos);camera.lookAt(_rp);}
  else if(RB.cam===1){const a=worldT*0.4;camera.position.set(_rp.x+Math.cos(a)*6,_rp.y+2,_rp.z+Math.sin(a)*6);camera.lookAt(_rp);}
  else if(RB.cam===2){camera.position.copy(_rp);tiltQ.setFromAxisAngle(XAX,S.tilt*DEG);camera.quaternion.copy(_rq).multiply(tiltQ);}
  else{if(RB.tripod.distanceTo(_rp)>45)RB.tripod.set(_rp.x+10,_rp.y+5,_rp.z+10);camera.position.copy(RB.tripod);camera.lookAt(_rp);}
  showHint();
}

// ---------------- photo mode ----------------
const PH={on:false,pos:new V3(),yaw:0,pitch:0};
function enterPhoto(){PH.on=true;PH.pos.copy(camera.position);_e.setFromQuaternion(camera.quaternion,'YXZ');PH.yaw=_e.y;PH.pitch=_e.x;document.body.classList.add('clean');showHint();}
function exitPhoto(){PH.on=false;document.body.classList.remove('clean');$('hint').style.display='none';}
function cycleTod(d){const o=['day','sunset','night'];const i=o.indexOf(S.tod);S.tod=o[((i<0?0:i)+d+3)%3];save();toast('Time of day: '+S.tod);}
function takePhoto(){
  $('hint').style.display='none';renderer.render(scene,camera);
  try{const url=renderer.domElement.toDataURL('image/png');const a=document.createElement('a');a.href=url;a.download='rotorbound-'+new Date().toISOString().replace(/[:.]/g,'-')+'.png';document.body.appendChild(a);a.click();a.remove();toast('📷 Saved to your Downloads folder');}catch(e){toast("Couldn't save the photo here");}
  showHint();
}
function updPhoto(dt){
  const mx=pad.lx+K('d')-K('a'),mz=pad.ly+K('s')-K('w'),my=pad.rt-pad.lt+K('e')-K('q');
  const lx=pad.rx+(K('arrowright')-K('arrowleft')),ly=pad.ry+(K('arrowdown')-K('arrowup'));
  PH.yaw-=lx*1.6*dt;PH.pitch=Math.max(-1.5,Math.min(1.5,PH.pitch-ly*1.4*dt));
  const sp=10*(kb.keys.has('shift')?3:1);
  _v.set(mx,0,mz).applyAxisAngle(UP,PH.yaw);PH.pos.addScaledVector(_v,sp*dt);PH.pos.y=Math.max(groundH(PH.pos.x,PH.pos.z,PH.pos.y)+0.3,PH.pos.y+my*sp*dt);
  if(PH.pos.distanceTo(D.pos)>120)PH.pos.sub(D.pos).setLength(120).add(D.pos);
  camera.position.copy(PH.pos);_e.set(PH.pitch,PH.yaw,0,'YXZ');camera.quaternion.setFromEuler(_e);
  drone.visible=true;drone.position.copy(D.pos);drone.quaternion.copy(D.q);
}

// ---------------- time of day ----------------
const TOD={
  day:{top:0x5ea8e6,hor:0xc4e2f5,fog:0xc4e2f5,near:160,far:800,hs:0xe6f2ff,hg:0x4d4a40,hi:0.95,sc:0xfff0d8,si:1.25,sp:[220,320,120],night:0},
  sunset:{top:0x34497f,hor:0xf6a25e,fog:0xe39b6b,near:120,far:650,hs:0xffc59a,hg:0x4a3a35,hi:0.6,sc:0xff9850,si:1.0,sp:[320,45,-60],night:0.45},
  night:{top:0x02040c,hor:0x101b36,fog:0x0b1326,near:60,far:480,hs:0x34446e,hg:0x101018,hi:0.32,sc:0x9fb4ff,si:0.22,sp:[-150,260,-200],night:1}
};
const CYCLE=[[0,'day'],[0.3,'day'],[0.42,'sunset'],[0.52,'night'],[0.8,'night'],[0.9,'sunset'],[1,'day']],CYCLE_LEN=480;
const _ca=new THREE.Color(),_cb=new THREE.Color(),_sunDir=new V3(0.5,0.7,0.3),_shc=new V3();
let nightF=0;
function mixC(target,a,b,u){_ca.setHex(a);_cb.setHex(b);target.copy(_ca).lerp(_cb,u);}
function applyTod(){
  let A,B,u=0;
  if(S.tod==='cycle'){const p=(worldT/CYCLE_LEN)%1;let k=0;while(k<CYCLE.length-2&&p>CYCLE[k+1][0])k++;A=TOD[CYCLE[k][1]];B=TOD[CYCLE[k+1][1]];u=(p-CYCLE[k][0])/(CYCLE[k+1][0]-CYCLE[k][0]);}
  else{A=B=TOD[S.tod]||TOD.day;}
  const L=(x,y)=>x+(y-x)*u;
  mixC(skyU.top.value,A.top,B.top,u);mixC(skyU.hor.value,A.hor,B.hor,u);mixC(scene.fog.color,A.fog,B.fog,u);
  scene.fog.near=L(A.near,B.near);scene.fog.far=L(A.far,B.far);
  const wx=weatherNow(),wxDim=wx==='rain'?0.6:wx==='fog'?0.75:wx==='snow'?0.85:1;
  if(wx==='fog'){scene.fog.near*=0.1;scene.fog.far*=0.28;}else if(wx==='rain'){scene.fog.near*=0.45;scene.fog.far*=0.55;}else if(wx==='snow'){scene.fog.near*=0.45;scene.fog.far*=0.5;}
  mixC(hemi.color,A.hs,B.hs,u);mixC(hemi.groundColor,A.hg,B.hg,u);hemi.intensity=L(A.hi,B.hi)*(MAPDEF.lightMul||1)*wxDim+lightning*1.6;
  mixC(sun.color,A.sc,B.sc,u);sun.intensity=L(A.si,B.si)*(MAPDEF.lightMul||1)*(wx==='clear'?1:wx==='snow'?0.7:0.4);
  _sunDir.set(L(A.sp[0],B.sp[0]),L(A.sp[1],B.sp[1]),L(A.sp[2],B.sp[2])).normalize();
  {const c=SHADOWS?_shc.set(Math.round(D.pos.x/16)*16,0,Math.round(D.pos.z/16)*16):_shc.set(0,0,0);sun.position.copy(c).addScaledVector(_sunDir,420);sun.target.position.copy(c);sun.target.updateMatrixWorld();}
  nightF=L(A.night,B.night);
  skyU.sunDir.value.copy(_sunDir);if(wx!=='clear'){const k=0.6*(1-nightF*0.6);skyU.top.value.lerp(_cb.setHex(0x6b7280),k);skyU.hor.value.lerp(_cb.setHex(0xa7adb6),k);scene.fog.color.lerp(_cb.setHex(wx==='fog'?0xb9bfc7:0x9aa1ab),k);}
  if(mistPts)mistPts.material.opacity=wx==='fog'?0.24:wx==='rain'?0.06:0;puddleMat.opacity=wx==='rain'?1:0.85;skyU.sunCol.value.copy(sun.color).multiplyScalar(nightF>0.8?0.3:1);
  for(const m of wallMats)m.emissiveIntensity=nightF*0.95;
  for(const m of glowMats){if(m.isMeshBasicMaterial)mixC(m.color,0xbfc4cc,0xffffff,nightF);else m.emissiveIntensity=0.15+nightF*0.95;}
  stars.material.opacity=Math.max(0,nightF-0.3)/0.7;
  if(lampGlow)lampGlow.material.opacity=Math.max(0,nightF-0.2);
  {const wet=wx==='rain'?1.7:1,n=Math.max(0,nightF-0.25)/0.75;if(lampPool){lampPool.material.opacity=Math.min(1,n*0.75*wet);}if(neonPool)neonPool.forEach(m=>m.material.opacity=Math.min(1,n*0.55*wet));
   carBeam.material.opacity=n*0.5*wet;headMat.color.setHex(n>0.2?0xfff1c9:0x777777);tailMat.color.setHex(n>0.2?0xff2020:0x551111);}
  mixC(lampMat.color,0xd8d2b8,0xfff1b0,nightF);mixC(headMat.color,0x777777,0xfffbe0,nightF);mixC(tailMat.color,0x551111,0xff2222,nightF);
}

// ---------------- audio ----------------
let AC=null,master,mGain,o1,o2,filt,wGain,wFilt,noiseBuf=null;
let mot=[],washG=null,wetG=null,encl=0,enclT=0;
function initAudio(){
  if(AC){if(AC.state!=='running')AC.resume().catch(()=>{});return;}
  try{AC=new (window.AudioContext||window.webkitAudioContext)();}catch(e){return;}
  master=AC.createGain();master.gain.value=S.sound?S.volume:0;master.connect(AC.destination);
  const bus=AC.createGain();bus.connect(master);
  // room echo for tunnels, halls and anything with a roof overhead
  const conv=AC.createConvolver(),L=Math.floor(AC.sampleRate*1.8),ir=AC.createBuffer(2,L,AC.sampleRate);
  for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<L;i++){const t=i/L;d[i]=(Math.random()*2-1)*Math.pow(1-t,3.2)*(i<AC.sampleRate*0.012?0.2:1);}}
  conv.buffer=ir;wetG=AC.createGain();wetG.gain.value=0;bus.connect(conv);conv.connect(wetG);wetG.connect(master);
  filt=AC.createBiquadFilter();filt.type='lowpass';filt.frequency.value=900;mGain=AC.createGain();mGain.gain.value=0;filt.connect(mGain);mGain.connect(bus);
  // four motors, each a little detuned, following its own share of the mix
  mot=[0,1,2,3].map(k=>{const a=AC.createOscillator(),b=AC.createOscillator(),g=AC.createGain(),gb=AC.createGain();a.type='sawtooth';b.type='square';gb.gain.value=0.3;g.gain.value=0.25;a.connect(g);b.connect(gb);gb.connect(g);g.connect(filt);a.start();b.start();return{a,b,g};});
  o1=mot[0].a;o2=mot[0].b;
  const buf=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),ch=buf.getChannelData(0);for(let i=0;i<ch.length;i++)ch[i]=Math.random()*2-1;
  const n=AC.createBufferSource();n.buffer=buf;n.loop=true;wFilt=AC.createBiquadFilter();wFilt.type='bandpass';wFilt.Q.value=0.7;wGain=AC.createGain();wGain.gain.value=0;n.connect(wFilt);wFilt.connect(wGain);wGain.connect(bus);n.start();
  // prop-wash rumble: low, lumpy noise
  const n2=AC.createBufferSource();n2.buffer=buf;n2.loop=true;n2.playbackRate.value=0.6;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=170;lp.Q.value=3;washG=AC.createGain();washG.gain.value=0;n2.connect(lp);lp.connect(washG);washG.connect(bus);n2.start();
  noiseBuf=buf;
}
const MIXS=[[1,1,1],[-1,1,-1],[1,-1,-1],[-1,-1,1]];
function enclosed(){const l=gatherNear(D.pos.x,D.pos.z,0.5);for(const c of l){if(c.disabled||c.ramp)continue;if(c.min.y>D.pos.y+0.4&&c.min.y<D.pos.y+45&&D.pos.x>c.min.x&&D.pos.x<c.max.x&&D.pos.z>c.min.z&&D.pos.z<c.max.z)return 1;}return 0;}
function updAudio(){
  if(!AC)return;const t=AC.currentTime,sp=_rel.copy(D.vel).sub(wind).length(),live=started&&!RB.on&&!PH.on;
  master.gain.setTargetAtTime(S.sound&&!menuOpen&&!GA.open?S.volume:0,t,0.05);
  const base=D.vel.length()*1.5;
  mot.forEach((m,k)=>{const sg=MIXS[k],mk=Math.max(0,Math.min(1,D.motor+0.035*(sg[0]*D.w.z+sg[1]*D.w.x)+0.02*sg[2]*D.w.y));const f=((85+mk*430)*GAR.pitch+base)*(1+(k-1.5)*0.007);m.a.frequency.setTargetAtTime(f,t,0.03);m.b.frequency.setTargetAtTime(f*0.5,t,0.03);});
  filt.frequency.setTargetAtTime(500+D.motor*2800,t,0.05);
  mGain.gain.setTargetAtTime(live&&D.motor>0.01?0.04+D.motor*0.22:0,t,0.05);
  wGain.gain.setTargetAtTime(live?Math.min(0.4,Math.pow(sp/55,1.4)*0.4):0,t,0.1);wFilt.frequency.setTargetAtTime(300+sp*28,t,0.1);
  washG.gain.setTargetAtTime(live?Math.min(0.5,washF*0.45+shake*0.08):0,t,0.04);
  if(t-enclT>0.2){enclT=t;encl=live?enclosed():0;}
  wetG.gain.setTargetAtTime(encl?0.55:(MAPDEF.indoor||MAPDEF.dark)?0.18:0.05,t,0.25);
}
function tone(f0,f1,dur,vol,type){if(!AC)return;const t=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f0,t);o.frequency.linearRampToValueAtTime(f1,t+dur*0.3);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(0.001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+0.05);}
function sfxDing(){tone(880,1320,0.35,0.25);}
function sfxGraze(){tone(320,180,0.09,0.14,'square');tone(1900,1400,0.04,0.05,'triangle');}
function sfxTrick(n){tone(520+n*90,780+n*120,0.25,0.18,'triangle');}
function sfxCrash(){if(!AC||!noiseBuf)return;const t=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseBuf;f.type='lowpass';f.frequency.value=1400;g.gain.setValueAtTime(0.6,t);g.gain.exponentialRampToValueAtTime(0.001,t+0.6);s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+0.7);tone(150,55,0.45,0.25,'square');tone(2400,900,0.12,0.06,'sawtooth');}

// ---------------- video fx ----------------
const stc=$('static'),sctx=stc.getContext('2d'),simg=sctx.createImageData(160,90);
let staticLvl=0;
function updFx(dt){
  $('fx').style.display=S.fx&&S.view==='fpv'?'block':'none';
  let target=S.fx&&S.view==='fpv'?0.035:0;
  if(D.crashed&&S.view==='fpv')target=0.8;
  if(started&&S.view==='fpv')target=Math.max(target,extStatic());
  staticLvl+=(target-staticLvl)*Math.min(1,dt*(staticLvl>target?3:12));
  stc.style.opacity=staticLvl.toFixed(3);
  if(staticLvl>0.01&&!document.body.classList.contains('clean')){const d=simg.data;for(let i=0;i<d.length;i+=4){const v=Math.random()*255|0;d[i]=d[i+1]=d[i+2]=v;d[i+3]=255;}sctx.putImageData(simg,0,0);}
}

// ---------------- camera ----------------
const tiltQ=new QT(),shakeQ=new QT(),chasePos=new V3(0,3,6),_hf=new V3(),XAX=new V3(1,0,0);
let shake=0;
function updCamera(dt){
  if(!started&&!window.__rbHold){const sp0=spawnPoint(),sp=sp0.p,a=performance.now()*0.00005+(sp0.h||0);drone.visible=false;camera.position.set(sp[0],Math.max(sp[1],groundH(sp[0],sp[2],sp[1]+2))+2.2,sp[2]);_e.set(0.06,a,0,'YXZ');camera.quaternion.setFromEuler(_e);return;}
  const fpv=S.view==='fpv';
  drone.visible=!fpv;
  drone.position.copy(D.pos);drone.quaternion.copy(D.q);
  props.forEach((p,k)=>p.rotation.y+=(k%2?1:-1)*(0.5+D.motor*60)*dt);
  const wash=(!D.crashed&&D.vel.y<-4&&D.motor>0.3)?Math.min(1,(-D.vel.y-4)/8)*D.motor:0;
  shake+=(wash-shake)*Math.min(1,dt*8);
  tiltQ.setFromAxisAngle(XAX,S.tilt*DEG);
  if(fpv){
    camera.position.copy(D.pos);camera.quaternion.copy(D.q).multiply(tiltQ);
    if(shake>0.01){_e.set((Math.random()-.5)*0.04*shake,(Math.random()-.5)*0.03*shake,(Math.random()-.5)*0.05*shake);shakeQ.setFromEuler(_e);camera.quaternion.multiply(shakeQ);}
  }else{
    _hf.set(0,0,1).applyQuaternion(D.q);_hf.y=0;if(_hf.lengthSq()<1e-4)_hf.set(0,0,1);_hf.normalize();
    const want=_v.copy(D.pos).addScaledVector(_hf,2.4);want.y+=0.9;
    chasePos.lerp(want,1-Math.exp(-6*dt));{const g=groundH(chasePos.x,chasePos.z,chasePos.y)+0.4;if(chasePos.y<g)chasePos.y=g;}
    camera.position.copy(chasePos);camera.lookAt(D.pos);
  }
}
function updHeadlight(){
  const li=S.light==='on'?1:S.light==='off'?0:Math.max(MAPDEF.dark?1:0,(nightF-0.3)/0.7);
  headlight.intensity=li*2.4;headlight.position.copy(drone.position);tiltQ.setFromAxisAngle(XAX,S.tilt*DEG);
  headlight.target.position.copy(_v.set(0,0,-10).applyQuaternion(_q.copy(drone.quaternion).multiply(tiltQ)).add(drone.position));
  sky.position.copy(camera.position);stars.position.copy(camera.position);
}

// ---------------- OSD ----------------
const hz=$('horizon'),_p=new V3(),ARR=['↑','↗','→','↘','↓','↙','←','↖'];
function bearing(tx,tz){
  _hf.set(0,0,-1).applyQuaternion(camera.quaternion);_hf.y=0;if(_hf.lengthSq()<1e-4)return '•';_hf.normalize();
  const dx=tx-camera.position.x,dz2=tz-camera.position.z,r=-_hf.z*dx+_hf.x*dz2,f=_hf.x*dx+_hf.z*dz2;
  return ARR[(Math.round(Math.atan2(r,f)/(Math.PI/4))+8)%8];
}
function currentTarget(){
  {const e=extTarget();if(e)return e;}
  if(S.activity==='race'&&gates.length)return gates[nextGate].c;
  if(S.activity==='courier'&&(job.state==='pickup'||job.state==='deliver')){const t=job.state==='pickup'?job.from:job.to;return _p.set(t.x,t.h,t.z);}
  return null;
}
function nearestToken(){let b=null,bd=40*40;for(const m of tokens){if(!m.visible)continue;const d=m.position.distanceToSquared(D.pos);if(d<bd){bd=d;b=m;}}return b;}
function updOSD(){
  const fpv=S.view==='fpv';
  const sp=D.vel.length()*3.6,alt=Math.max(0,D.pos.y-R-groundH(D.pos.x,D.pos.z,D.pos.y));
  const volt=batVolt().toFixed(1);
  $('oTL').textContent=({acro:'ACRO',horizon:'HORZ',angle:'ANGL'}[S.mode]||'ANGL')+(S.altHold&&S.mode!=='acro'?' ALT':'')+'\n'+fmtT(flightT).slice(0,-3)+'\n◆ '+gotTokens.size+'/'+tokens.length;
  let tc='',tr='';
  if(S.activity==='race'){
    tc=TRACKS[S.track].name.toUpperCase()+'\n'+(lapStart!==null?'LAP '+fmtT(simT-lapStart):'FLY THROUGH THE GREEN GATE')+'\nLAST '+fmtT(lastLap)+'  BEST '+fmtT(best);
    tr='GATE '+(nextGate+1)+'/'+gates.length;
  }else if(S.activity==='courier'){
    const st={pickup:'PICK UP THE PACKAGE (yellow pad)',deliver:'DELIVER '+fmtT(job.t).slice(0,-3)+' / PAR '+fmtT(job.par).slice(0,-3),done:'DELIVERED',failed:'JOB FAILED · reset for a new one',none:''}[job.state];
    tc='COURIER  '+fmtCash(cash)+'\n'+st+(job.hold>0?'\nHOLD '+'▮'.repeat(Math.ceil(job.hold/0.7*5)):'');
    tr=job.state==='deliver'?'CARGO '+Math.round(job.m*100)+'%':'';
  }else if(S.activity==='free'){tc=(segHud.name?'⏱ '+segHud.name.toUpperCase()+'  '+fmtT(segHud.t)+'\n':'')+'FREE FLIGHT & TRICKS  '+fmtCash(cash)+'\nSCORE '+T.total.toLocaleString()+'  BEST COMBO '+T.bestCombo.toLocaleString()+(inPark(D.pos)?'\n★ STUNT PARK: COMBOS PAY ×2':'');}
  {const o=extOSD(tc,tr);tc=o[0];tr=o[1];}
  const tg=currentTarget();
  if(tg){const d=D.pos.distanceTo(tg);tr+=(tr?'\n':'')+d.toFixed(0)+'m';$('arrow').textContent=bearing(tg.x,tg.z)+(tg.y-D.pos.y>6?' ▲':tg.y-D.pos.y<-6?' ▼':'');}
  else{$('arrow').textContent=nearestToken()?'◆ token nearby':'';}
  $('oTC').textContent=tc;$('oTR').textContent=tr;
  $('oML').textContent=sp.toFixed(0)+' KM/H';
  const ws=wind.length();
  $('oMR').textContent='ALT '+alt.toFixed(1)+'m'+(ws>0.5?'\nWIND '+ws.toFixed(0)+' '+bearing(camera.position.x+wind.x,camera.position.z+wind.z):'');
  $('oBL').textContent=volt+'V';
  $('oBC').textContent='THR '+(D.motor*100).toFixed(0)+'%';
  $('oBR').textContent=(source==='controller'?'🎮 PAD':source==='touch'?'✋ TOUCH':'⌨ KEYS')+(fpv?'  '+S.tilt+'°':'');
  const live=T.prox>0.4?'PROXIMITY '+T.prox.toFixed(1)+'s':'';
  $('combo').textContent=(T.combo.length||live)?(T.combo.slice(-4).join(' + ')+(live?(T.combo.length?' + ':'')+live:'')+(T.combo.length?'\n×'+T.combo.length+'   '+(T.pts*T.combo.length*(inPark(D.pos)?2:1)).toLocaleString():'')):'';
  $('cross').style.display=fpv?'block':'none';
  if(fpv){
    _hf.set(0,0,-1).applyQuaternion(camera.quaternion);_hf.y=0;
    if(_hf.lengthSq()>1e-3){_hf.normalize();
      const r=new V3(-_hf.z,0,_hf.x);
      const a=new V3().copy(camera.position).addScaledVector(_hf,1000).addScaledVector(r,-200).project(camera);
      const b=new V3().copy(camera.position).addScaledVector(_hf,1000).addScaledVector(r,200).project(camera);
      if(a.z<1&&b.z<1){const ax=(a.x+1)/2*innerWidth,ay=(1-a.y)/2*innerHeight,bx=(b.x+1)/2*innerWidth,by=(1-b.y)/2*innerHeight;
        const mx=(ax+bx)/2,my=(ay+by)/2,ang=Math.atan2(by-ay,bx-ax);
        hz.style.display='block';hz.style.transform=`translate(${mx-hz.offsetWidth/2}px,${my}px) rotate(${ang}rad)`;}else hz.style.display='none';
    }else hz.style.display='none';
  }else hz.style.display='none';
}
let toastT=null;
function toast(msg){const t=$('toast');t.textContent=msg;t.style.opacity=1;clearTimeout(toastT);toastT=setTimeout(()=>t.style.opacity=0,2000);}

