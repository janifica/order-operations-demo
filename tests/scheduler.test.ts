import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Engine,type Action } from '../server/engine.js';
import { DigestScheduler,digestScheduleFromEnv } from '../server/scheduler.js';

let engine:Engine,time:number;
beforeEach(()=>{time=Date.parse('2026-10-08T00:59:00Z');engine=new Engine(':memory:',()=>new Date(time),'connected');});
afterEach(()=>engine.close());
const scheduler=()=>new DigestScheduler(engine,{time:'09:00',timeZone:'Asia/Shanghai'});
describe('daily digest scheduling',()=>{
 it('waits for local time and queues once per date, while manual runs remain independent',()=>{
  const s=scheduler();expect(s.tick()).toBeUndefined();time+=60000;
  const first=s.tick()!;expect(first.duplicate).toBe(false);expect(first.action.payload.scheduledFor).toBe('2026-10-08');
  time+=60000;expect(s.tick()!.action.id).toBe(first.action.id);expect(engine.all('actions')).toHaveLength(1);
  engine.digest();expect(engine.all('actions')).toHaveLength(2);
  time+=86400000;expect(s.tick()!.duplicate).toBe(false);expect(engine.all('digest_runs')).toHaveLength(2);
 });
 it('catches up today after downtime without creating past-day runs',()=>{
  time=Date.parse('2026-10-11T15:00:00Z');scheduler().tick();
  expect(engine.all<Action>('actions')).toHaveLength(1);expect(engine.all<Action>('actions')[0].payload.scheduledFor).toBe('2026-10-11');
 });
 it('retains the same run after SQLite reopen and scheduler replacement',()=>{
  const dir=mkdtempSync(join(tmpdir(),'parcel-schedule-'));let persistent:Engine|undefined;
  try{
   time=Date.parse('2026-10-08T10:00:00Z');const path=join(dir,'db.sqlite');
   persistent=new Engine(path,()=>new Date(time),'connected');const config={time:'09:00',timeZone:'Asia/Shanghai'};
   const id=new DigestScheduler(persistent,config).tick()!.action.id;persistent.close();
   persistent=new Engine(path,()=>new Date(time),'connected');
   expect(new DigestScheduler(persistent,config).tick()!.action.id).toBe(id);expect(persistent.all('actions')).toHaveLength(1);
  }finally{persistent?.close();rmSync(dir,{recursive:true,force:true});}
 });
 it('does not enqueue twice during the repeated hour at daylight-saving fallback',()=>{
  const s=new DigestScheduler(engine,{time:'01:30',timeZone:'America/New_York'});
  time=Date.parse('2026-11-01T05:30:00Z');const id=s.tick()!.action.id;
  time=Date.parse('2026-11-01T06:30:00Z');expect(s.tick()!.action.id).toBe(id);expect(engine.all('actions')).toHaveLength(1);
 });
 it('rolls back the action and run marker together when recording fails',()=>{
  time+=60000;const original=engine.log.bind(engine);const mock=vi.spyOn(engine,'log').mockImplementationOnce(()=>{throw new Error('storage failure');});
  expect(()=>scheduler().tick()).toThrow('storage failure');expect(engine.all('actions')).toHaveLength(0);expect(engine.all('digest_runs')).toHaveLength(0);
  mock.mockImplementation(original);expect(scheduler().tick()!.duplicate).toBe(false);
 });
 it('does not create another run after a same-day schedule time change or failed send',()=>{
  time=Date.parse('2026-10-08T10:00:00Z');const first=scheduler().tick()!.action;
  first.status='failed';engine.put('actions',first);
  expect(new DigestScheduler(engine,{time:'10:00',timeZone:'Asia/Shanghai'}).tick()!.action.id).toBe(first.id);expect(engine.all('actions')).toHaveLength(1);
 });
 it('disables absent schedules and rejects invalid configuration',()=>{
  expect(digestScheduleFromEnv({})).toBeUndefined();expect(digestScheduleFromEnv({DAILY_DIGEST_TIME:'09:00'})).toEqual({time:'09:00',timeZone:'Asia/Shanghai'});
  for(const time of ['24:00','9:00','10:60'])expect(()=>digestScheduleFromEnv({DAILY_DIGEST_TIME:time})).toThrow('HH:mm');
  expect(()=>digestScheduleFromEnv({DAILY_DIGEST_TIME:'09:00',DAILY_DIGEST_TIME_ZONE:'invalid'})).toThrow('time zone');
 });
});
