import {useCurrentFrame} from 'remotion';
import {Frame} from '../Scene';
import {Lift,Route} from '../motion';
export const Outro=()=>{const f=useCurrentFrame();return <Frame id="outro" dark><div style={{position:'absolute',left:70,right:70,top:330}}><Route labels={['React + TS','SQLite','Zapier','ClickUp + Slack']} frame={f}/></div><div style={{display:'flex',gap:24,position:'absolute',left:270,top:605}}>{['Source code','Tests','Workflow mappings'].map((label,i)=><Lift key={label} delay={90+i*30} style={{border:'1px solid #588677',borderRadius:20,padding:'26px 35px',fontSize:32}}>✓ {label}</Lift>)}</div><Lift delay={190} style={{position:'absolute',left:75,right:75,top:825,textAlign:'center',fontSize:32,color:'#b9edc9'}}>github.com/janifica/order-operations-demo</Lift></Frame>};
