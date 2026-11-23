'use strict';
// ================= v0.7 shared map features =================
Object.assign(MAPDEF,{terrain:null,waters:[],under:[],lightMul:1,dark:false,indoor:false,segments:[],skims:[],vaults:[],fireworks:null,updaters:[],weatherDefault:'clear',name:''});
const NEONS=[0xff2d95,0x00e5ff,0xb36bff,0xffd23f,0x39ff88,0xff6a3f].map(c=>basic(c));
const glassMat=lam(0x9fd3f0,{transparent:true,opacity:0.32,emissive:0x0a2a40,emissiveIntensity:0.5,depthWrite:false});
const snowMat=lam(0xf4f7fb),woodMat2=lam(0x8a6a44),rustMat=lam(0x8a4b2a),whiteMat=lam(0xe8eaee);
// ground height: terrain, water surfaces (raise) and underground spaces / holes (lower)
function groundH(x,z,y){let h=MAPDEF.terrain?MAPDEF.terrain(x,z):0;
  for(const w of MAPDEF.waters)if(x>w.x0&&x<w.x1&&z>w.z0&&z<w.z1&&w.y>h&&(!w.test||w.test(x,z)))h=w.y;
  for(const u of MAPDEF.under)if(x>u.x0&&x<u.x1&&z>u.z0&&z<u.z1&&(u.hole||y<u.maxY))h=Math.min(h,u.floor);
  return h;}
function onTerrain(x,z,y){if(!MAPDEF.terrain)return false;const t=MAPDEF.terrain(x,z);return Math.abs(groundH(x,z,y)-t)<1e-6;}
// split a rectangle into pieces around rectangular holes [x0,x1,z0,z1]
function rectsMinus(x0,x1,z0,z1,holes){const out=[];const Z=[...new Set([z0,z1,...holes.flatMap(h=>[h[2],h[3]])])].filter(v=>v>=z0&&v<=z1).sort((a,b)=>a-b);
  for(let k=0;k+1<Z.length;k++){const za=Z[k],zb=Z[k+1];if(zb-za<1e-3)continue;const zm=(za+zb)/2;const hs=holes.filter(h=>zm>h[2]&&zm<h[3]&&h[1]>x0&&h[0]<x1).sort((a,b)=>a[0]-b[0]);let xa=x0;
    for(const h of hs){if(h[0]-xa>1e-3)out.push([xa,h[0],za,zb]);xa=Math.max(xa,h[1]);}if(x1-xa>1e-3)out.push([xa,x1,za,zb]);}
  return out;}
function holedPlane(x0,x1,z0,z1,holes,mat,y){for(const[a,b,c,d]of rectsMinus(x0,x1,z0,z1,holes)){const m=new THREE.Mesh(new THREE.PlaneGeometry(b-a,d-c),mat);m.rotation.x=-Math.PI/2;m.position.set((a+b)/2,y,(c+d)/2);scene.add(m);}}
function holedSlab(x0,x1,z0,z1,y,th,holes,mat){for(const[a,b,c,d]of rectsMinus(x0,x1,z0,z1,holes))box((a+b)/2,y,(c+d)/2,b-a,th,d-c,mat);}
// generic spinning rotor (fans, turbines)
function addFan(x,y,z,ax,r,spd,mat,bw=2.2){const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);if(ax==='z')g.rotation.y=Math.PI/2;const rot=new THREE.Group();g.add(rot);
  for(let k=0;k<3;k++){const bl=new THREE.Mesh(new THREE.BoxGeometry(0.5,r,bw),mat);bl.position.y=r/2;const arm=new THREE.Group();arm.rotation.x=k/3*TAU;arm.add(bl);rot.add(arm);}
  rot.add(new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,1.4,16).rotateZ(Math.PI/2),darkMetal));fans.push({x,y,z,ax,r,spd,rot});}
function turbine(x,z,base,h,r,spd){box(x,base,z,2.4,h,2.4,whiteMat);box(x,base+h-1.5,z,3,3,6,whiteMat);const fz=z-3.4;addFan(x,base+h,fz,'z',r,spd,whiteMat,1.6);
  const c=new V3(x,base+h,fz);gapZones.push({c,n:new V3(0,0,1),name:'TURBINE THREAD',pts:350,test:p=>{const d=p.distanceTo(c);return d<r-1&&d>2.5;}});}
