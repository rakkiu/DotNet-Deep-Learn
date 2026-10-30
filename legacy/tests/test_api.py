"""Integration tests against a real ASP.NET process and isolated SQLite file."""
import json, os, pathlib, shutil, socket, subprocess, tempfile, time, unittest, urllib.request, urllib.error
ROOT = pathlib.Path(__file__).resolve().parents[1]
DOTNET = os.environ.get('DOTNET_CMD') or shutil.which('dotnet') or '/workspace/tooling/dotnet/dotnet'
CONTENT = json.loads((ROOT/'server/Data/catalog.json').read_text())
class ApiTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        with socket.socket() as s: s.bind(('127.0.0.1',0)); self.port=s.getsockname()[1]
        self.base=f'http://127.0.0.1:{self.port}/api'
        self.log=open(pathlib.Path(self.temp.name)/'api.log','w+')
        self.start()
    def start(self):
        env={**os.environ,'DEEPLEARN_DB':str(pathlib.Path(self.temp.name)/'test.db'),'Logging__LogLevel__Default':'Warning'}
        self.process=subprocess.Popen([DOTNET,'run','--project',str(ROOT/'server/DeepLearn.Api.csproj'),'--no-build','--urls',f'http://127.0.0.1:{self.port}'],cwd=ROOT,env=env,stdout=self.log,stderr=self.log)
        for _ in range(100):
            try:
                if self.request('/health')['status']=='ok': return
            except (OSError,urllib.error.URLError): time.sleep(.1)
        self.log.seek(0);self.fail(self.log.read())
    def tearDown(self):
        self.process.terminate();self.process.wait(timeout=10);self.log.close();self.temp.cleanup()
    def request(self,path,method='GET',body=None):
        data=None if body is None else json.dumps(body).encode()
        req=urllib.request.Request(self.base+path,data=data,method=method,headers={'Content-Type':'application/json'})
        # Loopback requests never need an Internet proxy.
        opener=urllib.request.build_opener(urllib.request.ProxyHandler({}))
        with opener.open(req,timeout=5) as r:return json.load(r)
    def test_content_and_answer_secrecy(self):
        catalog=self.request('/catalog')
        self.assertEqual(len(catalog['topics']),7);self.assertEqual(len(catalog['lessons']),3)
        ids=[]
        for lesson in catalog['lessons']:
            self.assertGreaterEqual(len(lesson['sections']),6)
            self.assertEqual((len(lesson['examples']),len(lesson['questions']),len(lesson['exercises'])),(2,5,3))
            for q in lesson['questions']:
                ids.append(q['id']);self.assertNotIn('correctOptionId',q);self.assertNotIn('explanation',q)
                for o in q['options']:self.assertNotIn('explanation',o)
            for ex in lesson['examples']:
                self.assertNotIn('output',ex);self.assertNotIn('correctOptionId',ex)
        self.assertEqual(len(set(ids)),15)
    def test_grading_all_fifteen_questions_and_feedback(self):
        for lesson in CONTENT['lessons']:
            for q in lesson['questions']:
                wrong=next(o['id'] for o in q['options'] if o['id']!=q['correctOptionId'])
                url=f"/lessons/{lesson['id']}/quiz/{q['id']}"
                bad=self.request(url,'POST',{'optionId':wrong});self.assertFalse(bad['correct'])
                good=self.request(url,'POST',{'optionId':q['correctOptionId']});self.assertTrue(good['correct'])
                self.assertGreater(good['id'],bad['id'])
                feedback=json.loads(good['feedback']);self.assertEqual(feedback['correctOptionId'],q['correctOptionId'])
                self.assertTrue(all(o['explanation'] for o in feedback['options']))
        self.assertEqual(len(self.request('/state')['attempts']),30)
    def test_review_updates_without_erasing_initial_attempt(self):
        url='/lessons/oop-polymorphism/quiz/oop-q-concept'
        self.request(url,'POST',{'optionId':'b'})
        def review(state):
            latest={a['questionId']:a for a in state['attempts']}
            return [a for a in latest.values() if not a['correct']]
        self.assertEqual(len(review(self.request('/state'))),1)
        self.request(url,'POST',{'optionId':'a'})
        state=self.request('/state');self.assertEqual(len(review(state)),0)
        self.assertEqual(len(state['attempts']),2);self.assertFalse(state['attempts'][0]['correct'])
    def test_progress_notes_bookmarks_exercises_survive_restart_and_seed(self):
        self.request('/progress/oop-polymorphism','PUT',{'section':'examples','read':True})
        self.request('/notes/oop-polymorphism','PUT',{'text':'Phân biệt kiểu tham chiếu và runtime.'})
        self.request('/bookmarks/oop-polymorphism','PUT',{'saved':True})
        self.request('/lessons/oop-polymorphism/exercises/oop-e-fill','PUT',{'code':'my answer','assessed':True,'checks':[True,True,True]})
        before=self.request('/state');self.process.terminate();self.process.wait(timeout=10);self.start()
        self.assertEqual(self.request('/state'),before)
        self.assertEqual(len(self.request('/catalog')['lessons']),3)
        self.request('/bookmarks/oop-polymorphism','PUT',{'saved':False})
        self.assertEqual(self.request('/state')['bookmarks'],[])
    def test_validation_rejects_unknown_ids_and_invalid_self_assessment(self):
        cases=[('/notes/missing','PUT',{'text':'x'}),('/progress/oop-polymorphism','PUT',{'section':'fake','read':True}),('/lessons/oop-polymorphism/quiz/oop-q-concept','POST',{'optionId':'z'}),('/lessons/sql-left-join/quiz/oop-q-concept','POST',{'optionId':'a'}),('/notes/oop-polymorphism','PUT',{'text':'x'*20001}),('/lessons/oop-polymorphism/exercises/oop-e-fill','PUT',{'code':'','assessed':True,'checks':[True,True,True]})]
        for path,method,body in cases:
            with self.subTest(path=path):
                with self.assertRaises(urllib.error.HTTPError) as ctx:self.request(path,method,body)
                self.assertEqual(ctx.exception.code,400)
    def test_all_six_predictions(self):
        for lesson in CONTENT['lessons']:
            for ex in lesson['examples']:
                result=self.request(f"/lessons/{lesson['id']}/examples/{ex['id']}",'POST',{'optionId':ex['correctOptionId']})
                self.assertTrue(result['correct']);self.assertEqual(result['output'],ex['output']);self.assertEqual(result['steps'],ex['steps'])
if __name__=='__main__':unittest.main(verbosity=2)
