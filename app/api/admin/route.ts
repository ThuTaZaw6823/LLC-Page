import { database, isAdmin, validOrigin, validateEntry, json } from '../../../lib/content';
export const dynamic='force-dynamic';
export async function GET(request:Request){
 if(!isAdmin(request))return json({error:'Only the authorized site owner can use this dashboard.'},403);
 try {const {results}=await database().prepare('SELECT * FROM entries ORDER BY updated_at DESC, id DESC').all();return json({entries:results});}
 catch{return json({error:'Content storage is unavailable. Please try again later.'},503);}
}
export async function POST(request:Request){
 if(!isAdmin(request))return json({error:'Only the authorized site owner can change content.'},403);
 if(!validOrigin(request))return json({error:'Invalid request origin or content type.'},403);
 let raw;try{const text=await request.text();if(text.length>35000)return json({error:'Content is too large.'},413);raw=JSON.parse(text);if(!raw||typeof raw!=='object'||Array.isArray(raw))throw new Error();}catch{return json({error:'Invalid request.'},400);}
 try{
  const db=database();
  if(raw.action==='delete'){
   if(typeof raw.id!=='string'||!/^[a-f0-9-]{36}$/.test(raw.id))return json({error:'Invalid entry ID.'},400);
   const result=await db.prepare('DELETE FROM entries WHERE id = ?').bind(raw.id).run();
   return result.meta.changes?json({ok:true}):json({error:'This entry no longer exists.'},404);
  }
  if(raw.action!=='save')return json({error:'Invalid action.'},400);
  let v;try{v=validateEntry(raw)}catch(e){return json({error:(e as Error).message},400)}
  const now=new Date().toISOString();
  let id=raw.id;
  if(id){
   if(typeof id!=='string'||!/^[a-f0-9-]{36}$/.test(id))return json({error:'Invalid entry ID.'},400);
   if(typeof raw.updated_at!=='string')return json({error:'Reload the entry before saving.'},400);
   const result=await db.prepare('UPDATE entries SET kind=?,title=?,summary=?,body=?,category=?,status=?,event_date=?,link=?,image=?,updated_at=? WHERE id=? AND updated_at=?').bind(v.kind,v.title,v.summary,v.body,v.category,v.status,v.event_date,v.link,v.image,now,id,raw.updated_at).run();
   if(!result.meta.changes)return json({error:'This entry changed in another tab or was removed. Refresh the list and reopen it before saving.'},409);
  } else {
   id=crypto.randomUUID();
   await db.prepare('INSERT INTO entries (id,kind,title,summary,body,category,status,event_date,link,image,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,v.kind,v.title,v.summary,v.body,v.category,v.status,v.event_date,v.link,v.image,now,now).run();
  }
  return json({ok:true,id});
 }catch{return json({error:'The change could not be saved. Your form has been kept; please try again.'},503);}
}