// time-trial segments: start ring -> finish ring
function segment(name,a,b,r=4){const A=new V3(...a),B=new V3(...b),n=B.clone().sub(A).normalize();
  const mk=(p,col)=>{const m=new THREE.Mesh(new THREE.TorusGeometry(r,0.25,8,36),basic(col,{transparent:true,opacity:0.8}));m.position.copy(p);m.lookAt(p.clone().add(n));scene.add(m);return m;};
  MAPDEF.segments.push({name,A,B,n,r,mA:mk(A,0xff6a3f),mB:mk(B,0x00e5ff),t0:null,best:null});}
// rooftop pools etc: skim the surface for a trick
function skimZone(x0,x1,z0,z1,y,name){MAPDEF.skims.push({x0,x1,z0,z1,y,name,cd:0});}
function roofPool(b){const w=Math.min(b.w*0.55,14),d=Math.min(b.d*0.4,8),x=b.x-b.w*0.1,z=b.z,y=b.h;
  box(x,y,z-d/2-0.3,w+0.6,1,0.3,whiteMat);box(x,y,z+d/2+0.3,w+0.6,1,0.3,whiteMat);box(x-w/2-0.3,y,z,0.3,1,d,whiteMat);box(x+w/2+0.3,y,z,0.3,1,d,whiteMat);
  const wtr=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshPhongMaterial({color:0x28b6e6,shininess:140,specular:0xffffff,transparent:true,opacity:0.85}));wtr.rotation.x=-Math.PI/2;wtr.position.set(x,y+0.85,z);scene.add(wtr);
  skimZone(x-w/2,x+w/2,z-d/2,z+d/2,y+0.85,'POOL SKIM');
  const px=b.x+b.w*0.3;for(const ox of[-1,1])for(const oz of[-1,1])box(px+ox*2.2,y,z+oz*2.2,0.2,2.8,0.2,woodMat2);box(px,y+2.8,z,5,0.15,5,woodMat2);
  tree(b.x+b.w*0.32,b.z+b.d*0.32,y);b.clear=false;}
// secret vault room with a roof hatch that opens once every token on the map is found
function vaultRoom(x,y,z,w,d,h){const t=0.4;box(x,y,z-d/2,w,h,t,darkMetal);box(x,y,z+d/2,w,h,t,darkMetal);box(x-w/2,y,z,t,h,d,darkMetal);box(x+w/2,y,z,t,h,d,darkMetal);box(x,y-0.2,z,w,0.2,d,darkMetal);
  const hs=2.4;holedSlab(x-w/2,x+w/2,z-d/2,z+d/2,y+h,0.3,[[x-hs/2,x+hs/2,z-hs/2,z+hs/2]],darkMetal);
  const hatch=new THREE.Mesh(new THREE.BoxGeometry(hs+0.2,0.25,hs+0.2),lam(0xffd23f,{emissive:0x332200}));hatch.position.set(x,y+h+0.45,z);hatch.userData.noMerge=1;scene.add(hatch);
  const hc=collider(x-hs/2-0.1,y+h+0.3,z-hs/2-0.1,x+hs/2+0.1,y+h+0.6,z+hs/2+0.1);
  const trophy=new THREE.Group();trophy.add(new THREE.Mesh(new THREE.BoxGeometry(0.9,0.2,1.3),basic(0xffd23f)));for(const[a,b]of[[.6,.6],[-.6,.6],[.6,-.6],[-.6,-.6]]){const p=new THREE.Mesh(new THREE.CylinderGeometry(0.4,0.4,0.05,16),basic(0xfff3b0));p.position.set(a,0.1,b);trophy.add(p);}
  trophy.position.set(x,y+h*0.45,z);scene.add(trophy);const glow=new THREE.Mesh(new THREE.SphereGeometry(1.6,16,10),basic(0xffd23f,{transparent:true,opacity:0.15,depthWrite:false}));glow.position.copy(trophy.position);scene.add(glow);
  MAPDEF.vaults.push({x,y,z,w,d,h,hatch,hc,trophy,open:false,anim:0});}
