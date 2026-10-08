export const scenes=[
 {id:'intro',seconds:10,title:'Orders in. Fulfillment in focus.',caption:'A personal automation project. Synthetic orders and tracking events.',kind:'intro'},
 {id:'overview',seconds:12,title:'One operations workspace.',caption:'The actual app interface, rendered from an offline domain replay.',kind:'ui',snapshot:'overview'},
 {id:'intake',seconds:14,title:'Two packages. One order.',caption:'CSV rows are validated and grouped before fulfillment begins.',kind:'ui',snapshot:'overview',modal:'import'},
 {id:'partial',seconds:16,title:'Partial delivery stays partial.',caption:'The first package arrives. The second package is still outstanding.',kind:'ui',snapshot:'partial',orderId:'PORTFOLIO-2001'},
 {id:'complete',seconds:14,title:'Complete only when all arrive.',caption:'The same aggregation rule drives the order and downstream task update.',kind:'ui',snapshot:'complete',orderId:'PORTFOLIO-2001'},
 {id:'reliability',seconds:12,title:'Repeats do not create more work.',caption:'Replay checks reject duplicate and stale events without adding actions.',kind:'ui',snapshot:'reliability',view:'activity'},
 {id:'clickup',seconds:14,title:'Verified in ClickUp.',caption:'Captured Oct 8, 2026 · The matching real task reached COMPLETE.',kind:'evidence',image:'clickup-portfolio-complete.jpg'},
 {id:'slack',seconds:14,title:'Verified in Slack.',caption:'Captured Oct 8, 2026 · Partial and delivered notifications reached the demo channel.',kind:'evidence',image:'slack-portfolio-connected.jpg'},
 {id:'outro',seconds:14,title:'Built to inspect, retry and maintain.',caption:'React · TypeScript · Fastify · SQLite · Zapier · ClickUp · Slack',kind:'outro'},
] as const;
export const duration=scenes.reduce((sum,scene)=>sum+scene.seconds*30,0);
