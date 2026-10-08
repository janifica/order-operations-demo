export const fps=30;
export const scenes=[
 {id:'intro',seconds:8,title:'CSV → ClickUp → Slack.',caption:'Two-package fulfillment automation. Personal project with synthetic logistics.',kind:'intro'},
 {id:'clickup',seconds:8,title:'ClickUp. Confirmed.',caption:'Dated real test evidence: matching task COMPLETE. Not a new execution.',kind:'evidence',image:'clickup-portfolio-complete.jpg'},
 {id:'slack',seconds:8,title:'Slack. Delivered.',caption:'Dated real test evidence: partial and complete delivery messages.',kind:'evidence',image:'slack-portfolio-connected.jpg'},
 {id:'overview',seconds:8,title:'One clear workspace.',caption:'Offline replay of the actual app and domain engine.',kind:'ui',snapshot:'overview'},
 {id:'intake',seconds:12,title:'Two rows. One order.',caption:'Validate and group a synthetic CSV into one two-package order.',kind:'ui',snapshot:'overview',modal:'import'},
 {id:'partial',seconds:12,title:'One down. One to go.',caption:'One delivered package keeps the order partially delivered.',kind:'ui',snapshot:'partial',orderId:'PORTFOLIO-2001'},
 {id:'complete',seconds:10,title:'Every package counts.',caption:'All packages must arrive before the order is complete.',kind:'ui',snapshot:'complete',orderId:'PORTFOLIO-2001'},
 {id:'reliability',seconds:12,title:'Duplicates stop here.',caption:'Duplicate and older events add no extra provider actions.',kind:'ui',snapshot:'reliability',view:'activity'},
 {id:'outro',seconds:12,title:'Start with one test order.',caption:'Scope a pilot using a sample CSV and a demo workspace; verify results before production.',kind:'outro'},
] as const;
export const duration=scenes.reduce((sum,scene)=>sum+scene.seconds*fps,0);
