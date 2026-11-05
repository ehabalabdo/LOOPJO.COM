const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { z } = require('zod');
const BASE = 'https://www.loopjo.com';
const annotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: true };
async function readPublic(path, fetcher) {
  const response = await fetcher(BASE + path, { redirect: 'error', signal: AbortSignal.timeout(10000) });
  if (!response.ok) throw new Error('Public source unavailable');
  const text = await response.text();
  if (text.length > 1000000) throw new Error('Source too large');
  return text;
}
function parseServices(text) {
  const section = text.split('## Core services')[1]?.split('\n## ')[0] || '';
  return [...section.matchAll(/^- \[([^\]]+)\]\((https:\/\/www\.loopjo\.com\/([a-z0-9-]+))\): (.+)$/gm)]
    .map(([, name, url, id, summary]) => ({ id, name, summary, url }));
}
const aliases = {
  'social-media-jordan': 'سوشال سوشيال تواصل محتوى social media instagram facebook',
  'google-ads-jordan': 'جوجل غوغل اعلان إعلانات google ads',
  'web-design-jordan': 'موقع مواقع متجر website ecommerce',
  'digital-marketing-jordan': 'تسويق رقمي marketing seo',
  'branding-agency-jordan': 'هوية شعار براند branding logo',
  'mobile-app-development-jordan': 'تطبيق تطبيقات جوال mobile apps',
  'custom-software-jordan': 'برمجيات نظام أنظمة crm software',
  'video-production-jordan': 'فيديو ريلز تصوير موشن video reels',
  'event-management-jordan': 'فعاليات فعالية تفعيل events'
};
function createServer(fetcher = fetch) {
  const server = new McpServer({ name: 'loopjo-public-services', version: '0.3.0' });
  const wrap = fn => async args => {
    try { return { content: [{ type: 'text', text: JSON.stringify(await fn(args)) }] }; }
    catch { return { isError: true, content: [{ type: 'text', text: 'تعذّر قراءة المصدر العام. حاول لاحقًا أو تواصل مع Loop عبر الموقع. Unable to read the public source.' }] }; }
  };
  const catalog = async () => {
    // Only the reviewed service catalog is exposed; never scrape whole pages or contacts.
    const { services } = JSON.parse(await readPublic('/data/loopjo-services.json', fetcher));
    const text = z.string().trim().min(1).max(1500).refine(value =>
      !/[\w.+-]+@[\w.-]+\.[a-z]{2,}|(?:\+?\d[\d ()-]{7,}\d)|https?:\/\/|wa\.me\//i.test(value));
    const schema = z.array(z.object({
      id: z.enum(Object.keys(aliases)), name: text, summary: text,
      url: z.string(), offerings: z.array(z.object({title: text, description: text})).min(1).max(12)
    })).min(1).max(9);
    const safe = schema.parse(services);
    if (new Set(safe.map(s => s.id)).size !== safe.length) throw new Error('Duplicate service');
    return safe.map(s => ({...s, url: BASE + '/' + s.id}));
  };
  server.registerTool('search_services', {
    description: 'Search Loop public services in Arabic or English. Omit query to list services. Returns official source links.',
    inputSchema: { query: z.string().trim().max(160).optional() }, annotations
  }, wrap(async ({ query = '' }) => {
    const tokens = query.toLowerCase().split(/\s+/).filter(Boolean);
    const services = await catalog();
    return { services: services.filter(s => !tokens.length || tokens.some(t => `${s.name} ${s.summary} ${aliases[s.id] || ''}`.toLowerCase().includes(t))).map(({id,name,summary,url})=>({id,name,summary,url})) };
  }));
  server.registerTool('get_service_details', {
    description: 'Return only the requested service scope from the reviewed public service catalog. Use the exact service_id returned by search_services. No contact details, staff profiles or customer records are returned.',
    inputSchema: { service_id: z.string().regex(/^[a-z0-9-]{1,100}$/) }, annotations
  }, wrap(async ({ service_id }) => {
    const service = (await catalog()).find(s => s.id === service_id);
    if (!service) return { found: false, message: 'Unknown service. Search services first.' };
    const content = service.offerings.map(o=>o.title+': '+o.description).join('\n');
    return { id:service.id, name:service.name, summary:service.summary, url:service.url, content,
      notice: 'Service scope only. Confirm current prices and timing with Loop. No binding quote is provided.' };
  }));
  server.registerTool('get_contact_details', {
    description: 'Only when the user asks how to contact Loop, return the official contact page URL. Never returns phone numbers, email addresses, personal names, social handles or location details. Does not send inquiries or book calls.',
    inputSchema: {}, annotations
  }, wrap(async () => {
    return { contact_page_url: BASE + '/loopjo#support' };
  }));
  return server;
}
module.exports = { createServer, parseServices };
