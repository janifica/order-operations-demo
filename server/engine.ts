import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

export type ShipmentStatus = 'pending' | 'in_transit' | 'delivered' | 'exception';
export type OrderStatus = ShipmentStatus | 'partially_delivered';
export type Shipment = { id:string; orderId:string; carrier:string; trackingNumber:string; status:ShipmentStatus; lastEventAt:string|null };
export type Order = { id:string; customer:string; email:string; total:number; createdAt:string; status:OrderStatus; shipments:Shipment[]; taskId:string|null; inputKey:string };
export type Action = {id:string;orderId:string|null;type:string;status:'pending'|'retrying'|'awaiting_receipt'|'succeeded'|'failed';attempts:number;maxAttempts:number;nextAttemptAt:string|null;lastError:string|null;createdAt:string;completedAt:string|null;payload:Record<string,unknown>;receiptDeadline?:string;uncertain?:boolean};
export type Exception = {id:string;orderId:string|null;kind:string;message:string;status:'open'|'resolved';createdAt:string;actionId:string|null};
export type Log = {id:string;orderId:string|null;type:string;message:string;createdAt:string};
export class DomainError extends Error { constructor(public status:number,message:string){super(message);} }
const trimmed = z.string().trim().min(1).max(160);
export const orderSchema = z.object({id:trimmed,customer:trimmed,email:z.email(),total:z.number().finite().min(0).max(1e9),shipments:z.array(z.object({carrier:trimmed,trackingNumber:trimmed})).min(1).max(100)});
export const eventSchema = z.object({id:trimmed,carrier:trimmed,trackingNumber:trimmed,status:z.enum(['in_transit','delivered','exception']),occurredAt:z.iso.datetime({offset:true})});
export type OrderInput = z.infer<typeof orderSchema>;
export const demoOrders:OrderInput[] = [
 {id:'ORD-1042',customer:'Juniper Home Studio',email:'orders@example.com',total:428,shipments:[{carrier:'UPS',trackingNumber:'DEMO-UPS-1042-A'},{carrier:'USPS',trackingNumber:'DEMO-USPS-1042-B'}]},
 {id:'ORD-1043',customer:'Northline Supply',email:'northline@example.com',total:189,shipments:[{carrier:'UPS',trackingNumber:'DEMO-UPS-1043'}]},
 {id:'ORD-1044',customer:'Atelier Goods',email:'atelier@example.com',total:760,shipments:[{carrier:'Amazon Logistics',trackingNumber:'DEMO-AMZ-1044'}]},
 {id:'ORD-1045',customer:'Cedar & Stone',email:'cedar@example.com',total:96,shipments:[{carrier:'USPS',trackingNumber:'DEMO-USPS-1045'}]}
];

