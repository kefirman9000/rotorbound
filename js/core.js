'use strict';
const VERSION='0.10.0';
const REPO='kefirman9000/rotorbound';
const $=id=>document.getElementById(id);
if(!window.THREE){document.body.innerHTML='<div style="padding:40px;font-size:20px">Could not load the 3D engine (lib/three.min.js is missing). Re-download Rotorbound from GitHub.</div>';throw new Error('three.js missing');}
THREE.ColorManagement.legacyMode=false;
const V3=THREE.Vector3, QT=THREE.Quaternion;
const DEG=Math.PI/180, G=9.81, R=0.22, STEP=1/240, CRASH_V=7.5, GH_DT=0.05, TAU=Math.PI*2;
const UP=new V3(0,1,0);
$('verS').textContent='v'+VERSION;
const store={get(k,d){try{const v=localStorage.getItem('rotorbound.'+k);return v==null?d:JSON.parse(v);}catch(e){return d;}},set(k,v){try{localStorage.setItem('rotorbound.'+k,JSON.stringify(v));}catch(e){}}};

// ---------------- settings ----------------
const DEFAULTS={weather:'auto',dynRes:true,ai:'medium',battery:false,signal:false,speedFx:true,quality:'high',rollRc:1,rollSr:0.7,rollEx:0,pitchRc:1,pitchSr:0.7,pitchEx:0,yawRc:1,yawSr:0.6,yawEx:0,thrMid:0.5,thrExpo:0,altHold:false,dzL:0.08,dzR:0.08,trigRumble:true,propWash:true,racingLine:true,bind:null,cal:null,respawn:'safe',map:'city',shadows:true,activity:'race',track:'city',tod:'day',wind:1,ghost:true,light:'auto',traffic:true,mode:'angle',layout:'trigger',rate:670,expo:0.3,angleMax:55,tilt:25,fov:95,thrustRatio:4.5,deadzone:0.08,invertPitch:false,view:'fpv',fx:true,rumble:true,sound:true,volume:0.6};
let S=Object.assign({},DEFAULTS,store.get('settings',{}));
function save(){store.set('settings',S);}
const DEFAULT_BIND={thr:{t:'b',i:7,inv:false},yaw:{t:'a',i:0,inv:false},pitch:{t:'a',i:3,inv:true},roll:{t:'a',i:2,inv:false},btn:{respawn:0,view:1,lap:2,mode:3,tiltDn:4,tiltUp:5,turtle:6,reset:8,menu:9,replay:10,photo:11}};
if(!S.bind||!S.bind.btn)S.bind=JSON.parse(JSON.stringify(DEFAULT_BIND));
if(S.layout!=='trigger'&&S.bind.thr.t==='b')S.bind.thr={t:'a',i:1,inv:true};
let cash=store.get('cash',0);
function addCash(v){cash+=v;store.set('cash',cash);}
// ---------------- garage parts ----------------
const PARTS={
  frame:{l:'Frame',p:[
    {id:'free5',n:'Freestyle 5"',cost:0,d:'Balanced all-rounder. Takes a hit, flips well.'},
    {id:'race5',n:'Race 5" (carbon light)',cost:1500,mass:0.85,drag:0.85,tough:0.8,d:'Lighter and slipperier: faster and snappier, but breaks easier.'},
    {id:'whoop',n:'Cinewhoop 3" ducted',cost:2500,mass:0.75,drag:1.55,thr:0.78,tough:1.7,resp:0.9,scale:0.8,d:'Prop guards bounce off walls. Slow and smooth — made for indoors.'},
    {id:'x8',n:'X8 heavy lifter',cost:4000,mass:1.6,drag:1.25,thr:1.75,cargo:0.4,tough:1.3,resp:0.8,scale:1.3,d:'Eight motors. Carries courier packages like they weigh nothing.'}]},
  motor:{l:'Motors',p:[
    {id:'m2306',n:'2306 · 2450KV',cost:0,d:'Stock motors. Good all round.'},
    {id:'m2207',n:'2207 · 1950KV torque',cost:1200,thr:1.08,resp:1.25,pitch:0.85,d:'More torque: crisper throttle and quicker recovery from prop wash.'},
    {id:'m2306r',n:'2306 · 2750KV race',cost:2200,thr:1.25,resp:1.1,drain:1.25,pitch:1.15,d:'Screaming race motors. Big top end, drains the pack faster.'}]},
  prop:{l:'Props',p:[
    {id:'tri',n:'5" tri-blade',cost:0,d:'Grippy and predictable.'},
    {id:'bi',n:'5" bi-blade',cost:600,thr:0.93,drag:0.92,drain:0.85,resp:0.95,d:'Efficient and floaty. Higher top speed on long straights.'},
    {id:'quad',n:'5" quad-blade',cost:900,thr:1.07,resp:1.15,drain:1.15,drag:1.04,d:'Locked-in grip for tight cornering.'}]},
  bat:{l:'Battery',p:[
    {id:'4s1500',n:'4S 1500mAh',cost:0,cells:4,d:'Stock pack.'},
    {id:'6s1100',n:'6S 1100mAh',cost:1800,cells:6,thr:1.15,cap:0.85,mass:0.97,pitch:1.12,d:'Higher voltage: more punch, slightly lighter, sags sooner.'},
    {id:'6s1500',n:'6S 1500mAh',cost:3000,cells:6,thr:1.15,cap:1.3,mass:1.12,pitch:1.12,d:'Punch and endurance, at the cost of weight.'}]}};
