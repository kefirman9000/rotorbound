'use strict';
if(MAP==='city'){
// ground & roads
const grass=new THREE.Mesh(new THREE.PlaneGeometry(6000,6000),grassMat);grass.rotation.x=-Math.PI/2;grass.position.y=-0.1;scene.add(grass);
const roadSize=N*CELL+ROAD;
const roadTex=canvasTex(256,256,(g,w,h)=>{g.fillStyle='#3b3d41';g.fillRect(0,0,w,h);for(let i=0;i<2500;i++){g.fillStyle=`rgba(${rnd()<.5?0:255},${rnd()<.5?0:255},255,${rnd()*.05})`;g.fillRect(rnd()*w,rnd()*h,2,2);}g.fillStyle='#e9e3c4';for(let p=0;p<w;p+=26){if(p>w/2-40&&p<w/2+40)continue;g.fillRect(p,0,13,2);g.fillRect(p,h-2,13,2);g.fillRect(0,p,2,13);g.fillRect(w-2,p,2,13);}});
roadTex.repeat.set(roadSize/CELL,roadSize/CELL);roadTex.offset.set(-(ROAD/2)/CELL,-(ROAD/2)/CELL);
{const road=new THREE.Mesh(new THREE.PlaneGeometry(roadSize,roadSize),lam(0xffffff,{map:roadTex,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}));road.rotation.x=-Math.PI/2;scene.add(road);}

function garage(cx,cz){
  const A=38,X0=cx-A/2,X1=cx+A/2,Z0=cz-A/2,Z1=cz+A/2,T=0.3;
  const holes={5:[cx+10,cx+18],10:[cx-18,cx-10],15:[cx+10,cx+18]};
  for(const y of[5,10,15]){
    const[hx0,hx1]=holes[y],hz0=cz-4,hz1=cz+4;
    for(const[a,b,c,d]of[[X0,hx0,Z0,Z1],[hx1,X1,Z0,Z1],[hx0,hx1,Z0,hz0],[hx0,hx1,hz1,Z1]])if(b-a>0.01&&d-c>0.01)box((a+b)/2,y-T,(c+d)/2,b-a,T,d-c,concrete);
    box(cx,y,Z0+0.15,A,1.1,0.3,concrete);box(cx,y,Z1-0.15,A,1.1,0.3,concrete);box(X0+0.15,y,cz,0.3,1.1,A,concrete);box(X1-0.15,y,cz,0.3,1.1,A,concrete);
  }
  for(const[x,z]of[[cx-10,cz-10],[cx-10,cz+10],[cx+10,cz-10],[cx+10,cz+10],[X0+0.4,Z0+0.4],[X0+0.4,Z1-0.4],[X1-0.4,Z0+0.4],[X1-0.4,Z1-0.4]])box(x,0,z,0.7,15,0.7,concrete);
  const carC=[0xb91c1c,0x1d4ed8,0xe5e7eb,0x111827,0x65a30d].map(c=>lam(c));
  for(const y of[0.25,5,10])for(let k=0;k<4;k++){const z=cz+(k<2?-14:14),x=cx-14+(k%2)*8;box(x,y,z,4.2,1.4,1.9,carC[(k+Math.round(y))%5]);}
  const sign=new THREE.Mesh(new THREE.PlaneGeometry(6,6),basic(0xffffff,{map:canvasTex(128,128,(g)=>{g.fillStyle='#1d4fd8';g.fillRect(0,0,128,128);g.fillStyle='#fff';g.font='bold 100px sans-serif';g.textAlign='center';g.textBaseline='middle';g.fillText('P',64,70);})}));
  sign.position.set(X0-0.05,11.5,cz+12);sign.rotation.y=-Math.PI/2;scene.add(sign);
}

// city blocks
const SKEL={x:-60,z:0},SITES=[[-120,-120],[120,120]];
let skelTop=0;
for(let i=0;i<N;i++)for(let j=0;j<N;j++){
  const cx=-HALF+i*CELL+CELL/2,cz=-HALF+j*CELL+CELL/2,dc=Math.hypot(cx,cz);
  box(cx,0,cz,BLOCK,0.25,BLOCK,sideMat);
  if(i===3&&j===3){box(cx,0.25,cz,BLOCK-6,0.02,BLOCK-6,grassMat,false);box(0,0.25,0,4,0.3,4,padMat);for(let k=0;k<8;k++){const a=k/8*TAU;tree(Math.cos(a)*15,Math.sin(a)*15);}
    mesh(new THREE.CylinderGeometry(4,4.4,0.8,20),concrete,0,0.65,-9);collider(-4,0,-13,4,1.05,-5);continue;}
  if(i===5&&j===3){garage(cx,cz);continue;}
  if(cx===SKEL.x&&cz===SKEL.z){skelTop=skeleton(cx,cz,24,24,3.6,0.35);crane(cx,cz,skelTop+18,46);
    [yellowSteel,redSteel,steel,concrete].forEach((m,k)=>box(cx-16+k*2.2,0.25,cz+18,2,2.4,2,m));continue;}
  if(SITES.some(([x,z])=>x===cx&&z===cz)){skeleton(cx,cz,20,8,3.6,0.5);crane(cx+14,cz-14,55,36);
    box(cx,0.25,cz+20,BLOCK,2.4,0.2,lam(0xd9d4c7));for(let k=0;k<5;k++)box(cx-14+k*6,0.25,cz-19,4.5,2.2,2,concrete);continue;}
  const r=rnd();
  if(dc>80&&r<0.12){box(cx,0.25,cz,BLOCK-4,0.02,BLOCK-4,grassMat,false);for(let k=0;k<9;k++)tree(cx+(rnd()-.5)*(BLOCK-10),cz+(rnd()-.5)*(BLOCK-10));continue;}
  const down=95*Math.exp(-(dc*dc)/(2*120*120));
  const H=()=>8+rnd()*18+down*(0.35+rnd()*0.85);
  const s=rnd(),A=BLOCK-6;
  if(s<0.3){const w=A*(0.6+rnd()*0.4),d=A*(0.6+rnd()*0.4);building(cx,cz,w,d,H()*1.15);}
  else if(s<0.65){const w=(A-5)/2;
    if(rnd()<.5){const h1=H(),h2=H(),d2=A*(0.7+rnd()*.3);building(cx-w/2-2.5,cz,w,A,h1);building(cx+w/2+2.5,cz,w,d2,h2);
      fireEscape(cx-2.5,cz-A/4,'x',1,h1,4);fireEscape(cx+2.5,cz+A/5,'x',-1,h2,4);box(cx,0.25,cz+A/2-4,1.5,1.3,2.6,dumpMat);alleys.push([cx,6,cz]);}
    else{const h1=H(),h2=H(),w2=A*(0.7+rnd()*.3);building(cx,cz-w/2-2.5,A,w,h1);building(cx,cz+w/2+2.5,w2,w,h2);
      fireEscape(cx-A/4,cz-2.5,'z',1,h1,4);fireEscape(cx+A/5,cz+2.5,'z',-1,h2,4);box(cx+A/2-4,0.25,cz,2.6,1.3,1.5,dumpMat);alleys.push([cx,6,cz]);}}
  else{const w=(A-5)/2;for(const ox of[-1,1])for(const oz of[-1,1])building(cx+ox*(w/2+2.5),cz+oz*(w/2+2.5),w*(0.75+rnd()*.25),w*(0.75+rnd()*.25),H());}
}

// river, rail bridges and the riverside tunnel
{
  const water=new THREE.Mesh(new THREE.PlaneGeometry(40,6000),new THREE.MeshPhongMaterial({color:0x2c6c8c,shininess:90,specular:0x99bbcc,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}));water.rotation.x=-Math.PI/2;water.position.set(270,0.03,0);scene.add(water);
  const bm=lam(0x7a5a4a);
  for(const bz of[-90,30,150]){
    box(270,7,bz,68,1,10,bm);box(270,8,bz-4.8,68,1,0.3,darkMetal);box(270,8,bz+4.8,68,1,0.3,darkMetal);
    box(244,0,bz,3,7,8,bm);box(296,0,bz,3,7,8,bm);box(238,0,bz,4,7,10,bm);box(302,0,bz,4,7,10,bm);
    for(let x=240;x<=300;x+=10){box(x,8,bz-4.8,0.3,3,0.3,darkMetal);box(x,8,bz+4.8,0.3,3,0.3,darkMetal);}
    box(270,11,bz-4.8,68,0.3,0.3,darkMetal);box(270,11,bz+4.8,68,0.3,0.3,darkMetal);
  }
  box(225.75,0,0,0.5,7.5,400,tunnelMat);box(234.25,0,0,0.5,7.5,400,tunnelMat);box(230,7,0,9,0.6,400,tunnelMat);
  box(230,0,0,8,0.04,400,lam(0x2a2b2e),false);
  const tl=basic(0xfff4d0);for(let z=-195;z<=195;z+=10)box(230,6.85,z,1.6,0.12,0.6,tl,false);
  for(const z of[-200,200]){box(225.5,0,z,1.2,9,1.2,concrete);box(234.5,0,z,1.2,9,1.2,concrete);box(230,7.6,z,10.2,1.4,1.2,concrete);}
  
}

// elevated train loop on the ±150 roads
const TRAIN_Y=16,TRAIN_S=150;
{
  const deck=lam(0x6b6e74);
  box(0,TRAIN_Y-0.6,-TRAIN_S,TRAIN_S*2+4,0.6,4,deck);box(0,TRAIN_Y-0.6,TRAIN_S,TRAIN_S*2+4,0.6,4,deck);
  box(-TRAIN_S,TRAIN_Y-0.6,0,4,0.6,TRAIN_S*2-4,deck);box(TRAIN_S,TRAIN_Y-0.6,0,4,0.6,TRAIN_S*2-4,deck);
  for(const o of[-1.2,1.2]){box(0,TRAIN_Y,-TRAIN_S+o,TRAIN_S*2+4,0.15,0.15,darkMetal,false);box(0,TRAIN_Y,TRAIN_S+o,TRAIN_S*2+4,0.15,0.15,darkMetal,false);box(-TRAIN_S+o,TRAIN_Y,0,0.15,0.15,TRAIN_S*2,darkMetal,false);box(TRAIN_S+o,TRAIN_Y,0,0.15,0.15,TRAIN_S*2,darkMetal,false);}
  for(let k=-TRAIN_S;k<=TRAIN_S;k+=30){for(const[x,z]of[[k,-TRAIN_S],[k,TRAIN_S],[-TRAIN_S,k],[TRAIN_S,k]])box(x,0,z,1.3,TRAIN_Y-0.6,1.3,concrete);}
}
const trainTex=canvasTex(256,64,(g)=>{g.fillStyle='#d9dde3';g.fillRect(0,0,256,64);g.fillStyle='#1e3a8a';g.fillRect(0,44,256,8);g.fillStyle='#233142';for(let x=10;x<250;x+=30)g.fillRect(x,12,22,22);});
const trainNight=canvasTex(256,64,(g)=>{g.fillStyle='#000';g.fillRect(0,0,256,64);g.fillStyle='#ffeab0';for(let x=10;x<250;x+=30)g.fillRect(x,12,22,22);});
const trainMat=lam(0xffffff,{map:trainTex,emissive:0xffffff,emissiveMap:trainNight,emissiveIntensity:0});glowMats.push(trainMat);
const trainEnd=lam(0xb8bec7),trainUnder=lam(0x333333);
const trainCars=[];for(let k=0;k<5;k++){const m=new THREE.Mesh(new THREE.BoxGeometry(3,3.2,10.5),[trainMat,trainMat,trainEnd,trainUnder,trainEnd,trainEnd]);scene.add(m);trainCars.push(m);}
const TRAIN_LEN=TRAIN_S*8;
function trainAt(s){s=((s%TRAIN_LEN)+TRAIN_LEN)%TRAIN_LEN;const L=TRAIN_S*2;const seg=Math.floor(s/L),u=s-seg*L;
  if(seg===0)return[-TRAIN_S+u,-TRAIN_S,Math.PI/2];if(seg===1)return[TRAIN_S,-TRAIN_S+u,0];if(seg===2)return[TRAIN_S-u,TRAIN_S,Math.PI/2];return[-TRAIN_S,TRAIN_S-u,0];}
updTrain=function(t){const s0=t*15;trainCars.forEach((m,k)=>{const[x,z,ry]=trainAt(s0-k*11);m.position.set(x,TRAIN_Y+1.8,z);m.rotation.y=ry;const along=ry===0;dynBox(x,TRAIN_Y+1.8,z,along?1.5:5.25,1.6,along?5.25:1.5);});}

// traffic
for(let k=0;k<70;k++){const axis=rnd()<.5?'x':'z',line=-HALF+Math.floor(rnd()*(N+1))*CELL,dir=rnd()<.5?1:-1;addCar({axis,line,dir,lane:dir*3*(axis==='x'?1:-1),p:(rnd()-.5)*440,v:7+rnd()*7,big:rnd()<0.15});}

// ---------------- STUNT PARK (west) ----------------
PARK={x0:-435,x1:-255,z0:-125,z1:125};
function ringObstacle(x,y,z,nx,ny,nz,r,col,name,pts){
  const n=new V3(nx,ny,nz).normalize(),c=new V3(x,y,z);
  const m=new THREE.Mesh(new THREE.TorusGeometry(r,0.6,10,48),neon(col));m.position.copy(c);m.lookAt(c.clone().add(n));scene.add(m);
  const a=new V3(1,0,0);if(Math.abs(n.dot(a))>0.9)a.set(0,1,0);a.cross(n).normalize();const b=n.clone().cross(a);
  const cnt=Math.max(24,Math.round(r*4));
  for(let k=0;k<cnt;k++){const t=k/cnt*TAU;const p=c.clone().addScaledVector(a,Math.cos(t)*r).addScaledVector(b,Math.sin(t)*r);collider(p.x-0.7,p.y-0.7,p.z-0.7,p.x+0.7,p.y+0.7,p.z+0.7);}
  gapZones.push({c,n,name,pts,test:p=>p.distanceTo(c)<r-0.8});
}
{
  box(-345,0,0,180,0.12,250,concrete2,false);
  const edge=neon(0x3fc8ff);box(-345,0.12,-125,180,0.1,0.4,edge,false);box(-345,0.12,125,180,0.1,0.4,edge,false);box(-435,0.12,0,0.4,0.1,250,edge,false);box(-255,0.12,0,0.4,0.1,250,edge,false);
  ramp(-300,-268,-112,-100,'x',12,0.12,concrete);ramp(-440,-405,20,32,'x',0.12,14,concrete);
  ringObstacle(-290,14,-80,1,0,0,8,0x39ff88,'RING',150);
  ringObstacle(-330,28,-40,0,0,1,12,0xff3fd8,'RING',150);
  ringObstacle(-380,18,-90,1,0,1,9,0xffd23f,'RING',150);
  ringObstacle(-300,40,40,0,1,0,10,0x3fc8ff,'DROP RING',250);
  ringObstacle(-400,10,60,1,0,0,7,0xff6a3f,'RING',200);
  ringObstacle(-350,55,0,0,0,1,14,0xa78bfa,'SKY RING',200);
  ringObstacle(-420,6,-60,0,0,1,4,0x39ff88,'NEEDLE',400);
  for(const[x,y,z,ax,r,spd,col]of[[-310,14,-10,'x',10,1.1,0xff3fd8],[-410,20,-30,'z',11,-0.9,0x39ff88],[-410,12,100,'x',8,1.6,0xffd23f]]){
    const g=new THREE.Group();g.position.set(x,y,z);scene.add(g);
    if(ax==='z')g.rotation.y=Math.PI/2;
    const rot=new THREE.Group();g.add(rot);
    for(let k=0;k<3;k++){const bl=new THREE.Mesh(new THREE.BoxGeometry(0.5,r,2.2),neon(col));bl.position.y=r/2;const arm=new THREE.Group();arm.rotation.x=k/3*TAU;arm.add(bl);rot.add(arm);}
    rot.add(new THREE.Mesh(new THREE.CylinderGeometry(1.4,1.4,1.2,16).rotateZ(Math.PI/2),darkMetal));
    const bx=ax==='x'?x-2.5:x,bz=ax==='x'?z:z-2.5;box(bx,0,bz,1.4,y,1.4,darkMetal);box(bx,y-0.6,bz,ax==='x'?3:1.2,1.2,ax==='x'?1.2:3,darkMetal);
    fans.push({x,y,z,ax,r,spd,rot});
    const c=new V3(x,y,z),n=ax==='x'?new V3(1,0,0):new V3(0,0,1);gapZones.push({c,n,name:'FAN THREAD',pts:300,test:p=>p.distanceTo(c)<r-0.5&&p.distanceTo(c)>1.5});
  }
  {const hx=-330,hz=90,len=60,rad=9;
   const hp=new THREE.Mesh(new THREE.CylinderGeometry(rad,rad,len,32,1,true,Math.PI,Math.PI),lam(0xcfd6de,{side:THREE.DoubleSide}));hp.rotation.z=Math.PI/2;hp.position.set(hx,rad,hz);scene.add(hp);
   for(let k=0;k<=24;k++){const a=Math.PI+k/24*Math.PI;const y=rad+Math.sin(a)*(rad+0.95),z=hz+Math.cos(a)*(rad+0.95);collider(hx-len/2,y-0.95,z-0.95,hx+len/2,y+0.95,z+0.95);}
   box(hx,rad,hz-rad-0.2,len,0.3,0.4,neon(0xff3fd8),false);box(hx,rad,hz+rad+0.2,len,0.3,0.4,neon(0xff3fd8),false);
   gapZones.push({c:new V3(hx-len/2,rad/2,hz),n:new V3(1,0,0),name:'PIPE RUN',pts:200,test:p=>Math.abs(p.z-hz)<rad&&p.y<rad});}
  for(const[x,z,h]of[[-270,100,60],[-425,-110,75],[-280,-115,90]]){
    mesh(scaleUvY(new THREE.BoxGeometry(3,h,3),h/3),latticeMat,x,h/2,z);collider(x-1.5,0,z-1.5,x+1.5,h,z+1.5);
    box(x,h,z,7,0.5,7,concrete);box(x,h+0.5,z,7,0.15,0.15,neon(0xff6a3f),false);mesh(new THREE.SphereGeometry(0.5,8,6),basic(0xff2d2d),x,h+3,z);
  }
  for(const[x,y,z,s]of[[-300,26,-30,6],[-345,38,-90,8],[-395,30,-20,7],[-420,48,40,6],[-360,62,50,9],[-290,52,90,6]]){
    const rock=mesh(new THREE.DodecahedronGeometry(s,0),rockMat,x,y-s*0.55,z);rock.scale.set(1,0.75,1);
    box(x,y-0.6,z,s*1.5,1,s*1.5,grassMat);collider(x-s*0.7,y-s*1.2,z-s*0.7,x+s*0.7,y-0.6,z+s*0.7);
    tree(x+s*0.3,z-s*0.2,y+0.4);if(s>6)tree(x-s*0.35,z+s*0.3,y+0.4);
  }
  
  const sg=new THREE.Mesh(new THREE.PlaneGeometry(40,8),basic(0xffffff,{map:canvasTex(512,100,(g)=>{g.fillStyle='#0b1020';g.fillRect(0,0,512,100);g.fillStyle='#39ff88';g.font='bold 70px Impact, Arial Black';g.textAlign='center';g.textBaseline='middle';g.fillText('STUNT PARK',256,52);}),side:THREE.DoubleSide}));sg.position.set(-252,16,0);sg.rotation.y=Math.PI/2;scene.add(sg);
}

// ---------------- STADIUM (south) ----------------
const STAD={x:0,z:330};
{
  const sx=STAD.x,sz=STAD.z,FX=50,FZ=32;
  const fieldTex=canvasTex(512,330,(g,w,h)=>{for(let i=0;i<10;i++){g.fillStyle=i%2?'#3f8f3a':'#479c40';g.fillRect(i*w/10,0,w/10,h);}g.strokeStyle='#fff';g.lineWidth=4;g.strokeRect(8,8,w-16,h-16);g.beginPath();g.moveTo(w/2,8);g.lineTo(w/2,h-8);g.stroke();g.beginPath();g.arc(w/2,h/2,46,0,TAU);g.stroke();g.strokeRect(8,h/2-70,70,140);g.strokeRect(w-78,h/2-70,70,140);});
  fieldTex.wrapS=fieldTex.wrapT=THREE.ClampToEdgeWrapping;
  const f=new THREE.Mesh(new THREE.PlaneGeometry(FX*2+8,FZ*2+8),lam(0xffffff,{map:fieldTex,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-2}));f.rotation.x=-Math.PI/2;f.position.set(sx,0.04,sz);scene.add(f);
  const seatA=lam(0x1d4ed8),seatB=lam(0xe5e7eb),wallM=lam(0x8b8f99);
  for(let k=0;k<=12;k++){
    const hx=FX+4+k*2,hz=FZ+4+k*2,th=k===12?1.5:2,top=k===12?20:1+k*1.2,mat=k===12?wallM:(k%2?seatA:seatB);
    box(sx,0,sz+hz+th/2,2*(hx+th),top,th,mat);box(sx+hx+th/2,0,sz,th,top,2*hz,mat);box(sx-hx-th/2,0,sz,th,top,2*hz,mat);
    const nz=sz-hz-th/2,piece=hx+th-5;box(sx-5-piece/2,0,nz,piece,top,th,mat);box(sx+5+piece/2,0,nz,piece,top,th,mat);if(top>6)box(sx,6,nz,10,top-6,th,mat);
  }
  const lightPanel=basic(0xbfc4cc);glowMats.push(lightPanel);
  for(const ox of[-1,1])for(const oz of[-1,1]){const x=sx+ox*82,z=sz+oz*64;box(x,0,z,1.2,42,1.2,steel);box(x,42,z,9,4.5,1.2,lightPanel);}
  for(const ox of[-1,1]){const gx=sx+ox*FX;box(gx,0,sz-3.7,0.2,2.4,0.2,seatB);box(gx,0,sz+3.7,0.2,2.4,0.2,seatB);box(gx,2.4,sz,0.2,0.2,7.6,seatB);}
  
  gapZones.push({c:new V3(sx,3,sz-FZ-4),n:new V3(0,0,1),name:'STADIUM TUNNEL',pts:250,test:p=>Math.abs(p.x-sx)<5&&p.y<6});
  gapZones.push({c:new V3(sx,1.2,sz),n:new V3(1,0,0),name:'MIDFIELD SKIM',pts:120,test:p=>p.y<1.5&&Math.abs(p.z-sz)<FZ});
}

// ---------------- SKYFAIR THEME PARK (north) ----------------
const wheel={x:-60,y:30,z:-345,r:24,g:null,gondolas:[]};
const dropT={x:10,z:-385,h:62,car:null,y:5};
let coaster=null;
const _wc=new V3(),_ct=new V3();
{
  box(0,0,-340,220,0.12,130,concrete2,false);
  box(-8,0,-268,3,18,3,redSteel);box(8,0,-268,3,18,3,redSteel);box(0,18,-268,19,3,3,redSteel);billboard(0,23,-266.4,18,6,0,4);
  const tentCols=[0xef4444,0xf59e0b,0x3b82f6,0x22c55e,0xa855f7].map(c=>lam(c)),booth=lam(0xf3f4f6);
  for(let k=0;k<9;k++){const x=-95+k*10.5,z=-292-(k%2)*8;mesh(new THREE.ConeGeometry(3.2,4,8),tentCols[k%5],x,4.2,z);box(x,0,z,4.5,2.2,4.5,booth);collider(x-2.6,2.2,z-2.6,x+2.6,5.5,z+2.6,true);}
  const g=new THREE.Group();g.position.set(wheel.x,wheel.y,wheel.z);scene.add(g);wheel.g=g;
  const rimM=neon(0xff3fd8),spokeM=lam(0xe5e7eb);
  for(const ox of[-1.1,1.1]){const rim=new THREE.Mesh(new THREE.TorusGeometry(wheel.r,0.35,8,64),rimM);rim.rotation.y=Math.PI/2;rim.position.x=ox;g.add(rim);}
  for(let k=0;k<16;k++){const sp=new THREE.Mesh(new THREE.BoxGeometry(0.3,wheel.r,0.3),spokeM);const arm=new THREE.Group();arm.rotation.x=k/16*TAU;sp.position.y=wheel.r/2;arm.add(sp);g.add(arm);}
  for(let k=0;k<16;k++){const gm=new THREE.Mesh(new THREE.BoxGeometry(2.2,2.2,2.2),tentCols[k%5]);scene.add(gm);wheel.gondolas.push(gm);}
  box(wheel.x-3.5,0,wheel.z,2,wheel.y,2,steel);box(wheel.x+3.5,0,wheel.z,2,wheel.y,2,steel);box(wheel.x,wheel.y-1,wheel.z,9,2,2,darkMetal);
  gapZones.push({c:new V3(wheel.x,wheel.y,wheel.z),n:new V3(1,0,0),name:'WHEEL THREAD',pts:250,test:p=>p.distanceTo(_wc.set(wheel.x,wheel.y,wheel.z))<wheel.r-1.5});
  box(dropT.x,0,dropT.z,3,dropT.h,3,lam(0x6366f1));mesh(new THREE.SphereGeometry(1,10,8),basic(0xffd23f),dropT.x,dropT.h+1,dropT.z);
  dropT.car=new THREE.Mesh(new THREE.BoxGeometry(8,1.6,8),neon(0x3fc8ff));scene.add(dropT.car);
  const pts=[];for(let i=0;i<48;i++){const a=i/48*TAU;pts.push(new V3(70+50*Math.cos(a),5+26*Math.exp(-Math.pow(a-0.5,2)/0.08)+(a>1.1?8*(0.5+0.5*Math.sin(4*a+1)):0)+(a>4.4&&a<5.6?10*Math.sin((a-4.4)/1.2*Math.PI):0),-340+38*Math.sin(a)));}
  const curve=new THREE.CatmullRomCurve3(pts,true);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve,400,0.45,8,true),lam(0xdc2626)));
  const len=curve.getLength(),supM=lam(0xe5e7eb);
  for(let i=0;i<140;i++){const p=curve.getPointAt(i/140);collider(p.x-0.7,p.y-0.7,p.z-0.7,p.x+0.7,p.y+0.7,p.z+0.7);if(i%5===0)box(p.x,0,p.z,0.5,Math.max(0.1,p.y-0.5),0.5,supM);}
  const cartM=lam(0xfacc15),carts=[];for(let k=0;k<3;k++){const c=new THREE.Mesh(new THREE.BoxGeometry(1.8,1.3,2.8),cartM);scene.add(c);carts.push(c);}
  let hmax=0;pts.forEach(p=>hmax=Math.max(hmax,p.y));
  coaster={curve,len,carts,u:0,hmax};
}
updParkRides=function(t,dt){
  const a=t*0.12;wheel.g.rotation.x=a;
  wheel.gondolas.forEach((gm,k)=>{const b=a+k/16*TAU;const y=wheel.y+Math.cos(b)*wheel.r-1.5,z=wheel.z+Math.sin(b)*wheel.r;gm.position.set(wheel.x,y,z);dynBox(wheel.x,y,z,1.1,1.1,1.1);});
  for(let k=0;k<24;k++){const b=a+k/24*TAU;dynBox(wheel.x,wheel.y+Math.cos(b)*wheel.r,wheel.z+Math.sin(b)*wheel.r,1.4,0.6,0.6);}
  const cyc=(t%14)/14;dropT.y=cyc<0.55?5+50*(cyc/0.55):cyc<0.7?55:cyc<0.78?55-50*Math.pow((cyc-0.7)/0.08,2):5;
  dropT.car.position.set(dropT.x,dropT.y,dropT.z);
  dynBox(dropT.x,dropT.y,dropT.z-3,4,0.8,1);dynBox(dropT.x,dropT.y,dropT.z+3,4,0.8,1);dynBox(dropT.x-3,dropT.y,dropT.z,1,0.8,4);dynBox(dropT.x+3,dropT.y,dropT.z,1,0.8,4);
  const c=coaster,cl=u=>Math.min(0.99999,Math.max(0,isFinite(u)?u:0));if(!isFinite(c.u))c.u=0;const p0=c.curve.getPointAt(cl(c.u));const v=Math.max(5,Math.sqrt(2*G*Math.max(0,c.hmax+1.5-p0.y)));c.u=(c.u+v*dt/c.len)%1;
  c.carts.forEach((m,k)=>{const u=cl(((c.u-k*3.2/c.len)%1+1)%1);const p=c.curve.getPointAt(u);c.curve.getTangentAt(u,_ct);m.position.set(p.x,p.y+1.1,p.z);m.lookAt(p.x+_ct.x,p.y+1.1+_ct.y,p.z+_ct.z);dynBox(p.x,p.y+1.1,p.z,1.3,0.9,1.3);});
}

