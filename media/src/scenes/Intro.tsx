import {useCurrentFrame} from 'remotion';
import {Frame} from '../Scene';
import {Lift,Route,ease} from '../motion';
export const Intro=()=>{const f=useCurrentFrame();return <Frame id="intro" dark><div style={{position:'absolute',top:390,left:80,right:80}}><Route labels={['Orders','parcel.','Tasks + alerts']} frame={f}/></div><Lift delay={90} style={{position:'absolute',left:510,top:690,fontSize:42,color:'#b9edc9'}}>Less chasing. More clarity.</Lift><div style={{position:'absolute',left:100,top:820,right:100,height:1,background:'#729b8e',scale:`${ease(f,100,180)} 1`}}/></Frame>};
