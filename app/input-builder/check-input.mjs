import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {normalizeSource,sourceReport} from './compatibility.js';
import {VERSION} from './catalog.js';
export async function checkInput(file=new URL('../../solver/src/Input.cpp',import.meta.url)){
 const baseline=JSON.parse(await readFile(new URL('input-contract.json',import.meta.url),'utf8'));
 if(baseline.commit!==VERSION)throw Error('Catalogue and source contract versions differ');
 const text=await readFile(file,'utf8');
 const hash=createHash('sha256').update(normalizeSource(text)).digest('hex');
 return {...sourceReport(text,hash,baseline),source:String(file instanceof URL?fileURLToPath(file):file),commit:VERSION};
}
export async function assertCompatibleInput(file){
 const report=await checkInput(file);
 if(!report.matches)throw Error('Input.cpp changed. Review the catalogue, update the reviewed source contract and rerun native-reader tests before publishing. Added keys: '+report.added.join(', ')+'; removed keys: '+report.removed.join(', '));
 return report;
}
if(process.argv[1]&&pathToFileURL(process.argv[1]).href===import.meta.url){
 const flag=process.argv.indexOf('--input');
 if(flag>=0&&!process.argv[flag+1])throw Error('--input requires an Input.cpp path');
 const report=await checkInput(flag<0?undefined:process.argv[flag+1]);
 console.log(JSON.stringify(report,null,2));process.exitCode=report.matches?0:2;
}