Object.assign(PARTS,{
  paint:{l:'Frame paint',p:[{id:'pc_carbon',n:'Carbon black',cost:0,col:0x1b1d22,d:'Classic raw carbon.'},{id:'pc_red',n:'Racing red',cost:150,col:0xc81d25,d:'Fast, obviously.'},{id:'pc_white',n:'Arctic white',cost:150,col:0xe8edf2,d:'Shows every scratch.'},{id:'pc_lime',n:'Toxic lime',cost:200,col:0x8bea2b,d:'Easy to spot in a crash.'},{id:'pc_blue',n:'Deep blue',cost:200,col:0x1f4fd1,d:'Calm and collected.'},{id:'pc_gold',n:'Gold chrome',cost:600,col:0xd4a017,d:'Flex.'}]},
  led:{l:'LED colour',p:[{id:'led_red',n:'Red',cost:0,col:0xff2d55,d:'Stock LEDs.'},{id:'led_cyan',n:'Cyan',cost:100,col:0x3fc8ff,d:'Cool glow.'},{id:'led_green',n:'Green',cost:100,col:0x39ff88,d:'Matrix vibes.'},{id:'led_purple',n:'Purple',cost:100,col:0xb06bff,d:'Night-flight favourite.'},{id:'led_white',n:'White',cost:100,col:0xffffff,d:'Bright and clean.'}]},
  propc:{l:'Prop colour',p:[{id:'pr_cyan',n:'Clear cyan',cost:0,col:0x3fc8ff,d:'Stock props.'},{id:'pr_orange',n:'Orange',cost:80,col:0xff8a1f,d:'Easy to find in the grass.'},{id:'pr_pink',n:'Hot pink',cost:80,col:0xff3d7f,d:'Loud.'},{id:'pr_black',n:'Black',cost:80,col:0x222222,d:'Stealthy.'},{id:'pr_yellow',n:'Yellow',cost:80,col:0xffd23f,d:'Sunny.'}]},
  osd:{l:'OSD colour',p:[{id:'osd_white',n:'White',cost:0,css:'#ffffff',d:'Stock OSD.'},{id:'osd_green',n:'Phosphor green',cost:120,css:'#5dff9a',d:'Old-school goggles.'},{id:'osd_amber',n:'Amber',cost:120,css:'#ffc14d',d:'Easy on the eyes at night.'},{id:'osd_cyan',n:'Cyan',cost:120,css:'#6fe3ff',d:'HUD style.'}]}});
const PART_CATS=Object.keys(PARTS);
const garage=store.get('garage',null)||{own:['free5','m2306','tri','4s1500'],eq:{frame:'free5',motor:'m2306',prop:'tri',bat:'4s1500'}};
const partOf=(cat,id)=>PARTS[cat].p.find(x=>x.id===id)||PARTS[cat].p[0];
function buildStats(sel){const o={thr:1,mass:1,drag:1,resp:1,tough:1,cargo:1,drain:1,cap:1,pitch:1,cells:4,scale:1};
  for(const c of PART_CATS){const p=partOf(c,sel[c]);for(const k of['thr','mass','drag','resp','tough','cargo','drain','cap','pitch'])if(p[k])o[k]*=p[k];if(p.cells)o.cells=p.cells;if(p.scale)o.scale=p.scale;}
  o.thr/=o.mass;o.resp/=Math.sqrt(o.mass);return o;}
let GAR=buildStats(garage.eq);
const MAP_IDS=['city','canyons','port','factory','valley','ski','mall'];const MAP=MAP_IDS.includes(S.map)?S.map:'city';
const SHADOWS=MAP!=='city'&&S.shadows!==false&&S.quality!=='low';
const TOK_KEY=MAP==='city'?'tokens':'tokens.'+MAP;

