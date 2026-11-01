import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {createHash} from 'node:crypto';import {fileURLToPath} from 'node:url';import net from 'node:net';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const dotnet=process.env.DDL_DOTNET??'dotnet';const feed=process.env.THEORY_NUGET_SOURCE;
const work=path.join(root,'.tools/upgrade-examples');fs.mkdirSync(work,{recursive:true});
const env={...process.env,DOTNET_CLI_HOME:process.env.DOTNET_CLI_HOME??path.join(work,'cli-home'),NUGET_PACKAGES:process.env.NUGET_PACKAGES??path.join(work,'nuget'),MSBuildEnableWorkloadResolver:'false',DOTNET_CLI_TELEMETRY_OPTOUT:'1',DOTNET_SKIP_FIRST_TIME_EXPERIENCE:'1',DOTNET_NOLOGO:'1',DOTNET_GENERATE_ASPNET_CERTIFICATE:'false',DOTNET_CLI_UI_LANGUAGE:'en-US'};
const execute=(args,cwd,timeout=90000)=>new Promise(resolve=>{const child=spawn(dotnet,args,{cwd,env,windowsHide:true});let out='';child.stdout.on('data',b=>out+=b);child.stderr.on('data',b=>out+=b);const timer=setTimeout(()=>child.kill(),timeout);child.on('error',e=>{clearTimeout(timer);resolve({code:1,out:String(e)});});child.on('close',code=>{clearTimeout(timer);resolve({code,out});});});
const clean=s=>s.replaceAll(root,'$REPO').replace(/\r\n/g,'\n').trim();
const reportFile=path.join(root,'docs/upgrade-example-results.json');
const prior=fs.existsSync(reportFile)?JSON.parse(fs.readFileSync(reportFile,'utf8')).results:[];
const meta=JSON.parse(fs.readFileSync(path.join(root,'client/src/data/theory.json'),'utf8'));
const lessons=meta.lessons.map(l=>JSON.parse(fs.readFileSync(path.join(root,'client/src/data/articles',l.id+'.json'),'utf8')));
const entries=lessons.flatMap(l=>l.sections.flatMap(s=>(s.examples??[]).map(e=>({l,e}))));
const results=[];let cursor=0;
function fileWrite(dir,name,content){const f=path.resolve(dir,name);if(!f.startsWith(dir+path.sep))throw Error('Fixture path escapes');fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,content);}
async function port(){const server=net.createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));const p=server.address().port;await new Promise(r=>server.close(r));return p;}
async function check({l,e}){
 const key=l.id+'/'+e.id,hash=createHash('sha256').update(JSON.stringify({files:e.files,kind:e.kind,expected:e.expected,diagnostic:e.diagnostic,requests:e.requests})).digest('hex');
 const before=prior.find(r=>r.key===key&&r.hash===hash&&!['failed','pending'].includes(r.status)&&(e.kind!=='cli'||r.status==='cli-verified'));if(before){results.push(before);return;}
 let result={key,hash,status:'pending',observed:''};
 if(['repository','test-project','publish','migration'].includes(e.kind)){result.status='lab-check';results.push(result);return;}
 if(e.kind==='illustration'){result.status='illustration';result.observed='Giải thích/lệnh tùy chọn, không tuyên bố đã chạy.';results.push(result);return;}
 const dir=path.resolve(work,l.id,e.id);if(!dir.startsWith(work+path.sep))throw Error('Fixture directory escapes workspace');fs.rmSync(dir,{recursive:true,force:true});fs.mkdirSync(dir,{recursive:true});
 for(const [name,text]of Object.entries(e.files??{}))fileWrite(dir,name,text);
 if(e.kind==='sql'){
  const {DatabaseSync}=await import('node:sqlite');const db=new DatabaseSync(':memory:');db.exec(e.files['schema.sql']);const rows=db.prepare('SELECT Name, Score FROM Students WHERE Score >= 8').all();result.status=rows.length===1&&rows[0].Name==='An'?'sql-verified':'failed';result.observed=JSON.stringify(rows);db.close();results.push(result);return;
 }
 let project=e.entryProject??'Demo.csproj';
 if(e.kind==='cli'&&Object.keys(e.files??{}).length===0){
  for(const args of [['new','console','-n','HelloDotNet','-f','net10.0','--no-restore'],['add','HelloDotNet/HelloDotNet.csproj','package','Microsoft.Extensions.Logging.Abstractions','--version','10.0.14','--no-restore']]){const run=await execute(args,dir);if(run.code!==0)throw Error(run.out);}
  project='HelloDotNet/HelloDotNet.csproj';
 }else if(e.kind==='cli'){
  if(!fs.existsSync(path.join(dir,'Demo.csproj')))fileWrite(dir,'Demo.csproj','<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><TargetFramework>net10.0</TargetFramework><OutputType>Exe</OutputType><ImplicitUsings>enable</ImplicitUsings></PropertyGroup></Project>');
  if(!fs.existsSync(path.join(dir,'Program.cs')))fileWrite(dir,'Program.cs','Console.WriteLine("Hello, World!");');
 }
 if(e.kind==='compile-error'){
  const f=path.join(dir,project);let xml=fs.readFileSync(f,'utf8');if(!xml.includes('<OutputType>'))xml=xml.replace('<PropertyGroup>','<PropertyGroup><OutputType>Exe</OutputType>');fs.writeFileSync(f,xml);
 }
 const build=await execute(['build',project,'--nologo','-v','quiet',...(feed?['--source',feed]:[])],dir);
 if(e.kind==='compile-error'){result.status=build.code!==0&&build.out.includes(e.diagnostic)?'expected-diagnostic':'failed';result.observed=clean(build.out);}
 else if(build.code!==0){result.status='failed';result.observed=clean(build.out);}
 else if(['compile-only','migration-intro'].includes(e.kind)){result.status='compiled';result.observed='Build thành công; không tính là đã chạy.';}
 else if(e.kind==='web'){
  const p=await port();const child=spawn(dotnet,['run','--no-build','--project',project,'--','--urls',`http://127.0.0.1:${p}`],{cwd:dir,env:{...env,ASPNETCORE_ENVIRONMENT:'Development'},windowsHide:true});let logs='';child.stdout.on('data',b=>logs+=b);child.stderr.on('data',b=>logs+=b);
  try{let ready=false;for(let i=0;i<100;i++){try{await fetch(`http://127.0.0.1:${p}/`,{signal:AbortSignal.timeout(300)});ready=true;break;}catch{await new Promise(r=>setTimeout(r,100));}}if(!ready)throw Error('Web fixture not ready '+logs);
   const observed=[];for(const req of e.requests??[]){const response=await fetch(`http://127.0.0.1:${p}${req.path}`,{method:req.method,headers:req.headers,body:req.body?JSON.stringify(req.body):undefined});const body=await response.text();if(response.status!==req.status)throw Error(`Expected ${req.status}, actual ${response.status}: ${body}`);observed.push({method:req.method,path:req.path,status:response.status,body});}result.status='http-verified';result.observed=JSON.stringify(observed);
  }catch(ex){result.status='failed';result.observed=clean(String(ex));}finally{child.kill();}
 }else if(e.kind==='test'){
  const run=await execute(['test',project,'--no-restore','--nologo','-v','minimal'],dir);result.status=run.code===0?'test-verified':'failed';result.observed=clean(run.out);
  if(run.code===0&&e.mutation){const file=path.join(dir,e.mutation.file),source=fs.readFileSync(file,'utf8');fs.writeFileSync(file,source.replace(e.mutation.remove,''));const mutation=await execute(['test',project,'--no-restore','--nologo','-v','minimal'],dir);fs.writeFileSync(file,source);if(mutation.code===0){result.status='failed';result.observed+='\nMutation was not caught';}else result.observed+='\nMutation bỏ guard bị test phát hiện đúng.';}
 }else if(e.kind==='cli'){
  const observed=[];let ok=true;for(const args of [['--info'],['--list-sdks'],['--list-runtimes'],['run','--no-build','--project',project],['package','list','--project',project,'--include-transitive','--no-restore'],['publish',project,'-c','Release','--self-contained','false','--no-restore']]){const run=await execute(args,dir);observed.push('$ dotnet '+args.join(' ')+'\n'+clean(run.out));if(run.code!==0)ok=false;}
  result.status=ok?'cli-verified':'failed';result.observed=observed.join('\n')+'\nVulnerability audit was not executed; its output depends on the live advisory source. IDE breakpoint keys are manual guidance, not automated verification.';
 }else{
  const dll=path.join(dir,'bin/Debug/net10.0',path.basename(project,'.csproj')+'.dll');const run=await execute([dll],dir,20000);const output=clean(run.out);result.status=run.code===0?'ran':'failed';result.observed=output;
  if(result.status==='ran'&&e.kind!=='cli'&&output!==e.expected.replaceAll('\r\n','\n').trim()){result.status='failed';result.observed=`Expected:\n${e.expected}\nActual:\n${output}`;}
 }
 results.push(result);console.log(result.status+': '+key+(result.status==='failed'?'\n'+result.observed:''));
 fs.writeFileSync(reportFile,JSON.stringify({reviewedAt:'2026-11-01',sdk:'10.0.403',runtime:'10.0.14',results},null,2)+'\n');
}
await Promise.all(Array.from({length:2},async()=>{while(cursor<entries.length){const entry=entries[cursor++];await check(entry);}}));
results.sort((a,b)=>a.key.localeCompare(b.key));fs.writeFileSync(reportFile,JSON.stringify({reviewedAt:'2026-11-01',sdk:'10.0.403',runtime:'10.0.14',results},null,2)+'\n');
console.log(JSON.stringify(results.reduce((a,r)=>(a[r.status]=(a[r.status]??0)+1,a),{})));if(results.some(r=>r.status==='failed'))process.exitCode=1;
