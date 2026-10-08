import Fastify from 'fastify';
import { z } from 'zod';
import { timingSafeEqual } from 'node:crypto';
import type { ZapierBridge } from './bridge.js';
import { Engine, DomainError, type Order, type Log, type Action } from './engine.js';
export function makeApp(engine:Engine,options:{bridge?:ZapierBridge;accessPassword?:string;receiptToken?:string;publicOrigin?:string}={}){
 const app=Fastify({logger:false,bodyLimit:1_100_000});
 const equal=(a:string,b:string)=>{const left=Buffer.from(a),right=Buffer.from(b);return left.length===right.length&&timingSafeEqual(left,right);};
 app.addHook('onRequest',async(req,reply)=>{
  const path=req.url.split('?')[0];
  if(path==='/health')return;
  if(path==='/api/integrations/receipt'){
   if(!options.bridge||!options.receiptToken||!equal(req.headers.authorization??'',`Bearer ${options.receiptToken}`))return reply.code(401).send({error:'Receipt authorization required.'});
   return;
  }
  if(options.accessPassword){
   const auth=req.headers.authorization??'';const value=auth.startsWith('Basic ')?Buffer.from(auth.slice(6),'base64').toString():'';
   if(!equal(value,`demo:${options.accessPassword}`))return reply.header('WWW-Authenticate','Basic realm="Parcel portfolio"').code(401).send({error:'Demo access required.'});
   if(!['GET','HEAD','OPTIONS'].includes(req.method)){
    const origin=req.headers.origin;if(origin&&origin!==(options.publicOrigin??`${req.protocol}://${req.headers.host}`))return reply.code(403).send({error:'Cross-origin writes are not allowed.'});
    if(req.headers['sec-fetch-site']==='cross-site')return reply.code(403).send({error:'Cross-site writes are not allowed.'});
   }
  }
 });
 app.setErrorHandler((err,req,reply)=>{if(err instanceof z.ZodError)return reply.code(400).send({error:'Invalid input.',details:err.issues});if(err instanceof DomainError)return reply.code(err.status).send({error:err.message});const status=(err as any).statusCode;if(status&&status<500)return reply.code(status).send({error:(err as Error).message});app.log.error(err);return reply.code(500).send({error:'Internal error. Check local server logs.'});});
 app.get('/health',()=>({status:'ok'}));
 app.get('/api/overview',()=>options.bridge?options.bridge.overview():engine.overview());
 app.post('/api/integrations/receipt',req=>options.bridge!.receipt(req.body));
 app.get<{Params:{id:string}}>('/api/orders/:id',req=>{const order=engine.get<Order>('orders',req.params.id);if(!order)throw new DomainError(404,'Order not found.');const {inputKey,...safe}=order;return {order:safe,logs:engine.all<Log>('logs').filter(l=>l.orderId===order.id),actions:engine.all<Action>('actions').filter(a=>a.orderId===order.id)};});
 app.post('/api/orders',req=>{const result=engine.addOrder(req.body);const {inputKey,...safe}=result.order;return {...result,order:safe};});
 app.post('/api/import',req=>engine.importCsv(z.object({csv:z.string()}).parse(req.body).csv));
 app.post('/api/events',req=>engine.applyEvent(req.body));
 app.post('/api/demo/seed',()=>engine.seed());
 app.post('/api/demo/scenario',req=>engine.scenario(z.object({scenario:z.string()}).parse(req.body).scenario));
 app.post('/api/actions/process',()=>options.bridge?options.bridge.tick():engine.process());
 app.post<{Params:{id:string}}>('/api/actions/:id/replay',req=>engine.replay(req.params.id));
 app.post('/api/digest',()=>engine.digest());return app;
}
