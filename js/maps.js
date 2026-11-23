'use strict';
// ================= v0.7 NEW MAPS =================
function terrainMesh(H,x0,x1,z0,z1,seg,colorFn){const g=new THREE.PlaneGeometry(x1-x0,z1-z0,seg,seg);g.rotateX(-Math.PI/2);g.translate((x0+x1)/2,0,(z0+z1)/2);
  const p=g.attributes.position,cols=new Float32Array(p.count*3),c=new THREE.Color();
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),y=H(x,z);p.setY(i,y);const sl=Math.hypot(H(x+1,z)-H(x-1,z),H(x,z+1)-H(x,z-1))/2;colorFn(c,x,y,z,sl);cols[i*3]=c.r;cols[i*3+1]=c.g;cols[i*3+2]=c.b;}
  g.setAttribute('color',new THREE.BufferAttribute(cols,3));g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true}));scene.add(m);return m;}
function pines(list,H){const n=list.length;if(!n)return;const cone=new THREE.ConeGeometry(2.2,7,8);cone.translate(0,6.2,0);const trunk=new THREE.CylinderGeometry(0.3,0.4,2.8,6);trunk.translate(0,1.4,0);
  const cm=new THREE.InstancedMesh(cone,lam(0x2f5a34),n),tm=new THREE.InstancedMesh(trunk,trunkMat,n),m4=new THREE.Matrix4(),q=new QT(),p=new V3(),s=new V3();
  list.forEach(([x,z,sc],k)=>{const y=H(x,z);p.set(x,y-0.3,z);s.set(sc,sc,sc);m4.compose(p,q,s);cm.setMatrixAt(k,m4);tm.setMatrixAt(k,m4);collider(x-0.35*sc,y,z-0.35*sc,x+0.35*sc,y+2.8*sc,z+0.35*sc,true);collider(x-1.6*sc,y+3*sc,z-1.6*sc,x+1.6*sc,y+9.6*sc,z+1.6*sc,true);});
  cm.frustumCulled=tm.frustumCulled=false;scene.add(cm);scene.add(tm);}
function planeAt(x,y,z,alongZ,col){const g=new THREE.Group();const fm=lam(col||0xf1f3f6);const fus=new THREE.Mesh(new THREE.CylinderGeometry(3,3,46,16),fm);fus.rotation.x=Math.PI/2;g.add(fus);
  const nose=new THREE.Mesh(new THREE.SphereGeometry(3,14,10),fm);nose.position.z=-23;nose.scale.z=1.6;g.add(nose);
  const wing=new THREE.Mesh(new THREE.BoxGeometry(36,0.5,6),fm);wing.position.set(0,-1,2);g.add(wing);const tail=new THREE.Mesh(new THREE.BoxGeometry(0.5,7,5),lam(0x1d4ed8));tail.position.set(0,5,21);g.add(tail);
  const ts=new THREE.Mesh(new THREE.BoxGeometry(12,0.4,4),fm);ts.position.set(0,1.5,21);g.add(ts);for(const s of[-1,1]){const e=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.3,5,12),lam(0x9aa3ad));e.rotation.x=Math.PI/2;e.position.set(s*9,-2.6,0);g.add(e);}
  for(let k=0;k<10;k++){const w=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.6,1),basic(0x223344));w.position.set(3.02,1,-15+k*3);g.add(w);const w2=w.clone();w2.position.x=-3.02;g.add(w2);}
  g.position.set(x,y,z);if(!alongZ)g.rotation.y=Math.PI/2;scene.add(g);return g;}

