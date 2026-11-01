import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {sections,body,material,initial,fieldsOf} from './catalog.js';
import {freshInput,validate,parseInput,serialize,changeType,bodyIdentities,remapBodyReferences} from './model.js';
const errors=d=>validate(d).issues.filter(x=>x.severity==='error');
test('Default input and round trip preserve a valid configuration',()=>{const d=freshInput();assert.deepEqual(errors(d),[]);assert.deepEqual(parseInput(serialize(d)),d);});
test('Reject duplicate keys, nonfinite numbers, reserved names and trailing tokens',()=>{
 for(const raw of ['{"time":1,"time":2}','{"x":{"id":1,"id":2}}','{"__proto__":{}}','{} []','{"x":NaN}'])assert.throws(()=>parseInput(raw));
 const d=freshInput();d.time=Infinity;assert(errors(d).some(x=>x.path==='time'));
});
test('Legacy material alias is imported without discarding its contents',()=>{const d=freshInput();d.materials=d.material;delete d.material;assert.deepEqual(parseInput(JSON.stringify(d)).material,freshInput().material);d.material={};assert.throws(()=>parseInput(JSON.stringify(d)));});
test('Model variants emit the native spelling and preserve literal softening keys',()=>{
 for(const type of ['elastic','mohr-coulomb','newtonian']){const d=freshInput();d.material.material_001=changeType(d.material.material_001,material,type);assert.deepEqual(errors(d),[]);}
 const m=changeType(initial(material),material,'mohr-coulomb');m.softening='exponential';m['softening.friction.active']=true;m['softening.friction.residual']=10;
 const d=freshInput();d.material.material_001=m;const x=parseInput(serialize(d));assert.equal(x.material.material_001['softening.friction.active'],true);assert.equal(typeof x.material.material_001.softening,'string');
});
test('Unknown imported fields remain intact and are explicitly reported',()=>{const d=freshInput();d.future_option={a:2};const x=parseInput(serialize(d));assert.deepEqual(x.future_option,{a:2});assert(validate(x).issues.some(i=>i.severity==='warning'&&i.path==='future_option'));});
test('Each supported geometry has a typed configuration',()=>{
 for(const type of ['cuboid','sphere','polygon_2d','particles']){const d=freshInput();d.body.cuerpo_001=changeType(d.body.cuerpo_001,body,type);assert.deepEqual(errors(d),[],type);}
 for(const type of ['particles_list','particles_from_file','gmsh']){const d=freshInput();d.body.cuerpo_001=changeType(d.body.cuerpo_001,body,type);const b=d.body.cuerpo_001;if(type==='gmsh')b.mesh_file='malla.msh';else b.file='particulas.json';assert.deepEqual(errors(d),[]);assert.equal(validate(d,{requireFiles:true}).valid,false);}
});
test('Validate linked materials, body order and one native body per Gmsh group',()=>{
 const d=freshInput();d.body.cuerpo_001.material_id=50;assert(errors(d).some(x=>x.message.includes('material indicado')));d.body.cuerpo_001.material_id=1;
 d.body={z:initial(body),a:changeType(initial(body),body,'gmsh')};d.body.a.physical_to_material={beta:1,alfa:1};
 assert.deepEqual(bodyIdentities(d),['a / alfa','a / beta','z']);d.contact={pair:{id:1,friction:.3,master_id:1,slave_id:3,normal_type:'master'}};
 const before=bodyIdentities(d);delete d.body.a;remapBodyReferences(d,before);assert.equal(d.contact.pair.master_id,0);assert.equal(d.contact.pair.slave_id,1);assert(errors(d).length>0);
});
test('Reject singular parameters, malformed vectors, zero geometry and misaligned particle lists',()=>{
 const changes=[d=>d.material.material_001.poisson=.5,d=>d.mesh.cells_number=[1.5,2,3],d=>d.gravity=[1,2],d=>d.body.cuerpo_001.point_p2=[0,0,0],d=>{d.body.cuerpo_001=changeType(d.body.cuerpo_001,body,'particles');d.body.cuerpo_001.particles.volume=[];}];
 for(const mutate of changes){const d=freshInput();mutate(d);assert(errors(d).length>0);}
});
test('Two-phase requires all fluid properties and validates their domains',()=>{
 const d=freshInput();d.n_phases=2;assert(errors(d).length===4);Object.assign(d.material.material_001,{density_fluid:1000,porosity:.3,bulk_fluid:2e9,hydraulic_conductivity:[.01,.01,.01]});assert.deepEqual(errors(d),[]);d.material.material_001.porosity=1;assert(errors(d).length>0);
});
test('External paths are simple, attachments required for ready packages',()=>{
 const d=freshInput();d.load_state=true;d.load_state_file='../state.json';assert(errors(d).some(x=>x.path==='load_state_file'));d.load_state_file='state.json';assert(validate(d,{requireFiles:true}).issues.some(x=>x.path==='load_state_file'&&x.severity==='error'));assert(validate(d,{requireFiles:true,attachments:new Map([['state.json',{}]])}).valid);
});
test('All optional root sections can be enabled and field checks expose dependencies',()=>{
 const d=freshInput();for(const sec of Object.values(sections))for(const[k,s]of Object.entries(sec.fields))if(s.optional)d[k]=initial(s);
 const result=validate(d);assert(result.issues.length>0);assert(result.issues.some(x=>x.path==='contact'));assert(result.issues.some(x=>x.path.includes('stl_mesh')));
});
test('Input.cpp option keys have explicit catalog or compatibility coverage',async()=>{
 const source=(await readFile(new URL('../../solver/src/Input.cpp',import.meta.url),'utf8')).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,'');
 const keys=new Set([...source.matchAll(/\["([^"\n]+)"\]/g)].map(m=>m[1]));
 for(const m of source.matchAll(/get_(?:number|boolean|string)\([^\n]*?,\s*"([^"]+)"/g))keys.add(m[1]);
 for(const m of source.matchAll(/(?:string|std::string)\s+(?:key|keyword)\s*=\s*"([^"]+)"/g))keys.add(m[1]);
 const covered=new Set(['materials']);function walk(s){for(const[k,v]of Object.entries(s.fields??{})){covered.add(k);walk(v);}for(const v of Object.values(s.variants??{}))for(const[k,x]of Object.entries(v)){covered.add(k);walk(x);}if(s.item)walk(s.item);}
 for(const s of Object.values(sections))walk(s);
 const external={position:'External particles/pressure/state records',volume:'External particles records',index:'External state records',stress:'External state records',material_id:'External material references'};
 for(const k of Object.keys(external))covered.add(k);
 const missing=[...keys].filter(k=>!covered.has(k)).sort();
 await mkdir(new URL('../../test-output/',import.meta.url),{recursive:true});
 await writeFile(new URL('../../test-output/KEY_COVERAGE.json',import.meta.url),JSON.stringify({source:'solver/src/Input.cpp',keys:[...keys].sort(),covered:[...covered].sort(),external,missing},null,2));
 assert.deepEqual(missing,[]);
});
