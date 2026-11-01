import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {zipSync,strToU8} from 'fflate';
import {validateSpecification,renderHeader} from './specification.js';
export function headerFrom(raw){
 raw=raw.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');validateSpecification(JSON.parse(raw));
 const hash=createHash('sha256').update(raw).digest('hex');return renderHeader(raw,hash);
}
export async function prepareSharedReader(){
 const base=fileURLToPath(new URL('../../integrations/shared-input-reader/',import.meta.url));
 const raw=await readFile(new URL('../../input-spec/input-schema.json',import.meta.url),'utf8');
 const header=headerFrom(raw);await mkdir(base,{recursive:true});
 await writeFile(base+'InputSchema.generated.h',header);
 const contents={'input-schema.json':strToU8(raw),'InputSchema.generated.h':strToU8(header)};
 for(const name of ['InputSchema.h','generate_header.py','Input.cpp.patch','LEER.txt','LICENSE.txt'])contents[name]=new Uint8Array(await readFile(base+name));
 const bytes=zipSync(contents,{level:6});
 return {bytes,schema:raw,sha256:createHash('sha256').update(bytes).digest('hex')};
}