// ---------------- PORT YARD ----------------
function buildPort(){
  MAPDEF.name='Port Yard';
  const yard=lam(0x8a877f),sea=new THREE.MeshPhongMaterial({color:0x1d5a78,shininess:120,specular:0xbcd6e6});
  {const g=new THREE.Mesh(new THREE.PlaneGeometry(1000,600),yard);g.rotation.x=-Math.PI/2;g.position.set(0,-0.02,40-300);scene.add(g);
   const w=new THREE.Mesh(new THREE.PlaneGeometry(3000,1600),sea);w.rotation.x=-Math.PI/2;w.position.set(0,-0.6,40+800);scene.add(w);
   MAPDEF.under.push({x0:-5000,x1:5000,z0:40.6,z1:5000,floor:-0.6,hole:true});
   box(0,-3,41,1000,3.2,1.2,concrete);for(let x=-200;x<=200;x+=16)box(x,0.2,39,0.7,0.8,0.7,darkMetal);}
  const corr=canvasTex(128,64,(g)=>{g.fillStyle='#fff';g.fillRect(0,0,128,64);g.fillStyle='rgba(0,0,0,.18)';for(let x=0;x<128;x+=8)g.fillRect(x,0,3,64);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(0,0,128,3);g.fillRect(0,61,128,3);});
  const CC=[0xc2352b,0x1d4ed8,0x15803d,0xe2b41f,0xe5e7eb,0x7c3aed,0xf97316,0x0e7490].map(c=>lam(c,{map:corr}));
  const lanesX=[-60,0,60],blocks=[[-190,-122],[-108,-42],[-28,14]],alleysZ=[];
  blocks.forEach(([z0,z1],bi)=>{let z=z0+1.25;while(z+2.6+1.25<=z1){for(const rz of[z,z+2.6]){for(let x=-180;x<=180;x+=12.6){if(lanesX.some(l=>Math.abs(x-l)<11))continue;const n=rnd()<0.1?0:1+Math.floor(rnd()*4.6);for(let s=0;s<n;s++)box(x,s*2.6,rz,12.2,2.6,2.5,CC[Math.floor(rnd()*CC.length)]);}}
    const ac=z+6.85;if(ac+3<z1)alleysZ.push([bi,ac]);z+=11.2;}});
  // moving gantry cranes over the stacks
  const gantries=[];
  for(const[z0,z1]of[[-196,-116],[-114,-36]]){const g=new THREE.Group();scene.add(g);const span=z1-z0,Hh=30;
    for(const z of[z0,z1])for(const ox of[-6,6]){const l=new THREE.Mesh(new THREE.BoxGeometry(1.6,Hh,1.6),yellowSteel);l.position.set(ox,Hh/2,z);g.add(l);}
    for(const ox of[-6,6]){const gb=new THREE.Mesh(new THREE.BoxGeometry(1.8,3,span+2),yellowSteel);gb.position.set(ox,Hh+1.5,(z0+z1)/2);g.add(gb);}
    for(const z of[z0,z1]){const cb=new THREE.Mesh(new THREE.BoxGeometry(14,2,1.6),yellowSteel);cb.position.set(0,Hh-1,z);g.add(cb);}
    const tro=new THREE.Mesh(new THREE.BoxGeometry(14,2.4,5),darkMetal);tro.position.y=Hh+1.2;g.add(tro);
    const spread=new THREE.Mesh(new THREE.BoxGeometry(12.6,0.8,2.6),darkMetal);g.add(spread);const cont=new THREE.Mesh(new THREE.BoxGeometry(12.2,2.6,2.5),CC[gantries.length+1]);g.add(cont);
    const cab=[];for(const ox of[-4,4]){const c=new THREE.Mesh(new THREE.CylinderGeometry(0.06,0.06,1,4),darkMetal);g.add(c);cab.push([c,ox]);}
    gantries.push({g,z0,z1,Hh,tro,spread,cont,cab,ph:gantries.length*3});}
  MAPDEF.updaters.push(t=>{for(const q of gantries){const x=150*Math.sin(t*0.018+q.ph);q.g.position.x=x;const tz=(q.z0+q.z1)/2+(q.z1-q.z0)*0.4*Math.sin(t*0.09+q.ph),ly=6+5*(1+Math.sin(t*0.13+q.ph));
    q.tro.position.z=tz;q.spread.position.set(0,ly+3,tz);q.cont.position.set(0,ly+1.3,tz);for(const[c,ox]of q.cab){const len=q.Hh-(ly+3.4);c.position.set(ox,ly+3.4+len/2,tz);c.scale.y=len;}
    for(const z of[q.z0,q.z1])for(const ox of[-6,6])dynBox(x+ox,q.Hh/2,z,0.8,q.Hh/2,0.8);
    for(const ox of[-6,6])dynBox(x+ox,q.Hh+1.5,(q.z0+q.z1)/2,0.9,1.5,(q.z1-q.z0)/2+1);dynBox(x,q.Hh+1.2,tz,7,1.2,2.5);dynBox(x,ly+1.6,tz,6.3,1.8,1.3);}});
  // ship-to-shore cranes on the quay
  const STS=[-130,-50,90];
  for(const x of STS){for(const z of[24,38])for(const ox of[-7,7])box(x+ox,0,z,1.6,44,1.6,redSteel);box(x,40,31,16,2,16,redSteel);box(x,44,50,4,2.5,60,redSteel);box(x,44,12,4,2.5,22,redSteel);box(x,46,24,10,6,8,whiteMat);box(x,46.5,16,1,10,1,redSteel);}
  // docked cargo ships with open holds and a tunnel through the bridge tower
  const holdsAll=[],tunnels=[];
  function ship(x0,x1,z0,z1,hullCol){const L=x1-x0,W=z1-z0,cz=(z0+z1)/2,Hs=12,t=1.2,hm=lam(hullCol),dm=lam(0x7a7f87);
    box((x0+x1)/2,-0.6,z0+t/2,L,Hs+0.6,t,hm);box((x0+x1)/2,-0.6,z1-t/2,L,Hs+0.6,t,hm);box(x0+t/2,-0.6,cz,t,Hs+0.6,W,hm);box(x1-t/2,-0.6,cz,t,Hs+0.6,W,hm);box(x1+3,-0.6,cz,6,Hs+0.6,W*0.55,hm);
    box((x0+x1)/2,1.5,cz,L-2*t,0.4,W-2*t,dm);
    const hw=18,hd=W-8,holds=[];for(let k=0;k<3;k++){const hx=x0+30+k*(hw+16);holds.push([hx-hw/2,hx+hw/2,cz-hd/2,cz+hd/2]);holdsAll.push({x:hx,z:cz,hw,hd,y:Hs});}
    holedSlab(x0+t,x1-t,z0+t,z1-t,Hs,0.5,holds,dm);
    for(let k=0;k<2;k++){const bx=x0+30+k*(hw+16)+hw/2+8;for(let r=0;r<8;r++){if(r===4)continue;const rz=z0+3+r*2.9,n=1+Math.floor(rnd()*3);for(let s=0;s<n;s++)box(bx,Hs+0.5+s*2.6,rz,12.2,2.6,2.5,CC[Math.floor(rnd()*CC.length)]);}}
    const sx=x0+12,y0=Hs+0.5;box(x0+12,y0,cz,16,4,20,whiteMat);box(x0+12,y0+10,cz,16,8,20,whiteMat);box(x0+4+(sx-3-(x0+4))/2,y0+4,cz,sx-3-(x0+4),6,20,whiteMat);box(sx+3+(x0+20-(sx+3))/2,y0+4,cz,x0+20-(sx+3),6,20,whiteMat);
    box(x0+12,y0+18,cz,6,1,28,whiteMat);box(x0+16,y0+18,cz,3,8,3,redSteel);
    tunnels.push({x:sx,z:cz,y:y0+7});
    gapZones.push({c:new V3(sx,y0+7,cz),n:new V3(0,0,1),name:'SHIP TUNNEL',pts:250,test:p=>Math.abs(p.x-sx)<3&&p.y>y0+4&&p.y<y0+10});
    for(const h of holds){const hx=(h[0]+h[1])/2;gapZones.push({c:new V3(hx,Hs,cz),n:new V3(0,1,0),name:'HOLD DIVE',pts:180,test:p=>Math.abs(p.x-hx)<hw/2&&Math.abs(p.z-cz)<hd/2});}
    return{x0,x1,z0,z1,cz,Hs};}
  const shA=ship(-175,-35,50,78,0x8b1e1e),shB=ship(15,160,50,78,0x1e3a8a);
  // breakwater + lighthouse (secret vault in the lantern room)
  box(-110,-0.6,150,200,3,8,rockMat);
  mesh(new THREE.CylinderGeometry(2.6,3.4,38,18),whiteMat,-20,2.4+19,150);collider(-23,2.4,147,-17,40.4,153);for(const y of[12,24,34])mesh(new THREE.CylinderGeometry(3.25-y*0.02,3.3-y*0.02,2,18),lam(0xc2352b),-20,2.4+y,150);
  holedSlab(-25.5,-14.5,144.5,155.5,40.4,0.4,[[-23,-17,147,153]],darkMetal);for(let k=0;k<12;k++){const a=k/12*TAU;box(-20+Math.cos(a)*5.3,40.8,150+Math.sin(a)*5.3,0.1,1,0.1,darkMetal);}
  vaultRoom(-20,40.8,150,5,5,4.4);
  const beam=new THREE.Group();beam.position.set(-20,43,150);const bm=basic(0xfff3c4,{transparent:true,opacity:0,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,fog:false});
  for(const s of[-1,1]){const c=new THREE.Mesh(new THREE.CylinderGeometry(0.5,8,120,16,1,true),bm);c.rotation.z=Math.PI/2;c.position.x=s*62;beam.add(c);}scene.add(beam);
  MAPDEF.updaters.push(t=>{beam.rotation.y=t*0.6;bm.opacity=Math.max(0,nightF-0.3)*0.18;});
  // offices + warehouses on the land side
  const off=[];for(const[x,h]of[[-150,26],[-80,38],[0,22],[90,30],[160,44]]){const b=building(x,-212,30,16,h,0,{plain:true});off.push(b);}
  box(-80,38,-212,10,0.3,10,padMat);
  for(let k=0;k<4;k++)building(-160+k*100,-260,60,30,12+rnd()*6);
  // traffic: straddle carriers & trucks
  for(const z of[-115,-35])for(let k=0;k<5;k++){const dir=k%2?1:-1;addCar({axis:'x',line:z,dir,lane:dir*3,p:-190+rnd()*380,v:5+rnd()*5,min:-195,max:195,big:rnd()<0.5});}
  for(let k=0;k<6;k++){const dir=k%2?1:-1;addCar({axis:'x',line:30,dir,lane:dir*3,p:-190+rnd()*380,v:8+rnd()*6,min:-200,max:200,big:rnd()<0.4});}
  for(const x of lanesX)for(let k=0;k<2;k++){const dir=k%2?1:-1;addCar({axis:'z',line:x,dir,lane:-dir*3,p:-190+rnd()*200,v:6+rnd()*5,min:-195,max:18,big:true});}
  const lp=[];for(const x of lanesX)for(let z=-185;z<20;z+=30)lp.push([x+10,z]);for(let x=-195;x<200;x+=30)lp.push([x,21]);makeLamps(lp);
  waterTowerClimb(-205,10,40);
  for(const z of[320])for(const x of[-200,-40,120])turbine(x,z,-0.6,55,24,0.35+rnd()*0.1);
  addHeli(0,-80,120,60,14,0);addBlimp(0,100,220,110,6,1);
  MAPDEF.fireworks={x0:-200,x1:200,z0:180,z1:300,y:60};
  for(let k=0;k<18;k++)addDebris('cone',-190+k*22,0,26.5);for(let k=0;k<14;k++)addDebris('barrel',-198+(k%2)*1,0,-30+Math.floor(k/2)*1.1);
  for(let k=0;k<6;k++)for(let s=0;s<3;s++)addDebris('box',-170+k*60,s*0.8,-235,{s:0.8});
  for(const[bi,z]of alleysZ)if(rnd()<0.4)mistSpots.push([0,z]);mistSpots.push([0,30],[-100,30],[100,30]);
  const aB=alleysZ.filter(a=>a[0]===1),aA=alleysZ.filter(a=>a[0]===0);const zB=aB[Math.min(1,aB.length-1)][1],zA=aA[Math.min(1,aA.length-1)][1];
  segment('Quay Sprint',[-195,4,30],[195,4,30]);segment('Stack Alley',[-176,3.5,zB],[176,3.5,zB],3);segment('Lighthouse Climb',[0,4,110],[-20,53,150]);
  const SP={p:[0,0,25],h:0};MAPDEF.spawn=SP;
  MAPDEF.tracks={
    port_stack:{name:'Container Canyon',spawn:SP,pts:[[-60,5,-35],[-60,5,zB],[-20,4,zB,.7],[40,4,zB,.7],[60,5,zB],[60,5,-115],[0,6,-115],[-60,6,-115],[-60,5,zA],[-120,4,zA,.7],[-195,5,zA],[-195,5,-35]]},
    port_ship:{name:'Harbor Run',spawn:SP,pts:[[-25,8,30],[-111,18,64],[-111,6,64,.9],[-145,6,64,.9],[-145,18,64],[-163,19,44],[-163,19.5,64,.7],[-163,19,86],[-60,10,150],[-20,54,150],[20,20,120],[90,38,70],[79,18,64],[79,6,64,.9],[45,6,64,.9],[45,18,64]]}
  };
  MAPDEF.spots=[{x:-80,z:-212,h:38.3},{x:shA.x1-10,z:shA.cz,h:12.5},{x:shB.x1-10,z:shB.cz,h:12.5},{x:-120,z:150,h:2.4},{x:-205,z:10,h:0},{x:0,z:25,h:0},...off.map(b=>({x:b.x+8,z:b.z,h:b.h})),{x:120,z:-255,h:0}];
  const tk=[];STS.forEach(x=>tk.push([x,53.5,24]));holdsAll.forEach(h=>tk.push([h.x,5,h.z]));tunnels.forEach(t=>tk.push([t.x,t.y,t.z]));
  tk.push([-24.3,42,150],[-205,4,150],[-205,47,10],[90,40,79],[-50,40,79],[160,46,-212],[-80,41,-212],[0,3,110],[195,3,-35],[-195,3,-115]);
  alleysZ.slice(0,4).forEach(([b,z],i)=>tk.push([i%2?120:-120,3,z]));
  MAPDEF.tokens=tk.slice(0,36);
}
// lattice water tower with a climbable ladder cage and a hatch through the tank
function waterTowerClimb(x,z,Ht){for(const ox of[-1,1])for(const oz of[-1,1])box(x+ox*4,0,z+oz*4,0.5,Ht,0.5,steel);
  for(let y=6;y<Ht;y+=8){box(x,y,z-4,8,0.3,0.3,steel);box(x,y,z+4,8,0.3,0.3,steel);box(x-4,y,z,0.3,0.3,8,steel);box(x+4,y,z,0.3,0.3,8,steel);}
  for(const ox of[-1,1])for(const oz of[-1,1])box(x+ox*0.95,0,z+oz*0.95,0.08,Ht,0.08,yellowSteel);
  for(let y=2;y<Ht;y+=2.5){box(x,y,z-0.95,1.9,0.06,0.06,yellowSteel);box(x,y,z+0.95,1.9,0.06,0.06,yellowSteel);box(x-0.95,y,z,0.06,0.06,1.9,yellowSteel);box(x+0.95,y,z,0.06,0.06,1.9,yellowSteel);}
  const tr=5.5,th=8;for(let k=0;k<14;k++){const a=k/14*TAU;box(x+Math.cos(a)*tr,Ht,z+Math.sin(a)*tr,2.6,th,2.6,rustMat);}
  holedSlab(x-tr,x+tr,z-tr,z+tr,Ht,0.4,[[x-1.3,x+1.3,z-1.3,z+1.3]],rustMat);holedSlab(x-tr,x+tr,z-tr,z+tr,Ht+th,0.4,[[x-1.3,x+1.3,z-1.3,z+1.3]],rustMat);
  gapZones.push({c:new V3(x,Ht+th+0.6,z),n:new V3(0,1,0),name:'TOWER CLIMB',pts:400,test:p=>Math.abs(p.x-x)<1.3&&Math.abs(p.z-z)<1.3});}

