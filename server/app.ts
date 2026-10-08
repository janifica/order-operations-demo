import Fastify from 'fastify';
import { z } from 'zod';
import { Engine, DomainError, type Order, type Log, type Action } from './engine.js';
export function makeApp(engine:Engine){
 const app=Fastify({logger:false,bodyLimit:1_100_000});
 app.setErrorHandler((err,req,reply)=>{if(err instanceof z.ZodError)return reply.code(400).send({error:'Invalid input.',details:err.issues});if(err instanceof DomainError)return reply.code(err.status).send({error:err.message});const status=(err as any).statusCode;if(status&&status<500)return reply.code(status).send({error:(err as Error).message});app.log.error(err);return reply.code(500).send({error:'Internal error. Check local server logs.'});});
 app.get('/api/overview',()=>engine.overview());
 app.get<{Params:{id:string}}>('/api/orders/:id',req=>{const order=engine.get<Order>('orders',req.params.id);if(!order)throw new DomainError(404,'Order not found.');const {inputKey,...safe}=order;return {order:safe,logs:engine.all<Log>('logs').filter(l=>l.orderId===order.id),actions:engine.all<Action>('actions').filter(a=>a.orderId===order.id)};});
 app.post('/api/orders',req=>{const result=engine.addOrder(req.body);const {inputKey,...safe}=result.order;return {...result,order:safe};});
 app.post('/api/import',req=>engine.importCsv(z.object({csv:z.string()}).parse(req.body).csv));
 app.post('/api/events',req=>engine.applyEvent(req.body));
 app.post('/api/demo/seed',()=>engine.seed());
 app.post('/api/demo/scenario',req=>engine.scenario(z.object({scenario:z.string()}).parse(req.body).scenario));
 app.post('/api/actions/process',()=>engine.process());
 app.post<{Params:{id:string}}>('/api/actions/:id/replay',req=>engine.replay(req.params.id));
 app.post('/api/digest',()=>engine.digest());return app;
}
