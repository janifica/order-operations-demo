import { describe,it,expect,beforeEach,afterEach } from 'vitest';
import { Engine, demoOrders, type Action, type Order, parseCsv } from '../server/engine.js';
import { makeApp } from '../server/app.js';
import { mkdtempSync,rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
let e:Engine;let time:number;
beforeEach(()=>{time=Date.parse('2026-10-08T08:00:00Z');e=new Engine(':memory:',()=>new Date(time));});
afterEach(()=>e.close());
const input=()=>structuredClone(demoOrders[0]);
const event=(overrides:Record<string,unknown>={})=>({id:'evt1',carrier:'UPS',trackingNumber:'DEMO-UPS-1042-A',status:'delivered',occurredAt:'2026-10-08T08:01:00Z',...overrides});
describe('order intake and import',()=>{
 it('validates an order before saving anything',()=>{expect(()=>e.addOrder({...input(),email:'bad'})).toThrow();expect(e.all('orders')).toHaveLength(0);expect(e.all('actions')).toHaveLength(0);});
 it('deduplicates canonical order payload and creates only one task action',()=>{e.addOrder(input());const o=input();o.shipments.reverse();o.shipments[0].carrier=o.shipments[0].carrier.toLowerCase();expect(e.addOrder(o).duplicate).toBe(true);expect(e.all('orders')).toHaveLength(1);expect(e.all('actions')).toHaveLength(1);});
 it('rejects conflicting reuse of an order ID',()=>{e.addOrder(input());expect(()=>e.addOrder({...input(),total:100})).toThrow('different details');});
 it('rejects the same shipment on another order',()=>{e.addOrder(input());expect(()=>e.addOrder({...input(),id:'OTHER'})).toThrow('another order');expect(e.all('orders')).toHaveLength(1);});
 it('rejects duplicate tracking numbers inside an order',()=>{const o=input();o.shipments.push(o.shipments[0]);expect(()=>e.addOrder(o)).toThrow('duplicate shipment');});
 it('handles quoted commas, quotes and multiline CSV',()=>{expect(parseCsv('a,b\r\n"hello, world","say ""hi""\nnow"')).toEqual([['a','b'],['hello, world','say "hi"\nnow']]);expect(()=>parseCsv('a\n"bad')).toThrow('Unclosed');});
 it('groups multiple rows into one order and reports invalid rows',()=>{const r=e.importCsv('order_id,customer,email,total,carrier,tracking_number\nA,"One, Two",a@example.com,20,UPS,T1\nA,"One, Two",a@example.com,20,USPS,T2\nB,Bad,bad,30,UPS,T3');expect(r.imported).toBe(1);expect(r.errors).toHaveLength(1);expect(e.get<Order>('orders','A')!.shipments).toHaveLength(2);});
 it('rejects conflicting grouped rows without partially importing an order',()=>{const r=e.importCsv('order_id,customer,email,total,carrier,tracking_number\nA,Alpha,a@example.com,20,UPS,T1\nA,Beta,a@example.com,20,UPS,T2');expect(r.imported).toBe(0);expect(r.errors[0].message).toContain('conflicting');});
 it('rejects missing numeric totals rather than interpreting blank as zero',()=>{const r=e.importCsv('order_id,customer,email,total,carrier,tracking_number\nA,Alpha,a@example.com,,UPS,T1');expect(r.imported).toBe(0);});
 it('does not partially import an order whose earlier CSV row was malformed',()=>{const r=e.importCsv('order_id,customer,email,total,carrier,tracking_number\nA,Alpha,a@example.com,20,UPS\nA,Alpha,a@example.com,20,UPS,T2');expect(r.imported).toBe(0);expect(e.all('orders')).toHaveLength(0);});
});
describe('shipment lifecycle',()=>{
 beforeEach(()=>e.addOrder(input()));
 it('only completes an order when all its packages are delivered',()=>{e.applyEvent(event());expect(e.get<Order>('orders','ORD-1042')!.status).toBe('partially_delivered');e.applyEvent(event({id:'evt2',carrier:'USPS',trackingNumber:'DEMO-USPS-1042-B'}));expect(e.get<Order>('orders','ORD-1042')!.status).toBe('delivered');});
 it('replayed delivery event creates no duplicate actions',()=>{e.applyEvent(event());const count=e.all('actions').length;expect(e.applyEvent(event()).accepted).toBe(false);expect(e.all('actions')).toHaveLength(count);});
 it('rejects conflicting use of an existing event ID',()=>{e.applyEvent(event());expect(()=>e.applyEvent(event({status:'in_transit'}))).toThrow('different payload');});
 it('ignores old events and never regresses delivered status',()=>{e.applyEvent(event());expect(e.applyEvent(event({id:'old',status:'in_transit',occurredAt:'2026-10-08T07:00:00Z'})).reason).toContain('timestamp');expect(e.applyEvent(event({id:'new',status:'in_transit',occurredAt:'2026-10-09T08:00:00Z'})).reason).toContain('terminal');expect(e.get<Order>('orders','ORD-1042')!.shipments[0].status).toBe('delivered');});
 it('normalizes timezone offsets before ordering events',()=>{e.applyEvent(event({status:'in_transit',occurredAt:'2026-10-08T10:00:00+02:00'}));expect(e.applyEvent(event({id:'older',occurredAt:'2026-10-08T07:59:00Z'})).accepted).toBe(false);});
 it('tracks and resolves a shipment exception after recovery',()=>{e.applyEvent(event({status:'exception'}));expect(e.overview().metrics.exceptions).toBe(1);e.applyEvent(event({id:'recovered',status:'in_transit',occurredAt:'2026-10-08T08:02:00Z'}));expect(e.overview().metrics.exceptions).toBe(0);});
 it('unknown shipments leave no accepted event or action',()=>{expect(()=>e.applyEvent(event({trackingNumber:'UNKNOWN'}))).toThrow('not found');expect(e.all('events')).toHaveLength(0);});
});
describe('durable outbox',()=>{
 it('applies simulated task creation exactly once per action ID',()=>{e.addOrder(input());e.process();e.process();expect(e.all('provider_records')).toHaveLength(1);expect(e.get<Order>('orders','ORD-1042')!.taskId).toBe('SIM-TASK-ORD-1042');});
 it('retries a transient failure when due without tight looping',()=>{const a=e.enqueue(null,'notify',{failure:'transient'});e.process();expect(e.get<Action>('actions',a.id)!.status).toBe('retrying');expect(e.process().processed).toBe(0);time+=2000;e.process();expect(e.get<Action>('actions',a.id)!.status).toBe('succeeded');expect(e.get<Action>('actions',a.id)!.attempts).toBe(2);});
 it('permanent failures stay blocked until corrected and replayed',()=>{const a=e.enqueue(null,'notify',{failure:'permanent'});e.process();expect(e.overview().metrics.exceptions).toBe(1);time+=60000;expect(e.process().processed).toBe(0);e.replay(a.id);expect(e.overview().metrics.exceptions).toBe(1);e.process();expect(e.overview().metrics.exceptions).toBe(0);expect(e.all('provider_records')).toHaveLength(1);});
 it('only allows replay of failed actions',()=>{const a=e.enqueue(null,'notify');expect(()=>e.replay(a.id)).toThrow('Only failed');});
 it('exhausts transient retries and exposes a failed action',()=>{const a=e.enqueue(null,'notify',{failure:'transient',failForAttempts:10});e.process();time+=2000;e.process();time+=4000;e.process();expect(e.get<Action>('actions',a.id)!.attempts).toBe(3);expect(e.get<Action>('actions',a.id)!.status).toBe('failed');expect(e.overview().metrics.exceptions).toBe(1);time+=60000;expect(e.process().processed).toBe(0);});
 it('preserves orders and pending actions over database reopen',()=>{const dir=mkdtempSync(join(tmpdir(),'order-test-'));try{const path=join(dir,'db.sqlite');let persistent=new Engine(path);persistent.addOrder(input());persistent.close();persistent=new Engine(path);expect(persistent.all('orders')).toHaveLength(1);expect(persistent.all('actions')).toHaveLength(1);persistent.process();expect(persistent.get<Order>('orders','ORD-1042')!.taskId).toBeTruthy();persistent.close();}finally{rmSync(dir,{recursive:true,force:true});}});
 it('rolls back queued changes on transaction failure',()=>{expect(()=>e.transaction(()=>{e.enqueue(null,'notify');throw new Error('abort');})).toThrow('abort');expect(e.all('actions')).toHaveLength(0);});
});
describe('HTTP API',()=>{
 it('exposes simulation status and validates invalid JSON input',async()=>{const app=makeApp(e);const overview=await app.inject('/api/overview');expect(overview.json().mode).toBe('simulation');const invalid=await app.inject({method:'POST',url:'/api/orders',payload:{}});expect(invalid.statusCode).toBe(400);const valid=await app.inject({method:'POST',url:'/api/orders',payload:input()});expect(valid.statusCode).toBe(200);expect(valid.json().order.inputKey).toBeUndefined();await app.close();});
});
