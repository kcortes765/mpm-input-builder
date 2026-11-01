import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,mkdtemp,writeFile,rm,realpath} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname,basename} from 'node:path';
import {inspectInputSource} from './compatibility.js';
import {checkInput,assertCompatibleInput} from './check-input.mjs';
const source=await readFile(new URL('../../solver/src/Input.cpp',import.meta.url),'utf8');
const baseline=JSON.parse(await readFile(new URL('input-contract.json',import.meta.url),'utf8'));
test('Reviewed Input.cpp matches in build and browser checks, including CRLF and BOM',async()=>{
 assert((await checkInput()).matches);
 assert((await inspectInputSource('\uFEFF'+source.replace(/\r\n?/g,'\n').replace(/\n/g,'\r\n'),baseline)).matches);
});
test('Added or removed input keys are reported without pretending to migrate the form',async()=>{
 const changed=source.replaceAll('"time_step"','"new_time_step"');
 const report=await inspectInputSource(changed,baseline);
 assert.equal(report.matches,false);assert(report.added.includes('new_time_step'));assert(report.removed.includes('time_step'));
});
test('A logic or default change with identical input names still blocks the build guard',async()=>{
 const changed=source.replace('"time",0.0','"time",0.123');assert.notEqual(changed,source);
 const report=await inspectInputSource(changed,baseline);assert(!report.matches);assert.deepEqual(report.added,[]);
 const dir=await mkdtemp(join(tmpdir(),'mpm-contract-'));
 try{const file=join(dir,'Input.cpp');await writeFile(file,changed);await assert.rejects(assertCompatibleInput(file),/Input.cpp changed/);}
 finally{const checked=await realpath(dir);assert.equal(dirname(checked),await realpath(tmpdir()));assert.match(basename(checked),/^mpm-contract-/);await rm(checked,{recursive:true,force:true});}
});
