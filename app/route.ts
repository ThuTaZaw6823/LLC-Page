import { homeHtml } from '../lib/home-html';
export function GET(){return new Response(homeHtml,{headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