// destructible props: cones, boxes, barrels, glass panes
const debris=[],shards=[];
const DEB_GEO={box:new THREE.BoxGeometry(1,1,1),cone:new THREE.ConeGeometry(0.28,0.72,10),barrel:new THREE.CylinderGeometry(0.38,0.38,1.05,12)};
const coneMat=lam(0xff6a1f),cardMat=lam(0xb08a58),barrelMat=lam(0x2f6b9a);
function addDebris(kind,x,y,z,o={}){let m;if(kind==='glass'){m=new THREE.Mesh(DEB_GEO.box,glassMat);m.scale.set(o.w||2,o.h||2,o.d||0.06);m.rotation.y=o.rotY||0;}else{m=new THREE.Mesh(DEB_GEO[kind]||DEB_GEO.box,o.mat||(kind==='cone'?coneMat:kind==='barrel'?barrelMat:cardMat));if(kind==='box')m.scale.setScalar(o.s||0.8);}
  const hh=kind==='glass'?(o.h||2)/2:kind==='cone'?0.36:kind==='barrel'?0.52:(o.s||0.8)/2;m.position.set(x,y+hh,z);m.userData.noMerge=1;scene.add(m);
  debris.push({m,kind,v:new V3(),av:new V3(),hh,flat:!!o.flat,hw:kind==='glass'?(o.flat?[(o.w||2)/2,(o.d||2)/2]:[(o.w||2)/2,(o.d||0.06)/2+0.15]):[hh,hh],live:false,gone:false,rest:y,yaw:o.rotY||0});}
for(let k=0;k<40;k++){const s=new THREE.Mesh(new THREE.TetrahedronGeometry(0.25),glassMat);s.visible=false;scene.add(s);shards.push({m:s,v:new V3(),t:0});}
let shardI=0;
function shatter(p,v){for(let k=0;k<10;k++){const s=shards[shardI++%shards.length];s.m.position.copy(p);s.m.visible=true;s.v.set(v.x*0.5+(Math.random()-.5)*5,Math.random()*4,v.z*0.5+(Math.random()-.5)*5);s.t=2;}tone(1800,900,0.25,0.12,'triangle');}
function updDebris(dt,live){
  for(const s of shards){if(!s.m.visible)continue;s.t-=dt;s.v.y-=G*dt;s.m.position.addScaledVector(s.v,dt);s.m.rotation.x+=dt*8;if(s.m.position.y<groundH(s.m.position.x,s.m.position.z,s.m.position.y)||s.t<0)s.m.visible=false;}
  for(const d of debris){if(d.gone)continue;const p=d.m.position;
    if(live&&!D.crashed){const dx=Math.abs(D.pos.x-p.x),dy=Math.abs(D.pos.y-p.y),dz2=Math.abs(D.pos.z-p.z),sp=D.vel.length();
      const hitR=d.flat?(dx<d.hw[0]&&dz2<d.hw[1]):d.kind==='glass'?(Math.abs(Math.sin(d.yaw))>0.5?(dx<d.hw[1]+R&&dz2<d.hw[0]):(dx<d.hw[0]&&dz2<d.hw[1]+R)):(dx<d.hw[0]+R&&dz2<d.hw[0]+R);
      if(hitR&&dy<(d.flat?0.15:d.hh)+R&&sp>1.5){
        if(d.kind==='glass'){d.gone=true;d.m.visible=false;shatter(p,D.vel);D.vel.multiplyScalar(0.8);rumble(0.3,0.6,120);if(S.activity==='free')addTrick('SMASH',60);continue;}
        if(!d.live){d.live=true;d.v.copy(D.vel).multiplyScalar(0.9);d.v.y+=2+sp*0.15;d.av.set((Math.random()-.5)*10,(Math.random()-.5)*10,(Math.random()-.5)*10);D.vel.multiplyScalar(0.9);rumble(0.15,0.35,70);tone(220,120,0.12,0.12,'square');}}}
    if(!d.live)continue;
    d.v.y-=G*dt;p.addScaledVector(d.v,dt);d.m.rotation.x+=d.av.x*dt;d.m.rotation.y+=d.av.y*dt;d.m.rotation.z+=d.av.z*dt;
    const g=groundH(p.x,p.z,p.y)+d.hh*0.6;if(p.y<g){p.y=g;d.v.y*=-0.3;d.v.x*=0.7;d.v.z*=0.7;d.av.multiplyScalar(0.6);if(d.v.length()<0.4){d.live=false;}}
  }
}
// helicopters and blimps that circle the map; catch the glowing orb for a bonus
const aircraft=[];
function addHeli(cx,cz,r,y,spd,ph){const g=new THREE.Group();const body=new THREE.Mesh(new THREE.SphereGeometry(1.6,14,10),lam(0x1d4ed8));body.scale.set(1,0.8,1.5);g.add(body);
  const boom=new THREE.Mesh(new THREE.BoxGeometry(0.35,0.35,4.5),lam(0x1d4ed8));boom.position.set(0,0.2,3.6);g.add(boom);
  const rotor=new THREE.Mesh(new THREE.BoxGeometry(9,0.06,0.35),darkMetal);rotor.position.y=1.5;g.add(rotor);const rotor2=rotor.clone();rotor2.rotation.y=Math.PI/2;g.add(rotor2);
  const tr=new THREE.Mesh(new THREE.BoxGeometry(0.06,1.6,0.25),darkMetal);tr.position.set(0.25,0.4,5.8);g.add(tr);
  for(const s of[-1,1]){const sk=new THREE.Mesh(new THREE.BoxGeometry(0.12,0.12,3),darkMetal);sk.position.set(s*1,-1.5,0);g.add(sk);}
  const led=new THREE.Mesh(new THREE.SphereGeometry(0.2,6,4),basic(0xff2d2d));led.position.set(0,-1.3,0);g.add(led);
  scene.add(g);const orb=new THREE.Mesh(new THREE.SphereGeometry(0.7,12,8),basic(0xffd23f,{transparent:true,opacity:0.85}));scene.add(orb);
  aircraft.push({g,kind:'heli',cx,cz,r,y,spd,ph,orb,cd:0,rotors:[rotor,rotor2,tr]});}
