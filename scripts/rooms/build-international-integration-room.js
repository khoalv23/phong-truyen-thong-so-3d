import * as THREE from "three";
import { INTERNATIONAL_FOLDER_REPRESENTATIVES, INTERNATIONAL_MEDIA } from "../data/international-integration-media.js";
import { INTERNATIONAL_SELECTED_MEDIA } from "../data/international-selected-media.js";
import { buildInternationalMapBoard } from "./build-international-map-board.js";
import { EXHIBIT_LIFT_Y } from "../config/scene-config.js";

import { createInternationalTopicSign } from '../core/international-topic-sign.js';

const COLORS={navy:0x234d6f,blue:0x4b8ba5,gold:0xd6a84b,red:0x8f2f34,white:0xffffff,ink:0x172032};
const SUPPORTED_IMAGE=new Set([".jpg",".jpeg",".png",".webp",".avif"]);

function sourceUrl(value){return encodeURI(value)}
function wallMount(parent,name,from,to){
  const dx=to[0]-from[0],dz=to[1]-from[1],length=Math.hypot(dx,dz);
  let nx=-dz/length,nz=dx/length;
  const mx=(from[0]+to[0])/2,mz=(from[1]+to[1])/2;
  if(nx*-mx+nz*-mz<0){nx*=-1;nz*=-1}
  const group=new THREE.Group();
  group.name=name;
  group.position.set(mx+nx*.19,0,mz+nz*.19);
  group.rotation.y=Math.atan2(nx,nz);
  group.userData.wallLength=length;
  parent.add(group);
  return group;
}
function panelMaterial(color,metalness=.04,roughness=.56){
  return new THREE.MeshStandardMaterial({color,metalness,roughness});
}
function addBoard(parent,{position=[0,0,.03],size,depth=.12,color=COLORS.white,gold=true}){
  const group=new THREE.Group();group.position.set(...position);parent.add(group);
  const outer=new THREE.Mesh(new THREE.BoxGeometry(size[0]+.30,size[1]+.30,depth),panelMaterial(COLORS.navy,.12,.48));
  outer.position.z=depth/2;
  const trim=new THREE.Mesh(new THREE.BoxGeometry(size[0]+.12,size[1]+.12,.035),panelMaterial(COLORS.gold,.42,.34));
  trim.position.z=depth+.025;
  const faceMaterial=color===COLORS.white?new THREE.MeshBasicMaterial({color:0xffffff}):panelMaterial(color,.02,.7);
  const face=new THREE.Mesh(new THREE.BoxGeometry(size[0],size[1],.025),faceMaterial);
  face.position.z=depth+.055;
  group.add(outer,trim,face);
  return {group,outer,trim,face,z:depth+.075};
}
function addZoneFrame(parent,{x=0,y=10,width,height}){
  const group=new THREE.Group();group.position.set(x,y,.012);parent.add(group);
  const outer=new THREE.Mesh(new THREE.BoxGeometry(width,height,.030),panelMaterial(COLORS.navy,.12,.50));
  outer.position.z=.015;
  const gold=new THREE.Mesh(new THREE.BoxGeometry(width-.28,height-.28,.014),panelMaterial(COLORS.gold,.38,.36));
  gold.position.z=.037;
  const face=new THREE.Mesh(new THREE.BoxGeometry(width-.52,height-.52,.008),new THREE.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.96}));
  face.position.z=.048;
  group.add(outer,gold,face);return group;
}
function artifactPages(items){
  return uniqueEvents(items).map(item=>({id:item.id,
    title:item.title,kicker:[item.year,item.person].filter(Boolean).join(" · "),
    description:item.caption,image:sourceUrl(item.displayPath),layout:"image-top"
  }));
}
function eventKey(item){
  return String(item.eventId||item.activityId||item.title||item.caption||item.id).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s*\(\d+\)\s*$/,"").trim();
}
function uniqueEvents(items){
  const seen=new Set();
  return items.filter(item=>{
    if(item.mediaType!=="image"||item.isDuplicate||!SUPPORTED_IMAGE.has(item.extension))return false;
    const key=eventKey(item);if(seen.has(key))return false;seen.add(key);return true;
  });
}
function registerImageArtifact(mesh,item,registerArtifact,registerInteractive,pages){
  const id=registerArtifact({
    title:item.title,description:item.caption,group:"HNUE – Hành trình hội nhập quốc tế",
    image:sourceUrl(item.displayPath),pages:pages?.length?pages:undefined,initialPage:Math.max(0,pages?.findIndex(page=>page.id===item.id)??0),idleMs:50000
  });
  mesh.userData={kind:"artifact",id};registerInteractive(mesh);
}
function createLazyPhoto({parent,item,position,size,renderer,registerArtifact,registerInteractive,loaders,pages}){
  const {group,outer,trim,face,z}=addBoard(parent,{position,size});
  const placeholder=new THREE.MeshBasicMaterial({color:0xffffff,side:THREE.DoubleSide});
  const photo=new THREE.Mesh(new THREE.PlaneGeometry(1,1),placeholder);
  photo.position.z=z+.02;photo.scale.set(size[0]-.34,size[1]-.34,1);group.add(photo);
  registerImageArtifact(photo,item,registerArtifact,registerInteractive,pages);
  const previewPath=item.thumbnailPath||item.displayPath;
  let previewTexture=null,fullTexture=null,activeMaterial=placeholder;
  const applyTexture=(texture)=>{
    const aspect=texture.image?.width&&texture.image?.height?texture.image.width/texture.image.height:size[0]/size[1];
    const maxW=size[0]-.34,maxH=size[1]-.34,drawW=Math.min(maxW,maxH*aspect),drawH=drawW/aspect;
    photo.scale.set(drawW,drawH,1);
    outer.scale.set((drawW+.64)/(size[0]+.30),(drawH+.64)/(size[1]+.30),1);
    trim.scale.set((drawW+.46)/(size[0]+.12),(drawH+.46)/(size[1]+.12),1);
    face.scale.set((drawW+.34)/size[0],(drawH+.34)/size[1],1);
    if(activeMaterial!==placeholder)activeMaterial.dispose();
    activeMaterial=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
    photo.material=activeMaterial;
  };
  const configureTexture=(texture)=>{
    texture.colorSpace=THREE.SRGBColorSpace;
    texture.minFilter=THREE.LinearMipmapLinearFilter;
    texture.magFilter=THREE.LinearFilter;
    texture.anisotropy=Math.min(8,renderer?.capabilities?.getMaxAnisotropy?.()||1);
    return texture;
  };
  const loader={
    preload(){
      if(previewTexture)return;
      previewTexture=configureTexture(new THREE.TextureLoader().load(sourceUrl(previewPath),()=>applyTexture(previewTexture)));
    },
    load(){
      this.preload();
      if(previewPath===item.displayPath||fullTexture)return;
      fullTexture=configureTexture(new THREE.TextureLoader().load(sourceUrl(item.displayPath),()=>applyTexture(fullTexture)));
    },
    unload(){
      if(!fullTexture)return;
      fullTexture.dispose();fullTexture=null;
      if(previewTexture)applyTexture(previewTexture);
    },
    dispose(){
      if(activeMaterial!==placeholder)activeMaterial.dispose();
      previewTexture?.dispose();fullTexture?.dispose();
      previewTexture=null;fullTexture=null;activeMaterial=placeholder;photo.material=placeholder;
      outer.scale.set(1,1,1);trim.scale.set(1,1,1);face.scale.set(1,1,1);
      photo.scale.set(size[0]-.34,size[1]-.34,1);
    }
  };
  loaders.push(loader);
  loader.preload();
}
function titlePanel(addTextPanel,parent,text,y){
  return createInternationalTopicSign({addTextPanel,parent,text:text.replace(/\n/g,' '),position:[0,y,.06]});
}
function legacyTitlePanel(addTextPanel,parent,text,y,width,size=116,height=1.32){
  const panel=addTextPanel(text,[0,y,.19],[width,height],0,{size,minFontSize:size,color:"#FFFFFF",background:"#234D6F",border:true,accent:"#D6A84B",borderWidth:12,weight:900,wrap:false,width:3000,height:height > 1.5 ? 560 : 360,lineHeight:130,unlit:true},parent);
  const redAccent=new THREE.Mesh(new THREE.BoxGeometry(Math.min(width*.16,3.8),.085,.018),panelMaterial(COLORS.red,.10,.48));
  redAccent.position.set(-width*.5+Math.min(width*.16,3.8)/2+.30,y-height*.41,.205);
  const goldAccent=new THREE.Mesh(new THREE.BoxGeometry(Math.max(width*.72,7),.085,.018),panelMaterial(COLORS.gold,.38,.34));
  goldAccent.position.set(width*.08,y-height*.41,.205);
  parent.add(redAccent,goldAccent);
  return panel;
}
function sectionLabel(addTextPanel,parent,text,x,y,width,textureWidth=1600,fontSize=58,minFontSize=46){
  const panel=addTextPanel(text,[x,y,.21],[width,1.05],0,{size:fontSize,minFontSize,color:"#FFFFFF",background:"#234D6F",border:true,accent:"#D6A84B",borderWidth:10,weight:900,wrap:false,width:textureWidth,height:320,lineHeight:Math.round(fontSize*1.21),unlit:true},parent);
  const redAccent=new THREE.Mesh(new THREE.BoxGeometry(Math.min(width*.16,2.8),.075,.016),panelMaterial(COLORS.red,.10,.48));
  redAccent.position.set(x-width*.5+Math.min(width*.16,2.8)/2+.20,y-.41,.225);
  const goldAccent=new THREE.Mesh(new THREE.BoxGeometry(Math.max(width*.68,3.2),.075,.016),panelMaterial(COLORS.gold,.38,.34));
  goldAccent.position.set(x+width*.08,y-.41,.225);
  parent.add(redAccent,goldAccent);
  return panel;
}
function conceptLine(addTextPanel,parent,text,y=15.55,width=29){
  return addTextPanel(text,[0,y,.21],[width,.72],0,{size:39,minFontSize:31,color:"#234D6F",background:"#FFFFFF",border:false,weight:800,wrap:false,width:2800,height:220,lineHeight:48,unlit:true},parent);
}
function addGrid(ctx,wall,items,{x0,x1,y0,y1,cols,rows,alignLastRow=false}){
  if(!items.length)return;
  const gapX=.52,gapY=.48;
  const cellW=(x1-x0-gapX*(cols-1))/cols,cellH=(y1-y0-gapY*(rows-1))/rows;
  const pages=artifactPages(items);
  items.slice(0,cols*rows).forEach((item,index)=>{
    const col=index%cols,row=Math.floor(index/cols);
    const rowCount=Math.min(cols,items.length-row*cols);
    const rowOffset=alignLastRow&&row===Math.ceil(items.length/cols)-1?(cols-rowCount)*(cellW+gapX)/2:0;
    const x=x0+cellW/2+rowOffset+col*(cellW+gapX),y=y1-cellH/2-row*(cellH+gapY);
    createLazyPhoto({parent:wall,item,position:[x,y,.08],size:[cellW,cellH],renderer:ctx.renderer,registerArtifact:ctx.registerArtifact,registerInteractive:ctx.registerInteractive,loaders:ctx.loaders,pages});
  });
}
function slideshowButton(ctx,wall,items,x,y,width=8,title="Hành trình hội nhập quốc tế"){
  const pages=artifactPages(items);if(!pages.length)return;
  const button=ctx.addTextPanel("XEM SLIDESHOW · "+pages.length+" HÌNH",[x,y,.23],[width,1.05],0,{size:52,minFontSize:40,color:"#FFFFFF",background:"#4B8BA5",border:true,accent:"#D6A84B",borderWidth:10,weight:900,wrap:false,width:1800,height:320,lineHeight:64,unlit:true},wall);
  const id=ctx.registerArtifact({title,description:"Chạm nút điều hướng để theo dõi trọn vẹn câu chuyện bằng hình ảnh.",group:"HNUE – Hành trình hội nhập quốc tế",image:pages[0].image,pages,idleMs:50000});
  button.userData={kind:"artifact",id};ctx.registerInteractive(button);
}
function byTopic(topic,mode="fixed"){return INTERNATIONAL_MEDIA.filter(item=>item.topic===topic&&item.displayMode===mode)}
function topicImages(topics){
  return uniqueEvents(INTERNATIONAL_MEDIA.filter(item=>topics.includes(item.topic)));
}
function pick(topic,count){return uniqueEvents(byTopic(topic)).slice(0,count)}
function selected(zone){return INTERNATIONAL_SELECTED_MEDIA.filter(item=>item.zone===zone)}

