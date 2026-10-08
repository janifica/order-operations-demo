import {Composition} from 'remotion';
import {Parcel} from './Composition';
import {duration} from './timeline';
export const RemotionRoot=()=> <Composition id="Parcel" component={Parcel} durationInFrames={duration} fps={30} width={1920} height={1080}/>;
