import { database, json } from '../../../lib/content';
export const dynamic='force-dynamic';
export async function GET(){try{const {results}=await database().prepare("SELECT * FROM entries WHERE status = 'published' ORDER BY created_at DESC, id DESC").all();return json({entries:results});}catch{ return json({error:'Unable to load content. Please try again later.'},503); }}
