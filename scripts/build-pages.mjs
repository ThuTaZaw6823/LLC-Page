import {readFileSync,writeFileSync,mkdirSync,cpSync} from 'node:fs';
const backend='https://lavender-language-center-draft.thutazawjohan.chatgpt.site';
const destination='pages';
mkdirSync(destination,{recursive:true});
let html=readFileSync('content/home.html','utf8');
// Project Pages serves from /LLC-Page/, so local assets must be relative.
html=html.replace(/(src|href)="\/(?!\/)([^"]*)"/g,(_,attr,path)=>`${attr}="${path==='admin'?backend+'/admin':'./'+path}"`);
writeFileSync(`${destination}/index.html`,html);
cpSync('public/style.css',`${destination}/style.css`);
cpSync('public/assets',`${destination}/assets`,{recursive:true});
let script=readFileSync('public/script.js','utf8');
if(!/fetch\(['"]\/api\/content['"]/.test(script))throw new Error('Expected published-content fetch was not found.');
script=script.replace(/fetch\(['"]\/api\/content['"]/,`fetch(${JSON.stringify(backend+'/api/content')}`);
writeFileSync(`${destination}/script.js`,script);
writeFileSync(`${destination}/.nojekyll`,'');
mkdirSync(`${destination}/admin`,{recursive:true});
writeFileSync(`${destination}/admin/index.html`,`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lavender Admin</title><meta http-equiv="refresh" content="0;url=${backend}/admin"><p><a href="${backend}/admin">Open the secure Lavender dashboard</a></p></html>`);
console.log('GitHub Pages frontend prepared. The authenticated dashboard and database remain on the backend.');
