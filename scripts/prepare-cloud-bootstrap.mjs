import {readFileSync,writeFileSync,readdirSync,mkdirSync} from 'node:fs';
const root='supabase/migrations';const files=readdirSync(root).filter(f=>f.endsWith('.sql')).sort();
const sql='-- DEWS empty-project bootstrap. No seed data or account credentials.\nBEGIN;\n'+files.map(f=>'-- '+f+'\n'+readFileSync(root+'/'+f,'utf8').replace(/^\uFEFF/, '')).join('\n')+`\nCOMMIT;\nSELECT tablename, rowsecurity FROM pg_tables WHERE schemaname='public' ORDER BY tablename;\n`;
mkdirSync('.local',{recursive:true});writeFileSync('.local/cloud-bootstrap.sql',sql);console.log('Prepared '+files.length+' migrations, '+Buffer.byteLength(sql)+' bytes');
