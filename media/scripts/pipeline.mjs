import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync,copyFileSync,existsSync,readdirSync,renameSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,resolve,relative} from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'../..');process.chdir(root);
const run=(command,args,cwd=root)=>{const result=spawnSync(command,args,{cwd,stdio:'inherit',env:{...process.env,TZ:'UTC'}});if(result.status!==0)throw Error(`${command} failed (${result.status})`);};
run(process.execPath,['node_modules/tsx/dist/cli.mjs','media/scripts/replay.ts']);
run(process.execPath,['media/scripts/sound.mjs']);
const evidence=['clickup-portfolio-complete.jpg','slack-portfolio-connected.jpg','receipts-connected.jpg'];
for(const file of evidence){const source=resolve('assets',file);if(!existsSync(source))throw Error(`Missing verified evidence: ${file}`);copyFileSync(source,resolve('media/public',file));}
mkdirSync('media/src/generated',{recursive:true});
writeFileSync('media/src/generated/app.css',readFileSync('client/styles.css','utf8').replace(/^@import.*$/gm,''));
run('npm',['run','lint'],resolve(root,'media'));
const hash=path=>createHash('sha256').update(readFileSync(path)).digest('hex');
const collect=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?collect(resolve(dir,entry.name)):[resolve(dir,entry.name)]);
const inputs=[...collect(resolve('client')),...collect(resolve('server')),...collect(resolve('media/src')),...collect(resolve('media/scripts')),resolve('media/package-lock.json'),resolve('media/remotion.config.ts'),resolve('media/public/generated/replay.json'),resolve('media/public/generated/sound.wav'),...evidence.map(f=>resolve('assets',f))];
mkdirSync('workspace/video',{recursive:true});
const replay=JSON.parse(readFileSync('media/public/generated/replay.json','utf8'));
const stamp=seconds=>new Date(seconds*1000).toISOString().slice(11,19)+',000';
let elapsed=0;
writeFileSync('workspace/video/captions.srt',replay.scenes.map((scene,index)=>{const start=elapsed;elapsed+=scene.seconds;return `${index+1}\n${stamp(start)} --> ${stamp(elapsed)}\n${scene.title}\n${scene.caption}\n`;}).join('\n'));
const manifest={generatedAt:new Date().toISOString(),rendered:false,captureDate:'2026-10-08',captureTimeZone:'Asia/Shanghai',externalActions:false,dimensions:[1920,1080],fps:replay.fps,frames:replay.duration,seconds:replay.duration/replay.fps,inputs:Object.fromEntries(inputs.map(path=>[relative(root,path),hash(path)]))};
if(!process.argv.includes('--check')){
 run('npx',['remotion','still','Parcel','../workspace/video/preview.png',`--frame=${(replay.scenes.slice(0,replay.scenes.findIndex(s=>s.id==='partial')).reduce((n,s)=>n+s.seconds,0)+5)*replay.fps}`],resolve(root,'media'));
 run('npx',['remotion','render','Parcel','../workspace/video/candidate.mp4','--codec=h264','--crf=20','--concurrency=2'],resolve(root,'media'));
 const output=resolve('workspace/video/candidate.mp4');if(!existsSync(output)||readFileSync(output).length<10000)throw Error('Render output missing or empty');manifest.rendered=true;manifest.outputSha256=hash(output);renameSync(output,'workspace/video/parcel-portfolio.mp4');
}
writeFileSync(process.argv.includes('--check')?'workspace/video/input-check.json':'workspace/video/manifest.json',JSON.stringify(manifest,null,2)+'\n');console.log('Pipeline complete. Artifacts: workspace/video/');