// ---------------- renderer / scene ----------------
const renderer=new THREE.WebGLRenderer({canvas:$('gl'),antialias:true});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)*({low:0.6,medium:0.85}[S.quality]||1));
renderer.setSize(innerWidth,innerHeight);
renderer.outputEncoding=THREE.sRGBEncoding;
const scene=new THREE.Scene();
scene.fog=new THREE.Fog(0xc4e2f5,160,750);
const camera=new THREE.PerspectiveCamera(S.fov,innerWidth/innerHeight,0.08,S.quality==='low'?1100:2200);
const hemi=new THREE.HemisphereLight(0xe6f2ff,0x4d4a40,0.95);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff0d8,1.25);sun.position.set(220,320,120);scene.add(sun);
if(SHADOWS){renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;sun.castShadow=true;const sz=Math.min(S.quality==='medium'?2048:4096,renderer.capabilities.maxTextureSize);sun.shadow.mapSize.set(sz,sz);const sc=sun.shadow.camera;sc.left=-170;sc.right=170;sc.top=170;sc.bottom=-170;sc.near=10;sc.far=1100;sun.shadow.bias=-0.0006;sun.shadow.normalBias=0.03;}
addEventListener('resize',()=>{renderer.setSize(innerWidth,innerHeight);camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();});

const skyU={top:{value:new THREE.Color(0x5ea8e6)},hor:{value:new THREE.Color(0xc4e2f5)},sunDir:{value:new V3(0.5,0.7,0.3).normalize()},sunCol:{value:new THREE.Color(0xfff0d8)}};
const sky=new THREE.Mesh(new THREE.SphereGeometry(1600,32,16),new THREE.ShaderMaterial({uniforms:skyU,side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:'varying vec3 vD;void main(){vD=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform vec3 top;uniform vec3 hor;uniform vec3 sunDir;uniform vec3 sunCol;varying vec3 vD;void main(){float h=clamp(vD.y,0.0,1.0);vec3 c=mix(hor,top,pow(h,0.55));float s=max(dot(normalize(vD),sunDir),0.0);c+=sunCol*(pow(s,600.0)*2.0+pow(s,12.0)*0.25);gl_FragColor=vec4(c,1.0);\n#include <encodings_fragment>\n}'}));
sky.renderOrder=-1;sky.frustumCulled=false;scene.add(sky);
const stars=(()=>{const n=1500,p=new Float32Array(n*3);for(let i=0;i<n;i++){const u=Math.random()*TAU,v=Math.random()*0.95+0.05,r=1500,c=Math.sqrt(1-v*v);p[i*3]=Math.cos(u)*c*r;p[i*3+1]=v*r;p[i*3+2]=Math.sin(u)*c*r;}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(p,3));const s=new THREE.Points(g,new THREE.PointsMaterial({color:0xffffff,size:1.6,sizeAttenuation:false,transparent:true,opacity:0,fog:false,depthWrite:false}));s.frustumCulled=false;return s;})();
scene.add(stars);

// ---------------- world helpers ----------------
let seed=1337;const rnd=()=>{seed=(seed*16807)%2147483647;return (seed-1)/2147483646;};
const colliders=[],buildings=[],dynCols=[];
function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;draw(c.getContext('2d'),w,h);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.encoding=THREE.sRGBEncoding;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
const lam=(c,o)=>new THREE.MeshLambertMaterial(Object.assign({color:c},o||{}));
const basic=(c,o)=>new THREE.MeshBasicMaterial(Object.assign({color:c},o||{}));
const unitBox=new THREE.BoxGeometry(1,1,1);
const batches=new Map();
function collider(x0,y0,z0,x1,y1,z1,soft){const c={min:new V3(x0,y0,z0),max:new V3(x1,y1,z1),st:0,soft:!!soft};colliders.push(c);return c;}
const SOFT_MATS=new Set();
function isThin(w,h,d){const a=[w,h,d].sort((p,q)=>p-q);return a[1]<0.35;}
function box(x,y,z,w,h,d,mat,collide=true){let a=batches.get(mat);if(!a){a=[];batches.set(mat,a);}a.push(x,y+h/2,z,w,h,d);if(collide)collider(x-w/2,y,z-d/2,x+w/2,y+h,z+d/2,SOFT_MATS.has(mat)||isThin(w,h,d));}
function flushBatches(){const m4=new THREE.Matrix4(),q=new QT(),p=new V3(),s=new V3();for(const[mat,a]of batches){const n=a.length/6;const im=new THREE.InstancedMesh(unitBox,mat,n);for(let i=0;i<n;i++){p.set(a[i*6],a[i*6+1],a[i*6+2]);s.set(a[i*6+3],a[i*6+4],a[i*6+5]);m4.compose(p,q,s);im.setMatrixAt(i,m4);}im.frustumCulled=false;scene.add(im);}batches.clear();}
// sloped surface (ramps, rising roads, stair streets): smooth collision along one axis
function ramp(x0,x1,z0,z1,axis,h0,h1,mat){colliders.push({min:new V3(x0,Math.min(h0,h1)-1.5,z0),max:new V3(x1,Math.max(h0,h1),z1),st:0,ramp:{axis,a0:axis==='x'?x0:z0,a1:axis==='x'?x1:z1,h0,h1}});
  if(!mat)return;const span=axis==='x'?x1-x0:z1-z0,wid=axis==='x'?z1-z0:x1-x0,dh=h1-h0,L=Math.hypot(span,dh),ang=Math.atan2(dh,span),th=0.8;
  const m=new THREE.Mesh(new THREE.BoxGeometry(axis==='x'?L:wid,th,axis==='x'?wid:L),mat);m.position.set((x0+x1)/2,(h0+h1)/2-th/2*Math.cos(ang),(z0+z1)/2);if(axis==='x')m.rotation.z=ang;else m.rotation.x=-ang;scene.add(m);}
