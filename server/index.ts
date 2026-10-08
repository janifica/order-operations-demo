import { mkdirSync,existsSync } from 'node:fs';
import { dirname,resolve } from 'node:path';
import staticFiles from '@fastify/static';
import { Engine } from './engine.js';
import { makeApp } from './app.js';
import { ZapierBridge } from './bridge.js';
const mode=process.env.EXECUTION_MODE==='connected'?'connected':'simulation';
const host=process.env.HOST??'127.0.0.1';
const accessPassword=process.env.DEMO_ACCESS_PASSWORD;
const receiptToken=process.env.ZAPIER_RECEIPT_TOKEN;
if(!['simulation','connected'].includes(process.env.EXECUTION_MODE??'simulation'))throw new Error('Invalid EXECUTION_MODE.');
if(mode==='connected'&&(!accessPassword||accessPassword.length<16))throw new Error('Connected mode requires a demo access password of at least 16 characters.');
if(!['127.0.0.1','localhost','::1'].includes(host)&&(!accessPassword||accessPassword.length<16))throw new Error('Public binding requires a demo access password of at least 16 characters.');
if(mode==='connected'&&!process.env.DATABASE_PATH)throw new Error('Connected mode requires an explicit dedicated DATABASE_PATH.');
const dbPath=resolve(process.env.DATABASE_PATH??'workspace/orders.sqlite');mkdirSync(dirname(dbPath),{recursive:true});
const engine=new Engine(dbPath,()=>new Date(),mode);
if(mode==='connected'&&engine.all<{taskId?:string}>('orders').some(o=>o.taskId?.startsWith('SIM-')))throw new Error('Use a separate database for connected mode; simulated task IDs cannot be reused.');
const bridge=mode==='connected'?new ZapierBridge(engine,{hooks:{create_task:process.env.ZAPIER_CREATE_TASK_HOOK,update_task:process.env.ZAPIER_UPDATE_TASK_HOOK,notify:process.env.ZAPIER_NOTIFY_HOOK,daily_digest:process.env.ZAPIER_DIGEST_HOOK},callbackBaseUrl:process.env.PUBLIC_BASE_URL??'',receiptToken:receiptToken??''}):undefined;
const app=makeApp(engine,{bridge,accessPassword,receiptToken,publicOrigin:process.env.PUBLIC_BASE_URL?new URL(process.env.PUBLIC_BASE_URL).origin:undefined});
if(mode==='simulation'){engine.seed();engine.process();}
if(existsSync(resolve('dist'))){await app.register(staticFiles,{root:resolve('dist')});app.setNotFoundHandler((request,reply)=>request.url.startsWith('/api/')?reply.code(404).send({error:'API route not found.'}):reply.sendFile('index.html'));}
const worker=setInterval(()=>{void Promise.resolve().then(()=>bridge?bridge.tick():engine.process()).catch(()=>console.error('Queue worker failed. Inspect the operation console.'));},1000);
app.addHook('onClose',()=>{clearInterval(worker);engine.close();});
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>void app.close());
await app.listen({host,port:Number(process.env.PORT??4310)});
console.log(`Order operations demo listening on port ${process.env.PORT??4310} (${mode}; synthetic logistics)`);
