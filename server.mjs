import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
const root=process.cwd();
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'};
http.createServer(async(req,res)=>{try{let u=new URL(req.url,'http://x'); let p=decodeURIComponent(u.pathname); if(p==='/' ) p='/index.html'; const f=path.join(root,p); if(!f.startsWith(root)) throw 0; await stat(f); const b=await readFile(f); res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream','Cache-Control':'no-store'});res.end(b)}catch(e){res.writeHead(404);res.end('Not found')}}).listen(3002,'0.0.0.0',()=>console.log('Sakura Life running at http://localhost:3002'));
