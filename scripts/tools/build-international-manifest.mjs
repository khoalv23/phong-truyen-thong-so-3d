import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = path.resolve("image_v2/Hội nhập quốc tế");
const output = path.resolve("scripts/data/international-integration-media.js");
const topics = {
  1:{title:"Học bổng Semester@NIE 2025",caption:"05 sinh viên · Hơn 400 triệu đồng",year:"2025",country:"Singapore",person:"",wallZone:"north-rear",fixed:2},
  2:{title:"Ngoại ngữ và AI song hành",caption:"Làm chủ ngoại ngữ – Bản lĩnh hội nhập",year:"2025",country:"Việt Nam",person:"",wallZone:"south-side",fixed:3},
  3:{title:"Học kỳ quốc tế tại Singapore",caption:"Hành trình học kỳ quốc tế tại Singapore",year:"2026",country:"Singapore",person:"",wallZone:"north-side",fixed:3},
  4:{title:"Ochanomizu Summer Program for Global Leaders",caption:"Học thuật · Ngoại ngữ · Đa văn hóa · Kỹ năng toàn cầu",year:"2026",country:"Nhật Bản",person:"",wallZone:"north-rear",fixed:1},
  5:{title:"Học bổng Semester@NIE 2026–2027",caption:"Cơ hội học tập trong môi trường giáo dục Singapore",year:"2026–2027",country:"Singapore",person:"",wallZone:"north-rear",fixed:1},
  6:{title:"Học bổng UNISTRA",caption:"Trao đổi miễn học phí tại Université de Strasbourg",year:"2026–2027",country:"Pháp",person:"Nguyễn Phương Thảo · Thái Minh Ngọc",wallZone:"north-rear",fixed:2},
  7:{title:"GNU-GIMS Fellowship",caption:"Cao Hoàng Tuấn · Lê Minh Thư · Gần 200 triệu đồng",year:"2025–2026",country:"Hàn Quốc",person:"Cao Hoàng Tuấn · Lê Minh Thư",wallZone:"north-rear",fixed:1},
  8:{title:"Giao lưu với sinh viên Đài Loan",caption:"Gặp gỡ · Workshop · Ẩm thực Việt Nam · Chia sẻ",year:"",country:"Đài Loan",person:"",wallZone:"south-rear",fixed:12},
  9:{title:"Trao đổi một năm tại Giang Tây",caption:"Học tập · Ngôn ngữ · Văn hóa · Thích nghi",year:"2025",country:"Trung Quốc",person:"",wallZone:"north-side",fixed:6},
  10:{title:"Ngày Tiếng Trung Quốc tế",caption:"Ngôn ngữ mở cửa thế giới",year:"",country:"Trung Quốc",person:"",wallZone:"south-side",fixed:15},
  11:{title:"Hồ Hoàng Minh – Hành trình tại Strasbourg",caption:"Trúng tuyển · Chuẩn bị · Học tập · Trải nghiệm",year:"2025–2026",country:"Pháp",person:"Hồ Hoàng Minh",wallZone:"north-side",fixed:5},
  12:{title:"Giao lưu với Marguerite Abouet",caption:"Đối thoại văn học và văn hóa Pháp ngữ",year:"",country:"Pháp",person:"Marguerite Abouet",wallZone:"south-rear",fixed:8},
  13:{title:"Tri thức không biên giới",caption:"Ngoại ngữ · Văn hóa · Công nghệ số",year:"",country:"Quốc tế",person:"TS. Trịnh Thùy Dương",wallZone:"east-center",fixed:7},
  14:{title:"Sẵn sàng tham gia chương trình trao đổi",caption:"Tìm hiểu → Đăng ký → Xét tuyển → Chuẩn bị → Học tập",year:"2026",country:"Philippines · Quốc tế",person:"",wallZone:"east-center",fixed:9}
};
function walk(dir,out=[]){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);entry.isDirectory()?walk(full,out):out.push(full)}return out}
const mediaExt=new Set([".jpg",".jpeg",".png",".webp",".avif",".heif",".heic",".mp4",".mov"]);
const allFiles=walk(root).filter(file=>mediaExt.has(path.extname(file).toLowerCase())).sort((a,b)=>a.localeCompare(b,"vi"));
const files=allFiles.filter(file=>{
  const rel=path.relative(root,file).split(path.sep);
  const topic=Number(rel[0]);
  return topics[topic];
});
const hashes=new Map();
const rows=files.map((file,index)=>{
  const rel=path.relative(root,file).split(path.sep);
  const topic=Number(rel[0]);
  const meta=topics[topic];
  const ext=path.extname(file).toLowerCase();
  const mediaType=[".mp4",".mov"].includes(ext)?"video":"image";
  const hash=crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
  const isDuplicate=hashes.has(hash);
  if(!isDuplicate)hashes.set(hash,file);
  const id="intl-"+String(index+1).padStart(3,"0");
  const sourcePath="./image_v2/Hội nhập quốc tế/"+rel.join("/");
  const derivedBase="./image_v2/.generated/international-integration/"+id;
  const thumbnailCandidate=derivedBase+"-thumb.webp";
  const displayCandidate=derivedBase+(mediaType==="video"?".mp4":"-display.webp");
  const exists=webPath=>fs.existsSync(path.resolve(webPath.replace(/^\.\//,"")));
  return {id,folder:rel.slice(0,-1).join("/"),topic,title:meta.title,mediaType,sourcePath,thumbnailPath:exists(thumbnailCandidate)?thumbnailCandidate:null,displayPath:exists(displayCandidate)?displayCandidate:sourcePath,isDuplicate,displayMode:isDuplicate?"duplicate":mediaType==="video"?"playlist":"gallery",wallZone:meta.wallZone,caption:meta.caption,year:meta.year,country:meta.country,person:meta.person,extension:ext};
});
for(const [topicText,meta] of Object.entries(topics)){
  const candidates=rows.filter(item=>item.topic===Number(topicText)&&item.mediaType==="image"&&!item.isDuplicate&&![ ".heif",".heic"].includes(item.extension));
  candidates.slice(0,meta.fixed).forEach(item=>item.displayMode="fixed");
}
const stats={total:rows.length,unique:rows.filter(x=>!x.isDuplicate).length,duplicates:rows.filter(x=>x.isDuplicate).length,images:rows.filter(x=>x.mediaType==="image").length,videos:rows.filter(x=>x.mediaType==="video").length};
const browserImageExt=new Set([".jpg",".jpeg",".png",".webp",".avif"]);
const representativeDir=path.resolve("image_v2/derived/international-folders");
fs.mkdirSync(representativeDir,{recursive:true});
const filesByFolder=new Map();
for(const file of allFiles){
  const extension=path.extname(file).toLowerCase();
  if(!browserImageExt.has(extension))continue;
  const folder=path.dirname(file);
  if(!filesByFolder.has(folder))filesByFolder.set(folder,[]);
  filesByFolder.get(folder).push(file);
}
const folderRepresentatives=[...filesByFolder.entries()].sort((a,b)=>a[0].localeCompare(b[0],"vi")).map(([folder,folderFiles],index)=>{
  const source=folderFiles[0];
  const extension=path.extname(source).toLowerCase();
  const fileName="folder-"+String(index+1).padStart(3,"0")+extension;
  fs.copyFileSync(source,path.join(representativeDir,fileName));
  const relativeFolder=path.relative(root,folder).split(path.sep).join("/");
  const leaf=path.basename(folder).replace(/_/g," ");
  return {
    id:"intl-folder-"+String(index+1).padStart(3,"0"),folder:relativeFolder,title:leaf,
    mediaType:"image",sourcePath:"./image_v2/Hội nhập quốc tế/"+path.relative(root,source).split(path.sep).join("/"),
    thumbnailPath:null,displayPath:"./image_v2/derived/international-folders/"+fileName,
    isDuplicate:false,displayMode:"folder-representative",wallZone:"south-side",
    caption:"Ảnh đại diện cho nhóm tư liệu "+leaf,year:"",country:"",person:"",extension
  };
});
const banner="/* Generated by scripts/tools/build-international-manifest.mjs. Do not edit by hand. */\n";
const body=banner+"export const INTERNATIONAL_TOPICS = "+JSON.stringify(topics,null,2)+";\n\nexport const INTERNATIONAL_MEDIA_STATS = "+JSON.stringify({...stats,representedFolders:folderRepresentatives.length},null,2)+";\n\nexport const INTERNATIONAL_FOLDER_REPRESENTATIVES = "+JSON.stringify(folderRepresentatives,null,2)+";\n\nexport const INTERNATIONAL_MEDIA = "+JSON.stringify(rows,null,2)+";\n";
fs.mkdirSync(path.dirname(output),{recursive:true});
fs.writeFileSync(output,body,"utf8");
console.log(JSON.stringify(stats));