export class Engine {
 readonly db:DatabaseSync;
 constructor(path:string,readonly clock:()=>Date=()=>new Date(),readonly mode:'simulation'|'connected'='simulation'){
  this.db=new DatabaseSync(path);
  this.db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
  this.db.exec(`CREATE TABLE IF NOT EXISTS orders(id TEXT PRIMARY KEY,data TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS shipments(id TEXT PRIMARY KEY,order_id TEXT NOT NULL REFERENCES orders(id),carrier TEXT NOT NULL,tracking TEXT NOT NULL,UNIQUE(carrier,tracking));
   CREATE TABLE IF NOT EXISTS events(id TEXT PRIMARY KEY,data TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS actions(id TEXT PRIMARY KEY,data TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS exceptions(id TEXT PRIMARY KEY,data TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS logs(id TEXT PRIMARY KEY,data TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS provider_records(id TEXT PRIMARY KEY,data TEXT NOT NULL);
   CREATE TABLE IF NOT EXISTS digest_runs(id TEXT PRIMARY KEY,data TEXT NOT NULL);`);
 }
 now(){return this.clock().toISOString();}
 close(){this.db.close();}
 all<T>(table:string):T[]{ return (this.db.prepare(`SELECT data FROM ${table} ORDER BY rowid DESC`).all() as {data:string}[]).map(r=>JSON.parse(r.data)); }
 get<T>(table:string,id:string):T|undefined {const r=this.db.prepare(`SELECT data FROM ${table} WHERE id=?`).get(id) as {data:string}|undefined;return r?JSON.parse(r.data):undefined;}
 put<T extends {id:string}>(table:string,item:T){this.db.prepare(`INSERT INTO ${table}(id,data) VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data`).run(item.id,JSON.stringify(item));}
 transaction<T>(fn:()=>T):T {this.db.exec('BEGIN IMMEDIATE');try{const result=fn();this.db.exec('COMMIT');return result;}catch(e){this.db.exec('ROLLBACK');throw e;}}
 log(orderId:string|null,type:string,message:string){this.put('logs',{id:randomUUID(),orderId,type,message,createdAt:this.now()} as Log);}
 enqueue(orderId:string|null,type:string,payload:Record<string,unknown>={}):Action{
  const action:Action={id:randomUUID(),orderId,type,status:'pending',attempts:0,maxAttempts:3,nextAttemptAt:null,lastError:null,createdAt:this.now(),completedAt:null,payload};this.put('actions',action);return action;
 }
 addOrder(raw:unknown){
  const input=orderSchema.parse(raw);input.email=input.email.toLowerCase();input.shipments=input.shipments.map(s=>({carrier:s.carrier.toLowerCase(),trackingNumber:s.trackingNumber.toUpperCase()}));
  input.shipments.sort((a,b)=>(a.carrier+'|'+a.trackingNumber).localeCompare(b.carrier+'|'+b.trackingNumber));
  const pairs=input.shipments.map(s=>s.carrier+'|'+s.trackingNumber);
  if(new Set(pairs).size!==pairs.length)throw new DomainError(400,'The order contains duplicate shipment numbers.');
  const key=JSON.stringify(input),existing=this.get<Order>('orders',input.id);
  if(existing){if(existing.inputKey!==key)throw new DomainError(409,'This order ID already exists with different details.');return {order:existing,duplicate:true};}
  for(const s of input.shipments){if(this.db.prepare('SELECT id FROM shipments WHERE carrier=? AND tracking=?').get(s.carrier,s.trackingNumber))throw new DomainError(409,'This shipment already belongs to another order.');}
  return this.transaction(()=>{
   const order:Order={...input,createdAt:this.now(),status:'pending',taskId:null,inputKey:key,shipments:input.shipments.map(s=>({...s,id:randomUUID(),orderId:input.id,status:'pending',lastEventAt:null}))};
   this.put('orders',order);for(const s of order.shipments)this.db.prepare('INSERT INTO shipments(id,order_id,carrier,tracking) VALUES(?,?,?,?)').run(s.id,order.id,s.carrier,s.trackingNumber);
   this.enqueue(order.id,'create_task',{customer:order.customer,status:order.status});this.log(order.id,'order.created',`Validated order and queued a ${this.mode==='simulation'?'simulated':'connected'} ClickUp task.`);return {order,duplicate:false};
  });
 }
 derive(shipments:Shipment[]):OrderStatus {
  if(shipments.every(s=>s.status==='delivered'))return 'delivered';
  if(shipments.some(s=>s.status==='exception'))return 'exception';
  if(shipments.some(s=>s.status==='delivered'))return 'partially_delivered';
  if(shipments.some(s=>s.status==='in_transit'))return 'in_transit';return 'pending';
 }
 applyEvent(raw:unknown){
  const event=eventSchema.parse(raw);event.carrier=event.carrier.toLowerCase();event.trackingNumber=event.trackingNumber.toUpperCase();event.occurredAt=new Date(event.occurredAt).toISOString();
  const prior=this.get<any>('events',event.id);
  if(prior){if(JSON.stringify(prior.event)!==JSON.stringify(event))throw new DomainError(409,'Event ID was already used for a different payload.');return {accepted:false,reason:'duplicate event'};}
  const match=this.db.prepare('SELECT order_id FROM shipments WHERE carrier=? AND tracking=?').get(event.carrier,event.trackingNumber) as {order_id:string}|undefined;
  if(!match)throw new DomainError(404,'Shipment not found. Select a known carrier and tracking number.');
  return this.transaction(()=>{
   const order=this.get<Order>('orders',match.order_id)!;const shipment=order.shipments.find(s=>s.carrier===event.carrier&&s.trackingNumber===event.trackingNumber)!;
   const stale=shipment.lastEventAt&&new Date(event.occurredAt).getTime()<=new Date(shipment.lastEventAt).getTime();
   const regression=shipment.status==='delivered'&&event.status!=='delivered';
   const reason=stale?'older or equal timestamp':regression?'delivered is a terminal state':undefined;
   this.put('events',{id:event.id,event,accepted:!reason});
   if(reason){this.log(order.id,'event.ignored',`Ignored ${event.id}: ${reason}.`);return {accepted:false,reason,order};}
   const previous=shipment.status;shipment.status=event.status;shipment.lastEventAt=event.occurredAt;order.status=this.derive(order.shipments);this.put('orders',order);
   if(event.status==='exception')this.put('exceptions',{id:`shipment:${shipment.id}`,orderId:order.id,kind:'shipment',message:`${shipment.trackingNumber} needs review.`,status:'open',createdAt:this.now(),actionId:null} as Exception);
   else {const ex=this.get<Exception>('exceptions',`shipment:${shipment.id}`);if(ex){ex.status='resolved';this.put('exceptions',ex);}}
   if(previous!==event.status){this.enqueue(order.id,'update_task',{status:order.status,shipment:shipment.trackingNumber});this.enqueue(order.id,'notify',{status:order.status,shipment:shipment.trackingNumber});}
   this.log(order.id,'event.accepted',`${shipment.trackingNumber} → ${event.status.replaceAll('_',' ')}; order → ${order.status.replaceAll('_',' ')}.`);
   return {accepted:true,order};
  });
 }
 process(){
  if(this.mode!=='simulation')return {processed:0};
  const eligible=this.all<Action>('actions').reverse().filter(a=>['pending','retrying'].includes(a.status)&&(!a.nextAttemptAt||a.nextAttemptAt<=this.now()));
  for(const original of eligible)this.transaction(()=>{
   const a={...original};a.attempts++;
   const failure=a.payload.failure;
   if(failure==='permanent'||(failure==='transient'&&a.attempts<=Number(a.payload.failForAttempts??1))){
    a.lastError=failure==='permanent'?'Simulated invalid connection (401).':'Simulated provider timeout (503).';
    if(failure==='permanent'||a.attempts>=a.maxAttempts){a.status='failed';a.nextAttemptAt=null;this.put('exceptions',{id:`action:${a.id}`,orderId:a.orderId,kind:'integration',message:a.lastError,status:'open',createdAt:this.now(),actionId:a.id} as Exception);}
    else {a.status='retrying';a.nextAttemptAt=new Date(this.clock().getTime()+2000*2**(a.attempts-1)).toISOString();}
    this.log(a.orderId,'action.'+a.status,`${a.type}: ${a.lastError}`);
   } else {
    // Simulated external provider applies a stable action ID once.
    if(!this.get('provider_records',a.id))this.put('provider_records',{id:a.id,type:a.type,payload:a.payload,completedAt:this.now()});
    if(a.type==='create_task'&&a.orderId){const order=this.get<Order>('orders',a.orderId)!;order.taskId=order.taskId??`SIM-TASK-${order.id}`;this.put('orders',order);}
    a.status='succeeded';a.nextAttemptAt=null;a.lastError=null;a.completedAt=this.now();const ex=this.get<Exception>('exceptions',`action:${a.id}`);if(ex){ex.status='resolved';this.put('exceptions',ex);}
    this.log(a.orderId,'action.succeeded',`${a.type.replaceAll('_',' ')} completed by the simulated provider (attempt ${a.attempts}).`);
   }
   this.put('actions',a);
  });return {processed:eligible.length};
 }
 replay(id:string){
  return this.transaction(()=>{const a=this.get<Action>('actions',id);if(!a)throw new DomainError(404,'Action not found.');if(a.status!=='failed')throw new DomainError(409,'Only failed actions can be replayed.');
   if(a.uncertain)throw new DomainError(409,'External outcome is uncertain. Reconcile in Zapier and submit a receipt before replaying; a resend may duplicate tasks or messages.');
   // In simulation, operator replay represents correcting the demo connection.
   a.payload={...a.payload};delete a.payload.failure;a.status='pending';a.attempts=0;a.nextAttemptAt=null;a.lastError=null;this.put('actions',a);this.log(a.orderId,'action.replayed',this.mode==='simulation'?'Demo connection corrected; queued the same action ID for replay.':'Queued the same action ID for replay after operator correction.');return {action:a};});
 }
 seed(){let added=0;for(const input of demoOrders)if(!this.addOrder(input).duplicate)added++;return {added};}
 digest(schedule?:{runKey:string;date:string;timeZone:string}){return this.transaction(()=>{
  const existing=schedule?this.get<{actionId:string}>('digest_runs',schedule.runKey):undefined;
  if(existing)return {action:this.get<Action>('actions',existing.actionId)!,duplicate:true};
  const orders=this.all<Order>('orders');
  const action=this.enqueue(null,'daily_digest',{orders:orders.length,active:orders.filter(o=>o.status!=='delivered').length,exceptions:this.all<Exception>('exceptions').filter(e=>e.status==='open').length,...(schedule?{scheduledFor:schedule.date,timeZone:schedule.timeZone}:{} )});
  if(schedule)this.put('digest_runs',{id:schedule.runKey,actionId:action.id,queuedAt:this.now()});
  this.log(null,schedule?'digest.scheduled':'digest.queued',schedule?`Scheduled daily digest for ${schedule.date} (${schedule.timeZone}).`:this.mode==='simulation'?'Queued an on-demand simulated daily operations digest.':'Queued an on-demand operations digest for the connected workflow.');
  return {action,duplicate:false};
 });}
 scenario(name:string){
  if(this.mode==='connected'&&(name==='retry'||name==='permanent_failure'))throw new DomainError(409,'Failure injection is available only in simulation mode.');
  this.seed();const order=this.get<Order>('orders','ORD-1042')!;
  const emit=(s:Shipment,status:string,id:string,when:string)=>this.applyEvent({id,carrier:s.carrier,trackingNumber:s.trackingNumber,status,occurredAt:when});
  const when=new Date(Math.max(this.clock().getTime(),...order.shipments.map(s=>s.lastEventAt?Date.parse(s.lastEventAt)+1000:0))).toISOString();
  if(name==='delivery'){const next=order.shipments.find(s=>s.status!=='delivered');if(next){emit(next,'delivered',randomUUID(),when);return {message:`Delivered ${next.trackingNumber}. ${this.get<Order>('orders',order.id)!.status==='delivered'?'All packages are now delivered.':'Order remains partially delivered until the other package arrives.'}`};}return {message:'Both packages are already delivered. Try duplicate or out-of-order events.'};}
  if(name==='duplicate'||name==='out_of_order'){
   const s=order.shipments[0],id='DEMO-DELIVERY-'+s.id;const prior=this.get<any>('events',id);
   const event=prior?.event??{id,carrier:s.carrier,trackingNumber:s.trackingNumber,status:'delivered',occurredAt:when};if(!prior)this.applyEvent(event);
   const r=name==='duplicate'?this.applyEvent(event):emit(s,'in_transit',randomUUID(),new Date(Date.parse(event.occurredAt)-60000).toISOString());return {message:`Event safely ignored: ${r.reason}.`};
  }
  if(name==='retry'||name==='permanent_failure'){this.transaction(()=>{this.enqueue('ORD-1043','notify',{failure:name==='retry'?'transient':'permanent',message:'Synthetic connection test'});this.log('ORD-1043','demo.failure','Queued an explicitly simulated integration failure.');});this.process();return {message:name==='retry'?'Injected a temporary timeout. Automatic retry is scheduled in 2 seconds.':'Injected an invalid connection. Open Exceptions to correct and replay it.'};}
  throw new DomainError(400,'Unknown scenario.');
 }
 overview(){const orders=this.all<Order>('orders'),exceptions=this.all<Exception>('exceptions'),actions=this.all<Action>('actions');const completed=actions.filter(a=>['succeeded','failed'].includes(a.status));
  return {mode:'simulation',metrics:{orders:orders.length,active:orders.filter(o=>o.status!=='delivered').length,delivered:orders.filter(o=>o.status==='delivered').length,exceptions:exceptions.filter(e=>e.status==='open').length,successRate:completed.length?Math.round(100*completed.filter(a=>a.status==='succeeded').length/completed.length):0},orders:orders.map(({inputKey,...o})=>o),exceptions,actions,logs:this.all<Log>('logs').slice(0,200),integrations:[{name:'Zapier',status:'simulated',description:'Local outbox simulates workflow execution; no real Zaps connected.'},{name:'ClickUp',status:'simulated',description:'Task IDs and updates are simulated locally.'},{name:'AfterShip',status:'simulated',description:'Synthetic shipment events; no live carrier tracking.'},{name:'Slack',status:'simulated',description:'Notifications are recorded locally, not sent.'}]};
 }
 importCsv(csv:string){
  const rows=parseCsv(csv);if(rows.length<2)throw new DomainError(400,'CSV needs a header and at least one data row.');
  const header=rows[0].map(s=>s.trim().toLowerCase());const keys=['order_id','customer','email','total','carrier','tracking_number'];if(keys.some(k=>!header.includes(k)))throw new DomainError(400,'Required headers: '+keys.join(', '));
  const groups=new Map<string,{input:OrderInput;row:number;invalid?:string}>();const invalidIds=new Set<string>();const errors:{row:number;message:string}[]=[];
  for(let i=1;i<rows.length;i++){if(rows[i].every(v=>!v.trim()))continue;const get=(k:string)=>rows[i][header.indexOf(k)]?.trim()??'';const id=get('order_id');const total=get('total');
   if(rows[i].length!==header.length){errors.push({row:i+1,message:'Column count does not match header.'});invalidIds.add(id);continue;}
   const input={id,customer:get('customer'),email:get('email'),total:total===''?NaN:Number(total),shipments:[{carrier:get('carrier'),trackingNumber:get('tracking_number')}]};
   const existing=groups.get(id);if(existing){if(existing.input.customer!==input.customer||existing.input.email!==input.email||existing.input.total!==input.total)existing.invalid='Rows for this order have conflicting customer, email, or total.';existing.input.shipments.push(...input.shipments);}else groups.set(id,{input,row:i+1});
  }
  let imported=0,duplicates=0;for(const group of groups.values()){try{if(invalidIds.has(group.input.id))throw new Error('An order row has the wrong column count; the entire order was skipped.');if(group.invalid)throw new Error(group.invalid);const r=this.addOrder(group.input);r.duplicate?duplicates++:imported++;}catch(e){errors.push({row:group.row,message:e instanceof z.ZodError?e.issues.map(i=>i.path.join('.')+': '+i.message).join('; '):(e as Error).message});}}
  return {imported,duplicates,errors};
 }
}

export function parseCsv(text:string):string[][]{
 if(text.length>1_000_000)throw new DomainError(413,'CSV is too large (maximum 1 MB).');
 const rows:string[][]=[];let row:string[]=[],field='',quoted=false,closed=false;
 const source=text.replace(/^\uFEFF/,'');
 for(let i=0;i<source.length;i++){const c=source[i];if(quoted){if(c==='"'){if(source[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c;}
  else if(c==='"'){if(field||closed)throw new DomainError(400,'Invalid CSV quoting.');quoted=true;}
  else if(c===','){row.push(field);field='';closed=false;}
  else if(c==='\n'||c==='\r'){if(c==='\r'&&source[i+1]==='\n')i++;row.push(field);rows.push(row);row=[];field='';closed=false;}
  else {if(closed&&!/\s/.test(c))throw new DomainError(400,'Unexpected text after quoted CSV field.');if(!closed)field+=c;}}
 if(quoted)throw new DomainError(400,'Unclosed CSV quote.');if(field||row.length||closed){row.push(field);rows.push(row);}return rows;
}
