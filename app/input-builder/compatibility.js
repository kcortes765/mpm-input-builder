export const normalizeSource=text=>text.replace(/^\uFEFF/,'').replace(/\r\n?/g,'\n');
export function inputKeys(text){
 const source=text.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
 const keys=new Set([...source.matchAll(/\["([^"\n]+)"\]/g)].map(m=>m[1]));
 for(const m of source.matchAll(/get_(?:number|boolean|string)\([^\n]*?,\s*"([^"]+)"/g))keys.add(m[1]);
 for(const m of source.matchAll(/(?:string|std::string)\s+(?:key|keyword)\s*=\s*"([^"]+)"/g))keys.add(m[1]);
 return [...keys].sort();
}
export function sourceReport(text,hash,baseline){
 const now=inputKeys(text),before=new Set(baseline.keys),current=new Set(now);
 return {matches:hash===baseline.sha256,sha256:hash,expected:baseline.sha256,
  added:now.filter(k=>!before.has(k)),removed:baseline.keys.filter(k=>!current.has(k)),
  scope:'Source identity and indicative key diff; not a C++ semantic parser or automatic migration'};
}
export async function inspectInputSource(text,baseline,subtle=globalThis.crypto?.subtle){
 if(typeof text!=='string'||text.length>2*1024*1024)throw Error('Source size limit');
 if(!subtle)throw Error('Secure hashing unavailable');
 const digest=await subtle.digest('SHA-256',new TextEncoder().encode(normalizeSource(text)));
 const hash=[...new Uint8Array(digest)].map(x=>x.toString(16).padStart(2,'0')).join('');
 return sourceReport(text,hash,baseline);
}
