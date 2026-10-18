import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { INTERNATIONAL_MEDIA } from "../data/international-integration-media.js";

const ffmpeg=spawnSync("ffmpeg",["-version"],{encoding:"utf8"});
if(ffmpeg.error||ffmpeg.status!==0){
  console.error("Không tìm thấy ffmpeg. Cài ffmpeg rồi chạy lại: node scripts/tools/derive-international-media.mjs");
  process.exit(2);
}
const projectRoot=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"../..");
const outputRoot=path.join(projectRoot,"image_v2/.generated/international-integration");
const force=process.argv.includes("--force");
fs.mkdirSync(outputRoot,{recursive:true});
let created=0,skipped=0,failed=0;
function run(args,target){
  if(!force&&fs.existsSync(target)){skipped++;return true}
  const result=spawnSync("ffmpeg",["-hide_banner","-loglevel","error","-y",...args,target],{encoding:"utf8"});
  if(result.status!==0){failed++;console.error(result.stderr||("Không thể xử lý "+target));return false}
  created++;return true;
}
for(const item of INTERNATIONAL_MEDIA){
  if(item.isDuplicate)continue;
  const input=path.join(projectRoot,item.sourcePath.replace(/^\.\//,""));
  const base=path.join(outputRoot,item.id);
  if(item.mediaType==="image"){
    run(["-i",input,"-vf","scale=min(512\\,iw):-2","-c:v","libwebp","-quality","78"],base+"-thumb.webp");
    run(["-i",input,"-vf","scale=min(4096\\,iw):-2","-c:v","libwebp","-quality","84"],base+"-display.webp");
  }else{
    run(["-i",input,"-vf","scale=-2:min(1080\\,ih)","-c:v","libx264","-crf","23","-preset","medium","-movflags","+faststart","-c:a","aac","-b:a","128k"],base+".mp4");
  }
}
console.log(JSON.stringify({created,skipped,failed,outputRoot}));
if(failed===0)await import("./build-international-manifest.mjs?refresh="+Date.now());
process.exitCode=failed?1:0;
