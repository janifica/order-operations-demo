import {AbsoluteFill,interpolate,useCurrentFrame} from 'remotion';
import type {ReactNode} from 'react';
import type {Overview} from '../../client/App';
import {scenes} from './timeline';
export type Replay={csv:string;snapshots:Record<string,Overview>};
export type SceneProps={replay:Replay};
export function Frame({id,children,dark=false}:{id:typeof scenes[number]['id'];children:ReactNode;dark?:boolean}){
 const index=scenes.findIndex(s=>s.id===id),scene=scenes[index],f=useCurrentFrame();
 return <AbsoluteFill style={{background:dark?'#123535':'#f3f5ed',color:dark?'#f3f5ed':'#173e3d',fontFamily:'Arial,sans-serif',overflow:'hidden'}}>
 <div style={{position:'absolute',width:750,height:750,right:-190,top:-380,borderRadius:'50%',background:dark?'#b9edc909':'#b9edc930',translate:`${Math.sin(f/100)*40}px ${Math.cos(f/110)*35}px`}}/>
 <div style={{position:'absolute',top:58,left:76,fontSize:22,letterSpacing:4,opacity:.65}}>PARCEL / ORDER OPERATIONS</div>
 <h1 style={{position:'absolute',top:108,left:72,fontFamily:'Arial,sans-serif',fontSize:82,lineHeight:1.06,letterSpacing:-3,margin:0,translate:`0px ${interpolate(f,[0,22],[36,0],{extrapolateRight:'clamp'})}px`,opacity:interpolate(f,[0,18],[0,1],{extrapolateRight:'clamp'})}}>{scene.title}</h1>
 {children}
 <div style={{position:'absolute',bottom:37,left:76,fontSize:19,letterSpacing:1,opacity:.65}}>{scene.kind==='evidence'?'REAL SAAS EVIDENCE · CAPTURED OCT 8, 2026':scene.kind==='ui'?'OFFLINE REPLAY · SYNTHETIC DATA & PROVIDERS':'PERSONAL PROJECT · AI-ASSISTED · SYNTHETIC LOGISTICS'}</div>
 <div style={{position:'absolute',bottom:37,right:76,fontSize:21,opacity:.65}}>{String(index+1).padStart(2,'0')} / 09</div>
 <div style={{position:'absolute',bottom:0,height:4,background:dark?'#b9edc9':'#26776a',width:`${(index+f/(scene.seconds*30))/scenes.length*100}%`}}/>
 </AbsoluteFill>;
}