// steam & wet streets
for(let k=0;k<16;k++){const ax=rnd()<.5,line=-HALF+Math.floor(rnd()*(N+1))*CELL,p=(rnd()-.5)*400;steamVent(ax?p:line+(rnd()-.5)*4,0.05,ax?line+(rnd()-.5)*4:p);}
for(let k=0;k<26;k++){const ax=rnd()<.5,line=-HALF+Math.floor(rnd()*(N+1))*CELL,p=(rnd()-.5)*400;puddle(ax?p:line+(rnd()-.5)*10,ax?line+(rnd()-.5)*10:p,1+rnd()*2.4);}
alleys.forEach(a=>steamVent(a[0],0.3,a[2]));
// street lights
{const pts=[];for(let i=0;i<=N;i++)for(let j=0;j<=N;j++){const x=-HALF+i*CELL,z=-HALF+j*CELL;for(const ox of[-1,1])for(const oz of[-1,1])pts.push([x+ox*(ROAD/2+0.9),z+oz*(ROAD/2+0.9)]);}makeLamps(pts);}
for(const s of[-1,1])gapZones.push({c:new V3(SKEL.x+s*12,40,SKEL.z),n:new V3(1,0,0),name:'TOWER THREAD',pts:180,test:p=>Math.abs(p.z-SKEL.z)<12&&p.y<skelTop});
for(const bz of[-90,30,150])gapZones.push({c:new V3(270,3.5,bz),n:new V3(0,0,1),name:'UNDER THE BRIDGE',pts:120,test:p=>Math.abs(p.x-270)<22&&p.y<7});
for(const z of[-200,200])gapZones.push({c:new V3(230,3.5,z),n:new V3(0,0,1),name:'TUNNEL RUN',pts:200,test:p=>Math.abs(p.x-230)<4&&p.y<7});
gapZones.push({c:new V3(0,40,-268),n:new V3(0,0,1),name:'ARCH',pts:80,test:p=>Math.abs(p.x)<6.5&&p.y<18});
// ===== v0.7 Rotor City set pieces =====
addHeli(0,0,120,85,15,0);addHeli(-345,0,60,45,12,2);addBlimp(0,0,260,120,7,1);
MAPDEF.fireworks={x0:240,x1:300,z0:-200,z1:200,y:70};
{const tall=buildings.slice().sort((a,b)=>b.h-a.h);tall.slice(1,5).forEach((b,i)=>searchlight(b.x,b.h,b.z,i*1.9));
 const tb=tall[0];vaultRoom(tb.x,tb.h,tb.z,6,6,4.5);tb.clear=false;
 let n=0;for(const b of buildings){if(n>=4)break;if(b.clear&&b.w>14&&b.d>14&&b.h>18&&b.h<60){roofPool(b);n++;}}}