function buildVideoScreen(ctx,wall){
  const videos=INTERNATIONAL_MEDIA
    .filter(media=>media.topic===10&&media.mediaType==="video"&&!media.isDuplicate)
    .sort((a,b)=>(a.extension===".mp4"?0:1)-(b.extension===".mp4"?0:1)||a.sourcePath.localeCompare(b.sourcePath,"vi"));
  if(!videos.length)return null;
  const {group,face,z}=addBoard(wall,{position:[6.2,3.9,.08],size:[8.8,4.4],depth:.16,color:0x101820});
  const label=ctx.addTextPanel("VIDEO PLAYLIST · "+videos.length+" CLIP\nNHẤN ĐỂ PHÁT / TẠM DỪNG",[0,.25,z+.03],[8.1,3.15],0,{size:42,minFontSize:30,color:"#FFFFFF",background:"#101820",border:false,weight:900,wrap:true,width:1500,height:620,unlit:true},group);
  let index=0,video=null,texture=null,screen=null;
  const release=()=>{
    if(video){video.pause();video.removeAttribute("src");video.load();video=null}
    if(texture){texture.dispose();texture=null}
    if(screen){screen.material.dispose();screen.material=new THREE.MeshBasicMaterial({color:0x101820});screen.visible=false}
    label.visible=true;ctx.setVideoActive(false);ctx.requestRender();
  };
  const toggle=()=>{
    if(!video){
      const item=videos[index];
      video=document.createElement("video");video.src=sourceUrl(item.displayPath);video.preload="metadata";video.playsInline=true;video.muted=true;video.loop=true;
      texture=new THREE.VideoTexture(video);texture.colorSpace=THREE.SRGBColorSpace;texture.minFilter=THREE.LinearFilter;
      const videoMaterial=new THREE.MeshBasicMaterial({map:texture,side:THREE.DoubleSide});
      if(!screen){screen=new THREE.Mesh(new THREE.PlaneGeometry(8.1,3.55),videoMaterial);screen.position.set(0,.22,z+.04);screen.userData={kind:"sceneAction",action:toggle};group.add(screen);ctx.registerInteractive(screen)}
      else{screen.material.dispose();screen.material=videoMaterial;screen.visible=true}
      label.visible=false;
    }
    if(video.paused)video.play().then(()=>ctx.setVideoActive(true)).catch(()=>ctx.setVideoActive(false));
    else{video.pause();ctx.setVideoActive(false)}
    ctx.requestRender();
  };
  const next=()=>{release();index=(index+1)%videos.length;toggle()};
  const previous=()=>{release();index=(index-1+videos.length)%videos.length;toggle()};
  const mute=()=>{if(video)video.muted=!video.muted;ctx.requestRender()};
  face.userData={kind:"sceneAction",action:toggle};label.userData={kind:"sceneAction",action:toggle};ctx.registerInteractive(face);ctx.registerInteractive(label);
  [["◀",previous,-3.2],["ÂM THANH",mute,0],["▶",next,3.2]].forEach(([text,action,x])=>{
    const control=ctx.addTextPanel(text,[x,-1.72,z+.08],[text==="ÂM THANH"?2.7:1.3,.48],0,{size:30,minFontSize:24,color:"#FFFFFF",background:"#234D6F",border:true,accent:"#D6A84B",borderWidth:8,weight:900,wrap:false,width:700,height:180,unlit:true},group);
    control.userData={kind:"sceneAction",action};ctx.registerInteractive(control);
  });
  const world=new THREE.Vector3();
  return {sync(cameraLocal){group.getWorldPosition(world);if(world.distanceTo(cameraLocal)>26&&video)release()},dispose:release};
}
function addWallLights(parent,length,count){
  for(let index=0;index<count;index++){
    const x=(index-(count-1)/2)*(length/Math.max(count,1));
    const light=new THREE.SpotLight(0xffe8bd,2.2,20,Math.PI/6,.48,1.35);
    light.position.set(x,18.4,3.0);light.target.position.set(x,9.5,0);light.castShadow=false;
    parent.add(light,light.target);
  }
}
function zoneLoaderController(walls){
  const cameraPoint=new THREE.Vector3(),wallPoint=new THREE.Vector3();
  return {
    sync(localCamera){
      cameraPoint.copy(localCamera);
      walls.forEach(({wall,loaders})=>{
        wall.getWorldPosition(wallPoint);const distance=wallPoint.distanceTo(cameraPoint);
        if(distance<42)loaders.forEach(loader=>loader.load());
        else if(distance>54)loaders.forEach(loader=>loader.unload());
      });
    },
    dispose(){walls.forEach(({loaders})=>loaders.forEach(loader=>loader.dispose?.()||loader.unload()))}
  };
}

