import { env } from 'cloudflare:workers';
export function database() { if (!env.DB) throw new Error('Content storage is unavailable. Please try again later.'); return env.DB; }
export const noCache = {'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export function json(data: unknown, status=200) { return Response.json(data,{status,headers:noCache}); }
export function isAdmin(request: Request) {
 const allowed = (env as unknown as {ADMIN_EMAIL?:string}).ADMIN_EMAIL;
 return !!allowed && !!request.headers.get('oai-authenticated-user-id') && request.headers.get('oai-authenticated-user-email')?.toLowerCase() === allowed.toLowerCase();
}
export function validOrigin(request: Request) {
 const origin=request.headers.get('origin');
 return !!origin && origin === new URL(request.url).origin && request.headers.get('content-type')?.split(';')[0] === 'application/json';
}
export function validateEntry(raw: Record<string,unknown>) {
 const value: Record<string,string>={};
 const fields: Record<string,number>={title:160,summary:500,body:20000,event_date:10,link:2000,image:2000};
 for (const [key,max] of Object.entries(fields)) {
  if(raw[key]!==undefined&&typeof raw[key]!=='string')throw new Error(`Invalid ${key}.`);
  value[key]=String(raw[key]??'').trim();
  if(value[key].length>max)throw new Error(`${key} is too long (maximum ${max} characters).`);
 }
 for(const key of ['kind','category','status'])value[key]=String(raw[key]??'');
 if(!['post','event'].includes(value.kind))throw new Error('Choose Post or Event.');
 if(!['draft','published'].includes(value.status))throw new Error('Choose Draft or Published.');
 if(!['knowledge','education','national','international'].includes(value.category))throw new Error('Choose a valid category.');
 if(!value.title||!value.summary)throw new Error('Title and summary are required.');
 if(value.kind==='event'&&!/^\d{4}-\d{2}-\d{2}$/.test(value.event_date))throw new Error('An event date is required.');
 if(value.event_date){const date=new Date(value.event_date+'T00:00:00Z');if(isNaN(date.getTime())||date.toISOString().slice(0,10)!==value.event_date)throw new Error('Choose a valid date.');}
 for(const key of ['link','image'])if(value[key]){let url;try{url=new URL(value[key])}catch{throw new Error(`Enter a full HTTPS ${key} URL.`)}if(url.protocol!=='https:'||url.username||url.password)throw new Error(`${key} must be an HTTPS URL without credentials.`);}
 return value;
}