function addBlimp(cx,cz,r,y,spd,ph){const g=new THREE.Group();const env=new THREE.Mesh(new THREE.SphereGeometry(1,24,14),lam(0xe5e7eb));env.scale.set(5,5,17);g.add(env);
  const band=new THREE.Mesh(new THREE.CylinderGeometry(5.05,5.05,1.6,24,1,true),basic(0x00e5ff));band.rotation.x=Math.PI/2;g.add(band);
  const gon=new THREE.Mesh(new THREE.BoxGeometry(2.2,1.6,5),darkMetal);gon.position.y=-5.4;g.add(gon);
  for(const[a,b]of[[0,1],[Math.PI/2,1]]){const fin=new THREE.Mesh(new THREE.BoxGeometry(0.3,7,4),lam(0xe5e7eb));fin.position.z=14;fin.rotation.z=a;g.add(fin);}
  scene.add(g);const orb=new THREE.Mesh(new THREE.SphereGeometry(0.8,12,8),basic(0xffd23f,{transparent:true,opacity:0.85}));scene.add(orb);
  aircraft.push({g,kind:'blimp',cx,cz,r,y,spd,ph,orb,cd:0});}
const _ap=new V3();
function updAircraft(t,dt,live){for(const a of aircraft){const ang=a.ph+t*a.spd/a.r,x=a.cx+Math.cos(ang)*a.r,z=a.cz+Math.sin(ang)*a.r,y=a.y+Math.sin(t*0.4+a.ph)*(a.kind==='heli'?3:1.5);
  a.g.position.set(x,y,z);a.g.rotation.y=-ang+(a.spd>0?Math.PI:0);
  if(a.kind==='heli'){a.g.rotation.z=0.12*Math.sign(a.spd);a.rotors[0].rotation.y=t*25;a.rotors[1].rotation.y=t*25+Math.PI/2;a.rotors[2].rotation.x=t*40;dynBox(x,y,z,2.2,1.6,2.2);a.orb.position.set(x,y-5,z);}
  else{const c=Math.abs(Math.cos(a.g.rotation.y)),s=Math.abs(Math.sin(a.g.rotation.y));dynBox(x,y,z,s*17+c*5,5,c*17+s*5);dynBox(x,y-5.4,z,2.5,1,2.5);a.orb.position.set(x,y-8,z);}
  a.orb.visible=simT>=a.cd;
  if(live&&a.orb.visible&&a.orb.position.distanceToSquared(D.pos)<4){a.cd=simT+45;addCash(a.kind==='heli'?100:150);sfxDing();rumble(0.4,0.8,200);toast((a.kind==='heli'?'🚁 Caught the chopper bonus':'🎈 Grabbed the blimp bonus')+' +'+fmtCash(a.kind==='heli'?100:150));}}}
