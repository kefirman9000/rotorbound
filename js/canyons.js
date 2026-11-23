'use strict';
// ================= NEON CANYONS =================
// A compact 380 x 380 m vertical city: low band streets/alleys, mid band facades/skybridges, high band rooftops.
function buildCanyons(){
  const SUB_HOLES=[[-5,5,-180,-170],[165,175,-15,-5],[-175,-165,-15,-5],[18,50,120,130]];MAPDEF.collapseSegs=[];MAPDEF.name='Neon Canyons';
  const XL=[[-190,0],[-130,10],[-70,12],[0,24],[70,12],[130,10],[190,0]];
  const ZL=[[-190,0],[-130,10],[-70,12],[-10,24],[40,10],[95,16],[150,12]];
  const asphalt=lam(0x313439),mark=basic(0xd9d4bd,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4}),yel=basic(0xe3b53b,{polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-4});
  const NEON=[0xff2d95,0x00e5ff,0xb36bff,0xffd23f,0x39ff88,0xff6a3f].map(c=>basic(c));
  const glass=lam(0x8fc8ea,{transparent:true,opacity:0.42,emissive:0x0a2a40,emissiveIntensity:0.6});
  const solarMat=lam(0x1d3557);SOFT_MATS.add(solarMat);const woodMat=lam(0x9c7a4f),gravel=lam(0x77706a),waterM=new THREE.MeshPhongMaterial({color:0x1f5f7a,shininess:120,specular:0xc8dde8});
  const vSigns=['NOODLE','KARAOKE','HOTEL','PACHI','BAR 24H','RAMEN','ARCADE','SUSHI','CAFE'].map((t,i)=>{const tx=canvasTex(128,512,(g)=>{const bg=['#1a0b2e','#0b1d2e','#2e0b16'][i%3];g.fillStyle=bg;g.fillRect(0,0,128,512);g.strokeStyle=['#ff2d95','#00e5ff','#ffd23f'][i%3];g.lineWidth=8;g.strokeRect(6,6,116,500);g.fillStyle=g.strokeStyle;g.textAlign='center';g.textBaseline='middle';const ch=t.split('');const step=Math.min(80,470/ch.length);g.font='bold '+Math.floor(step*0.9)+'px Impact, Arial Black, sans-serif';ch.forEach((c,k)=>g.fillText(c,64,256-(ch.length-1)*step/2+k*step));});tx.wrapS=tx.wrapT=THREE.ClampToEdgeWrapping;const m=lam(0xffffff,{map:tx,emissive:0xffffff,emissiveMap:tx,emissiveIntensity:0.4});glowMats.push(m);return m;});
  let vsi=0;
  // vertical blade sign sticking out from a facade (axis = direction it sticks out along)
  function blade(x,y,z,axis,dir,h){const L=3,ox=axis==='x'?dir*L/2:0,oz=axis==='z'?dir*L/2:0;const mat=vSigns[vsi++%vSigns.length];
    for(const s of[-1,1]){const p=new THREE.Mesh(new THREE.PlaneGeometry(L,h),mat);p.position.set(x+ox+(axis==='z'?s*0.16:0),y+h/2,z+oz+(axis==='x'?s*0.16:0));p.rotation.y=axis==='x'?(s>0?0:Math.PI):(s>0?Math.PI/2:-Math.PI/2);scene.add(p);}
    box(x+ox,y,z+oz,axis==='x'?L:0.3,h,axis==='z'?L:0.3,darkMetal);}
  function neonEdges(x,z,w,d,y0,h,mat){if(y0<1)NIGHT_NEON.push({x,z,w,d,c:mat.color.getHex()});for(const ox of[-1,1])for(const oz of[-1,1])box(x+ox*(w/2+0.12),y0,z+oz*(d/2+0.12),0.3,h,0.3,mat,false);
    box(x,y0+h-0.3,z-d/2-0.12,w+0.5,0.3,0.3,mat,false);box(x,y0+h-0.3,z+d/2+0.12,w+0.5,0.3,0.3,mat,false);box(x-w/2-0.12,y0+h-0.3,z,0.3,0.3,d+0.5,mat,false);box(x+w/2+0.12,y0+h-0.3,z,0.3,0.3,d+0.5,mat,false);}
  const helipads=[],chainB=[],shafts=[],stacks=[];
  function topper(b,style,mat){const{x,z,w,d,h}=b;
    if(style==='spire'){b.clear=false;box(x,h,z,1.4,16,1.4,steel);box(x,h+16,z,0.5,10,0.5,steel);box(x,h+26,z,0.8,0.8,0.8,basic(0xff3b3b),false);}
    else if(style==='crown'){b.clear=false;for(const ox of[-1,1])for(const oz of[-1,1])box(x+ox*(w/2-0.7),h,z+oz*(d/2-0.7),1.2,6,1.2,darkMetal);box(x,h+6,z-d/2+0.7,w,0.6,0.6,mat);box(x,h+6,z+d/2-0.7,w,0.6,0.6,mat);box(x-w/2+0.7,h+6,z,0.6,0.6,d,mat);box(x+w/2-0.7,h+6,z,0.6,0.6,d,mat);}
    else if(style==='helipad'){const s=Math.min(w,d)*0.8;box(x,h,z,s,0.3,s,padMat);box(x,h+0.3,z-s/2,s,0.12,0.25,mat,false);box(x,h+0.3,z+s/2,s,0.12,0.25,mat,false);b.clear=false;helipads.push({x,z,h:h+0.3});}
    else if(style==='mast'){b.clear=false;const mx=x+w*0.25,mz=z+d*0.25;box(mx,h,mz,0.8,24,0.8,steel);box(mx,h+16,mz,3,0.3,3,steel);for(const ox of[-1,1])box(mx+ox*1.2,h+19,mz,0.5,1.6,0.4,lam(0xe5e7eb));box(mx,h+24,mz,0.6,0.6,0.6,basic(0xff3b3b),false);}
  }
  function tower(x,z,w,d,h,style){
    const mat=NEON[Math.floor(rnd()*NEON.length)];
    let b;
    if(style==='overhang'&&h>30){const h1=h*0.35;building(x,z,w*0.58,d*0.58,h1,0,{plain:true});b=building(x,z,w,d,h-h1,h1);box(x,h1-0.3,z,w,0.3,d,mat,false);}
    else if(style==='setback'&&h>40){const h1=h*0.62;building(x,z,w,d,h1,0,{plain:true});neonEdges(x,z,w,d,0,h1,mat);b=building(x,z,w*0.68,d*0.68,h-h1,h1);}
    else{b=building(x,z,w,d,h,0,{plain:style==='helipad'||style==='crown'});}
    if(style!=='setback'&&rnd()<0.45)neonEdges(x,z,w,d,0,h,mat);
    topper(b,style,mat);return b;
  }
  function pickStyle(h){const r=rnd();if(h>85&&r<0.4)return'spire';if(r<0.14)return'overhang';if(r<0.3)return'setback';if(r<0.42)return'crown';if(r<0.58)return'helipad';if(r<0.72)return'mast';return'plain';}
  function openBridge(xa,xb,zc,y0,mat){const L=xb-xa,cx=(xa+xb)/2;box(cx,y0,zc,L,0.4,4.2,concrete);box(cx,y0+3.8,zc,L,0.4,4.2,concrete);box(cx,y0+0.4,zc-2,L,1,0.12,darkMetal);box(cx,y0+0.4,zc+2,L,1,0.12,darkMetal);
    for(let x=xa+3;x<xb;x+=6){box(x,y0+0.4,zc-2,0.25,3.4,0.25,darkMetal);box(x,y0+0.4,zc+2,0.25,3.4,0.25,darkMetal);}
    box(cx,y0-0.15,zc,L,0.15,0.4,mat,false);
    gapZones.push({c:new V3(cx,y0+2,zc),n:new V3(1,0,0),name:'SKYBRIDGE',pts:220,test:p=>Math.abs(p.z-zc)<1.8&&p.y>y0+0.4&&p.y<y0+3.8});}
  function glassBridgeZ(x,za,zb,y0){const L=zb-za;box(x,y0,(za+zb)/2,4,4,L,glass);box(x,y0-0.2,(za+zb)/2,4.4,0.2,L,darkMetal);box(x,y0+4,(za+zb)/2,4.4,0.2,L,darkMetal);}

  // ground with a cut for the canal
  {holedPlane(-800,800,-800,160,SUB_HOLES,asphalt,-0.02);
   const s=new THREE.Mesh(new THREE.PlaneGeometry(1600,800),lam(0x3d4046));s.rotation.x=-Math.PI/2;s.position.set(0,-0.02,190+400);scene.add(s);
   const w=new THREE.Mesh(new THREE.PlaneGeometry(1600,30),waterM);w.rotation.x=-Math.PI/2;w.position.set(0,-0.9,175);scene.add(w);
   box(0,-2,160.4,1600,2.3,0.8,concrete,false);box(0,-2,189.6,1600,2.3,0.8,concrete,false);}
  // lane markings
  for(const[c,w]of XL){if(!w)continue;if(w>=20){box(c-0.35,0,-9,0.18,0.03,318,yel,false);box(c+0.35,0,-9,0.18,0.03,318,yel,false);}else for(let z=-188;z<150;z+=9)box(c,0,z,0.2,0.03,4,mark,false);}
  for(const[c,w]of ZL){if(!w)continue;if(w>=20){box(0,0,c-0.35,326,0.03,0.18,yel,false);box(0,0,c+0.35,326,0.03,0.18,yel,false);}else for(let x=-188;x<190;x+=9)box(x,0,c,4,0.03,0.2,mark,false);}

  const zone=(i,j)=>{if(j===4)return'chain';if(i===4&&j===1)return'scaffold';if((i>=4&&j===0)||(i===5&&j===1))return'construction';if(i===2&&j===2)return'neonA';if(i===3&&j===3)return'neonB';if((i===2&&j===3)||(i===3&&j===2))return'crossMid';if(j===5)return(i===2||i===3)?'plaza':i===5?'steps':i===1?'carwash':'waterfront';if(j===0||i<=1)return'alley';return'mixed';};
  const CHAIN_H=[44,58,72,96,68,86];
  for(let i=0;i<6;i++)for(let j=0;j<6;j++){
    const x0=XL[i][0]+XL[i][1]/2,x1=XL[i+1][0]-XL[i+1][1]/2,z0=ZL[j][0]+ZL[j][1]/2,z1=j<5?ZL[j+1][0]-ZL[j+1][1]/2:144;
    const cx=(x0+x1)/2,cz=(z0+z1)/2,W=x1-x0-6,Dd=z1-z0-6,zn=zone(i,j),dc=Math.hypot(cx,cz+10);
    holedSlab(x0,x1,z0,z1,0,0.25,SUB_HOLES,zn==='construction'?gravel:sideMat);
    if(zn==='alley'){
      const nx=W>40?3:2,nz=Dd>40?3:2,cw=(W-4*(nx-1))/nx,cd=(Dd-4*(nz-1))/nz;
      const shaftAt=(nx===3&&nz===3&&rnd()<0.6)?4:-1;
      const hs=[];
      for(let a=0;a<nx;a++)for(let c=0;c<nz;c++){
        const bx=x0+3+cw/2+a*(cw+4),bz=z0+3+cd/2+c*(cd+4),h=16+rnd()*22+Math.max(0,22-dc/8);hs.push(h);
        if(a*nz+c===shaftAt){const t=0.6,sh=h+8;box(bx,0,bz-cd/2+t/2,cw,sh,t,concrete);box(bx-cw/2+t/2,0,bz,t,sh,cd,concrete);box(bx+cw/2-t/2,0,bz,t,sh,cd,concrete);
          const gw=4.5,side=(cw-gw)/2;box(bx-cw/2+side/2,0,bz+cd/2-t/2,side,sh,t,concrete);box(bx+cw/2-side/2,0,bz+cd/2-t/2,side,sh,t,concrete);box(bx,5.5,bz+cd/2-t/2,gw,sh-5.5,t,concrete);
          box(bx,sh-0.3,bz-cd/2+0.2,cw,0.3,0.3,NEON[1],false);shafts.push([bx,sh,bz]);
          gapZones.push({c:new V3(bx,sh-1,bz),n:new V3(0,1,0),name:'SHAFT CLIMB',pts:240,test:p=>Math.abs(p.x-bx)<cw/2-0.6&&Math.abs(p.z-bz)<cd/2-0.6});continue;}
        const b=building(bx,bz,cw,cd,h);if(rnd()<0.35)neonEdges(bx,bz,cw,cd,0,h,NEON[Math.floor(rnd()*6)]);
      }
      // fire escapes, dumpsters and hanging wires in the alleys
      for(let a=0;a<nx-1;a++){const ax=x0+3+(a+1)*cw+a*4+2;for(let c=0;c<nz;c++){const bz=z0+3+cd/2+c*(cd+4),dir=(a+c)%2?1:-1;fireEscape(ax-dir*2,bz+(rnd()-.5)*cd*0.4,'x',dir,30,3.5);}
        box(ax,0.25,z0+3+cd*0.5,1.5,1.3,2.6,dumpMat);alleys.push([ax,6,cz]);
        for(let k=0;k<2;k++)box(ax,7+rnd()*7,z0+3+rnd()*Dd,4.4,0.07,0.07,darkMetal);}
      for(let c=0;c<nz-1;c++){const az=z0+3+(c+1)*cd+c*4+2;for(let a=0;a<nx;a++){const bx=x0+3+cw/2+a*(cw+4),dir=(a+c)%2?-1:1;fireEscape(bx+(rnd()-.5)*cw*0.4,az-dir*2,'z',dir,30,3.5);}
        box(x0+3+cw*0.5,0.25,az,2.6,1.3,1.5,dumpMat);
        for(let k=0;k<2;k++)box(x0+3+rnd()*W,7+rnd()*7,az,0.07,0.07,4.4,darkMetal);}
    }
    else if(zn==='chain'){
      const hb=CHAIN_H[i],gap=6,w2=(W-gap)/2;
      [[x0+3+w2/2,hb],[x1-3-w2/2,hb+(i%2?-10:9)]].forEach(([bx,h])=>{const b=building(bx,cz,w2,Dd,h,0,{plain:true});b.clear=false;box(bx,h,cz-Dd/2+0.15,w2,0.8,0.3,roofMat);box(bx,h,cz+Dd/2-0.15,w2,0.8,0.3,roofMat);box(bx-w2/2+0.15,h,cz,0.3,0.8,Dd,roofMat);box(bx+w2/2-0.15,h,cz,0.3,0.8,Dd,roofMat);chainB.push(b);
        for(let a=0;a<3;a++)for(let c=0;c<3;c++){const px=bx-w2*0.3+a*w2*0.3,pz=cz-Dd*0.3+c*Dd*0.3;if(rnd()<0.6)box(px,h+0.5,pz,Math.min(4,w2*0.22),0.12,2.2,solarMat);}
        if(rnd()<0.5)neonEdges(bx,cz,w2,Dd,0,h,NEON[i%6]);});
    }
    else if(zn==='scaffold'){
      const top=skeleton(cx,cz,30,32,4,0.5);
      box(cx,0,cz-15.2,30,32,0.4,concrete);box(cx+15.2,0,cz,0.4,32,30,concrete);
      for(let y=2;y<=64;y+=4){box(cx,y,cz+16.4,30,0.15,1.4,woodMat);box(cx-16.4,y,cz,1.4,0.15,30,woodMat);}
      for(let k=-15;k<=15;k+=5){box(cx+k,0,cz+17.1,0.12,66,0.12,steel);box(cx-17.1,0,cz+k,0.12,66,0.12,steel);}
      for(let k=0;k<8;k++){const L=8+rnd()*14,x=cx+(rnd()-.5)*26,z=cz+(rnd()-.5)*26,yt=40+rnd()*80;box(x,yt-L,z,0.08,L,0.08,darkMetal);box(x,yt-L-0.6,z,0.5,0.6,0.5,yellowSteel);}
      crane(cx,cz,top+17,52);
      for(const s of[-1,1]){gapZones.push({c:new V3(cx+s*15,60,cz),n:new V3(1,0,0),name:'SCAFFOLD THREAD',pts:180,test:p=>Math.abs(p.z-cz)<15&&p.y<top});gapZones.push({c:new V3(cx,60,cz+s*15),n:new V3(0,0,1),name:'SCAFFOLD THREAD',pts:180,test:p=>Math.abs(p.x-cx)<15&&p.y<top});}
      MAPDEF.scaffold={x:cx,z:cz,top};
    }
    else if(zn==='construction'){
      const cc=[0xc2352b,0x1d4ed8,0x15803d,0xe2b41f,0xe5e7eb,0x7c3aed].map(c=>lam(c));
      if(i===5&&j===0)skeleton(cx,cz,18,6,3.6,0.6);
      if(i===5&&j===1)crane(cx,cz,72,34);
      for(let r=0;r<3;r++){const rz=z0+6+r*((z1-z0-12)/2);for(let k=0;k<3;k++){const rx=x0+8+k*((x1-x0-16)/2.2);if(i===5&&j===0&&Math.abs(rx-cx)<12&&Math.abs(rz-cz)<12)continue;if(i===5&&j===1&&Math.abs(rx-cx)<4&&Math.abs(rz-cz)<4)continue;if(i===4&&j===0&&Math.hypot(rx-100,rz+162)<15)continue;if(i===5&&j===1&&Math.hypot(rx-180,rz+85)<9)continue;const n=1+Math.floor(rnd()*3);for(let s=0;s<n;s++)box(rx,0.25+s*2.6,rz,6,2.6,2.5,cc[Math.floor(rnd()*6)]);stacks.push([rx,0.25+n*2.6+1.5,rz]);}}
      box(cx,0.25,z0+0.5,x1-x0-14,2.2,0.15,lam(0xd9d4c7));box(cx,0.25,z1-0.5,x1-x0-14,2.2,0.15,lam(0xd9d4c7));
    }
    else if(zn==='neonA'){
      building(-57,-43,8,36,35);
      building(-38,-43,24,22,92,0,{plain:true});neonEdges(-38,-43,24,22,0,92,NEON[0]);
      building(-38,-43,17,15,32,92,{plain:true});neonEdges(-38,-43,17,15,92,32,NEON[2]);
      const t=building(-38,-43,10,9,16,124,{plain:true});neonEdges(-38,-43,10,9,124,16,NEON[1]);topper(t,'crown',NEON[1]);
      
      
      MAPDEF.neonA={x:-38,z:-43};
    }
    else if(zn==='neonB'){
      building(57.5,18,7,27,28);
      building(38,18,24,22,78,0,{plain:true});neonEdges(38,18,24,22,0,78,NEON[1]);
      building(38,18,16,15,30,78,{plain:true});neonEdges(38,18,16,15,78,30,NEON[2]);
      const t=building(38,18,9,8,14,108,{plain:true});neonEdges(38,18,9,8,108,14,NEON[0]);topper(t,'spire',NEON[0]);
      
      
      MAPDEF.neonB={x:38,z:18};
    }
    else if(zn==='crossMid'){
      if(i===3){building(27,-43,24,36,70,0,{plain:true});neonEdges(27,-43,24,36,0,70,NEON[3]);building(52.5,-43,17,36,45);
        }
      else{building(-27,18.5,24,27,65,0,{plain:true});neonEdges(-27,18.5,24,27,0,65,NEON[4]);building(-52.5,18.5,17,27,50);
        }
    }
    else if(zn==='plaza'){
      holedSlab(cx-W/2,cx+W/2,cz-Dd/2,cz+Dd/2,0.25,0.02,SUB_HOLES,grassMat);
      for(let k=0;k<6;k++)tree(cx+(k%3-1)*W*0.32,cz+(k<3?-1:1)*Dd*0.3);
      if(i===2){mesh(new THREE.CylinderGeometry(4,4.4,0.8,20),concrete,cx,0.65,cz);collider(cx-4,0,cz-4,cx+4,1.05,cz+4);}
      else{const cxS=cx+15;box(cxS,0,cz,2,9,2,darkMetal);const sg=new THREE.Mesh(new THREE.PlaneGeometry(22,5),basic(0xffffff,{map:canvasTex(512,116,(g)=>{g.fillStyle='#0b1020';g.fillRect(0,0,512,116);g.fillStyle='#ff2d95';g.font='bold 76px Impact, Arial Black';g.textAlign='center';g.textBaseline='middle';g.fillText('NEON CANYONS',256,60);}),side:THREE.DoubleSide}));sg.position.set(cxS,11.5,cz);scene.add(sg);collider(cxS-11,9,cz-0.3,cxS+11,14,cz+0.3);}
    }
    else if(zn==='steps'){
      const sx0=x0+3,sx1=x1-3,wid=sx1-sx0,c2=(sx0+sx1)/2,zt=118,zb=z1-3,n=24,st=(zb-zt)/n;
      box(c2,0.25,(z0+3+zt)/2,wid,11.75,zt-(z0+3),concrete);
      for(let k=0;k<n;k++)box(c2,0.25,zb-(k+0.5)*st,wid,(k+1)*11.75/n,st,k%2?concrete:concrete2,false);
      ramp(sx0,sx1,zt,zb,'z',12,0.25,null);
      box(sx0+0.2,0.25,(zt+zb)/2,0.3,0.3,zb-zt,NEON[1],false);box(sx1-0.2,0.25,(zt+zb)/2,0.3,0.3,zb-zt,NEON[1],false);
      building(c2+wid*0.2,z0+3+5,wid*0.5,8,24,12);tree(c2-wid*0.3,z0+8,12);tree(c2-wid*0.1,z0+8,12);
      MAPDEF.terrace={x:c2-wid*0.25,z:z0+3+7,h:12};
    }
    else if(zn==='carwash'){const L=30,cx2=x0+3+L/2+2,cz2=cz,brushes=[];box(cx2,0.25,cz2-4.5,L,6,0.6,whiteMat);box(cx2,0.25,cz2+4.5,L,6,0.6,whiteMat);box(cx2,6.25,cz2,L,0.6,9.6,whiteMat);
      for(let k=0;k<3;k++){const bx2=cx2-L/2+6+k*9;for(const sgn of[-1,1]){const br=new THREE.Mesh(new THREE.CylinderGeometry(1.1,1.1,5,12),NEON[k%2?1:0]);br.position.set(bx2,0.25+2.8,cz2+sgn*2.6);scene.add(br);brushes.push(br);collider(bx2-1.1,0.25,cz2+sgn*2.6-1.1,bx2+1.1,5.5,cz2+sgn*2.6+1.1,true);}
        const ob=new THREE.Mesh(new THREE.CylinderGeometry(0.9,0.9,6,12).rotateX(Math.PI/2),NEON[4]);ob.position.set(bx2+4.5,5,cz2);scene.add(ob);brushes.push(ob);collider(bx2+3.6,4.1,cz2-3,bx2+5.4,5.9,cz2+3,true);steamVent(bx2,0.3,cz2);}
      gapZones.push({c:new V3(cx2,3,cz2),n:new V3(1,0,0),name:'CAR WASH',pts:180,test:p=>Math.abs(p.z-cz2)<4&&p.y<6});
      building(x1-3-4,cz,8,Dd*0.8,16);MAPDEF.carwash={x:cx2,z:cz2};
      MAPDEF.updaters.push(t=>brushes.forEach((b,i)=>{if(i%3===2)b.rotation.z=t*6;else b.rotation.y=t*(i%2?6:-6);}));}
    else if(zn==='waterfront'){
      const n=W>40?2:1,w=(W-6*(n-1))/n;for(let a=0;a<n;a++){const bx=x0+3+w/2+a*(w+6);const b=tower(bx,cz,w,Dd*0.8,12+rnd()*18,rnd()<0.4?'helipad':'plain');}
    }
    else{ // mixed downtown blocks
      const down=95*Math.exp(-(dc*dc)/(2*95*95));const H=()=>Math.min(118,22+rnd()*22+down*(0.4+rnd()*0.7));
      const s=rnd();
      if(s<0.3){const w=W*(0.7+rnd()*0.25),d=Dd*(0.7+rnd()*0.25),h=H();tower(cx,cz,w,d,h,pickStyle(h));}
      else if(s<0.7){const w=(W-6)/2;for(const o of[-1,1]){const h=H();tower(cx+o*(w/2+3),cz,w,Dd*(0.75+rnd()*.25),h,pickStyle(h));}}
      else{const w=(W-6)/2,d=(Dd-6)/2;for(const ox of[-1,1])for(const oz of[-1,1]){const h=H();tower(cx+ox*(w/2+3),cz+oz*(d/2+3),w,d,h,pickStyle(h));}}
    }
  }
  // skybridges around the crossroads
  openBridge(-26,15,-43,46,NEON[1]);
  openBridge(-15,26,20,58,NEON[0]);
  glassBridgeZ(-32.5,-32,5,30);

  // elevated highway along z=95 with a broken middle section
  {const deckM=lam(0x5d6067),HY=20.8;
   ramp(-192,-130,88,102,'x',0.25,HY+1.2,deckM);for(const x of[-170,-150])box(x,0,95,1.6,0.25+(HY+0.95)*(x+192)/62-0.8,8,concrete);
   for(const[a,b]of[[-130,-16],[21,200]]){const L=b-a,cx=(a+b)/2;box(cx,HY,95,L,1.2,14,deckM);box(cx,HY+1.2,88.3,L,1,0.4,concrete);box(cx,HY+1.2,101.7,L,1,0.4,concrete);
     for(let x=a+4;x<b;x+=10)box(x,HY+1.21,95,4,0.03,0.2,mark,false);
     for(let x=a+10;x<b;x+=20)box(x,HY-0.15,95,6,0.12,0.5,basic(0xfff4d0),false);}
   for(let x=-186;x<190;x+=22){if(XL.some(([c,w])=>w&&Math.abs(x-c)<w/2+3)||(x>-20&&x<25)||x<-128)continue;for(const z of[90,100])box(x,0,z,1.6,HY,1.6,concrete);}
   box(-14.5,HY-0.6,93,3,1,5,concrete);box(19.5,HY-0.4,97,3,0.8,6,concrete);for(let k=0;k<5;k++){box(-13+k*0.1,HY,90+k*2.5,0.08,0.08,1.2,darkMetal,false);}
   box(3,0,95,10,1.2,8,concrete);box(-2,1.2,93,4,0.8,3,concrete);
   
   gapZones.push({c:new V3(2.5,26,95),n:new V3(1,0,0),name:'HIGHWAY JUMP',pts:260,test:p=>Math.abs(p.z-95)<7&&p.y>18&&p.y<34});
   for(const x of[-100,100])gapZones.push({c:new V3(x,8,95),n:new V3(1,0,0),name:'UNDERPASS',pts:120,test:p=>Math.abs(p.z-95)<7&&p.y<HY});
   for(let k=0;k<16;k++){const seg=k<8?[-126,-20]:[25,195],dir=k%2?1:-1;addCar({axis:'x',line:95,dir,lane:dir*3.5,p:seg[0]+rnd()*(seg[1]-seg[0]),v:14+rnd()*8,min:seg[0],max:seg[1],y0:HY+1.2,big:rnd()<0.2});}
  }
  // promenade, railing and the two canal bridges
  box(0,0,158,1600,0.25,4,sideMat);box(0,0.25,160,1600,1,0.25,darkMetal);
  for(const bx of[-70,70]){
    for(let z=156;z<194;z+=2){const y=1+5*Math.sin(Math.PI*(z+1-156)/38);if(bx===70&&z+1>164&&z+1<186){const g=new THREE.Group();g.position.set(bx,y,z+1);const dk=new THREE.Mesh(new THREE.BoxGeometry(10,0.5,2),lam(0x7a5a4a));dk.position.y=0.25;g.add(dk);for(const o of[-4.9,4.9]){const r=new THREE.Mesh(new THREE.BoxGeometry(0.2,1,2),darkMetal);r.position.set(o,1,0);g.add(r);}scene.add(g);MAPDEF.collapseSegs.push({g,y,z:z+1,r:(rnd()-.5)*1.4});continue;}box(bx,y,z+1,10,0.5,2,lam(0x7a5a4a));box(bx-4.9,y+0.5,z+1,0.2,1,2,darkMetal);box(bx+4.9,y+0.5,z+1,0.2,1,2,darkMetal);}
    for(let z=158;z<=192;z+=4){if(bx===70&&z>163&&z<187)continue;const y=1+5*Math.sin(Math.PI*(z-156)/38),top=6+9*Math.sin(Math.PI*(z-156)/38);for(const o of[-5,5])box(bx+o,y,z,0.3,top-y+0.5,0.3,redSteel);}
    for(let z=156;z<194;z+=2){const top=6+9*Math.sin(Math.PI*(z+1-156)/38);for(const o of[-5,5])box(bx+o,top,z+1,0.4,0.4,2,redSteel);}
    box(bx,-0.4,175,10.4,0.12,30,NEON[1],false);
    gapZones.push({c:new V3(bx,2,175),n:new V3(1,0,0),name:'UNDER THE BRIDGE',pts:150,test:p=>Math.abs(p.z-175)<12&&p.y<4.5});
  }
  // south bank docks
  box(0,0,205,420,0.25,30,concrete);for(let k=0;k<6;k++){const x=-170+k*68;building(x,232,40,22,10+rnd()*14);buildings.pop();}
  for(const x of[-120,40,150]){box(x-6,0.25,198,1,16,1,yellowSteel);box(x+6,0.25,198,1,16,1,yellowSteel);box(x,16.25,198,14,1.2,1.4,yellowSteel);box(x,16.25,190,1.2,1.2,16,yellowSteel);}
  // distant skyline so the edges don't feel empty
  for(let k=0;k<70;k++){const a=rnd()*TAU,r=240+rnd()*200,x=Math.cos(a)*r,z=Math.sin(a)*r;if(z>140&&z<260)continue;building(x,z,16+rnd()*20,16+rnd()*20,20+rnd()*70);buildings.pop();}

  // traffic on the street grid
  for(const[c,w]of XL){if(!w)continue;const offs=w>=20?[4,8]:[w/4];for(let k=0;k<5;k++){const dir=k%2?1:-1;addCar({axis:'z',line:c,dir,lane:dir*offs[k%offs.length]*-1,p:-150+rnd()*300,v:7+rnd()*8,min:c===0?-150:-190,max:150,big:rnd()<0.15});}}
  for(const[c,w]of ZL){if(!w)continue;const offs=w>=20?[4,8]:[w/4];for(let k=0;k<5;k++){const dir=k%2?1:-1;addCar({axis:'x',line:c,dir,lane:dir*offs[k%offs.length],p:-150+rnd()*300,v:7+rnd()*8,min:c===-10?-150:-190,max:c===-10?150:190,big:rnd()<0.15});}}
  // steam vents and wet patches
  alleys.forEach(a=>{steamVent(a[0],0.3,a[2]+(rnd()-.5)*10);puddle(a[0],a[2]+(rnd()-.5)*14,1.2+rnd(),0.27);});
  for(let k=0;k<14;k++){const L=XL[1+Math.floor(rnd()*5)];const z=-180+rnd()*320;steamVent(L[0]+(rnd()-.5)*L[1]*0.5,0.05,z);}
  for(let k=0;k<30;k++){if(rnd()<.5){const L=XL[1+Math.floor(rnd()*5)];puddle(L[0]+(rnd()-.5)*L[1]*0.7,-180+rnd()*320,1+rnd()*2.2);}else{const L=ZL[1+Math.floor(rnd()*5)];puddle(-180+rnd()*360,L[0]+(rnd()-.5)*L[1]*0.7,1+rnd()*2.2);}}
  chainB.forEach((b,k)=>{if(k%2===0)steamVent(b.x+b.w*0.3,b.h+0.8,b.z-6);});
  if(MAPDEF.scaffold)steamVent(MAPDEF.scaffold.x-10,0.3,MAPDEF.scaffold.z+20);
  // street lamps
  const lp=[];for(const[c,w]of XL){if(!w)continue;for(let z=-180;z<150;z+=32)for(const o of[-1,1])lp.push([c+o*(w/2+0.9),z]);}
  for(const[c,w]of ZL){if(!w)continue;for(let x=-176;x<190;x+=32)for(const o of[-1,1])lp.push([x,c+o*(w/2+0.9)]);}
  for(let x=-185;x<190;x+=25)lp.push([x,157.5]);
  makeLamps(lp);

  // ===== v0.7 set pieces =====
  // --- subway network under the avenues: two stations, a train, shafts and a plaza ramp ---
  {const sF=-12,sT=-4,tw=lam(0x3a3c42),tfl=lam(0x26272a),strip=basic(0xfff1c8);
   const U=(x0,x1,z0,z1,o)=>MAPDEF.under.push(Object.assign({x0,x1,z0,z1,floor:sF,maxY:-0.5},o||{}));
   U(-5,5,-180,140);U(-175,175,-15,-5);U(-25,25,-30,10);U(-35,35,108,140);
   for(const h of SUB_HOLES)U(h[0],h[1],h[2],h[3],{hole:true});
   box(0,sF-0.3,-20,10,0.3,320,tfl,false);box(0,sF-0.3,-10,350,0.3,10,tfl,false);box(0,sF-0.3,-10,50,0.3,40,tfl,false);box(0,sF-0.3,124,70,0.3,32,tfl,false);
   const ceil=(x0,x1,z0,z1)=>holedSlab(x0,x1,z0,z1,sT,0.6,SUB_HOLES,tw);
   ceil(-5,5,-180,-30);ceil(-5,5,10,108);ceil(-175,-25,-15,-5);ceil(25,175,-15,-5);ceil(-25,25,-30,10);ceil(-35,35,108,140);
   const W=(x0,x1,z0,z1,y0=sF,y1=sT+0.6)=>box((x0+x1)/2,y0,(z0+z1)/2,Math.max(0.6,x1-x0),y1-y0,Math.max(0.6,z1-z0),tw);
   W(-5.6,-5,-180,-30);W(5,5.6,-180,-30);W(-5.6,-5,10,108);W(5,5.6,10,108);
   W(-175,-25,-15.6,-15);W(-175,-25,-5,-4.4);W(25,175,-15.6,-15);W(25,175,-5,-4.4);
   W(-25.6,-25,-30,-15);W(-25.6,-25,-5,10);W(25,25.6,-30,-15);W(25,25.6,-5,10);W(-25,-5,-30.6,-30);W(5,25,-30.6,-30);W(-25,-5,10,10.6);W(5,25,10,10.6);
   W(-35.6,-35,108,140);W(35,35.6,108,120);W(35,35.6,130,140);W(-35,-5,107.4,108);W(5,35,107.4,108);W(-35,35,140,140.6);
   W(-5,5,-180.6,-180,sF,0.3);W(-175.6,-175,-15,-5,sF,0.3);W(175,175.6,-15,-5,sF,0.3);
   // shaft walls up to street level, lips between shafts and tube ceilings, fences
   W(-5.6,-5,-180,-170,sT,0.3);W(5,5.6,-180,-170,sT,0.3);W(-5,5,-170,-169.4,sT,0.3);
   for(const sx of[1,-1]){const a=sx>0?165:-175,b=sx>0?175:-165;W(a,b,-15.6,-15,sT,0.3);W(a,b,-5,-4.4,sT,0.3);if(sx>0)W(164.4,165,-15,-5,sT,0.3);else W(-165,-164.4,-15,-5,sT,0.3);}
   for(const[x0,x1,z0,z1]of SUB_HOLES.slice(0,3)){for(const x of[x0,x1])for(let z=z0;z<=z1;z+=2.5)box(x,0,z,0.12,1.2,0.12,yellowSteel);for(const z of[z0,z1])box((x0+x1)/2,1.1,z,x1-x0,0.1,0.1,yellowSteel);}
   // plaza ramp down into station B
   ramp(18,50,120,130,'x',sF,0.25,concrete);W(35,50,119.4,120,sF,0.3);W(35,50,130,130.6,sF,0.3);W(50,50.6,120,130,sF,0.3);W(18,35,119.4,120,sT,0.3);W(18,35,130,130.6,sT,0.3);W(17.4,18,120,130,sT,0.3);
   // platforms, columns, lights
   for(const[x,z,w,d]of[[15,-23,16,12],[-15,-23,16,12],[15,3,16,12],[-15,3,16,12],[-20,124,26,30],[20,114,26,10],[20,136,26,6]])box(x,sF,z,w,1.2,d,concrete2);
   for(const x of[-15,15])for(const z of[-24,4,115,134])box(x,sF,z,0.9,sT-sF,0.9,tw);
   for(let z=-175;z<140;z+=10)box(0,sT-0.15,z,1.2,0.12,0.5,strip,false);for(let x=-170;x<175;x+=10)box(x,sT-0.15,-10,0.5,0.12,1.2,strip,false);
   for(const x of[-20,0,20])for(const z of[-25,-15,0])box(x,sT-0.15,z,3,0.12,0.6,strip,false);for(const x of[-25,-10,10,25])for(const z of[112,124,136])box(x,sT-0.15,z,3,0.12,0.6,strip,false);
   // subway train shuttling under the avenue
   const tcars=[],tm=lam(0xc0c6cf),tf=lam(0xffd23f);for(let k=0;k<3;k++){const m=new THREE.Mesh(new THREE.BoxGeometry(3.2,3.4,12),[tm,tm,lam(0x8a9099),lam(0x222222),tf,tf]);scene.add(m);tcars.push(m);}
   MAPDEF.updaters.push(t=>{const per=34,ph=(t%(2*per))/per;let s=ph<1?ph:2-ph;s=Math.min(1,Math.max(0,(s*per-4)/(per-8)));const c=-145+s*260;tcars.forEach((m,k)=>{const z=c+(k-1)*12.5;m.position.set(0,sF+0.4+1.7,z);dynBox(0,sF+2.1,z,1.6,1.7,6);});});
   for(const[x0,x1,z0,z1]of SUB_HOLES.slice(0,3)){const cx=(x0+x1)/2,cz=(z0+z1)/2;gapZones.push({c:new V3(cx,-2,cz),n:new V3(0,1,0),name:'SUBWAY DROP',pts:220,test:p=>p.x>x0&&p.x<x1&&p.z>z0&&p.z<z1});}
   gapZones.push({c:new V3(34,-4,125),n:new V3(1,0,0),name:'STATION DIVE',pts:150,test:p=>p.z>120&&p.z<130&&p.y<0});
   MAPDEF.subTokens=[[15,-9,-22],[-20,-9,124],[120,-8,-10],[-120,-8,-10],[0,-7,-120]];
  }
  // --- rotating neon spinner tower in the north-east construction lot ---
  {const cx=100,cz=-162,rings=[];box(cx,0.25,cz,3,50,3,darkMetal);
   [[6,0.25,12],[20,-0.35,12],[34,0.18,12]].forEach(([y,spd,h],ri)=>{const g=new THREE.Group();g.position.set(cx,y,cz);scene.add(g);const panels=[];
     for(let k=0;k<16;k++){if(k%5===0)continue;const a=k/16*TAU,p=new THREE.Mesh(new THREE.BoxGeometry(3.4,h,0.4),k%2?NEON[ri%6]:darkMetal);p.position.set(Math.cos(a)*9,h/2,Math.sin(a)*9);p.rotation.y=-a+Math.PI/2;g.add(p);panels.push(a);}rings.push({g,spd,h,y,panels});});
   let inside=false;
   MAPDEF.updaters.push(t=>{for(const r of rings){const rot=t*r.spd;r.g.rotation.y=rot;for(const a0 of r.panels){const a=a0-rot,x=cx+Math.cos(a)*9,z=cz+Math.sin(a)*9,c=Math.abs(Math.cos(a)),s=Math.abs(Math.sin(a));dynBox(x,r.y+r.h/2,z,s*1.7+c*0.3,r.h/2,c*1.7+s*0.3);}}
     const inn=Math.hypot(D.pos.x-cx,D.pos.z-cz)<7.5&&D.pos.y>6&&D.pos.y<46;if(inn&&!inside&&S.activity==='free'&&!D.crashed)addTrick('SPINNER',300);inside=inn;});
  }
  // --- collapsing canal bridge (x=70) ---
  {const segs=MAPDEF.collapseSegs;let warned=false;
   MAPDEF.updaters.push(t=>{const T=(t+40)%150;for(const s of segs){let y=s.y,rx=0;
     if(T<120){if(T>119)y+=Math.sin(t*60+s.z)*0.08;}else if(T<121.5){y+=Math.sin(t*60+s.z)*0.12;}else if(T<124.5){const u=(T-121.5)/3;y=s.y+(-3-s.y)*u*u;rx=u*s.r;}else if(T<140){y=-3;rx=s.r;}else{const u=(T-140)/10;y=-3+(s.y+3)*u;rx=s.r*(1-u);}
     s.g.position.y=y;s.g.rotation.x=rx;if(y>-1)dynBox(70,y+0.25,s.z,5,0.4,1);}
     const T2=(t+40)%150;if(T2>118&&T2<119&&!warned&&Math.hypot(D.pos.x-70,D.pos.z-175)<200){warned=true;toast('⚠ The canal bridge is collapsing!');}if(T2<100)warned=false;});
  }
  // --- wind turbines across the canal ---
  for(const x of[-150,0,150])turbine(x,300,0,55,24,0.35+rnd()*0.12);
  // --- water tower climb in the crane lot ---
  waterTowerClimb(180,-85,40);
  // --- rooftop pools and gardens ---
  {let n=0;for(const b of buildings){if(n>=4)break;if(b.clear&&b.w>14&&b.d>14&&b.h>20&&b.h<100&&Math.abs(b.z-66)>25){roofPool(b);n++;}}}
  // --- traffic cones, box stacks and glass bus shelters ---
  for(let k=0;k<24;k++){const L=XL[1+Math.floor(rnd()*5)];addDebris('cone',L[0]+L[1]/2-0.8,0.25,-180+rnd()*320);}
  alleys.forEach(a=>{for(let s=0;s<3;s++)addDebris('box',a[0]+(s%2)*0.9,0.25+(s>1?0.8:0),a[2]+8,{s:0.8});});
  for(const[x,z]of[[-12.5,-60],[12.5,60],[-70+6.9,-100],[70-6.9,100]]){addDebris('glass',x,0.25,z,{w:3.5,h:2.4,d:0.06,rotY:Math.PI/2});box(x,0.25+2.4,z,1.6,0.1,3.6,darkMetal,false);}
  // --- aircraft, fireworks, searchlights, mist, segments, secret vault ---
  addHeli(0,-10,90,95,14,0);addHeli(-100,40,60,55,-12,2);addBlimp(0,0,150,135,6,1.5);
  MAPDEF.fireworks={x0:-150,x1:150,z0:165,z1:260,y:70};
  {const tall=buildings.slice().sort((a,b)=>b.h-a.h).slice(2,6);tall.forEach((b,i)=>searchlight(b.x,b.h,b.z,i*1.7));}
  alleys.forEach(a=>mistSpots.push([a[0],a[2]]));mistSpots.push([-100,95],[60,95],[0,175]);
  segment('Narrow Street',[-130,5,-150],[-130,5,-20]);segment('Tower Dive',[0,130,-10],[0,8,-10],5);segment('Canal Dash',[-180,2.5,175],[180,2.5,175]);segment('Subway Sprint',[0,-8,100],[0,-8,-160],3);
  vaultRoom(-38,140,-43,6,5.5,4.5);
  // ---- map definition ----
  const SP={p:[0,0.25,157],h:0};
  MAPDEF.spawn=SP;
  const chain=chainB.slice().sort((a,b)=>a.x-b.x);
  const sc=MAPDEF.scaffold;
  for(let k=0;k+1<chain.length;k++){const a=chain[k],b=chain[k+1],g0=a.x+a.w/2,g1=b.x-b.w/2;if(g1<=g0)continue;const lo=Math.min(a.h,b.h),hi=Math.max(a.h,b.h);
    gapZones.push({c:new V3((g0+g1)/2,hi,66),n:new V3(1,0,0),name:'ROOF GAP',pts:140,test:p=>Math.abs(p.z-66)<17&&p.y>lo-3&&p.y<hi+10});}
  MAPDEF.tracks={
    nc_cross:{name:'Crossroads Sprint',spawn:SP,pts:[[0,8,120],[0,10,20],[0,14,-10,1.2],[0,10,-45],[0,12,-70],[70,10,-70],[70,10,-35],[70,8,40],[35,8,40],[-35,8,40],[-70,8,40],[-70,10,70],[-70,8,120],[-70,8,150],[-35,8,150],[0,8,150]]},
    nc_canyon:{name:'Canyon Run',spawn:SP,pts:[[-130,5,150],[-130,5,40],[-130,5,-60],[-130,5,-130],[-70,5,-130],[0,5,-130],[0,5,-70],[-70,5,-70],[-70,5,-40],[-70,5,40],[-70,5,95],[-20,5,95],[40,5,95],[130,5,95],[130,5,40],[70,5,40],[70,5,150],[0,5,150],[-70,5,150]]},
    nc_sky:{name:'Sky Chain',spawn:SP,pts:[...chain.map(b=>[b.x,b.h+9,66]),[130,100,66],[130,85,-70],[sc.x-7,90,sc.z+24],[sc.x-7,90,sc.z+8,.45],[sc.x-7,90,sc.z-8,.45],[sc.x-7,92,sc.z-26],[38,130,32],[-38,118,-24],[-120,70,20]]}
  };
  const spots=buildings.filter(b=>b.clear&&b.h<120).map(b=>({x:b.x,z:b.z,h:b.h}));
  helipads.forEach(h=>spots.push(h));spots.push({x:0,z:157,h:0.25},{x:-38,z:123,h:0.27});if(MAPDEF.terrace)spots.push(MAPDEF.terrace);
  MAPDEF.spots=spots;
  const tk=[[2.5,25,95],[-70,1.6,175],[70,1.6,175],[-5.5,48,-43],[5.5,60,20],[sc.x-7,sc.top+3,sc.z-7],[sc.x+8,50,sc.z+8],[-38,149,-43],[0,15,-30],[0,45,-10],[-100,4,95],[180,1.5,157.5],[0,0.6,175],[-51.5,20,-43],[-32.5,26,-14]];
  (MAPDEF.subTokens||[]).forEach(t=>tk.splice(3,0,t));tk.push([MAPDEF.carwash.x,3,MAPDEF.carwash.z],[104.5,40,-162],[180,49,-85]);
  shafts.forEach(s=>tk.push([s[0],s[1]*0.5,s[2]]));
  alleys.slice(0,4).forEach(a=>tk.push(a));
  helipads.slice(0,3).forEach(h=>tk.push([h.x,h.h+1.5,h.z]));
  stacks.slice(0,2).forEach(s=>tk.push(s));
  for(let k=0;k+1<chain.length&&tk.length<30;k+=2){const a=chain[k],b=chain[k+1];tk.push([(a.x+a.w/2+b.x-b.w/2)/2,Math.min(a.h,b.h)-6,66]);}
  MAPDEF.tokens=tk.slice(0,30);
}
