import {useCurrentFrame} from 'remotion';
import App from '../../client/App';
import type {Replay} from './Scene';
import {ease,pop} from './motion';
export function UiView({replay,snapshot,order=false,view='overview',wide=false}:{replay:Replay;snapshot:string;order?:boolean;view?:string;wide?:boolean}){
 const f=useCurrentFrame(),width=wide?1776:1200;
 return <div className="video-ui" style={{position:'absolute',left:72,top:255,width,height:745,borderRadius:24,overflow:'hidden',border:'1px solid #dae2d8',boxShadow:'0 24px 70px #153d3b20',opacity:ease(f,10,30),translate:`0px ${(1-pop(f,12))*70}px`}}><div style={{width:1792,height:900,position:'relative',pointerEvents:'none',transformOrigin:order?'right top':'left top',scale:(wide?1:order?1.12:.88)+ease(f,20,320,0,.025),translate:order?`${width-1792}px -10px`:'-15px 0px'}}><App key={`${snapshot}-${order}-${view}`} presentation={{overview:replay.snapshots[snapshot],view,orderId:order?'PORTFOLIO-2001':undefined}}/></div></div>;
}
