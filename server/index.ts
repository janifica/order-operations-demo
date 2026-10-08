import { mkdirSync,existsSync } from 'node:fs';
import { dirname,resolve } from 'node:path';
import staticFiles from '@fastify/static';
import { Engine } from './engine.js';
import { makeApp } from './app.js';
const dbPath=resolve(process.env.DATABASE_PATH??'workspace/orders.sqlite');mkdirSync(dirname(dbPath),{recursive:true});
const engine=new Engine(dbPath);const app=makeApp(engine);
engine.seed();engine.process();
if(existsSync(resolve('dist'))){await app.register(staticFiles,{root:resolve('dist')});app.setNotFoundHandler((request,reply)=>request.url.startsWith('/api/')?reply.code(404).send({error:'API route not found.'}):reply.sendFile('index.html'));}
const worker=setInterval(()=>{try{engine.process();}catch(error){console.error('Local queue worker failed:',error);}},1000);
app.addHook('onClose',()=>{clearInterval(worker);engine.close();});
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>void app.close());
await app.listen({host:'127.0.0.1',port:Number(process.env.PORT??4310)});
console.log(`Order operations demo: http://127.0.0.1:${process.env.PORT??4310} (simulation only)`);
