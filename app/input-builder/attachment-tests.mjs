import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {freshInput,parseInput,serialize,validate} from './model.js';
import {attachmentIssues} from './attachments.js';
const records=(name,text)=>new Map([[name,{bytes:new TextEncoder().encode(text)}]]);
test('State attachment is checked structurally, including duplicate properties',()=>{
 const d=freshInput();d.load_state=true;d.load_state_file='state.json';
 for(const text of ['[]','[{"index":0,"index":1,"stress":[]}]',JSON.stringify([{index:-1,stress:[]}]),JSON.stringify([{index:0,stress:[[1,2],[1,2],[1,2]]}])])assert(attachmentIssues(d,records('state.json',text)).length>0);
 const rows=[{index:0,stress:[[1,0,0],[0,1,0],[0,0,1]]}];assert.deepEqual(attachmentIssues(d,records('state.json',JSON.stringify(rows))),[]);rows.push(rows[0]);assert(attachmentIssues(d,records('state.json',JSON.stringify(rows))).length>0);
});
test('Particles require valid per-particle material references unless homogeneous material overrides them',()=>{
 const d=freshInput();d.body={points:{type:'particles_list',file:'points.json'}};
 const a=records('points.json',JSON.stringify([{position:[.5,.5,.5],volume:.1,material_id:40}]));assert(attachmentIssues(d,a).length>0);d.body.points.material_id=1;assert.deepEqual(attachmentIssues(d,a),[]);
});
test('Seismic header and chronological order are checked against current configuration',()=>{
 const d=freshInput();d.earthquake={active:true,file:'earthquake.txt',header:true};const a=records('earthquake.txt','t ax ay az\n0 0 0 0\n1 1 1 1\n');assert.deepEqual(attachmentIssues(d,a),[]);d.earthquake.header=false;assert(attachmentIssues(d,a).length>0);
 d.earthquake.header=true;assert(attachmentIssues(d,records('earthquake.txt','header\n1 0 0 0\n0 0 0 0\n')).length>0);
});
test('Gmsh groups are checked against the actual attached mesh',async()=>{
 const d=freshInput(),raw=await readFile(new URL('../../fixtures/one_group.msh',import.meta.url),'utf8');
 const group=raw.match(/3\s+\d+\s+"([^"]+)"/)[1];d.body={mesh:{type:'gmsh',mesh_file:'mesh.msh',physical_to_material:{[group]:1}}};const a=records('mesh.msh',raw);assert.deepEqual(attachmentIssues(d,a),[]);
 d.body.mesh.physical_to_material={missing:1};assert(attachmentIssues(d,a).length>0);
});
test('STL rejects incomplete and nonnumeric triangles',()=>{
 const d=freshInput();d.terrain_contact={active:true,stl_mesh:'terrain.stl',friction:.3,distance_threshold:0,penalty_contact_active:false,penalty_stiffness:0};
 assert(attachmentIssues(d,records('terrain.stl','solid x\nendsolid x')).length>0);
 const good='solid x\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid x';assert.deepEqual(attachmentIssues(d,records('terrain.stl',good)),[]);
 assert(attachmentIssues(d,records('terrain.stl',good.replace('vertex 1','vertex NaN'))).length>0);
});
test('Referenced input.json cannot replace the main configuration inside a ZIP',()=>{const d=freshInput();d.load_state=true;d.load_state_file='input.json';assert(validate(d).issues.some(x=>x.message.includes('reservado')));});
test('Native collections provided as arrays normalize without changing their iteration order',()=>{
 const d=freshInput();d.material=[{id:1,type:'elastic',young:1e6,density:1000,poisson:.25}];d.body=Array.from({length:12},(_,i)=>({type:'sphere',material_id:1,center:[i,0,0],diameter:1}));const x=parseInput(serialize(d));assert.deepEqual(Object.keys(x.body).sort().map(k=>x.body[k].center[0]),Array.from({length:12},(_,i)=>i));assert.deepEqual(Object.values(x.material),d.material);
});
