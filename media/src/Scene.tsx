import {AbsoluteFill,Img,interpolate,staticFile,useCurrentFrame} from 'remotion';
import App,{type Overview} from '../../client/App';
import {scenes} from './timeline';
export type Replay={csv:string;snapshots:Record<string,Overview>};
export const Scene=({index,replay}:{index:number;replay:Replay})=>{
 const scene=scenes[index],frame=useCurrentFrame();
 const opacity=interpolate(frame,[0,12,scene.seconds*30-12,scene.seconds*30],[0,1,1,0],{extrapolateLeft:'clamp',extrapolateRight:'clamp'});
 const ui=scene.kind==='ui';const evidence=scene.kind==='evidence';
 return <AbsoluteFill style={{background:'#f5f6f0',color:'#183c3d',fontFamily:'Arial, sans-serif',opacity,padding:64}}>
 <div style={{fontSize:24,letterSpacing:4,marginBottom:18}}>PARCEL / PERSONAL PORTFOLIO DEMO</div>
 <h1 style={{fontFamily:'Arial, sans-serif',fontSize:68,lineHeight:1.08,margin:0,maxWidth:1770}}>{scene.title}</h1>
 <p style={{fontSize:32,lineHeight:1.35,maxWidth:1750,margin:'20px 0 0'}}>{scene.caption}</p>
 {ui&&<div className="video-ui" style={{position:'absolute',left:64,top:280,width:1792,height:700,overflow:'hidden',border:'1px solid #d9ded5',borderRadius:14,boxShadow:'0 12px 35px #163c3c15'}}><div style={{width:1792,height:900,position:'relative',pointerEvents:'none'}}><App presentation={{overview:replay.snapshots[scene.snapshot],view:'view' in scene?scene.view:undefined,orderId:'orderId' in scene?scene.orderId:undefined,modal:'modal' in scene?scene.modal:undefined,csv:replay.csv}}/></div></div>}
 {evidence&&<Img src={staticFile(scene.image)} style={{position:'absolute',left:64,top:280,width:1792,height:700,objectFit:'contain',borderRadius:12,background:'#e8ece5'}}/>}
 {(scene.kind==='intro'||scene.kind==='outro')&&<div style={{position:'absolute',top:390,left:90,right:90,padding:60,background:'#193e3f',color:'#f5f6f0',borderRadius:22}}><div style={{fontSize:78,lineHeight:1.18,fontWeight:700}}>{scene.kind==='intro'?'Intake → Package progress → Fulfillment':'Source, tests and workflow documentation.'}</div><p style={{fontSize:37,lineHeight:1.5,marginBottom:0}}>{scene.kind==='intro'?'Automatic video replay uses the real app UI and domain engine. Separate dated captures show the verified SaaS integration.':'github.com/janifica/order-operations-demo'}</p><p style={{fontSize:30,lineHeight:1.4,color:'#c6d6ca'}}>Synthetic logistics. No live carrier tracking. No client performance claims.</p></div>}
 <div style={{position:'absolute',bottom:36,left:64,fontSize:23,letterSpacing:1}}>{ui?'OFFLINE UI REPLAY · SIMULATED PROVIDERS':evidence?'DATED CONNECTED EVIDENCE · NOT REEXECUTED DURING RENDER':'AI-ASSISTED PERSONAL PROJECT · SYNTHETIC DATA'}</div>
 <div style={{position:'absolute',bottom:36,right:64,fontSize:23}}>{String(index+1).padStart(2,'0')} / {scenes.length}</div>
 </AbsoluteFill>;
};
