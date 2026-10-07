const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=__dirname;
http.createServer((req,res)=>{
 let file;try{file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));}catch{res.writeHead(400).end();return;}
 if(file===root)file=path.join(root,'index.html');
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 const types={'.html':'text/html; charset=utf-8','.mjs':'application/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.webmanifest':'application/manifest+json'};
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');fs.createReadStream(file).pipe(res);
}).listen(4070,'127.0.0.1',()=>console.log('Tips: http://127.0.0.1:4070/'));