// weather: rain / snow particles, fog, lightning
const WX_N=2600;let wxPts=null,wxKind='',lightning=0;
function weatherNow(){const w=S.weather||'auto';return w==='auto'?MAPDEF.weatherDefault:w;}
function buildWeather(kind){if(wxPts){scene.remove(wxPts);wxPts.geometry.dispose();wxPts=null;}wxKind=kind;if(kind!=='rain'&&kind!=='snow')return;
  const pos=new Float32Array(WX_N*3);for(let i=0;i<WX_N;i++){pos[i*3]=(Math.random()-.5)*80;pos[i*3+1]=Math.random()*50;pos[i*3+2]=(Math.random()-.5)*80;}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));
  const tex=canvasTex(32,32,(c)=>{if(kind==='rain'){c.fillStyle='rgba(200,220,255,.8)';c.fillRect(15,0,2,32);}else{const gr=c.createRadialGradient(16,16,0,16,16,16);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gr;c.fillRect(0,0,32,32);}});
  wxPts=new THREE.Points(g,new THREE.PointsMaterial({map:tex,size:kind==='rain'?0.9:0.5,transparent:true,opacity:kind==='rain'?0.55:0.9,depthWrite:false}));wxPts.frustumCulled=false;scene.add(wxPts);}
function updWeather(dt){const k=weatherNow();if(k!==wxKind)buildWeather(k);if(!wxPts)return;
  wxPts.visible=!(MAPDEF.indoor&&D.pos.y<MAPDEF.roofY);
  const a=wxPts.geometry.attributes.position.array,c=camera.position,fall=wxKind==='rain'?26:2.2;
  for(let i=0;i<WX_N;i++){let x=a[i*3],y=a[i*3+1],z=a[i*3+2];y-=fall*dt;x+=wind.x*dt*0.6+(wxKind==='snow'?Math.sin(y+i)*0.3*dt:0);z+=wind.z*dt*0.6;
    if(y<c.y-20||y<groundH(x,z,y)){y=c.y+20+Math.random()*10;x=c.x+(Math.random()-.5)*80;z=c.z+(Math.random()-.5)*80;}
    if(x-c.x>40)x-=80;if(x-c.x<-40)x+=80;if(z-c.z>40)z-=80;if(z-c.z<-40)z+=80;a[i*3]=x;a[i*3+1]=y;a[i*3+2]=z;}
  wxPts.geometry.attributes.position.needsUpdate=true;
  if(wxKind==='rain'&&nightF>0.4&&Math.random()<dt*0.08){lightning=1;setTimeout(()=>{if(AC&&noiseBuf){const t=AC.currentTime,s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain();s.buffer=noiseBuf;f.type='lowpass';f.frequency.value=180;g.gain.setValueAtTime(0.9,t);g.gain.exponentialRampToValueAtTime(0.001,t+2.5);s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+2.6);}},400+Math.random()*1500);}
  lightning=Math.max(0,lightning-dt*3);}
