const kinds=new Set(['object','map','list','choice','number','integer','boolean','string','vector','pair']);
export function validateSpecification(spec){
 if(spec?.schema!=='mpm-input-definitions/1'||!Number.isSafeInteger(spec.version)||spec.version<1||!/^[a-f0-9]{40}$/.test(spec.sourceCommit??''))throw Error('Invalid shared input specification');
 const seen=new Set();
 function fields(map,path){if(!map||typeof map!=='object'||Array.isArray(map))throw Error('Invalid fields: '+path);for(const[k,s]of Object.entries(map)){if(['__proto__','prototype','constructor'].includes(k))throw Error('Reserved schema key');walk(s,path+'.'+k);}}
 function walk(s,path){
  if(!s||!kinds.has(s.kind)||typeof s.label!=='string')throw Error('Unsupported field: '+path);
  if(s.kind==='object'){fields(s.fields,path);for(const[k,v]of Object.entries(s.variants??{}))fields(v,path+'.'+k);}
  if(s.kind==='list'||s.kind==='map')walk(s.item,path+'[]');
  if(s.kind==='choice'&&(!Array.isArray(s.choices)||!s.choices.length))throw Error('Empty choices: '+path);
  for(const p of ['min','max','exclusiveMin','exclusiveMax','minItems'])if(s[p]!==undefined&&!Number.isFinite(s[p]))throw Error('Invalid bound: '+path);
  for(const d of ['translations','noteTranslations'])for(const[code,value]of Object.entries(s[d]??{}))if(!['en','pt'].includes(code)||typeof value!=='string'||!value)throw Error('Invalid translation: '+path);
 }
 fields(spec.sections,'sections');
 for(const s of Object.values(spec.sections))for(const k of Object.keys(s.fields)){if(seen.has(k))throw Error('Duplicate root field: '+k);seen.add(k);}
 return spec;
}
export function renderHeader(raw,hash){
 const delimiter='MPM_'+hash.slice(0,12);
 if(raw.includes(')'+delimiter+'"'))throw Error('Raw string delimiter conflict');
 return '// Generated from input-schema.json; do not edit.\n#pragma once\nnamespace InputSchema {\ninline const char* specificationText(){return R"'+delimiter+'('+raw+')'+delimiter+'";}\ninline const char* specificationSha256(){return "'+hash+'";}\n}\n';
}