// ambient steam vents and wet patches
const steamVents=[];function steamVent(x,y,z){steamVents.push({x,y,z,ph:Math.random()*10});}
const puddleMat=new THREE.MeshPhongMaterial({color:0x15181c,shininess:160,specular:0x9fb3c8,transparent:true,opacity:0.85,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6});
function puddle(x,z,r,y=0.02){const m=new THREE.Mesh(new THREE.CircleGeometry(r,18),puddleMat);m.rotation.x=-Math.PI/2;m.scale.set(1,0.55+Math.random()*0.4,1);m.rotation.z=Math.random()*3;m.position.set(x,y,z);scene.add(m);}
function mesh(geo,mat,x,y,z){const m=new THREE.Mesh(geo,mat);m.position.set(x,y,z);scene.add(m);return m;}
function dynBox(cx,cy,cz,hx,hy,hz){dynCols.push({min:new V3(cx-hx,cy-hy,cz-hz),max:new V3(cx+hx,cy+hy,cz+hz),st:0});}

// ---------------- materials ----------------
const WIN=[[5,12,54,38],[10,16,16,26,38,16,16,26]];
function winRects(style){const r=WIN[style];return r.length===4?[r]:[r.slice(0,4),r.slice(4)];}
function dayTex(style){return canvasTex(512,512,(g)=>{g.fillStyle='#fff';g.fillRect(0,0,512,512);for(let i=0;i<8;i++)for(let j=0;j<8;j++)for(const[x,y,w,h]of winRects(style)){const s=36+Math.floor(rnd()*22);g.fillStyle=`rgb(${s},${s+18},${s+36})`;g.fillRect(i*64+x,j*64+y,w,h);g.fillStyle='rgba(255,255,255,.18)';g.fillRect(i*64+x,j*64+y,w,Math.max(4,h*0.2));}});}
function nightTex(style){return canvasTex(512,512,(g)=>{g.fillStyle='#000';g.fillRect(0,0,512,512);const cols=['#ffd58a','#ffe7b0','#fff3d6','#bcd8ff','#ffc070'];for(let i=0;i<8;i++)for(let j=0;j<8;j++)for(const[x,y,w,h]of winRects(style)){if(rnd()<0.42){g.fillStyle=cols[Math.floor(rnd()*cols.length)];g.globalAlpha=0.55+rnd()*0.45;g.fillRect(i*64+x,j*64+y,w,h);g.globalAlpha=1;}}});}
const texSets=[0,1,0,1].map(s=>[dayTex(s),nightTex(s)]);
const wallMats=['#e8dcc8','#c9ced6','#b07a5a','#9aa7b5','#d8c49a','#7d8a99'].map((c,i)=>{const t=texSets[i%4];return lam(c,{map:t[0],emissive:0xffffff,emissiveMap:t[1],emissiveIntensity:0});});
const roofMat=lam(0x555a60),propMat=lam(0x8a8f96),sideMat=lam(0xa9a9a4),grassMat=lam(0x5f8f45),concrete=lam(0x9a9890),concrete2=lam(0xb9b6ae);
const darkMetal=lam(0x3a3d44),steel=lam(0x6f7a86),yellowSteel=lam(0xe2b41f),redSteel=lam(0xc2352b),tunnelMat=lam(0x55575c),dumpMat=lam(0x2f6b3d);
const trunkMat=lam(0x6b4a2f),leafMat=lam(0x3f7a35),rockMat=lam(0x7c6f64);
SOFT_MATS.add(propMat);
const padMat=lam(0x222222,{map:canvasTex(128,128,(g)=>{g.fillStyle='#222';g.fillRect(0,0,128,128);g.strokeStyle='#ffd23f';g.lineWidth=8;g.beginPath();g.arc(64,64,46,0,7);g.stroke();g.fillStyle='#ffd23f';g.font='bold 60px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('H',64,68);})});
const glowMats=[];
const neon=c=>basic(c);
const lampMat=basic(0xd8d2b8);
// billboards with made-up brands
const ADS=[['ZAP COLA','#e11d48','#fff','Taste the voltage'],['BYTE BURGER','#f59e0b','#1b1b1b','Now with 64 bits'],['NOVA PHONE 9','#1d4ed8','#fff','Thinner than ever'],['HYPER NOODLE','#16a34a','#fff','Ready in 90 seconds'],['SKYFAIR PARK','#9333ea','#ffe066','Open late every night'],['ROTOR RACING','#0ea5e9','#0b1020','Live tonight 9PM'],['MOON MILK','#334155','#e2e8f0','Out of this world'],['GLOOP SODA','#14b8a6','#042f2e','It wiggles']];
const adMats=ADS.map(([t,bg,fg,sub])=>{const tx=canvasTex(512,256,(g)=>{g.fillStyle=bg;g.fillRect(0,0,512,256);g.strokeStyle=fg;g.lineWidth=10;g.strokeRect(10,10,492,236);g.fillStyle=fg;g.textAlign='center';g.textBaseline='middle';let fs=86;do{g.font='bold '+fs+'px Impact, Arial Black, sans-serif';fs-=4;}while(g.measureText(t).width>460&&fs>20);g.fillText(t,256,110);g.font='bold 30px sans-serif';g.fillText(sub,256,190);});tx.wrapS=tx.wrapT=THREE.ClampToEdgeWrapping;const m=lam(0xffffff,{map:tx,emissive:0xffffff,emissiveMap:tx,emissiveIntensity:0.15});glowMats.push(m);return m;});
function billboard(x,y,z,w,h,rotY,ad){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,h),adMats[ad%adMats.length]);p.position.set(x,y,z);p.rotation.y=rotY;scene.add(p);const back=new THREE.Mesh(new THREE.PlaneGeometry(w,h),darkMetal);back.position.copy(p.position);back.rotation.y=rotY+Math.PI;scene.add(back);
  const ax=Math.abs(Math.cos(rotY))>0.5;collider(x-(ax?w/2:0.3),y-h/2,z-(ax?0.3:w/2),x+(ax?w/2:0.3),y+h/2,z+(ax?0.3:w/2));}

// ---------------- city layout ----------------
const N=7,ROAD=16,CELL=60,BLOCK=CELL-ROAD,HALF=N*CELL/2;
const alleys=[];
function fireEscape(wallX,wallZ,axis,dir,h,span){
  const top=Math.min(h-2,34);
  for(let y=4;y<=top;y+=3.5){
    if(axis==='x'){const px=wallX+dir*0.6;box(px,y,wallZ,1.2,0.12,span,darkMetal);box(wallX+dir*1.17,y+0.12,wallZ,0.06,1,span,darkMetal,false);box(px,y-3.4,wallZ-span/2+0.3,0.5,3.4,0.08,darkMetal,false);}
    else{const pz=wallZ+dir*0.6;box(wallX,y,pz,span,0.12,1.2,darkMetal);box(wallX,y+0.12,wallZ+dir*1.17,span,1,0.06,darkMetal,false);box(wallX-span/2+0.3,y-3.4,pz,0.08,3.4,0.5,darkMetal,false);}
  }
}
function building(x,z,w,d,h,y0=0,opt={}){
  const geo=new THREE.BoxGeometry(w,h,d);const uv=geo.attributes.uv;
  for(let i=0;i<uv.count;i++){const f=Math.floor(i/4);let sx,sy;if(f<2){sx=d/32;sy=h/28;}else if(f<4){sx=0;sy=0;}else{sx=w/32;sy=h/28;}uv.setXY(i,uv.getX(i)*sx,uv.getY(i)*sy);}
  const wm=wallMats[Math.floor(rnd()*wallMats.length)];
  const top=y0+h;
  const m=new THREE.Mesh(geo,[wm,wm,roofMat,roofMat,wm,wm]);m.position.set(x,y0+h/2,z);scene.add(m);
  collider(x-w/2,y0,z-d/2,x+w/2,top,z+d/2);
  const b={x,z,w,d,h:top,clear:true,bill:false};
  if(opt.plain){buildings.push(b);return b;}
  if(opt.parapet||(w>12&&d>12&&rnd()<0.5)){box(x,top,z-d/2+0.15,w,0.8,0.3,roofMat);box(x,top,z+d/2-0.15,w,0.8,0.3,roofMat);box(x-w/2+0.15,top,z,0.3,0.8,d,roofMat);box(x+w/2-0.15,top,z,0.3,0.8,d,roofMat);}
  const ac=Math.floor(rnd()*4);for(let k=0;k<ac;k++){b.clear=false;box(x+(rnd()-.5)*w*.6,top,z+(rnd()-.5)*d*.6,1.6+rnd()*2.5,1+rnd()*1.5,1.6+rnd()*2.5,propMat);}
  if(top>45&&rnd()<0.6){b.clear=false;const ax=x+(rnd()-.5)*w*.3,az=z+(rnd()-.5)*d*.3,ah=6+rnd()*14;box(ax,top,az,0.4,ah,0.4,propMat);box(ax,top+ah,az,0.6,0.6,0.6,basic(0xff3b3b),false);}
  if(top<45&&rnd()<0.3){b.clear=false;const tx=x+(rnd()-.5)*w*.4,tz=z+(rnd()-.5)*d*.4;mesh(new THREE.CylinderGeometry(1.6,1.6,3.2,12),trunkMat,tx,top+3.8,tz);mesh(new THREE.ConeGeometry(1.8,1,12),trunkMat,tx,top+5.9,tz);for(const[ox,oz]of[[-1,-1],[1,-1],[-1,1],[1,1]])box(tx+ox*1.1,top,tz+oz*1.1,0.2,2.2,0.2,darkMetal);collider(tx-1.6,top,tz-1.6,tx+1.6,top+6.4,tz+1.6);}
  if(top>12&&top<45&&rnd()<0.22){b.clear=false;b.bill=true;rnd();}
  buildings.push(b);return b;
}
const trunkGeo=new THREE.CylinderGeometry(0.25,0.35,3,6),crownGeo=new THREE.SphereGeometry(2.4,8,6);
function tree(x,z,y0=0){mesh(trunkGeo,trunkMat,x,y0+1.75,z);const c=mesh(crownGeo,leafMat,x,y0+4.8,z);c.scale.y=1.2;collider(x-0.35,y0,z-0.35,x+0.35,y0+3,z+0.35);collider(x-1.9,y0+2.6,z-1.9,x+1.9,y0+7.4,z+1.9,true);}

function skeleton(cx,cz,W,floors,fh,deck){
  const top=floors*fh;
  for(const x of[cx-W/2,cx,cx+W/2])for(const z of[cz-W/2,cz,cz+W/2]){if(x===cx&&z===cz)continue;box(x,0,z,0.6,top,0.6,steel);}
  for(let f=1;f<=floors;f++){const y=f*fh;
    box(cx,y-0.4,cz-W/2,W,0.4,0.4,steel);box(cx,y-0.4,cz+W/2,W,0.4,0.4,steel);box(cx-W/2,y-0.4,cz,0.4,0.4,W,steel);box(cx+W/2,y-0.4,cz,0.4,0.4,W,steel);
    box(cx,y-0.4,cz,W,0.4,0.3,steel);box(cx,y-0.4,cz,0.3,0.4,W,steel);
    if(rnd()<deck){const qx=rnd()<.5?-1:1,qz=rnd()<.5?-1:1;box(cx+qx*W/4,y-0.55,cz+qz*W/4,W/2-0.8,0.15,W/2-0.8,concrete);}
  }
  return top;
}
const cranes=[];
const latticeMat=lam(0xe2b41f,{map:canvasTex(64,64,(g)=>{g.clearRect(0,0,64,64);g.strokeStyle='#fff';g.lineWidth=6;g.strokeRect(3,3,58,58);g.beginPath();g.moveTo(0,0);g.lineTo(64,64);g.moveTo(64,0);g.lineTo(0,64);g.stroke();}),alphaTest:0.5,side:THREE.DoubleSide});
function scaleUvY(geo,f){const a=geo.attributes.uv.array;for(let i=1;i<a.length;i+=2)a[i]*=f;return geo;}
function crane(x,z,mastH,jib){
  mesh(scaleUvY(new THREE.BoxGeometry(2,mastH,2),mastH/2),latticeMat,x,mastH/2,z);
  collider(x-1,0,z-1,x+1,mastH,z+1);
  const g=new THREE.Group();g.position.set(x,mastH,z);scene.add(g);
  const add=(geo,mat,px,py,pz)=>{const m=new THREE.Mesh(geo,mat);m.position.set(px,py,pz);g.add(m);return m;};
  add(new THREE.BoxGeometry(jib,1.2,1.2),latticeMat,jib/2,0.6,0);
  add(new THREE.BoxGeometry(jib*0.3,1.2,1.4),latticeMat,-jib*0.15,0.6,0);
  add(new THREE.BoxGeometry(4,3,2.4),concrete,-jib*0.28,-0.6,0);
  add(new THREE.BoxGeometry(2.6,2.2,2.2),yellowSteel,1.2,-1.4,1.8);
  add(new THREE.ConeGeometry(1.2,6,4),latticeMat,0,3.6,0);
  add(new THREE.SphereGeometry(0.4,8,6),basic(0xff2d2d),jib,1.4,0);
  const trolley=add(new THREE.BoxGeometry(1.6,0.6,1.6),darkMetal,0,-0.3,0);
  const cable=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1,4),darkMetal);scene.add(cable);
  const hook=new THREE.Group();hook.add(new THREE.Mesh(new THREE.BoxGeometry(1.4,1.2,1.4),yellowSteel));const load=new THREE.Mesh(new THREE.BoxGeometry(5,0.6,1.2),redSteel);load.position.y=-1.6;hook.add(load);scene.add(hook);
  cranes.push({x,z,mastH,jib,g,trolley,cable,hook,ph:rnd()*10});
}
const _cv=new V3();
function updCranes(t){
  for(const c of cranes){
    const a=c.ph+1.3*Math.sin(t*0.035+c.ph);c.g.rotation.y=a;
    const d=c.jib*(0.5+0.35*Math.sin(t*0.06+c.ph*2));c.trolley.position.set(d,-0.3,0);
    const L=c.mastH*0.45+10*Math.sin(t*0.045+c.ph);
    const sx=0.12*Math.sin(t*0.9+c.ph),sz=0.1*Math.sin(t*0.67+c.ph*3);
    _cv.set(d,0,0).applyAxisAngle(UP,a);const tx=c.x+_cv.x,tz=c.z+_cv.z,ty=c.mastH-0.6;
    const hx=tx+Math.sin(sx)*L,hy=ty-L,hz=tz+Math.sin(sz)*L;
    c.hook.position.set(hx,hy,hz);c.hook.rotation.y=a;
    c.cable.position.set((tx+hx)/2,(ty+hy)/2,(tz+hz)/2);c.cable.scale.y=L;c.cable.lookAt(hx,hy,hz);c.cable.rotateX(Math.PI/2);
    dynBox(hx,hy,hz,0.8,0.7,0.8);dynBox(hx,hy-1.6,hz,2.6,0.35,2.6);
    for(let s=-c.jib*0.3;s<=c.jib;s+=3){_cv.set(s,0,0).applyAxisAngle(UP,a);dynBox(c.x+_cv.x,c.mastH+0.6,c.z+_cv.z,0.9,0.8,0.9);}
  }
}

