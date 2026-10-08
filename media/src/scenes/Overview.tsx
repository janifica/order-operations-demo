import {useCurrentFrame} from 'remotion';
import {Frame,type SceneProps} from '../Scene';
import {UiView} from '../UiView';
import {Lift,ease,ink} from '../motion';
export const Overview=({replay}:SceneProps)=>{const f=useCurrentFrame();return <Frame id="overview"><UiView replay={replay} snapshot="overview"/><div style={{position:'absolute',right:75,top:285,width:490}}>{[['Orders',replay.snapshots.overview.metrics.orders],['Packages',replay.snapshots.overview.orders.reduce((n,o)=>n+o.shipments.length,0)],['Open exceptions',replay.snapshots.overview.metrics.exceptions]].map(([label,value],i)=><Lift key={label} delay={20+i*28} style={{padding:30,background:i===0?'#b9edc9':'white',borderRadius:24,marginBottom:22,boxShadow:'0 16px 35px #163d3c12'}}><div style={{fontSize:23,color:ink,opacity:.65}}>{label}</div><div style={{fontSize:74,fontWeight:700,color:ink}}>{Math.round(Number(value)*ease(f,20+i*28,50+i*28))}</div></Lift>)}</div></Frame>};
