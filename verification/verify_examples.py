"""Run published teaching code and reference solutions; never learner submissions.
Requires .NET 10 SDK, NuGet access for EF SQLite, and local loopback sockets.
"""
import concurrent.futures, hashlib, json, os, pathlib, shutil, socket, sqlite3, subprocess, tempfile, time, urllib.request, urllib.error
ROOT = pathlib.Path(__file__).resolve().parents[1]
DATA = json.loads((ROOT / 'client/src/data/catalog.json').read_text())['lessons']
DOTNET = os.environ.get('DOTNET_CMD') or shutil.which('dotnet') or '/workspace/tooling/dotnet/dotnet'
OLD = {'oop-e-fill': 'Dog', 'oop-e-debug': 'Dog', 'oop-e-design': 'Email\nSMS', 'linq-e-fill': '2', 'linq-e-debug': '2\n2, 3\ncalls = 3', 'linq-e-design': '250\n100, 150\n100, 150'}
jobs = {}; references = 0
for lesson in DATA:
    if lesson['language'] == 'sql': continue
    for item in lesson['examples'] + lesson['exercises'] + [section for section in lesson['sections'] if section.get('code') and 'expectedOutput' in section]:
        code = item.get('code', item.get('solution'))
        if item['id'] in ['oop-e-fill','oop-e-debug']: code = 'Animal a = new Dog(); a.Speak();\n' + code
        expected = item.get('output', item.get('expectedOutput', OLD.get(item['id'])))
        assert expected is not None, item['id']
        job = dict(code=code, files=item.get('files') or {}, kind=item.get('verificationKind','console'), request=item.get('request'), status=item.get('expectedStatus',200))
        key = hashlib.sha256(json.dumps(job,sort_keys=True).encode()).hexdigest()[:16]
        if key in jobs: assert jobs[key]['expected'] == expected, (item['id'],'conflicting output')
        else: jobs[key] = dict(**job, expected=expected, key=key, id=item['id'])
        references += 1

def verify(job, root):
    path = root / job['key']; path.mkdir()
    web = job['kind']=='web'
    package = '<ItemGroup><PackageReference Include="Microsoft.EntityFrameworkCore.Sqlite" Version="10.0.14" /></ItemGroup>' if job['kind']=='ef' else ''
    if job['kind']=='framework': package='<ItemGroup><FrameworkReference Include="Microsoft.AspNetCore.App" /></ItemGroup>'
    (path/'Verify.csproj').write_text('<Project Sdk="Microsoft.NET.Sdk'+('.Web' if web else '')+'"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings><Nullable>enable</Nullable></PropertyGroup>'+package+'</Project>')
    (path/'Program.cs').write_text(job['code'])
    for name,content in job['files'].items():
        target=path/name; target.parent.mkdir(parents=True,exist_ok=True); target.write_text(content)
    build=subprocess.run([DOTNET,'build',str(path/'Verify.csproj'),'--nologo','-v:q'],capture_output=True,text=True,timeout=90)
    assert build.returncode==0, (job['id'],'build failed',build.stdout,build.stderr)
    command=[DOTNET,str(path/'bin/Debug/net10.0/Verify.dll')]
    if not web:
        run=subprocess.run(command,capture_output=True,text=True,timeout=15)
        assert run.returncode==0, (job['id'],run.stderr)
        actual=run.stdout.strip()
    else:
        with socket.socket() as reserve: reserve.bind(('127.0.0.1',0)); port=reserve.getsockname()[1]
        env={**os.environ,'Logging__LogLevel__Default':'None','ASPNETCORE_ENVIRONMENT':'Development'}
        proc=subprocess.Popen(command+['--urls',f'http://127.0.0.1:{port}'],cwd=path,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
        try:
            req=job['request']; body=json.dumps(req['body']).encode() if 'body' in req else None
            for retry in range(150):
                try:
                    request=urllib.request.Request(f'http://127.0.0.1:{port}'+req['path'],data=body,method=req['method'],headers={'Content-Type':'application/json'})
                    try: response=urllib.request.urlopen(request,timeout=2)
                    except urllib.error.HTTPError as error: response=error
                    actual=response.read().decode().strip()
                    assert response.status==job['status'],(job['id'],'status',response.status,actual)
                    break
                except urllib.error.URLError:
                    if proc.poll() is not None: raise AssertionError((job['id'],'server exited',proc.communicate()))
                    time.sleep(.05)
            else: raise AssertionError((job['id'],'server startup timeout'))
            if 'X-Lesson' in job['code']: assert response.headers.get('X-Lesson')=='40'
        finally:
            proc.terminate()
            try: proc.communicate(timeout=5)
            except subprocess.TimeoutExpired: proc.kill();proc.communicate()
    assert actual==job['expected'].strip(),(job['id'],'output',actual,job['expected'])
    return job['id']

if __name__=='__main__':
    passed=[]; failed=[]
    with tempfile.TemporaryDirectory(prefix='dotnet-curriculum-') as folder:
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            futures={pool.submit(verify,job,pathlib.Path(folder)):job for job in jobs.values()}
            for f in concurrent.futures.as_completed(futures):
                try: passed.append(f.result())
                except Exception as e: failed.append(str(e)); print('FAIL',str(e),flush=True)
                if (len(passed)+len(failed))%10==0: print(f'{len(passed)} programs passed; {len(failed)} failed',flush=True)
    sql=next(l for l in DATA if l['id']=='sql-left-join')
    for item in sql['examples']+sql['exercises']:
        with sqlite3.connect(':memory:') as db:
            db.executescript(sql['schema'])
            if item['id']=='sql-e-design': db.execute("INSERT INTO Orders VALUES (103,1,'Paid')")
            rows=[[str(v) if v is not None else 'NULL' for v in row] for row in db.execute(item.get('code',item.get('solution'))) ]
            expected=item['table']['rows'] if 'code' in item else ([['An','2'],['Bình','0'],['Chi','0']] if item['id']=='sql-e-design' else [['An','101'],['Bình','NULL'],['Chi','NULL']])
            assert rows==expected,(item['id'],rows,expected)
            passed.append(item['id'])
    report=dict(uniquePrograms=len(jobs),csharpReferences=references,sqlStatements=5,passed=len(passed),failures=failed)
    (ROOT/'verification/latest-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps(report,ensure_ascii=False),flush=True)
    if failed: raise SystemExit(1)