// ---------------- ABANDONED FACTORY ----------------
function buildFactory(){
  MAPDEF.name='Abandoned Factory';MAPDEF.lightMul=0.55;MAPDEF.dark=true;MAPDEF.weatherDefault='fog';MAPDEF.roofY=30;
  const conc=lam(0x6e6a63),brickTex=canvasTex(128,64,(g)=>{g.fillStyle='#7a4a3a';g.fillRect(0,0,128,64);g.fillStyle='#5e3628';for(let y=0;y<64;y+=8){g.fillRect(0,y,128,1);for(let x=(y/8)%2?0:8;x<128;x+=16)g.fillRect(x,y,1,8);}}),brick=lam(0xffffff,{map:brickTex});
  const grate=lam(0x5b5f66),pipeM=lam(0x5c3d2e),dark=lam(0x252628),tunD=lam(0x1c1d1f);
  {const g=new THREE.Mesh(new THREE.PlaneGeometry(1000,1000),conc);g.rotation.x=-Math.PI/2;g.position.y=-0.02;scene.add(g);}
  const X0=-90,X1=90,Z0=-50,Z1=50,HH=30;
  box(0,0,0,180,0.05,100,lam(0x4c4a46),false);
  // long walls with window bays (glass panes can be smashed)
  for(const z of[Z0,Z1]){box(0,0,z,181,6,1,brick);box(0,24,z,181,6,1,brick);for(let x=-90;x<=90;x+=10)box(x,6,z,2,18,1,brick);for(let x=-85;x<90;x+=10)if(rnd()<0.6)addDebris('glass',x,6,z,{w:8,h:18,d:0.08});}
  // end walls with big doors (east wall has a hole for the conveyor tube)
  for(const x of[X0,X1]){box(x,0,-29,1,30,42,brick);box(x,0,29,1,30,42,brick);box(x,16,-5.1,1,14,5.8,brick);box(x,16,5.1,1,14,5.8,brick);
    if(x===X1){box(x,16,0,1,6,4.4,brick);box(x,26,0,1,4,4.4,brick);}else box(x,16,0,1,14,4.4,brick);}
  // roof with skylights (some open, some glass)
  const sky=[];for(const x of[-60,-20,20,60])for(const z of[-25,0,25])sky.push([x-4,x+4,z-4,z+4]);
  holedSlab(X0,X1,Z0,Z1,HH,0.8,sky,lam(0x3a3836));
  sky.forEach(([a,b,c,d],i)=>{const cx=(a+b)/2,cz=(c+d)/2,open=(cx===-60&&cz===25)||(cx===20&&cz===-25)||rnd()<0.25;
    if(!open)addDebris('glass',cx,HH+0.4,cz,{w:8,h:0.06,d:8,flat:true});else{box(cx,0.1,cz,8,HH,8,basic(0xfff6d8,{transparent:true,opacity:0.05,depthWrite:false}),false);gapZones.push({c:new V3(cx,HH+0.4,cz),n:new V3(0,1,0),name:'SKYLIGHT',pts:160,test:p=>Math.abs(p.x-cx)<4&&Math.abs(p.z-cz)<4});}});
  // catwalks
  const rail=(x,y,z,w,d)=>box(x,y,z,w,1,d,grate);
  for(const z of[47.25,-47.25]){box(0,10,z,176,0.25,2.5,grate);rail(0,10.25,z-Math.sign(z)*1.25,176,0.06);}
  for(const x of[-40,40]){box(x,10,0,2.5,0.25,92,grate);rail(x-1.25,10.25,0,0.06,92);rail(x+1.25,10.25,0,0.06,92);}
  for(const x of[-87.25,87.25]){box(x,18,0,2.5,0.25,96,grate);rail(x-Math.sign(x)*1.25,18.25,0,0.06,96);}
  box(0,18,0,172,0.25,2.5,grate);rail(0,18.25,-1.25,172,0.06);rail(0,18.25,1.25,172,0.06);
  ramp(-80,-60,40,44,'x',0.05,10,grate);ramp(60,80,-44,-40,'x',10,0.05,grate);
  // overhead crane girder rolling along the hall
  box(0,23,48.5,180,0.8,0.8,steel);box(0,23,-48.5,180,0.8,0.8,steel);
  const crane2=new THREE.Group();scene.add(crane2);const gir=new THREE.Mesh(new THREE.BoxGeometry(2,1.6,98),yellowSteel);gir.position.y=24.8;crane2.add(gir);const hoist=new THREE.Mesh(new THREE.BoxGeometry(2.4,1.4,2.4),darkMetal);crane2.add(hoist);const hcab=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,1,4),darkMetal);crane2.add(hcab);
  // conveyors with crates
  const crates=[];for(const z of[-20,0,20]){box(0,1,z,120,0.3,2,dark);for(let x=-58;x<=58;x+=8){box(x,0,z-0.9,0.3,1,0.3,steel);box(x,0,z+0.9,0.3,1,0.3,steel);}for(let k=0;k<8;k++){const c=new THREE.Mesh(new THREE.BoxGeometry(1.3,1.3,1.3),cardMat);scene.add(c);crates.push({c,z,k});}}
  MAPDEF.updaters.push(t=>{const cx=70*Math.sin(t*0.05);crane2.position.x=cx;const hz=30*Math.sin(t*0.11),hy=14+5*Math.sin(t*0.17);hoist.position.set(0,hy,hz);hcab.position.set(0,(hy+24)/2,hz);hcab.scale.y=24-hy;
    dynBox(cx,24.8,0,1,0.8,49);dynBox(cx,hy,hz,1.2,0.7,1.2);for(const q of crates){const x=((t*2.2+q.k*15)%120)-60;q.c.position.set(x,1.95,q.z);dynBox(x,1.95,q.z,0.65,0.65,0.65);}});
  for(const x of[-45,0,45])for(const z of[-10,10])box(x,0,z,7,9,5,rustMat);
  box(0,4,48.6,180,0.8,0.8,pipeM);box(0,26,-48.6,180,0.8,0.8,pipeM);for(let x=-80;x<=80;x+=32)box(x,0,-48.4,0.8,26,0.8,pipeM);
  for(let k=0;k<12;k++){const x=-80+rnd()*160,z=-40+rnd()*80,L=8+rnd()*8;box(x,HH-L,z,0.08,L,0.08,darkMetal);box(x,HH-L-0.5,z,0.4,0.5,0.4,steel);}
  for(let k=0;k<12;k++){const x=-85+rnd()*170,z=(rnd()<.5?-1:1)*(42+rnd()*4);for(let s=0;s<3;s++)addDebris('barrel',x+(s%2)*0.9,0,z+(s>1?0.9:0));}
  for(let k=0;k<10;k++)addDebris('box',-70+rnd()*140,0,-35+rnd()*70,{s:1});
  for(let x=-80;x<=80;x+=20)for(const z of[-30,30])box(x,HH-1.2,z,3,0.2,0.8,basic(0xffe8b0),false);
  for(let x=-90;x<=90;x+=30)box(x+1.1,8,49,0.4,0.4,0.4,basic(0xff6a1f),false);
  // yard: smokestacks with ladder cages, silos, conveyor tube, dark tunnel, rail yard, tanks
  const stacks=[[-40,-120],[0,-128],[40,-120]];
  stacks.forEach(([x,z])=>{mesh(new THREE.CylinderGeometry(3.4,4.4,70,20),brick,x,35,z);collider(x-3.6,0,z-3.6,x+3.6,70,z+3.6);for(const y of[20,45,66])mesh(new THREE.CylinderGeometry(4.2-y*0.012,4.3-y*0.012,1,20),dark,x,y,z);
    const cz=z+4.6;for(const ox of[-1,1])box(x+ox*0.8,0,cz,0.08,70,0.08,steel);for(let y=2;y<70;y+=2.5)box(x,y,cz+0.8,1.6,0.06,0.06,steel);steamVent(x,70,z);});
  vaultRoom(0,70,-128,5,5,4);
  for(const z of[-30,0,30]){mesh(new THREE.CylinderGeometry(7,7,32,20),lam(0x9aa0a6),130,16,z);collider(123.8,0,z-6.2,136.2,32,z+6.2);mesh(new THREE.ConeGeometry(7.2,4,20),lam(0x7d838a),130,34,z);collider(124,32,z-5,136,36,z+5);}
  box(104,22,0,28,0.3,4.4,grate);box(104,26,0,28,0.3,4.4,grate);box(104,22.3,-2.1,28,3.7,0.2,lam(0x707780));box(104,22.3,2.1,28,3.7,0.2,lam(0x707780));for(const x of[96,112])box(x,0,0,0.8,22,0.8,steel);
  gapZones.push({c:new V3(104,24,0),n:new V3(1,0,0),name:'CONVEYOR TUBE',pts:220,test:p=>Math.abs(p.z)<2&&p.y>22&&p.y<26});
  box(-180,0,-84.3,160,6.6,0.6,tunD);box(-180,0,-75.7,160,6.6,0.6,tunD);box(-180,6,-80,160,0.6,9.2,tunD);for(let x=-250;x<=-110;x+=20)box(x,5.6,-80,0.4,0.3,0.4,basic(0xff2d2d),false);
  for(const ox of[-1,1])for(const oz of[-1,1])box(-270+ox*10,0,-80+oz*10,0.5,8,0.5,steel);box(-270,8,-80,22,0.4,22,rustMat);
  gapZones.push({c:new V3(-180,3,-80),n:new V3(1,0,0),name:'DARK TUNNEL',pts:240,test:p=>Math.abs(p.z+80)<4&&p.y<6});
  box(0,0.05,108.8,500,0.12,0.15,steel,false);box(0,0.05,111.2,500,0.12,0.15,steel,false);for(const x of[-100,-80,40,60])box(x,0.4,110,14,4.2,3.2,rnd()<.5?rustMat:lam(0x1e3a8a));
  for(const x of[-150,-130]){mesh(new THREE.SphereGeometry(6,18,12),rustMat,x,10,60);collider(x-5,4,55,x+5,16,65);for(const o of[-1,1])box(x+o*3,0,60,0.6,6,0.6,steel);}
  for(let k=0;k<8;k++)addDebris('barrel',-150+k*1.1,0,70);for(let k=0;k<12;k++)addDebris('cone',-100+k*8,0,95);
  for(let x=-250;x<=250;x+=5){if(Math.abs(x)<15)continue;box(x,0,-250,0.08,2.4,0.08,steel);box(x,0,250,0.08,2.4,0.08,steel);}box(0,2.3,-250,500,0.06,0.06,steel);box(0,2.3,250,500,0.06,0.06,steel);
  mistSpots.push([-180,-80],[0,110],[-150,60],[60,-90],[0,0]);
  segment('Tunnel Sprint',[-95,3,-80],[-255,3,-80],3);segment('Stack Climb',[0,3,-123.4],[0,68,-123.4],1.6);segment('Hall Dash',[-100,6,0],[95,6,0]);
  const SP={p:[-110,0,0],h:-Math.PI/2};MAPDEF.spawn=SP;
  MAPDEF.tracks={
    fac_floor:{name:'Factory Floor',spawn:SP,pts:[[-100,6,0],[-60,5,-10],[-10,6,-35],[40,6,-20],[75,8,0],[40,14,25],[-30,22,10,.8],[-60,24,25,.8],[-60,34,25,.8],[-100,34,25]]},
    fac_yard:{name:'Smokestack Slalom',spawn:SP,pts:[[-110,8,-40],[-40,12,-108],[0,30,-140],[40,12,-108],[90,10,-70],[126,24,-15],[112,24,0,.6],[96,24,0,.6],[60,16,8],[-80,6,0],[-105,6,0],[-110,6,-60],[-105,3,-80,.7],[-180,3,-80,.7],[-262,4,-80]]}
  };
  MAPDEF.spots=[{x:0,z:0,h:0},{x:-40,z:-25,h:30.8},{x:40,z:12,h:30.8},{x:130,z:-30,h:36},{x:130,z:30,h:36},{x:-270,z:-80,h:8.4},{x:-80,z:110,h:4.6},{x:60,z:110,h:4.6},{x:-87,z:30,h:18.25},{x:0,z:47,h:10.25}];
  MAPDEF.tokens=[[-60,30,25],[0,12,-47],[-40,12,30],[40,12,-30],[87,20,40],[-87,20,-40],[0,20,0],[-45,10.5,10],[45,10.5,-10],[0,40,-123.4],[40,60,-115.4],[130,37.5,0],[104,24,0],[-180,3,-80],[-270,10,-80],[-90,5,110],[50,5,110],[-140,17,60],[-60,32,-25],[60,33,25],[0,3,-130+10],[150,5,-100],[-200,6,150],[200,6,-150],[80,6,-30]];
}

