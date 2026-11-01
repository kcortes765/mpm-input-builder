import adapter from '../../integrations/shared-input-reader/InputSchema.h';
import generator from '../../integrations/shared-input-reader/generate_header.py';
import patch from '../../integrations/shared-input-reader/Input.cpp.patch';
import readme from '../../integrations/shared-input-reader/LEER.txt';
import license from '../../integrations/shared-input-reader/LICENSE.txt';
import {zipSync,strToU8} from 'fflate';
import {renderHeader} from './specification.js';
export async function readerPackage(spec){
 const raw=JSON.stringify(spec,null,2)+'\n';
 const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(raw));
 const hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
 const contents={'input-schema.json':strToU8(raw),'InputSchema.generated.h':strToU8(renderHeader(raw,hash)),
  'InputSchema.h':strToU8(adapter),'generate_header.py':strToU8(generator),'Input.cpp.patch':strToU8(patch),'LEER.txt':strToU8(readme),'LICENSE.txt':strToU8(license)};
 return zipSync(contents,{level:6});
}