// fog banks that roll through low streets/alleys when foggy
let mistPts=null;const mistSpots=[];
let neonPool=null;
function buildNightFx(){if(!NIGHT_NEON.length)return;const tex=canvasTex(8,64,(g)=>{const gr=g.createLinearGradient(0,0,0,64);gr.addColorStop(0,'rgba(255,255,255,.9)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,8,64);});
  const geo=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2).translate(0,0,0.5),byC=new Map();for(const n of NIGHT_NEON){if(!byC.has(n.c))byC.set(n.c,[]);byC.get(n.c).push(n);}
  neonPool=[];const m4=new THREE.Matrix4(),q=new QT(),p=new V3(),sc=new V3();
  for(const[c,L]of byC){const im=new THREE.InstancedMesh(geo,new THREE.MeshBasicMaterial({map:tex,color:c,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}),L.length*4);let k=0;
    for(const n of L)for(const[ang,ox,oz,len]of[[0,0,n.d/2+0.15,n.w],[Math.PI,0,-n.d/2-0.15,n.w],[Math.PI/2,n.w/2+0.15,0,n.d],[-Math.PI/2,-n.w/2-0.15,0,n.d]]){q.setFromAxisAngle(UP,ang);m4.compose(p.set(n.x+ox,0.31,n.z+oz),q,sc.set(len+1,1,5));im.setMatrixAt(k++,m4);}
    im.frustumCulled=false;im.userData.noMerge=1;scene.add(im);neonPool.push(im);}}
function buildMist(){if(!mistSpots.length)return;const n=mistSpots.length*6,pos=new Float32Array(n*3);mistSpots.forEach((s,i)=>{for(let k=0;k<6;k++){pos[(i*6+k)*3]=s[0]+(Math.random()-.5)*16;pos[(i*6+k)*3+1]=1.5+Math.random()*5;pos[(i*6+k)*3+2]=s[1]+(Math.random()-.5)*16;}});
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));const tex=canvasTex(64,64,(c)=>{const gr=c.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gr;c.fillRect(0,0,64,64);});
  mistPts=new THREE.Points(g,new THREE.PointsMaterial({map:tex,color:0xd5dbe3,size:22,transparent:true,opacity:0,depthWrite:false}));mistPts.frustumCulled=false;scene.add(mistPts);}
// fireworks at night + sweeping searchlights
const fw={bursts:[],t:0};let searchlights=[];
function buildFireworks(){if(!MAPDEF.fireworks)return;for(let b=0;b<6;b++){const n=90,pos=new Float32Array(n*3),col=new Float32Array(n*3);const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));
  const p=new THREE.Points(g,new THREE.PointsMaterial({size:1.6,vertexColors:true,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));p.frustumCulled=false;scene.add(p);fw.bursts.push({p,vel:new Float32Array(n*3),t:9,c:new V3()});}}
function updFireworks(dt){if(!fw.bursts.length)return;const on=nightF>0.6&&!menuOpen;fw.t-=dt;
  if(on&&fw.t<0){fw.t=0.6+Math.random()*1.8;const b=fw.bursts.find(x=>x.t>2.6)||fw.bursts[0];const A=MAPDEF.fireworks;b.c.set(A.x0+Math.random()*(A.x1-A.x0),A.y+Math.random()*40,A.z0+Math.random()*(A.z1-A.z0));b.t=0;
    const pos=b.p.geometry.attributes.position.array,col=b.p.geometry.attributes.color.array,h=Math.random(),cc=new THREE.Color().setHSL(h,1,0.6);
    for(let i=0;i<pos.length/3;i++){pos[i*3]=b.c.x;pos[i*3+1]=b.c.y;pos[i*3+2]=b.c.z;const u=Math.random()*2-1,a=Math.random()*TAU,s=Math.sqrt(1-u*u),sp=10+Math.random()*6;b.vel[i*3]=Math.cos(a)*s*sp;b.vel[i*3+1]=u*sp;b.vel[i*3+2]=Math.sin(a)*s*sp;col[i*3]=cc.r;col[i*3+1]=cc.g;col[i*3+2]=cc.b;}
    b.p.geometry.attributes.color.needsUpdate=true;if(D.pos.distanceTo(b.c)<400)setTimeout(()=>tone(120,60,0.4,0.25,'sawtooth'),Math.min(1500,D.pos.distanceTo(b.c)*3));}
  for(const b of fw.bursts){if(b.t>2.6){b.p.material.opacity=0;continue;}b.t+=dt;const pos=b.p.geometry.attributes.position.array;for(let i=0;i<pos.length/3;i++){b.vel[i*3+1]-=6*dt;b.vel[i*3]*=1-dt*0.9;b.vel[i*3+1]*=1-dt*0.9;b.vel[i*3+2]*=1-dt*0.9;pos[i*3]+=b.vel[i*3]*dt;pos[i*3+1]+=b.vel[i*3+1]*dt;pos[i*3+2]+=b.vel[i*3+2]*dt;}b.p.geometry.attributes.position.needsUpdate=true;b.p.material.opacity=Math.max(0,1-b.t/2.6);}}