for(const z of[-150,0,150])turbine(380,z,0,55,24,0.35+rnd()*0.1);
for(let k=0;k<30;k++){const ax=rnd()<.5,line=-HALF+Math.floor(rnd()*(N+1))*CELL,p=(rnd()-.5)*400;addDebris('cone',ax?p:line+ROAD/2-0.8,0,ax?line+ROAD/2-0.8:p);}
for(const[x,z]of SITES)for(let s=0;s<6;s++)addDebris('box',x-8+(s%3)*0.9,0.25+(s>2?0.8:0),z+12,{s:0.8});
alleys.forEach(a=>mistSpots.push([a[0],a[2]]));for(let z=-180;z<=180;z+=60)mistSpots.push([270,z]);
segment('River Run',[270,3,-230],[270,3,230]);segment('Tunnel Blast',[230,3.5,-210],[230,3.5,210],3);segment('Downtown Dive',[-30,110,60],[-30,8,60],5);
MAPDEF.name='Rotor City';
// ---- Rotor City map definition ----
const SPC={p:[0,0.55,0],h:0};MAPDEF.spawn=SPC;
MAPDEF.tracks={
  city:{name:'City Loop',spawn:SPC,pts:[[90,6,30],[90,14,-60],[30,8,-90],[-60,24,-90],[-90,6,-20],[-90,11,60],[-20,4,90],[60,10,90]]},
  garage:{name:'Parking Garage',spawn:{p:[80,0,0],h:-Math.PI/2},pts:[[100,2.6,0,.6],[120,2.6,0,.6],[134,5,0,.6],[120,7.4,0,.6],[106,10,0,.6],[120,12.4,0,.6],[134,15,0,.6],[120,19,0],[88,6,0]]},
  bridges:{name:'Bridge Run',spawn:{p:[262,0,-235],h:Math.PI},pts:[[270,3,-200],[270,3.5,-90],[262,3,-30],[278,3.5,30],[270,3,90],[270,3.5,150],[282,8,205],[258,14,205],[255,14,90],[255,14,-30],[255,14,-150]]},
  rooftop:{name:'Rooftop Run',spawn:SPC,pts:(()=>{const c=buildings.filter(b=>b.h>12&&(b.clear?b.h<70:b.h<45));const sec=[];for(const b of c){const d=Math.hypot(b.x,b.z);if(d<40||d>210)continue;if(Math.abs(Math.abs(b.x)-TRAIN_S)<18||Math.abs(Math.abs(b.z)-TRAIN_S)<18)continue;const k=Math.floor((Math.atan2(b.z,b.x)+Math.PI)/TAU*10)%10;if(!sec[k]||Math.abs(b.h-35)<Math.abs(sec[k].h-35))sec[k]=b;}return sec.filter(Boolean).map(b=>[b.x,b.h+(b.clear?9:11),b.z]);})()},
  stunt:{name:'Stunt Park Slalom',spawn:{p:[-258,0.12,-80],h:Math.PI/2},pts:[[-275,10,-80],[-290,14,-80,.9],[-340,16,-82],[-380,18,-90,1],[-415,14,-70],[-410,26,-30,.8],[-400,22,10],[-385,10,55],[-360,12,95],[-330,9,90,.9],[-300,30,75],[-300,58,58],[-300,40,40,1.1],[-300,22,22],[-345,50,25],[-350,55,0,1.2],[-335,46,-30],[-290,20,-60]]},
  skyfair:{name:'Skyfair Park',spawn:{p:[0,0.12,-250],h:0},pts:[[0,8,-268],[0,12,-310],[-25,30,-345],[-60,38,-345,1.2],[-95,15,-345],[-50,6,-395],[10,40,-372],[60,20,-296],[120,12,-340],[70,6,-368],[20,6,-320]]}
};
MAPDEF.spots=buildings.filter(b=>b.clear&&b.h<70).map(b=>({x:b.x,z:b.z,h:b.h}));
MAPDEF.spots.push({x:0,z:0,h:0.55},{x:114,z:-12,h:15},{x:-300,z:-30,h:26.4},{x:-280,z:-115,h:90.5},{x:-270,z:100,h:60.5},{x:0,z:330,h:0},{x:-30,z:-320,h:0.12});
MAPDEF.tokens=[[262,2.5,30],[285,2.5,150],[230,3.5,-120],[230,3.5,120],[SKEL.x+6,skelTop+3,SKEL.z+6],[SKEL.x+6,45,SKEL.z-6],[0,2.2,330],[82,48,394],[0,3,280],[wheel.x,wheel.y-12,wheel.z],[dropT.x,dropT.h+4,dropT.z],[0,22.5,-268],[136,12.4,16],[150,10,-135],[-150,10,135],[-330,1.4,90],[-270,63,100],[-425,78,-110],[-280,93,-115],[-345,40.5,-90],[-360,64.5,50],[-420,50.5,40],[-420,6,-60],[120,58,120],[-120,58,-120]];
{const ct=coaster.curve.getPointAt(0.11);MAPDEF.tokens.push([ct.x,ct.y+4,ct.z]);
 let tb=buildings[0];for(const b of buildings)if(b.h>tb.h)tb=b;MAPDEF.tokens.push([tb.x,tb.h+8,tb.z]);
 alleys.slice(0,3).forEach(a=>MAPDEF.tokens.push(a));}
}
if(MAP==='canyons')buildCanyons();
if(MAP==='port')buildPort();if(MAP==='factory')buildFactory();if(MAP==='valley')buildValley();if(MAP==='ski')buildSki();if(MAP==='mall')buildMall();
for(const t of MAPDEF.tokens){const g=groundH(t[0],t[2],t[1]);if(t[1]<g+1.5)t[1]=g+2.5;}

