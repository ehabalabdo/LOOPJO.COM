const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { InMemoryTransport } = require('@modelcontextprotocol/sdk/inMemory.js');
const { createServer } = require('../lib/loop-mcp.cjs');
async function session(fetcher) {
  const [a,b] = InMemoryTransport.createLinkedPair();
  const server = createServer(fetcher);
  const client = new Client({name:'test',version:'1.0.0'});
  await server.connect(a); await client.connect(b);
  return {client, close:async()=>{await client.close(); await server.close();}};
}
const index = readFileSync('llms.txt','utf8');
test('catalog, Arabic search, detail allowlist, contacts, validation and outages',async()=>{
  const urls=[];
  const s=await session(async url=>{urls.push(url);return {ok:true,text:async()=>url.endsWith('llms.txt')?index:'<main><h1>Service details</h1><p>Published scope</p><script>secret script</script></main>'};});
  try {
    const tools=await s.client.listTools(); assert.equal(tools.tools.length,3);
    for(const t of tools.tools) assert.equal(t.annotations.readOnlyHint,true);
    const call=async(name,args={})=>s.client.callTool({name,arguments:args});
    const data=r=>JSON.parse(r.content[0].text);
    assert.equal(data(await call('search_services')).services.length,9);
    assert.ok(data(await call('search_services',{query:'سوشال'})).services.some(x=>x.id==='social-media-jordan'));
    assert.equal(data(await call('search_services',{query:'spaceship'})).services.length,0);
    const detail=data(await call('get_service_details',{service_id:'social-media-jordan'}));
    assert.match(detail.content,/Published scope/); assert.doesNotMatch(detail.content,/secret script/);
    const count=urls.length;
    assert.equal(data(await call('get_service_details',{service_id:'calendar'})).found,false);
    assert.equal(urls.length,count+1); // Only the public catalog, never the unknown page.
    assert.equal((await call('get_service_details',{service_id:'../calendar'})).isError,true);
    assert.match(data(await call('get_contact_details')).contact,/Info@loopjo.com/);
    assert.equal(data(await call('get_contact_details')).sends_requests,false);
  } finally {await s.close();}
  const broken=await session(async()=>{throw Error('offline');});
  try {assert.equal((await broken.client.callTool({name:'search_services',arguments:{}})).isError,true);}
  finally {await broken.close();}
});
test('HTTP transport supports initialize, tool listing and origin protection',async()=>{
  const express=require('express');
  const handler=require('../api/mcp.js');
  const app=express(); app.use(express.json()); app.all('/api/mcp',handler);
  const listener=app.listen(0,'127.0.0.1'); await new Promise(r=>listener.once('listening',r));
  const url=`http://127.0.0.1:${listener.address().port}/api/mcp`;
  const headers={'Content-Type':'application/json',Accept:'application/json, text/event-stream'};
  try {
    const init=await fetch(url,{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-03-26',capabilities:{},clientInfo:{name:'test',version:'1'}}})});
    assert.equal(init.status,200); assert.equal((await init.json()).result.serverInfo.name,'loopjo-public-services');
    const list=await fetch(url,{method:'POST',headers,body:JSON.stringify({jsonrpc:'2.0',id:2,method:'tools/list',params:{}})});
    assert.equal((await list.json()).result.tools.length,3);
    assert.equal((await fetch(url)).status,405);
    assert.equal((await fetch(url,{method:'POST',headers:{...headers,Origin:'https://untrusted.example'},body:'{}'})).status,403);
  } finally {await new Promise(r=>listener.close(r));}
});