function searchlight(x,y,z,ph){const g=new THREE.Group();g.position.set(x,y,z);const cone=new THREE.Mesh(new THREE.CylinderGeometry(0.6,9,160,16,1,true),basic(0xdfefff,{transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false}));cone.position.y=80;g.add(cone);scene.add(g);searchlights.push({g,cone,ph});}
function updSearch(t){for(const s of searchlights){s.g.rotation.z=0.45*Math.sin(t*0.3+s.ph);s.g.rotation.x=0.35*Math.cos(t*0.23+s.ph*2);s.cone.material.opacity=Math.max(0,nightF-0.4)*0.16;}}
// per-frame: segments, skims and vaults
const segHud={name:'',t:0,show:0};
function updSegments(dt){if(S.activity!=='free'||D.crashed)return;for(const s of MAPDEF.segments){
  const cross=(P,ring)=>{const d0=_tp.copy(D.prev).sub(P).dot(s.n),d1=_tp2.copy(D.pos).sub(P).dot(s.n);if(d0<0&&d1>=0){const t=d0/(d0-d1);_tp.copy(D.prev).lerp(D.pos,t);return _tp.distanceTo(P)<s.r;}return false;};
  if(cross(s.A)){s.t0=simT;sfxDing();toast('⏱ '+s.name+' started');}
  if(s.t0!=null&&cross(s.B)){const tt=simT-s.t0;s.t0=null;const k='seg.'+MAP+'.'+s.name,b=store.get(k,null);const nb=b==null||tt<b;if(nb)store.set(k,tt);addCash(nb?100:40);toast((nb?'🏆 ':'')+s.name+' '+fmtT(tt)+(b!=null&&!nb?'  (best '+fmtT(b)+')':''));sfxDing();rumble(0.5,0.8,200);}
  if(s.t0!=null&&simT-s.t0>90)s.t0=null;}
  const run=MAPDEF.segments.find(s=>s.t0!=null);segHud.name=run?run.name:'';segHud.t=run?simT-run.t0:0;
  for(const z of MAPDEF.skims){if(!D.grounded&&D.pos.x>z.x0&&D.pos.x<z.x1&&D.pos.z>z.z0&&D.pos.z<z.z1&&D.pos.y<z.y+0.9&&D.pos.y>z.y-0.6&&D.vel.length()>7&&z.cd<simT){z.cd=simT+3;addTrick(z.name,150);}}}
let vaultOpenNotified=false;
function updVaults(dt){for(const v of MAPDEF.vaults){
  const unlocked=gotTokens.size>=tokens.length&&tokens.length>0;
  if(unlocked&&!v.open){v.open=true;v.hc.disabled=true;if(!vaultOpenNotified){vaultOpenNotified=true;toast('🔓 All tokens found. A secret hatch has opened somewhere on this map…');}}
  if(v.open&&v.anim<1){v.anim=Math.min(1,v.anim+dt*0.6);v.hatch.position.x=v.x+v.anim*2.6;}
  v.trophy.rotation.y+=dt*1.5;
  const key='vault.'+MAP;if(v.open&&!store.get(key,false)&&Math.abs(D.pos.x-v.x)<v.w/2&&Math.abs(D.pos.z-v.z)<v.d/2&&D.pos.y>v.y&&D.pos.y<v.y+v.h){store.set(key,true);addCash(5000);sfxDing();rumble(1,1,500);toast('🏆 You found the secret vault! +$5,000');}}}

