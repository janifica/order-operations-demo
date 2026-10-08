import {useEffect,useState} from 'react';
import {cancelRender,continueRender,delayRender,staticFile} from 'remotion';
import {TransitionSeries} from '@remotion/transitions';
import {Scene,type Replay} from './Scene';
import {scenes} from './timeline';
import './generated/app.css';
import './video.css';
export const Parcel=()=>{
 const [handle]=useState(()=>delayRender('Load replay inputs'));
 const [replay,setReplay]=useState<Replay|null>(null);
 useEffect(()=>{fetch(staticFile('generated/replay.json')).then(r=>{if(!r.ok)throw Error('Missing replay: run npm run video:check');return r.json();}).then(data=>{setReplay(data);continueRender(handle);}).catch(cancelRender);},[handle]);
 if(!replay)return null;
 return <TransitionSeries>{scenes.map((scene,index)=><TransitionSeries.Sequence key={scene.id} durationInFrames={scene.seconds*30}><Scene index={index} replay={replay}/></TransitionSeries.Sequence>)}</TransitionSeries>;
};