export function buildInternationalIntegrationRoom({
  parent,roomDefs,renderer,addTextPanel,registerArtifact,registerInteractive,
  registerMediaController,requestRender,setVideoActive
}){
  const root=new THREE.Group();root.name="international-integration-exhibits";root.position.y=EXHIBIT_LIFT_Y;parent.add(root);
  const n=roomDefs.goc3,s=roomDefs.goc4;
  const wallDefs=[
    ["north-side","international-north-side",n.corners.A.door,n.corners.A.back,3],
    ["north-rear","international-north-rear",n.corners.A.back,n.corners.B.back,3],
    ["east-center","international-east-center",n.corners.B.back,s.corners.A.back,5],
    ["south-rear","international-south-rear",s.corners.A.back,s.corners.B.back,3],
    ["south-side","international-south-side",s.corners.B.back,s.corners.B.door,4]
  ];
  const mounted={};const loadZones=[];
  wallDefs.forEach(([zone,name,from,to,lights])=>{
    const wall=wallMount(root,name,from,to),loaders=[];
    mounted[zone]=wall;loadZones.push({wall,loaders});addWallLights(wall,wall.userData.wallLength,lights);
    wall.userData.loaders=loaders;
  });
  // Framed exhibition zones give every content cluster the same architectural
  // hierarchy used in the other rooms while leaving the circulation clear.
  addZoneFrame(mounted["north-side"],{x:0,y:10.05,width:34.8,height:12.35});
  addZoneFrame(mounted["north-rear"],{x:0,y:10.00,width:34.8,height:13.15});
  addZoneFrame(mounted["south-rear"],{x:0,y:10.00,width:34.8,height:12.75});
  addZoneFrame(mounted["south-side"],{x:0,y:10.05,width:34.8,height:12.35});
  const contextFor=zone=>({renderer,addTextPanel,registerArtifact,registerInteractive,requestRender,setVideoActive,loaders:mounted[zone].userData.loaders});
  const northSide=mounted["north-side"],northSideCtx=contextFor("north-side");
  const studyAndExchange=selected("study");
  titlePanel(addTextPanel,northSide,"HỌC TẬP VÀ TRAO ĐỔI QUỐC TẾ",17.5,34);
  conceptLine(addTextPanel,northSide,"HỌC BỔNG · TRAO ĐỔI SINH VIÊN · CHƯƠNG TRÌNH HỌC TẬP QUỐC TẾ");
  addGrid(northSideCtx,northSide,studyAndExchange,{x0:-15.9,x1:15.9,y0:4.45,y1:14.45,cols:5,rows:3,alignLastRow:true});

  const northRear=mounted["north-rear"],northRearCtx=contextFor("north-rear");
  const studentExperiences=selected("experience");
  titlePanel(addTextPanel,northRear,"TRẢI NGHIỆM QUỐC TẾ CỦA SINH VIÊN HNUE",17.65,31);
  conceptLine(addTextPanel,northRear,"HỌC TẬP · HOẠT ĐỘNG TẬP THỂ · THÍCH NGHI VỚI MÔI TRƯỜNG MỚI",15.65);
  addGrid(northRearCtx,northRear,studentExperiences,{x0:-15.9,x1:15.9,y0:4.15,y1:14.55,cols:5,rows:3,alignLastRow:true});

  const east=mounted["east-center"];
  const mapBoard=buildInternationalMapBoard({parent:east,addTextPanel,registerInteractive,renderer,requestRender});

  const southRear=mounted["south-rear"],southRearCtx=contextFor("south-rear");
  const languageAndCulture=selected("culture");
  titlePanel(addTextPanel,southRear,"GIAO LƯU NGÔN NGỮ VÀ VĂN HÓA",17.5,31);
  conceptLine(addTextPanel,southRear,"NGÔN NGỮ · VĂN HÓA · GẶP GỠ · ĐỐI THOẠI");
  addGrid(southRearCtx,southRear,languageAndCulture,{x0:-15.9,x1:15.9,y0:4.25,y1:14.45,cols:5,rows:3,alignLastRow:true});

  const southSide=mounted["south-side"],southSideCtx=contextFor("south-side");
  const internationalCooperation=selected("cooperation");
  titlePanel(addTextPanel,southSide,"KẾT NỐI VÀ HỢP TÁC QUỐC TẾ",17.5,34);
  conceptLine(addTextPanel,southSide,"HỢP TÁC HỌC THUẬT · GIAO LƯU CHUYÊN MÔN · KẾT NỐI ĐỐI TÁC");
  addGrid(southSideCtx,southSide,internationalCooperation,{x0:-15.9,x1:15.9,y0:4.45,y1:14.4,cols:5,rows:3,alignLastRow:true});

  const lazyController=zoneLoaderController(loadZones);
  registerMediaController?.(lazyController,root);
  if(mapBoard?.controller)registerMediaController?.(mapBoard.controller,root);
  return {root,lazyController,mapBoardController:mapBoard?.controller};
}