// ---------------- CANYON VALLEY ----------------
function buildValley(){
  MAPDEF.name='Canyon Valley';
  const xc=z=>60*Math.sin(z/90)+18*Math.sin(z/37);
  const H=(x,z)=>{const d=Math.abs(x-xc(z));const fl=z<-165?27:2;const w=Math.min(1,Math.max(0,(d-19)/34));const rim=62+9*Math.sin(x/53)*Math.cos(z/61)+5*Math.sin(x/17+z/23)+(Math.abs(x)>220?(Math.abs(x)-220)*0.5:0);return fl+(rim-fl)*Math.pow(w,0.65);};
  MAPDEF.terrain=H;
  MAPDEF.waters.push({x0:-2000,x1:2000,z0:-2000,z1:-165,y:28.4,test:(x,z)=>Math.abs(x-xc(z))<21},{x0:-2000,x1:2000,z0:-165,z1:153,y:3.4,test:(x,z)=>Math.abs(x-xc(z))<21},{x0:-2000,x1:2000,z0:156,z1:2000,y:46});
  {const tc=new THREE.Color();terrainMesh(H,-360,360,-360,360,230,(c,x,y,z,sl)=>{const d=Math.abs(x-xc(z));if(sl>1.1)c.setHex(0x8a6a4f).lerp(tc.setHex(0x6e5440),Math.min(1,(sl-1.1)));else if(d<24)c.setHex(0xc9b48a);else if(y>50)c.setHex(0x5f8f45).lerp(tc.setHex(0x7da352),Math.sin(x*0.05+z*0.03)*0.5+0.5);else c.setHex(0x9b7b5a);});}
  const wm=new THREE.MeshPhongMaterial({color:0x2a7d8f,shininess:120,specular:0xd2ecf2,transparent:true,opacity:0.88});
  const ribbon=(za,zb,y)=>{const pts=[],idx=[];let n=0;for(let z=za;z<=zb;z+=4){pts.push(xc(z)-21,y,z,xc(z)+21,y,z);if(n){const a=(n-1)*2;idx.push(a,a+1,a+2,a+1,a+3,a+2);}n++;}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pts,3));g.setIndex(idx);g.computeVertexNormals();const m=new THREE.Mesh(g,wm);scene.add(m);};
  ribbon(-360,-165,28.4);ribbon(-165,154,3.4);
  {const l=new THREE.Mesh(new THREE.PlaneGeometry(720,210),wm);l.rotation.x=-Math.PI/2;l.position.set(0,46,156+105);scene.add(l);}
  // waterfall over a rock lip with a cave behind it
  const xf=xc(-157);box(xf,20,-157.5,44,7.4,15,rockMat);
  const fallTex=canvasTex(64,256,(g)=>{g.fillStyle='rgba(220,240,255,.6)';g.fillRect(0,0,64,256);g.fillStyle='rgba(255,255,255,.9)';for(let i=0;i<60;i++)g.fillRect(Math.random()*64,Math.random()*256,2,20+Math.random()*30);});
  const fall=new THREE.Mesh(new THREE.PlaneGeometry(40,25),basic(0xffffff,{map:fallTex,transparent:true,opacity:0.75,side:THREE.DoubleSide,depthWrite:false}));fall.position.set(xf,15.9,-149.7);scene.add(fall);
  MAPDEF.updaters.push(t=>{fallTex.offset.y=-t*1.2;});for(let k=-2;k<=2;k++)steamVent(xf+k*8,3.6,-147);
  // dam with a spillway tunnel and a lake behind it
  const xd=xc(153);box(xd-34,0,153,52,50,6,concrete);box(xd+34,0,153,52,50,6,concrete);box(xd,0,153,16,4,6,concrete);box(xd,12,153,16,38,6,concrete);box(xd-6,4,153,4,8,6,concrete);box(xd+6,4,153,4,8,6,concrete);
  box(xd,50,150.2,120,1.2,0.3,darkMetal);
  gapZones.push({c:new V3(xd,8,153),n:new V3(0,0,1),name:'DAM SPILLWAY',pts:300,test:p=>Math.abs(p.x-xd)<4&&p.y>4&&p.y<12});
  // suspension bridge (z=0) and rope bridge (z=-80)
  const x0b=xc(0),deckY=64;box(x0b,deckY-1,0,112,1,4,woodMat2);for(const s of[-1,1]){box(x0b,deckY,s*1.9,112,1,0.1,darkMetal);}
  for(const ex of[-56,56])for(const s of[-1,1])box(x0b+ex,H(x0b+ex,0)-4,s*2.4,1.6,deckY+26-H(x0b+ex,0)+4,1.6,steel);
  for(let k=0;k<28;k++){const xa=-56+k*4,xb=xa+4,f=u=>deckY+26-24*(1-Math.pow(u/56,2)),ym=(f(xa)+f(xb))/2;for(const s of[-1,1]){box(x0b+(xa+xb)/2,ym,s*2.4,4,0.12,0.12,darkMetal);box(x0b+xa,deckY,s*2.4,0.06,f(xa)-deckY,0.06,darkMetal);}}
  const x8=xc(-80);let lx=x8,rx=x8;while(H(lx,-80)<35&&lx>x8-120)lx-=1;while(H(rx,-80)<35&&rx<x8+120)rx+=1;box((lx+rx)/2,34.4,-80,rx-lx,0.25,2,woodMat2);for(const s of[-1,1])box((lx+rx)/2,35.4,-80+s*1,rx-lx,0.06,0.06,trunkMat);
  // natural rock arch (z=80)
  const xa8=xc(80),AR=34;const arch=new THREE.Mesh(new THREE.TorusGeometry(AR,6,10,28,Math.PI),rockMat);arch.position.set(xa8,20,80);scene.add(arch);
  for(let k=0;k<=18;k++){const a=k/18*Math.PI,px=xa8+Math.cos(a)*AR,py=20+Math.sin(a)*AR;collider(px-5,py-5,75,px+5,py+5,85);}
  gapZones.push({c:new V3(xa8,20,80),n:new V3(0,0,1),name:'ROCK ARCH',pts:220,test:p=>Math.hypot(p.x-xa8,p.y-20)<AR-6&&p.y>4});
  for(let k=0;k<22;k++){const z=-300+rnd()*560,x=xc(z)+(rnd()<.5?-1:1)*(14+rnd()*8),s=1+rnd()*2.5,y=groundH(x,z,99);const r=mesh(new THREE.DodecahedronGeometry(s,0),rockMat,x,y+s*0.5,z);collider(x-s*0.8,y,z-s*0.8,x+s*0.8,y+s*1.3,z+s*0.8);}
  const pl=[];for(let k=0;k<420;k++){const x=-340+rnd()*680,z=-340+rnd()*680;if(Math.abs(x-xc(z))<62||H(x,z)<52)continue;if(Math.abs(z)<8&&Math.abs(x-x0b)<70)continue;pl.push([x,z,0.8+rnd()*0.7]);}pines(pl,H);
  // ranger tower on the rim (secret vault in the cabin)
  const rxT=xc(-60)+75,rzT=-60,ryT=H(rxT,rzT);for(const ox of[-1,1])for(const oz of[-1,1])box(rxT+ox*2.2,ryT,rzT+oz*2.2,0.4,16,0.4,woodMat2);vaultRoom(rxT,ryT+16,rzT,5,5,4);
  for(const z of[-150,0,150]){const x=xc(z)-150;turbine(x,z,H(x,z),55,22,0.4+rnd()*0.1);}
  addHeli(xc(0),0,160,92,14,0);
  MAPDEF.fireworks={x0:-100,x1:100,z0:210,z1:320,y:90};
  for(let k=0;k<10;k++)mistSpots.push([xc(-150+k*30),-150+k*30]);
  const P=(z,y,s)=>s?[xc(z),y,z,s]:[xc(z),y,z],E=(z,dx,dy)=>{const x=xc(z)+dx;return[x,H(x,z)+dy,z];};
  segment('White Water',[xc(-140),7,-140],[xc(140),7,140],5);segment('Falls Drop',[xf,40,-151],[xf,6,-151],6);
  const SP={p:[xc(-40)+70,H(xc(-40)+70,-40),-40],h:Math.PI/2};MAPDEF.spawn=SP;
  MAPDEF.tracks={
    val_river:{name:'River Run',spawn:SP,pts:[P(-230,33),P(-180,32),P(-150,30),P(-130,9),P(-90,8),P(-30,8),P(30,8),P(80,8),P(125,8),[xd,8,153,.8],P(185,52),E(150,85,20),E(40,85,20),E(-40,85,20),E(-120,85,20),E(-200,85,20)]},
    val_rim:{name:'Rim Rush',spawn:SP,pts:[E(200,-85,20),[xd,56,140],P(80,40),P(0,56),P(-80,28),P(-150,40),E(-200,-85,20),E(-50,-90,20),E(100,-90,20)]}
  };
  const sp=[];[[-150,90],[-20,85],[100,85],[60,-90],[-100,-90]].forEach(([z,dx])=>{const x=xc(z)+dx;sp.push({x,z,h:H(x,z)});});sp.push({x:xd,z:153,h:50},{x:x0b,z:0,h:deckY},{x:xf,z:-160,h:2},{x:(lx+rx)/2,z:-80,h:34.65},{x:rxT+8,z:rzT,h:H(rxT+8,rzT)});
  MAPDEF.spots=sp;
  const tk=[[xf,8,-158],[xf,30,-170],[xd,8,153],[xd,53,150],[x0b,60,0],[x0b+56,92,2.4],[(lx+rx)/2,30,-80],[xa8,63,80],[xa8,26,80],[rxT,ryT+22,rzT]];
  for(let k=0;k<16;k++){const z=-300+k*38;tk.push(k%2?[xc(z)+(k%4===1?12:-12),z<-165?31:6,z]:E(z,(k%4?95:-95),6));}
  tk.push([xc(250),49,250],[xc(-300),31,-300]);MAPDEF.tokens=tk.slice(0,30);
}