flushBatches();
buildMist();buildFireworks();buildNightFx();
const WATER_MESHES=[];{const WC=[0x1d5a78,0x2a7d8f,0x1f5f7a,0x2c6c8c,0x28b6e6];scene.traverse(o=>{if(o.isMesh&&o.material&&o.material.isMeshPhongMaterial&&WC.includes(o.material.color.getHex())){o.material.userData.water=1;WATER_MESHES.push(o);}});}
const _wr=new THREE.Raycaster(),_wd=new V3(0,-1,0);
function isWater(x,z,y){if(!WATER_MESHES.length)return false;_wr.set(_x0w.set(x,y+60,z),_wd);_wr.far=200;const h=_wr.intersectObjects(scene.children.filter(o=>o.isMesh&&o.material&&o.material.userData&&o.material.userData.water),false)[0];if(!h||h.point.y<y-0.6)return false;const hy=h.point.y;for(const c of gatherNear(x,z,0.5)){if(c.soft||c.ramp||c.disabled)continue;if(x>c.min.x&&x<c.max.x&&z>c.min.z&&z<c.max.z&&c.max.y>=hy-0.05&&c.max.y<=hy+4)return false;}return true;}
const _x0w=new V3();
let MERGE_CAND=null;{const L=[];scene.children.forEach(o=>{if(o.isMesh&&!o.isInstancedMesh&&o.visible&&!o.userData.noMerge&&!o.renderOrder){o.updateMatrixWorld();L.push({o,m:o.matrixWorld.clone()});}});MERGE_CAND=L;}
setTimeout(()=>{try{mergeStatic();}catch(e){console.warn('merge',e);}},2600);