// ---------------- shared map systems ----------------
const MAPDEF={spawn:null,tracks:{},spots:[],tokens:[]};
let PARK=null,lampGlow=null,updTrain=null,updParkRides=null;
const fans=[],gapZones=[];
function updFans(t){for(const f of fans){const a=t*f.spd;f.rot.rotation.x=a;for(let k=0;k<3;k++){const b=a+k/3*TAU;for(let s=2;s<=f.r;s+=2.2){const y=f.y+Math.cos(b)*s,o=Math.sin(b)*s;if(f.ax==='x')dynBox(f.x,y,f.z+o,0.5,1.2,1.2);else dynBox(f.x+o,y,f.z,1.2,1.2,0.5);}}}}
// traffic
const cars=[];
const CAR_N=90;
const carBody=new THREE.InstancedMesh(unitBox,lam(0xffffff),CAR_N),carCab=new THREE.InstancedMesh(unitBox,lam(0x9fb6c9),CAR_N);
const headMat=basic(0x777777),tailMat=basic(0x551111);
const carHead=new THREE.InstancedMesh(unitBox,headMat,CAR_N),carTail=new THREE.InstancedMesh(unitBox,tailMat,CAR_N);
const carBeamTex=canvasTex(32,64,(g)=>{const gr=g.createLinearGradient(0,64,0,0);gr.addColorStop(0,'rgba(255,240,200,.85)');gr.addColorStop(1,'rgba(255,240,200,0)');g.fillStyle=gr;g.beginPath();g.moveTo(10,64);g.lineTo(22,64);g.lineTo(32,0);g.lineTo(0,0);g.fill();});
const carBeam=new THREE.InstancedMesh(new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:carBeamTex,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}),CAR_N);carBeam.frustumCulled=false;scene.add(carBeam);
[carBody,carCab,carHead,carTail].forEach(m=>{m.frustumCulled=false;scene.add(m);});
const carPal=[0xb91c1c,0x1d4ed8,0xe5e7eb,0x111827,0x65a30d,0xf59e0b,0x7c3aed,0x0891b2,0xfafafa,0x52525b],_carCol=new THREE.Color();
function addCar(o){if(cars.length>=CAR_N)return;const k=cars.length;cars.push(Object.assign({dir:1,lane:0,p:0,v:10,big:false,min:-222,max:222,y0:0},o));_carCol.setHex(carPal[k%carPal.length]);carBody.setColorAt(k,_carCol);carBody.instanceColor.needsUpdate=true;}
const _m4=new THREE.Matrix4(),_cq=new QT(),_cp=new V3(),_cs=new V3(),_off=new V3();
function updTraffic(t,dt){
  for(let k=0;k<CAR_N;k++){const c=cars[k];
    if(!c||!S.traffic){_m4.makeScale(0,0,0);carBeam.setMatrixAt(k,_m4);carBody.setMatrixAt(k,_m4);carCab.setMatrixAt(k,_m4);carHead.setMatrixAt(k,_m4);carTail.setMatrixAt(k,_m4);continue;}
    const span=c.max-c.min;c.p+=c.dir*c.v*dt;if(c.p>c.max)c.p-=span;if(c.p<c.min)c.p+=span;
    const x=c.axis==='x'?c.p:c.line+c.lane,z=c.axis==='x'?c.line+c.lane:c.p,yaw=c.axis==='x'?(c.dir>0?Math.PI/2:-Math.PI/2):(c.dir>0?0:Math.PI);
    const L=c.big?8:4.3,Hh=c.big?3.2:1.2,y0=c.y0;
    _cq.setFromAxisAngle(UP,yaw);
    _m4.compose(_cp.set(x,y0+0.3+Hh/2,z),_cq,_cs.set(1.9,Hh,L));carBody.setMatrixAt(k,_m4);
    _m4.compose(_cp.set(x,y0+0.3+Hh+0.4,z),_cq,_cs.set(c.big?1.85:1.7,c.big?0.05:0.8,c.big?L-0.2:2.2));carCab.setMatrixAt(k,_m4);
    _off.set(0,0,L/2).applyQuaternion(_cq);
    _m4.compose(_cp.set(x+_off.x,y0+0.75,z+_off.z),_cq,_cs.set(1.7,0.25,0.1));carHead.setMatrixAt(k,_m4);
    _m4.compose(_cp.set(x-_off.x,y0+0.75,z-_off.z),_cq,_cs.set(1.7,0.25,0.1));carTail.setMatrixAt(k,_m4);
    {_off.set(0,0,-(L/2+5.5)).applyQuaternion(_cq);_m4.compose(_cp.set(x+_off.x,y0+0.07,z+_off.z),_cq,_cs.set(4,1,11));carBeam.setMatrixAt(k,_m4);}
    const along=c.axis==='x',top=0.3+Hh+(c.big?0:0.8);dynBox(x,y0+top/2,z,along?L/2:0.95,top/2,along?0.95:L/2);
  }
  carBeam.instanceMatrix.needsUpdate=carBody.instanceMatrix.needsUpdate=carCab.instanceMatrix.needsUpdate=carHead.instanceMatrix.needsUpdate=carTail.instanceMatrix.needsUpdate=true;
}
// street lamps + night glow
let lampPool=null;const NIGHT_NEON=[];
function makeLamps(pts){
  const poleGeo=new THREE.CylinderGeometry(0.1,0.14,7,6);poleGeo.translate(0,3.5,0);
  const lampGeo=new THREE.BoxGeometry(0.4,0.25,1.4);lampGeo.translate(0,7,0.5);
  const pm=new THREE.InstancedMesh(poleGeo,propMat,pts.length),lm=new THREE.InstancedMesh(lampGeo,lampMat,pts.length);
  const m4=new THREE.Matrix4(),gp=new Float32Array(pts.length*3);
  pts.forEach(([x,z],k)=>{m4.makeTranslation(x,0,z);pm.setMatrixAt(k,m4);lm.setMatrixAt(k,m4);collider(x-0.15,0,z-0.15,x+0.15,7.2,z+0.15,true);gp[k*3]=x;gp[k*3+1]=6.8;gp[k*3+2]=z+0.5;});
  pm.frustumCulled=lm.frustumCulled=false;scene.add(pm);scene.add(lm);
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(gp,3));
  const glowTex=canvasTex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(0.3,'rgba(255,220,150,.5)');gr.addColorStop(1,'rgba(255,200,120,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);});
  {const pt=canvasTex(64,64,(g)=>{const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,214,150,.9)');gr.addColorStop(0.5,'rgba(255,190,110,.35)');gr.addColorStop(1,'rgba(255,180,100,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);});
   const pg=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2);lampPool=new THREE.InstancedMesh(pg,new THREE.MeshBasicMaterial({map:pt,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-8}),pts.length);
   pts.forEach(([x,z],k)=>{m4.compose(_cp.set(x,0.06,z+1.2),_cq.set(0,0,0,1),_cs.set(11,1,11));lampPool.setMatrixAt(k,m4);});lampPool.frustumCulled=false;lampPool.userData.noMerge=1;scene.add(lampPool);}
  lampGlow=new THREE.Points(gg,new THREE.PointsMaterial({map:glowTex,color:0xffd590,size:7,transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending}));scene.add(lampGlow);
}