// ---------------- MOUNTAIN SKI RESORT ----------------
function buildSki(){
  MAPDEF.name='Ski Resort';MAPDEF.weatherDefault='snow';
  const base=z=>{const t=Math.min(1,Math.max(0,(220-z)/440));return 4+186*Math.pow(t,1.25);};
  const runX=z=>-20+25*Math.sin(z/70);
  const H=(x,z)=>{const b=base(z),side=Math.pow(Math.abs(x)/240,2)*55,bumps=10*Math.sin(x/45+z/80)+5*Math.sin(x/19)*Math.cos(z/27),groom=Math.max(0,1-Math.abs(x-runX(z))/28);return b+side+bumps*(1-groom*0.85);};
  MAPDEF.terrain=H;
  terrainMesh(H,-320,320,-320,320,230,(c,x,y,z,sl)=>{if(sl>1.05)c.setHex(0x7b7f86);else{const v=0.93+0.07*Math.sin(x*0.2+z*0.13);c.setRGB(v,v,Math.min(1,v+0.04));}});
  // chairlift (x=60) and gondola (x=-120)
  function lift(xl,za,zb,towerH,count,speed,cabin){const pts=[];for(let z=za;z>=zb;z-=40){const y=H(xl,z)+towerH;pts.push(new V3(xl,y,z));box(xl,H(xl,z),z,1.2,towerH,1.2,steel);box(xl,H(xl,z)+towerH,z,5,0.5,0.6,steel);}
    const seg=[];let L=0;for(let i=1;i<pts.length;i++){const l=pts[i].distanceTo(pts[i-1]);seg.push(l);L+=l;}
    const at=(s,off,out)=>{s=Math.max(0,Math.min(L,s));let i=0;while(i<seg.length-1&&s>seg[i]){s-=seg[i];i++;}const u=seg[i]?s/seg[i]:0;out.copy(pts[i]).lerp(pts[i+1],u);out.x+=off;return out;};
    for(const off of[-1.5,1.5])for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],m=a.clone().add(b).multiplyScalar(0.5),len=a.distanceTo(b);const c=new THREE.Mesh(new THREE.CylinderGeometry(0.05,0.05,len,4),darkMetal);c.position.copy(m);c.position.x+=off;c.lookAt(b.x+off,b.y,b.z);c.rotateX(Math.PI/2);scene.add(c);}
    const cars=[],cm=lam(cabin?0xc2352b:0x2b2f36);for(let k=0;k<count;k++){const g=new THREE.Group();if(cabin){g.add(new THREE.Mesh(new THREE.BoxGeometry(2.4,2.4,2.4),cm));const w=new THREE.Mesh(new THREE.BoxGeometry(2.45,0.9,2.45),basic(0x9fd3f0));w.position.y=0.3;g.add(w);}else{g.add(new THREE.Mesh(new THREE.BoxGeometry(2,0.2,0.8),cm));const bk=new THREE.Mesh(new THREE.BoxGeometry(2,0.9,0.12),cm);bk.position.set(0,0.45,0.4);g.add(bk);}
      const hang=new THREE.Mesh(new THREE.BoxGeometry(0.06,cabin?1.2:2.2,0.06),darkMetal);hang.position.y=cabin?1.8:1.2;g.add(hang);scene.add(g);cars.push(g);}
    const tmp=new V3();MAPDEF.updaters.push(t=>{cars.forEach((g,k)=>{let u=(t*speed+k*2*L/count)%(2*L);const up=u<L;at(up?u:2*L-u,up?-1.5:1.5,tmp);g.position.set(tmp.x,tmp.y-(cabin?3:2.4),tmp.z);g.rotation.y=up?0:Math.PI;dynBox(tmp.x,tmp.y-(cabin?3:2.4),tmp.z,cabin?1.2:1,cabin?1.2:0.6,cabin?1.2:0.5);});});
    return{pts,L};}
  const chair=lift(60,200,-200,14,36,4.5,false),gond=lift(-120,200,0,22,10,6,true);
  for(const[x,z,w,d,h]of[[60,212,14,10,6],[60,-212,14,10,7],[-120,212,12,10,7],[-120,-8,12,10,7]]){const y=H(x,z);box(x,y-1,z,w,h+1,d,woodMat2);box(x,y+h,z,w+2,0.6,d+2,roofMat);}
  // ski jump
  const zT0=-70,zT1=-10,yTop=H(150,zT0)+28,yTk=H(150,zT1)+5;ramp(146,154,zT0,zT1,'z',yTop,yTk,woodMat2);
  for(let z=zT0;z<=zT1;z+=8){const ry=yTop+(yTk-yTop)*(z-zT0)/(zT1-zT0),gy=H(150,z);if(ry-gy>1.5)box(150,gy,z,1,ry-gy-0.8,1,steel);}
  for(const s of[-1,1])box(150+s*4,yTk,(zT0+zT1)/2,0.08,1,zT1-zT0,yellowSteel,false);
  box(150,H(150,zT0-4),zT0-4,7,yTop-H(150,zT0-4),6,woodMat2);
  gapZones.push({c:new V3(150,yTk+3,zT1+2),n:new V3(0,0,1),name:'SKI JUMP',pts:300,test:p=>Math.abs(p.x-150)<5&&p.y>yTk-1&&p.y<yTk+12});
  // lodge with a sloped roof, summit restaurant (secret vault on top)
  const ly=H(-20,215);box(-20,ly-1,215,24,9,14,woodMat2);ramp(-32,-8,208,215,'z',ly+8,ly+13,roofMat);ramp(-32,-8,215,222,'z',ly+13,ly+8,roofMat);box(-12,ly+10,212,1.6,6,1.6,rockMat);
  const sy=H(-20,-215);box(-20,sy-1,-215,26,11,16,woodMat2);box(-20,sy+10,-215,28,0.6,18,roofMat);box(-8,sy+10.6,-209,0.8,22,0.8,steel);vaultRoom(-24,sy+10.6,-215,6,6,4);
  // slalom flags along the main run
  for(let z=-190,k=0;z<190;z+=30,k++){const x=runX(z)+(k%2?9:-9);for(const o of[-1.5,1.5])box(x+o,H(x+o,z),z,0.08,2,0.08,k%2?redSteel:lam(0x1d4ed8));}
  const pl=[];for(let k=0;k<520;k++){const x=-310+rnd()*620,z=-280+rnd()*480;if(Math.abs(x-runX(z))<34||Math.abs(x-60)<8||Math.abs(x+120)<8||(Math.abs(x-150)<14&&z>-80&&z<120)||Math.abs(x+20)<20&&z>200)continue;const sl=Math.hypot(H(x+1,z)-H(x-1,z),H(x,z+1)-H(x,z-1))/2;if(sl>0.9)continue;pl.push([x,z,0.7+rnd()*0.8]);}pines(pl,H);
  for(const z of[-120,0,120]){turbine(-262,z,H(-262,z),50,20,0.4);}
  addHeli(0,-150,120,230,14,0);
  for(let k=0;k<14;k++)addDebris('cone',-40+k*3,H(-40+k*3,190),190);
  segment('Downhill Schuss',[runX(-180),H(runX(-180),-180)+4,-180],[runX(180),H(runX(180),180)+4,180],6);segment('Big Air',[150,yTop+3,zT0+2],[150,H(150,90)+4,90],6);
  const SP={p:[0,H(0,200),200],h:0};MAPDEF.spawn=SP;
  const ry=z=>yTop+(yTk-yTop)*(z-zT0)/(zT1-zT0);
  const down=[];for(let z=-200,k=0;z<=190;z+=40,k++){const x=runX(z)+(k%2?10:-10);down.push([x,H(x,z)+5,z]);}
  for(const z of[150,50,-50,-150])down.push([69,H(69,z)+12,z]);
  MAPDEF.tracks={
    ski_down:{name:'Downhill',spawn:SP,pts:down},
    ski_jump:{name:'Big Air',spawn:SP,pts:[[150,yTop+4,zT0-8],[150,ry(-50)+3,-50],[150,ry(-25)+3,-25],[150,yTk+4,-4],[150,H(150,40)+6,40],[150,H(150,100)+6,100],[100,H(100,150)+20,150],[85,H(85,0)+30,0],[120,H(120,-90)+25,-90]]}
  };
  MAPDEF.spots=[{x:60,z:212,h:H(60,212)+6.6},{x:60,z:-212,h:H(60,-212)+7.6},{x:-120,z:-8,h:H(-120,-8)+7.6},{x:150,z:zT0-4,h:yTop},{x:-20,z:-209,h:sy+10.6},{x:0,z:200,h:H(0,200)}];
  const tk=[];for(let k=0;k<12;k++){const z=-200+k*35,x=runX(z)+(k%2?-18:18);tk.push([x,H(x,z)+3,z]);}
  chair.pts.forEach((p,i)=>{if(i%3===1)tk.push([p.x+5,p.y-6,p.z]);});gond.pts.forEach((p,i)=>{if(i%2===1)tk.push([p.x-5,p.y-4,p.z]);});
  tk.push([150,yTk+10,5],[150,yTop+5,zT0-4],[-20,ly+16,215],[-20,sy+26,-215],[-262,H(-262,0)+60,-3]);
  for(let k=0;k<6;k++){const x=-280+k*100,z=-250+rnd()*80;tk.push([x,H(x,z)+4,z]);}
  MAPDEF.tokens=tk.slice(0,30);
}

