import {Composition} from 'remotion';
import {Parcel} from './Composition';
import {duration,fps} from './timeline';
export const RemotionRoot=()=> <Composition id="Parcel" component={Parcel} durationInFrames={duration} fps={fps} width={1920} height={1080}/>;
