// Static development server. This is NOT authentication or a production data backend.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root=resolve('src');
const mime={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png'};
createServer(async(req,res)=>{
  try {
    const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    const file=resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
    if(!file.startsWith(root+sep)) {res.writeHead(403);return res.end('Forbidden');}
    const body=await readFile(file);
    res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':'no-store'});res.end(body);
  } catch {res.writeHead(404);res.end('Not found');}
}).listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('SFMDP preview on port '+(process.env.PORT||3000)));
