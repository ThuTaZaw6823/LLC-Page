import { adminHtml } from '../../lib/admin-html';
import { isAdmin, noCache } from '../../lib/content';
export const dynamic='force-dynamic';
export function GET(request:Request){
 if(!request.headers.get('oai-authenticated-user-id'))return Response.redirect(new URL('/signin-with-chatgpt?return_to=%2Fadmin',request.url),302);
 if(!isAdmin(request))return new Response('<!doctype html><html lang="en"><title>Access restricted</title><body><h1>Access restricted</h1><p>This dashboard is available only to the authorized site owner.</p><a href="/">Return to website</a></body></html>',{status:403,headers:{...noCache,'Content-Type':'text/html; charset=utf-8'}});
 return new Response(adminHtml,{headers:{...noCache,'Content-Type':'text/html; charset=utf-8','Content-Security-Policy':"default-src 'self'; img-src 'self' https:; style-src 'self'; script-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"}});
}