// ---------------- MALL & AIRPORT ----------------
function buildMall(){
  MAPDEF.name='Mall & Airport';MAPDEF.indoor=true;MAPDEF.roofY=26;MAPDEF.lightMul=0.85;
  const asph=lam(0x3a3c40),tile=new THREE.MeshPhongMaterial({color:0xd9d6cf,shininess:60,specular:0x555555}),wallW=lam(0xe9e4da),trim=lam(0x2b2f36),lightP=basic(0xfff8e8),shopC=[0xf3e9d2,0xd7e7f0,0xe9d7f0,0xd9f0d7,0xf0dcd7].map(c=>lam(c));
  {const g=new THREE.Mesh(new THREE.PlaneGeometry(1400,1400),asph);g.rotation.x=-Math.PI/2;g.position.y=-0.02;scene.add(g);}
  const VOID=[-60,60,-20,20];
  {const f=new THREE.Mesh(new THREE.PlaneGeometry(240,120),tile);f.rotation.x=-Math.PI/2;f.position.set(0,0.02,0);scene.add(f);}
  for(const y of[8,16])holedSlab(-120,120,-60,60,y-0.6,0.6,[VOID],tile);
  holedSlab(-120,120,-60,60,26,0.8,[VOID],trim);box(0,26.2,0,120,0.3,40,glassMat);
  for(let x=-105;x<=105;x+=30)for(const y of[7.3,15.3,25.9])for(const z of[-40,40])box(x,y,z,6,0.08,1.2,lightP,false);
  // shell walls
  box(0,0,60,241,26,1,wallW);box(0,0,-60,241,26,1,wallW);
  box(-120,0,-35,1,26,50,wallW);box(-120,0,35,1,26,50,wallW);box(-120,7,0,1,19,20,wallW);
  box(120,0,-40,1,26,40,wallW);box(120,0,40,1,26,40,wallW);box(120,16,0,1,10,40,wallW);
  for(let k=0;k<5;k++)addDebris('glass',-120,0,-8+k*4,{w:3.8,h:7,d:0.08,rotY:Math.PI/2});
  // glass railings around the atrium void (gaps where escalators land)
  const railSeg=(y,z,x0,x1)=>{if(x1-x0>0.2)box((x0+x1)/2,y,z,x1-x0,1.1,0.08,glassMat);};
  for(const[y,gapsS,gapsN]of[[8,[[-44,-40],[-4,0]],[[40,44]]],[16,[[40,44]],[[-4,0]]]]){for(const[z,gaps]of[[-20,gapsS],[20,gapsN]]){let x=-60;for(const[a,b]of gaps){railSeg(y,z,x,a);x=b;}railSeg(y,z,x,60);}box(-60,y,0,0.08,1.1,40,glassMat);box(60,y,0,0.08,1.1,40,glassMat);}
  // escalators crossing the void
  ramp(-44,-40,-20,8,'z',8,0.25,trim);ramp(40,44,-20,20,'z',16,8,trim);ramp(-4,0,-20,20,'z',8,16,trim);
  for(const[x,z0,z1,y0,y1]of[[-42,-20,8,8,0.25],[42,-20,20,16,8],[-2,-20,20,8,16]])for(const s of[-1,1]){const L=z1-z0;box(x+s*2.1,(y0+y1)/2+0.5,(z0+z1)/2,0.12,1.1,L,glassMat,false);}
  for(const x of[-60,-30,0,30,60])for(const z of[-21,21])box(x,0,z,0.9,26,0.9,trim);
  // shops: dividers and glass fronts on each floor, north and south
  for(const fy of[0,8,16]){const h=(fy===16?26:fy+7.4)-fy;for(const s of[-1,1]){const zf=s*46,zm=s*53;for(let x=-120;x<=120;x+=15){box(x,fy,zm,0.4,h,14,wallW);}
    for(let x=-112.5;x<120;x+=15){box(x-4.75,fy,zf,5.5,h,0.12,glassMat);box(x+4.75,fy,zf,5.5,h,0.12,glassMat);if(fy===0||rnd()<0.6){box(x,fy,zm+s*3,7,2,1.2,shopC[Math.floor(rnd()*5)]);if(rnd()<0.6)addDebris('box',x-2,fy,zm-s*2,{s:0.7});}
      box(x,fy+h-0.4,zf-s*0.1,14,0.25,0.12,NEONS[Math.floor(rnd()*6)],false);}}}
  // food court + fountain + planters
  for(let k=0;k<16;k++){const x=14+(k%4)*12,z=-12+Math.floor(k/4)*8;box(x,0,z,1.4,0.75,1.4,lam(0xe5e7eb));box(x,0,z,0.08,2.4,0.08,darkMetal);mesh(new THREE.ConeGeometry(1.6,0.8,10),lam([0xef4444,0x22c55e,0x3b82f6,0xf59e0b][k%4]),x,2.6,z);collider(x-1.6,2.2,z-1.6,x+1.6,3,z+1.6,true);}
  mesh(new THREE.CylinderGeometry(5,5.4,1,24),concrete,-15,0.5,0);collider(-20,0,-5,-10,1,5);steamVent(-15,1,0);
  for(const[x,z]of[[-50,-10],[-50,10],[-25,15],[-25,-15]]){box(x,0,z,3,0.8,3,concrete);tree(x,z,0.8);}
  // airport terminal
  const TX0=120,TX1=230,TZ=50,TH=22;box((TX0+TX1)/2,0,TZ,TX1-TX0,TH,1,wallW);box((TX0+TX1)/2,0,-TZ,TX1-TX0,TH,1,wallW);box((TX0+TX1)/2,TH,0,TX1-TX0,0.8,2*TZ,trim);
  {const f=new THREE.Mesh(new THREE.PlaneGeometry(TX1-TX0,2*TZ),tile);f.rotation.x=-Math.PI/2;f.position.set((TX0+TX1)/2,0.02,0);scene.add(f);}
  const JB=[-42,18];let zPrev=-TZ;for(const jz of JB){box(TX1,0,(zPrev+jz-2)/2,0.3,TH,jz-2-zPrev,glassMat);box(TX1,0,jz,0.3,5,4,glassMat);box(TX1,8.4,jz,0.3,TH-8.4,4,glassMat);zPrev=jz+2;}box(TX1,0,(zPrev+TZ)/2,0.3,TH,TZ-zPrev,glassMat);
  for(let x=150;x<=170;x+=10)for(const z of[-40,-25])box(x,0,z,2,1.2,10,trim);
  for(let x=196;x<=222;x+=6)for(const z of[-10,10,30])box(x,0,z,1.4,0.8,8,lam(0x3b4250));
  for(let x=140;x<=220;x+=20)box(x,10,-8,8,3,0.4,basic(0x111827),true);
  box(175,0.02,0,80,0.06,3,lam(0x4b5563),false);for(const s of[-1,1])box(175,0,s*1.8,80,1,0.08,glassMat);
  {const bags=[];const cx=172,cz=28,rx=14,rz=5;const belt=new THREE.Mesh(new THREE.TorusGeometry(1,0.12,6,40),trim);belt.scale.set(rx,rz,1);belt.rotation.x=Math.PI/2;belt.position.set(cx,0.9,cz);scene.add(belt);box(cx,0,cz,rx*2-3,0.9,rz*2-3,lam(0x9aa3ad));
    for(let k=0;k<14;k++){const b=new THREE.Mesh(new THREE.BoxGeometry(0.9,0.5,0.6),lam([0x1d4ed8,0xc2352b,0x15803d,0x111827,0xf59e0b][k%5]));scene.add(b);bags.push(b);}
    MAPDEF.updaters.push(t=>bags.forEach((b,k)=>{const a=t*0.25+k/14*TAU;const x=cx+Math.cos(a)*rx,z=cz+Math.sin(a)*rz;b.position.set(x,1.25,z);b.rotation.y=-a;dynBox(x,1.25,z,0.45,0.25,0.45);}));}
  for(let x=135;x<=225;x+=15)for(const z of[-30,30])box(x,0,z,0.9,TH,0.9,trim);
  // jet bridges and parked planes
  for(const jz of JB){const x0=TX1,x1=268;box((x0+x1)/2,5,jz-1.9,x1-x0,3.8,0.2,lam(0x9aa3ad));box((x0+x1)/2,5,jz+1.9,x1-x0,3.8,0.2,lam(0x9aa3ad));box((x0+x1)/2,4.8,jz,x1-x0,0.2,4,trim);box((x0+x1)/2,8.8,jz,x1-x0,0.2,4,trim);for(const x of[245,262])box(x,0,jz,0.8,4.8,0.8,steel);
    gapZones.push({c:new V3(250,6.8,jz),n:new V3(1,0,0),name:'JET BRIDGE',pts:220,test:p=>Math.abs(p.z-jz)<1.7&&p.y>5&&p.y<8.8});}
  for(const pz of[-30,30]){planeAt(275,7,pz,true);collider(272,4,pz-26,278,10,pz+24);collider(257,5.5,pz-1,293,6.5,pz+5);collider(274.5,10,pz+18.5,275.5,17,pz+23.5);collider(269,7.5,pz+19,281,9.5,pz+23);}
  const taxi=planeAt(340,7,0,true,0xffd23f);MAPDEF.updaters.push(t=>{const z=140*Math.sin(t*0.03);taxi.position.z=z;taxi.rotation.y=Math.cos(t*0.03)>0?Math.PI:0;dynBox(340,7,z,3,3,25);dynBox(340,6,z+2,18,0.5,3);});
  box(300,0,-110,6,45,6,lam(0xcfd6de));vaultRoom(300,45,-110,8,8,4.5);for(let x=150;x<450;x+=12)box(x,0.01,-130,6,0.03,0.3,basic(0xf2d14b),false);
  // parking deck
  const PX0=-230,PX1=-130,PZ=50;for(const y of[6,12])holedSlab(PX0,PX1,-PZ,PZ,y-0.4,0.4,[[-210,-170,y===6?40:30,y===6?48:38]],concrete);box((PX0+PX1)/2,17.6,0,PX1-PX0,0.4,2*PZ,concrete);
  ramp(-210,-170,40,48,'x',0.25,6,concrete);ramp(-210,-170,30,38,'x',12,6,concrete);
  for(let x=PX0+5;x<PX1;x+=15)for(let z=-PZ+5;z<PZ;z+=15)box(x,0,z,0.8,17.6,0.8,concrete);
  const carC=[0xb91c1c,0x1d4ed8,0xe5e7eb,0x111827,0x65a30d].map(c=>lam(c));for(const y of[0,6,12])for(let k=0;k<12;k++){if(rnd()<0.3)continue;const x=PX0+12+(k%6)*15,z=(k<6?-1:1)*20;box(x,y,z,4.2,1.4,1.9,carC[k%5]);}
  for(let k=0;k<10;k++)addDebris('cone',PX0+10+k*9,0,-PZ-3);
  for(let k=0;k<12;k++){const dir=k%2?1:-1;addCar({axis:'x',line:-80,dir,lane:dir*3,p:-300+rnd()*600,v:7+rnd()*6,min:-300,max:300});}
  for(let k=0;k<6;k++){const dir=k%2?1:-1;addCar({axis:'z',line:-125,dir,lane:-dir*2.5,p:-200+rnd()*400,v:6+rnd()*5,min:-200,max:200});}
  makeLamps([...Array(12)].map((_,k)=>[-280+k*50,-72]));
  addHeli(150,-150,120,70,15,0);
  mistSpots.push([300,-110],[-180,-80]);
  segment('Atrium Drop',[0,24,10],[0,2.5,10],4);segment('Terminal Run',[125,5,0],[225,5,0],4);
  const SP={p:[-100,0,0],h:-Math.PI/2};MAPDEF.spawn=SP;
  MAPDEF.tracks={
    mall_atrium:{name:'Atrium Loop',spawn:SP,pts:[[-100,3.5,0],[-50,4,0],[-42,8.5,-6,.8],[-42,11.5,-35],[40,11.5,-35],[90,11.5,-35],[42,16.5,0,.7],[42,20.5,-33],[-40,20.5,-35],[-40,20.5,35],[-20,4,10]]},
    mall_air:{name:'Terminal Dash',spawn:SP,pts:[[-100,4,0],[0,4,-32],[100,4,-32],[140,6,0],[178,5,-12],[224,6.8,-42,.5],[250,6.8,-42,.5],[270,7,-42,.45],[270,16,-42,.8],[300,16,-60],[290,30,-120],[200,14,-85],[100,12,-80],[-100,12,-80],[-187.5,9,-30,.8],[-187.5,9,22.5,.8],[-138,9,10,.8],[-125,4,0]]}
  };
  MAPDEF.spots=[{x:-15,z:30,h:8},{x:0,z:-40,h:16},{x:175,z:0,h:22.8},{x:-180,z:0,h:18},{x:300,z:-110,h:0},{x:180,z:-40,h:1.2},{x:-150,z:-40,h:6},{x:340,z:150,h:0}];
  MAPDEF.tokens=[[-15,3,0],[0,24,0],[-42,5,-6],[42,13,0],[-2,13,0],[100,11,-50],[-100,11,50],[100,20,50],[-100,20,-50],[67.5,2,-50],[-67.5,2,50],[172,3,28],[200,3,-40],[250,6.8,-42],[250,6.8,18],[275,12,-30],[275,12,30],[290,48,-110],[340,12,0],[-187.5,3,0],[-187.5,9,0],[-187.5,15,0],[-190,19,40],[-125,3,-60],[0,30,0],[125,8,0]];
}

