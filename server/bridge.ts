import { z } from 'zod';
import { Engine, DomainError, type Action, type Order, type Exception } from './engine.js';

export const receiptSchema = z.object({
 action_id:z.string().min(1), attempt:z.coerce.number().int().positive(),
 outcome:z.enum(['succeeded','failed']), task_id:z.string().min(1).max(160).optional(),
 error_code:z.enum(['rate_limit','invalid_configuration','provider_failure']).optional(),
}).strict();
export type BridgeConfig = {hooks:Partial<Record<string,string>>; callbackBaseUrl:string; receiptToken:string; receiptTimeoutMs?:number};
type Transport = (url:string,init:RequestInit)=>Promise<Pick<Response,'ok'|'status'>>;

/** A webhook acknowledgement is not a provider success. Only a verified receipt completes an action. */
export class ZapierBridge {
 private busy=false;
 constructor(readonly engine:Engine,readonly config:BridgeConfig,private transport:Transport=fetch){
  if(engine.mode!=='connected')throw new Error('Connected mode requires its own database.');
  const base=new URL(config.callbackBaseUrl);
  if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash)throw new Error('Callback base must be a public HTTPS origin/path without credentials, query or fragment.');
  if(config.receiptToken.length<32)throw new Error('Receipt token must contain at least 32 characters.');
  for(const url of Object.values(config.hooks).filter(Boolean)){
   const hook=new URL(url!);
   if(hook.protocol!=='https:'||hook.hostname!=='hooks.zapier.com'||!hook.pathname.startsWith('/hooks/catch/')||hook.username||hook.password||hook.search||hook.hash)throw new Error('Only Zapier Catch Hook HTTPS URLs are accepted.');
  }
 }
 private fail(a:Action,message:string,uncertain:boolean,retry=false){
  a.lastError=message;a.uncertain=uncertain;delete a.receiptDeadline;
  if(retry&&a.attempts<a.maxAttempts){a.status='retrying';a.nextAttemptAt=new Date(this.engine.clock().getTime()+2000*2**(a.attempts-1)).toISOString();}
  else {a.status='failed';a.nextAttemptAt=null;this.engine.put('exceptions',{id:`action:${a.id}`,orderId:a.orderId,kind:uncertain?'reconciliation':'integration',message,status:'open',createdAt:this.engine.now(),actionId:a.id} as Exception);}
  this.engine.put('actions',a);this.engine.log(a.orderId,'action.'+a.status,message);
 }
 payload(a:Action){
  const order=a.orderId?this.engine.get<Order>('orders',a.orderId):undefined;
  const status=String(a.payload.status??order?.status??'pending');
  const tracking=order?.shipments.map(s=>`${s.carrier}: ${s.trackingNumber}`).join('\n')??'';
  return {action_id:a.id,attempt:a.attempts,action_type:a.type,order_id:a.orderId??'',
   customer:order?.customer??'',email:order?.email??'',total:order?.total??0,status,clickup_status:status==='delivered'?'complete':'to do',
   task_id:order?.taskId??'',task_name:`[${a.orderId}] Fulfillment — ${order?.customer??'Demo'}`,
   task_description:`Synthetic portfolio order.\nOrder: ${a.orderId}\nStatus: ${status}\nPackages:\n${tracking}\nAction: ${a.id}`,
   tracking_summary:tracking,
   message:a.type==='daily_digest'?`Parcel demo daily summary: ${a.payload.orders} orders · ${a.payload.active} active · ${a.payload.exceptions} open exceptions.`:`[DEMO] ${a.orderId}: ${status.replaceAll('_',' ')}${a.payload.shipment?` · ${a.payload.shipment}`:''}. Action ${a.id}`,
   // Configure as Authorization header in the final Zap step, never in a URL.
   callback_url:new URL('api/integrations/receipt',this.config.callbackBaseUrl.replace(/\/?$/,'/')).href,
   callback_authorization:`Bearer ${this.config.receiptToken}`};
 }
 async tick(){
  if(this.busy)return {processed:0};this.busy=true;let processed=0;
  try{
   for(const original of this.engine.all<Action>('actions').reverse()){
    const a=this.engine.get<Action>('actions',original.id)!;
    if(a.status==='awaiting_receipt'){
     if(a.receiptDeadline&&a.receiptDeadline<=this.engine.now())this.engine.transaction(()=>this.fail(a,'Receipt deadline elapsed. Reconcile external outcome; no automatic resend.',true));
     continue;
    }
    if(!['pending','retrying'].includes(a.status)||(a.nextAttemptAt&&a.nextAttemptAt>this.engine.now()))continue;
    // Preserve per-order external action order; a failed predecessor blocks later changes.
    if(a.orderId){const sequence=this.engine.all<Action>('actions').reverse();const position=sequence.findIndex(x=>x.id===a.id);if(sequence.slice(0,position).some(x=>x.orderId===a.orderId&&x.status!=='succeeded'))continue;}
    const hook=this.config.hooks[a.type];
    if(!hook){this.engine.transaction(()=>this.fail(a,'Zapier hook is not configured for this action.',false));continue;}
    if(a.type==='update_task'&&(!this.engine.get<Order>('orders',a.orderId!)?.taskId||this.engine.get<Order>('orders',a.orderId!)?.taskId?.startsWith('SIM-'))){this.engine.transaction(()=>this.fail(a,'A verified external ClickUp task ID is required.',false));continue;}
    // Persist BEFORE network I/O, including before a process crash. Never hold SQLite transactions across awaits.
    this.engine.transaction(()=>{a.attempts++;a.status='awaiting_receipt';a.nextAttemptAt=null;a.receiptDeadline=new Date(this.engine.clock().getTime()+(this.config.receiptTimeoutMs??120000)).toISOString();this.engine.put('actions',a);this.engine.log(a.orderId,'action.dispatched','Submitted to Zapier; waiting for verified provider receipt.');});
    processed++;
    try{
     const result=await this.transport(hook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(this.payload(a)),signal:AbortSignal.timeout(10000),redirect:'error'});
     const current=this.engine.get<Action>('actions',a.id)!;
     if(current.status!=='awaiting_receipt')continue; // Receipt can arrive while HTTP request is pending.
     if(!result.ok)this.engine.transaction(()=>this.fail(current,`Zapier ingress returned HTTP ${result.status}.`,result.status>=500||result.status===408,result.status===429));
    }catch{const current=this.engine.get<Action>('actions',a.id)!;if(current.status==='awaiting_receipt')this.engine.transaction(()=>this.fail(current,'Dispatch outcome is uncertain after a network failure. Reconcile before resending.',true));}
   }
   return {processed};
  }finally{this.busy=false;}
 }
 receipt(raw:unknown){
  const receipt=receiptSchema.parse(raw);
  return this.engine.transaction(()=>{
   const a=this.engine.get<Action>('actions',receipt.action_id);if(!a)throw new DomainError(404,'Action not found.');
   if(a.attempts!==receipt.attempt)throw new DomainError(409,'Receipt attempt does not match dispatched attempt.');
   const prior=this.engine.get<{id:string;receipt:unknown}>('provider_records',a.id);
   if(prior){if(JSON.stringify(prior.receipt)!==JSON.stringify(receipt))throw new DomainError(409,'Conflicting receipt.');return {accepted:false,reason:'duplicate receipt'};}
   if(a.status!=='awaiting_receipt'&&!(a.status==='failed'&&a.uncertain))throw new DomainError(409,'Action is not awaiting reconciliation.');
   if(receipt.outcome==='failed'){
    // Only an explicit rate-limit failure receipt authorizes automatic resend.
    this.fail(a,`Zapier reported ${receipt.error_code??'provider_failure'}.`,receipt.error_code==='provider_failure'||!receipt.error_code,receipt.error_code==='rate_limit');
    return {accepted:true};
   }
   if(a.type==='create_task'){
    if(!receipt.task_id||receipt.task_id.startsWith('SIM-'))throw new DomainError(400,'A real task ID is required for task creation receipts.');
    const order=this.engine.get<Order>('orders',a.orderId!)!;
    if(order.taskId&&order.taskId!==receipt.task_id)throw new DomainError(409,'Order already has a different external task.');
    order.taskId=receipt.task_id;this.engine.put('orders',order);
   }
   a.status='succeeded';a.lastError=null;a.uncertain=false;a.nextAttemptAt=null;a.completedAt=this.engine.now();delete a.receiptDeadline;
   this.engine.put('actions',a);this.engine.put('provider_records',{id:a.id,receipt,completedAt:this.engine.now()});
   const exception=this.engine.get<Exception>('exceptions',`action:${a.id}`);if(exception){exception.status='resolved';this.engine.put('exceptions',exception);}
   this.engine.log(a.orderId,'action.succeeded',`${a.type} verified by Zapier execution receipt (attempt ${a.attempts}).`);
   return {accepted:true};
  });
 }
 overview(){
  const state=this.engine.overview();
  return {...state,mode:'connected',integrations:[
   {name:'Zapier',status:'configured',description:'HTTP acceptance stays awaiting receipt. Successful actions require an authenticated execution receipt.'},
   {name:'ClickUp',status:this.config.hooks.create_task&&this.config.hooks.update_task?'configured':'incomplete',description:'Zapier creates and updates tasks in the dedicated demo list. Confirm receipts and task results.'},
   {name:'AfterShip',status:'simulated',description:'Synthetic shipment events only; no live carrier tracking.'},
   {name:'Slack',status:this.config.hooks.notify&&this.config.hooks.daily_digest?'configured':'incomplete',description:'Zapier sends synthetic order alerts and summaries to the dedicated demo channel.'}]};
 }
}
