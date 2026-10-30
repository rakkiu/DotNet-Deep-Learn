"""Execute the exact lesson code/reference answers. Never execute learner submissions."""
import json,os,pathlib,shutil,sqlite3,subprocess,tempfile
ROOT=pathlib.Path(__file__).resolve().parents[1]
data=json.loads((ROOT/'client/src/data/catalog.json').read_text())['lessons']
dotnet=os.environ.get('DOTNET_CMD') or shutil.which('dotnet') or '/workspace/tooling/dotnet/dotnet'
count=0
with tempfile.TemporaryDirectory() as temp:
    project=pathlib.Path(temp)
    (project/'Verify.csproj').write_text('<Project Sdk="Microsoft.NET.Sdk"><PropertyGroup><OutputType>Exe</OutputType><TargetFramework>net10.0</TargetFramework><ImplicitUsings>enable</ImplicitUsings></PropertyGroup></Project>')
    subprocess.run([dotnet,'restore',str(project/'Verify.csproj')],check=True,capture_output=True)
    def run_cs(id,code,expected):
        global count
        (project/'Program.cs').write_text(code)
        result=subprocess.run([dotnet,'run','--project',str(project/'Verify.csproj'),'--no-restore','--verbosity','quiet'],capture_output=True,text=True,check=True)
        assert result.stdout.strip()==expected,(id,result.stdout,expected)
        print('PASS C#',id);count+=1
    for lesson in data[:2]:
        for example in lesson['examples']:run_cs(example['id'],example['code'],example['output'])
        for exercise in lesson['exercises']:
            code=exercise['solution']
            if exercise['id'] in ['oop-e-fill','oop-e-debug']:code='Animal a = new Dog(); a.Speak();\n'+code
            expected={'oop-e-fill':'Dog','oop-e-debug':'Dog','oop-e-design':'Email\nSMS','linq-e-fill':'2','linq-e-debug':'2\n2, 3\ncalls = 3','linq-e-design':'250\n100, 150\n100, 150'}[exercise['id']]
            run_cs(exercise['id'],code,expected)
sql=data[2]
for example in sql['examples']:
    with sqlite3.connect(':memory:') as db:
        db.executescript(sql['schema'])
        rows=[[str(v) if v is not None else 'NULL' for v in row] for row in db.execute(example['code'])]
        assert rows==example['table']['rows'],(example['id'],rows)
        print('PASS SQLite',example['id']);count+=1
for exercise in sql['exercises']:
    with sqlite3.connect(':memory:') as db:
        db.executescript(sql['schema'])
        if exercise['id']=='sql-e-design':db.execute("INSERT INTO Orders VALUES (103,1,'Paid')")
        rows=list(db.execute(exercise['solution']))
        expected=[('An',2),('Bình',0),('Chi',0)] if exercise['id']=='sql-e-design' else [('An',101),('Bình',None),('Chi',None)]
        assert rows==expected,(exercise['id'],rows)
        print('PASS SQLite',exercise['id']);count+=1
print(f'{count} executed examples/reference solutions passed (10 C#, 5 SQL).')
