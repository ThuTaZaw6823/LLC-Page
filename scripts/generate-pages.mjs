import {readFileSync,writeFileSync} from 'node:fs';
for(const name of ['home','admin'])writeFileSync(`lib/${name}-html.ts`,`// Generated from content/${name}.html by scripts/generate-pages.mjs\nexport const ${name}Html = ${JSON.stringify(readFileSync(`content/${name}.html`,'utf8'))};\n`);
