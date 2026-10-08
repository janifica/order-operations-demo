import {readFileSync,writeFileSync} from 'node:fs';
const {scenes}=JSON.parse(readFileSync('media/public/generated/replay.json','utf8'));
const rate=48000,seconds=scenes.reduce((n,s)=>n+s.seconds,0),samples=new Float32Array(rate*seconds);
const tone=(time,freq,amplitude=.12,length=.5)=>{for(let i=0;i<rate*length;i++){const at=Math.floor(time*rate)+i;if(at>=samples.length)break;const t=i/rate;const envelope=Math.min(1,t/.007)*Math.exp(-t*9);samples[at]+=amplitude*envelope*(Math.sin(2*Math.PI*freq*t)+.22*Math.sin(4*Math.PI*freq*t));}};
let offset=0;
for(const scene of scenes){tone(offset+.5,392,.07,.35);tone(offset+.64,523.25,.06,.35);if(['partial','complete','intake'].includes(scene.id)){tone(offset+3.33,659.25,.1,.5);tone(offset+3.5,783.99,.08,.7);}offset+=scene.seconds;}
const wav=Buffer.alloc(44+samples.length*2);wav.write('RIFF',0);wav.writeUInt32LE(wav.length-8,4);wav.write('WAVEfmt ',8);wav.writeUInt32LE(16,16);wav.writeUInt16LE(1,20);wav.writeUInt16LE(1,22);wav.writeUInt32LE(rate,24);wav.writeUInt32LE(rate*2,28);wav.writeUInt16LE(2,32);wav.writeUInt16LE(16,34);wav.write('data',36);wav.writeUInt32LE(samples.length*2,40);for(let i=0;i<samples.length;i++)wav.writeInt16LE(Math.round(Math.max(-1,Math.min(1,samples[i]))*32767),44+i*2);
writeFileSync('media/public/generated/sound.wav',wav);
console.log('Generated original, deterministic UI sound cues (no stock audio or provider notifications).');
