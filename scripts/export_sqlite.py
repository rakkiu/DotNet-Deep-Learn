"""One-time, read-only conversion of the previous SQLite profile to a client backup."""
import argparse, datetime, json, pathlib, sqlite3

def convert(database: pathlib.Path):
    if not database.is_file(): raise ValueError('Không tìm thấy file SQLite.')
    with sqlite3.connect(database.resolve().as_uri()+'?mode=ro',uri=True) as db:
        db.row_factory=sqlite3.Row
        db.execute('BEGIN')
        state={}
        for table,key in [('Progress','progress'),('Notes','notes'),('Bookmarks','bookmarks'),('Submissions','submissions'),('Attempts','attempts')]:
            rows=[]
            for row in db.execute(f'SELECT * FROM "{table}"'):
                item={name[0].lower()+name[1:]:value for name,value in dict(row).items()}
                for field in ['read','correct','assessed']:
                    if field in item:item[field]=bool(item[field])
                for field in ['createdAt','updatedAt']:
                    if field in item:
                        value=item[field].replace(' ','T')
                        if not value.endswith('Z') and '+' not in value[10:]:value+='Z'
                        item[field]=value
                rows.append(item)
            state[key]=rows
        state['attempts'].sort(key=lambda a:a['id'])
    return {'version':1,'exportedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'state':state}

def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('database',type=pathlib.Path)
    parser.add_argument('--output',required=True,type=pathlib.Path)
    args=parser.parse_args()
    backup=convert(args.database)
    # Never overwrite a pre-existing backup. Does not alter the SQLite file.
    with args.output.open('x',encoding='utf-8') as f:json.dump(backup,f,ensure_ascii=False,indent=2)
    print('Đã xuất tệp sao lưu:',args.output)
    print('Số bản ghi:',{k:len(v) for k,v in backup['state'].items()})
if __name__=='__main__':main()
