import {useEffect,useState} from 'react';
import {Audio} from '@remotion/media';
import {cancelRender,continueRender,delayRender,staticFile} from 'remotion';
import {TransitionSeries} from '@remotion/transitions';
import {type Replay} from './Scene';
import {Intro} from './scenes/Intro';
import {Overview} from './scenes/Overview';
import {Intake} from './scenes/Intake';
import {Partial} from './scenes/Partial';
import {Complete} from './scenes/Complete';
import {Reliability} from './scenes/Reliability';
import {ClickUp} from './scenes/ClickUp';
import {Slack} from './scenes/Slack';
import {Outro} from './scenes/Outro';
const components={intro:Intro,overview:Overview,intake:Intake,partial:Partial,complete:Complete,reliability:Reliability,clickup:ClickUp,slack:Slack,outro:Outro};
import {scenes} from './timeline';
import './generated/app.css';
import './video.css';
export const Parcel=()=>{
 const [handle]=useState(()=>delayRender('Load replay inputs'));
 const [replay,setReplay]=useState<Replay|null>(null);
 useEffect(()=>{fetch(staticFile('generated/replay.json')).then(r=>{if(!r.ok)throw Error('Missing replay: run npm run video:check');return r.json();}).then(data=>{setReplay(data);continueRender(handle);}).catch(cancelRender);},[handle]);
 if(!replay)return null;
 return <><Audio src={staticFile('generated/sound.wav')} volume={.7}/><TransitionSeries>{scenes.map((scene,index)=><TransitionSeries.Sequence key={scene.id} durationInFrames={scene.seconds*30}><AnimatedScene index={index} replay={replay}/></TransitionSeries.Sequence>)}</TransitionSeries></>;
};

function AnimatedScene({index,replay}:{index:number;replay:Replay}){const Component=components[scenes[index].id];return <Component replay={replay}/>;}
