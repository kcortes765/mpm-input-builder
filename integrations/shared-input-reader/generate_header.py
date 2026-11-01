"""Regenerate the C++ description from the same JSON used by the forms."""
from pathlib import Path
import argparse,hashlib,json
p=argparse.ArgumentParser();p.add_argument('schema',type=Path);p.add_argument('output',type=Path);p.add_argument('--web',type=Path);a=p.parse_args()
raw=a.schema.read_text(encoding='utf-8-sig').replace('\r\n','\n').replace('\r','\n')
spec=json.loads(raw)
if spec.get('schema')!='mpm-input-definitions/1' or not isinstance(spec.get('sections'),dict):raise SystemExit('Unsupported specification')
sha=hashlib.sha256(raw.encode()).hexdigest();delimiter='MPM_'+sha[:12]
if ')'+delimiter+'"' in raw:raise SystemExit('Raw string delimiter conflict')
header='// Generated from input-schema.json; do not edit.\n#pragma once\nnamespace InputSchema {\ninline const char* specificationText(){return R"'+delimiter+'('+raw+')'+delimiter+'";}\ninline const char* specificationSha256(){return "'+sha+'";}\n}\n'
a.output.write_text(header,encoding='utf-8',newline='\n')
if a.web:a.web.write_text('globalThis.__MPM_INPUT_SPEC__='+json.dumps(spec,ensure_ascii=False,separators=(',',':'))+';\n',encoding='utf-8',newline='\n')
print(sha)
