import { Engine } from './engine.js';

export type DigestSchedule = { time:string; timeZone:string };
export function digestScheduleFromEnv(env:Record<string,string|undefined>):DigestSchedule|undefined {
 if(!env.DAILY_DIGEST_TIME)return undefined;
 const time=env.DAILY_DIGEST_TIME,timeZone=env.DAILY_DIGEST_TIME_ZONE??'Asia/Shanghai';
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('DAILY_DIGEST_TIME must be HH:mm in 24-hour format.');
 try{new Intl.DateTimeFormat('en',{timeZone}).format(new Date());}catch{throw new Error('DAILY_DIGEST_TIME_ZONE must be a valid time zone.');}
 return {time,timeZone};
}

// Catch up only today's run after the configured time. Durable run keys prevent
// another enqueue on polling, restarts, or a repeated hour during DST changes.
export class DigestScheduler {
 private readonly formatter:Intl.DateTimeFormat;
 constructor(private readonly engine:Engine,readonly schedule:DigestSchedule){
  this.formatter=new Intl.DateTimeFormat('en-CA',{timeZone:schedule.timeZone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
 }
 tick(){
  const parts=Object.fromEntries(this.formatter.formatToParts(this.engine.clock()).map(p=>[p.type,p.value]));
  if(`${parts.hour}:${parts.minute}`<this.schedule.time)return undefined;
  const date=`${parts.year}-${parts.month}-${parts.day}`;
  return this.engine.digest({runKey:`daily:${this.schedule.timeZone}:${date}`,date,timeZone:this.schedule.timeZone});
 }
}
