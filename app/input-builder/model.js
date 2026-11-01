import {sections,fieldsOf,freshInput,initial} from './catalog.js';
export {freshInput,initial};
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const own=(x,k)=>Object.prototype.hasOwnProperty.call(x,k);
export const safeName=n=>typeof n==='string'&&/^[A-Za-z0-9_][A-Za-z0-9_. -]*$/.test(n)&&!['__proto__','constructor','prototype'].includes(n);
export function parseJSON(raw,limit=32*1024*1024){
 // Reject duplicate keys before JSON.parse can silently overwrite an entry.
 let i=0;const ws=()=>{while(/\s/.test(raw[i]??'')&&i<raw.length)i++;};
 function value(){ws();const ch=raw[i];
  if(ch==='{'||ch==='['){const end=ch==='{'?'}':']',keys=new Set();i++;ws();if(raw[i]===end){i++;return;}
   for(;;){if(ch==='{'){ws();const start=i;string();const k=JSON.parse(raw.slice(start,i));if(keys.has(k))throw Error('La entrada contiene una clave repetida: '+k);keys.add(k);ws();if(raw[i++]!==':')throw Error('Se esperaba un valor');}value();ws();if(raw[i]===end){i++;break;}if(raw[i++]!==',')throw Error('Separación inválida');}
  }else if(ch==='"')string();else{const m=raw.slice(i).match(/^(?:true|false|null|-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)/);if(!m)throw Error('Valor inválido');i+=m[0].length;}
 }
 function string(){if(raw[i++]!=='"')throw Error('Se esperaba un nombre');while(i<raw.length){const c=raw[i++];if(c==='"')return;if(c==='\\')i++;}throw Error('Texto incompleto');}
 if(typeof raw!=='string'||raw.length>limit)throw Error('El archivo JSON supera el tamaño permitido');
 value();ws();if(i!==raw.length)throw Error('Contenido adicional después de la entrada');
 const data=JSON.parse(raw);
 function protect(v){if(v&&typeof v==='object'){for(const k of Object.keys(v)){if(['__proto__','prototype','constructor'].includes(k))throw Error('Nombre reservado: '+k);protect(v[k]);}}}protect(data);return data;
}
export function parseInput(raw){
 const data=parseJSON(raw,4*1024*1024);if(!object(data))throw Error('La entrada debe ser un objeto');
 if(data.material&&data.materials)throw Error('La entrada define material y materials a la vez');
 if(data.materials){data.material=data.materials;delete data.materials;}
 for(const sec of Object.values(sections))for(const[k,s]of Object.entries(sec.fields))if(s.kind==='map'&&Array.isArray(data[k]))data[k]=Object.fromEntries(data[k].map((v,i)=>[(s.prefix??'grupo')+'_'+String(i+1).padStart(3,'0'),v]));
 return data;
}
export function changeType(value,schema,type){
 const previous=fieldsOf(schema,value),next=fieldsOf(schema,{type}),o={...value,type};
 for(const k of Object.keys(previous))if(!own(next,k))delete o[k];
 for(const[k,s]of Object.entries(next))if(!s.optional&&!own(o,k))o[k]=initial(s);
 return o;
}
export function validate(input,{attachments=new Map(),requireFiles=false}={}){
 const issues=[],files=[];const issue=(path,message,severity='error')=>issues.push({path,message,severity});
 if(!object(input))return {issues:[{path:'entrada',message:'La entrada debe ser un objeto',severity:'error'}],files,valid:false};
 const roots=Object.assign({},...Object.values(sections).map(s=>s.fields));
 const mats=object(input.material)?Object.values(input.material):[];
 const ids=new Set(mats.map(m=>m?.id));
 const bodies=object(input.body)?Object.entries(input.body).sort(([a],[b])=>a<b?-1:a>b?1:0).filter(([,b])=>b?.active!==false):[];
 function walk(s,v,path){
  if(v===undefined){if(!s.optional)issue(path,'Falta '+s.label);return;}
  if(s.phase===2&&input.n_phases!==2)issue(path,'Esta opción requiere dos fases');
  if(s.kind==='object'||s.kind==='map'){
   if(!object(v)){issue(path,'Se necesita un conjunto de propiedades');return;}
   const fields=s.kind==='object'?fieldsOf(s,v):null;
   if(fields){for(const[k,d]of Object.entries(fields))walk(d,v[k],path?path+'.'+k:k);for(const k of Object.keys(v))if(!own(fields,k))issue(path?path+'.'+k:k,'Parámetro no reconocido por el formulario, se conserva pero debe revisarse','warning');}
   else{if(Object.keys(v).length<(s.minItems??0))issue(path,'Añada al menos un elemento');for(const[k,x]of Object.entries(v)){if(!safeName(k))issue(path,'Nombre de elemento inválido');walk(s.item,x,path+'.'+k);}}
   return;
  }
  if(s.kind==='list'){if(!Array.isArray(v)){issue(path,'Se necesita una lista');return;}if(v.length<(s.minItems??0))issue(path,'Lista incompleta');v.forEach((x,i)=>walk(s.item,x,path+'['+i+']'));return;}
  if(s.kind==='vector'||s.kind==='pair'){
   const vectors=s.kind==='pair'?v:[v];if(!Array.isArray(v)||s.kind==='pair'&&v.length!==2){issue(path,'Se necesitan dos vectores de tres componentes');return;}
   for(const vector of vectors){if(!Array.isArray(vector)||vector.length!==3){issue(path,'Se necesitan tres componentes');continue;}for(const x of vector)checkNumber(x,s,path);}
   return;
  }
  if(s.kind==='boolean'){if(typeof v!=='boolean')issue(path,'Seleccione sí o no');return;}
  if(s.kind==='choice'){if(!s.choices.includes(v))issue(path,'Opción no admitida por el lector');return;}
  if(s.kind==='number'||s.kind==='integer'){
   checkNumber(v,{...s,integer:s.kind==='integer'},path);
   if(s.reference==='material'&&!ids.has(v))issue(path,'El material indicado no existe');
   if(s.reference==='body'&&(!Number.isInteger(v)||v<1||v>bodyIdentities(input).length))issue(path,'El cuerpo indicado no existe');
   return;
  }
  if(typeof v!=='string'){issue(path,'Se necesita texto');return;}
  if(s.file&&activeFile(path,input)){
   if(!safeName(v)||/[\\/]/.test(v)){issue(path,'Seleccione un archivo con nombre simple, sin carpetas');return;}
   if(v.toLowerCase()==='input.json'){issue(path,'input.json está reservado para la entrada principal');return;}
   if(s.file&&!v.toLowerCase().endsWith(s.file))issue(path,'El archivo debe ser '+s.file);
   files.push({name:v,path});if(!attachments.has(v))issue(path,'Archivo pendiente de adjuntar: '+v,requireFiles?'error':'warning');
  }
 }
 function checkNumber(n,s,p){
  if(typeof n!=='number'||!Number.isFinite(n)){issue(p,'Introduzca un número finito');return;}
  if(s.integer&&!Number.isSafeInteger(n))issue(p,'Se necesita un entero');
  if(s.min!==undefined&&n<s.min||s.max!==undefined&&n>s.max||s.exclusiveMin!==undefined&&n<=s.exclusiveMin||s.exclusiveMax!==undefined&&n>=s.exclusiveMax)issue(p,'Valor fuera del intervalo permitido');
 }
 walk({kind:'object',fields:roots},input,'');
 if(ids.size!==mats.length)issue('material','Los identificadores de material deben ser únicos');
 for(const[k,m]of Object.entries(input.material??{})){
  if(Object.keys(m).some(p=>p.startsWith('softening.'))&&m.softening!=='exponential')issue('material.'+k+'.softening','Active el ablandamiento exponencial para utilizar sus parámetros');
  for(const p of ['softening.friction.residual','softening.dilation.residual'])if(m[p]!==undefined&&m[p]>=90)issue('material.'+k+'.'+p,'El ángulo residual debe ser menor que 90°');
 }
 for(const p of ['material_point_results','grid_nodal_results','stl_contact_mesh']){
  const values=input.results?.[p];if(Array.isArray(values)&&values.length>1&&values.some(x=>x==='all'||x==='none'))issue('results.'+p,'Todos o ninguno se seleccionan sin otros campos');
 }
 if(!bodies.length)issue('body','Se necesita al menos un cuerpo activo');
 if(input.time_step>input.time)issue('time_step','El paso temporal supera la duración');
 if(input.n_phases===2){for(const[k,m]of Object.entries(input.material??{}))for(const field of ['density_fluid','porosity','bulk_fluid','hydraulic_conductivity'])if(!own(m,field))issue('material.'+k+'.'+field,'Complete las propiedades del fluido');}
 for(const[k,b]of bodies){
  const p='body.'+k;
  if(b.type==='cuboid')box(b,p,true);
  if(b.type==='particles'&&object(b.particles)){
   const p0=b.particles,n=p0.id?.length;
   if(new Set(p0.id??[]).size!==n)issue(p,'Los identificadores de partícula se repiten');
   for(const field of ['position','volume','material_id'])if(p0[field]?.length!==n)issue(p+'.particles.'+field,'Todas las listas deben tener la misma cantidad de partículas');
  }
  if(b.type==='polygon_2d'&&Array.isArray(b.points)){
   const axis={x:0,y:1,z:2}[b.extrude_direction];
   if(b.points.some(q=>!Array.isArray(q)||q.length!==3))continue;
   if(b.points.some(q=>Math.abs(q[axis]-b.points[0][axis])>1e-10))issue(p+'.points','Los vértices deben estar en un plano perpendicular a la extrusión');
   const ij=[0,1,2].filter(i=>i!==axis);let area=0;
   for(let i=0;i<b.points.length;i++){const a=b.points[i],c=b.points[(i+1)%b.points.length];area+=a[ij[0]]*c[ij[1]]-c[ij[0]]*a[ij[1]];}
   if(Math.abs(area)<1e-14)issue(p+'.points','El polígono tiene área nula');
  }
 }
 function box(b,p,strict=false){if(Array.isArray(b.point_p1)&&Array.isArray(b.point_p2)&&b.point_p1.some((x,i)=>strict?x>=b.point_p2[i]:x>b.point_p2[i]))issue(p,'El vértice mínimo debe preceder al máximo');}
 for(const group of ['load_distributed_box','initial_pressure_box','prescribed_pressure_box','pressure_force_box'])for(const[k,x]of Object.entries(input[group]??{}))box(x,group+'.'+k);
 for(const[k,p]of Object.entries(input.initial_pressure_material??{}))if(p.material!==p.material_id)issue('initial_pressure_material.'+k,'material y material_id deben coincidir en esta versión del lector');
 if(input.contact_manager?.active&&!Object.keys(input.contact??{}).length)issue('contact','Añada los pares de contacto');
 const contactIds=new Set();for(const[k,c]of Object.entries(input.contact??{})){if(c.master_id===c.slave_id)issue('contact.'+k,'Maestro y esclavo deben ser distintos');if(contactIds.has(c.id))issue('contact.'+k+'.id','ID de contacto repetido');contactIds.add(c.id);}
 if(input.load_state&&!input.load_state_file)issue('load_state_file','Adjunte el estado inicial');
 if(input.save_state&&!safeName(input.save_state_file??''))issue('save_state_file','Nombre de salida inválido');
 if(input.terrain_contact?.active&&!input.terrain_contact.stl_mesh)issue('terrain_contact.stl_mesh','Adjunte la superficie STL');
 if(input.terrain_contact?.penalty_contact_active&&!(input.terrain_contact.penalty_stiffness>0))issue('terrain_contact.penalty_stiffness','La penalización requiere rigidez positiva');
 if(input.earthquake?.active&&!input.earthquake.file)issue('earthquake.file','Adjunte el registro sísmico');
 if(input.hydro_mechanical_coupling?.enabled&&!input.hydro_mechanical_coupling.pore_pressure_field)issue('hydro_mechanical_coupling.pore_pressure_field','Adjunte el campo de presión de poros');
 return {issues,files,valid:!issues.some(x=>x.severity==='error')};
}
function activeFile(path,input){
 if(path==='load_state_file')return input.load_state===true;
 if(path.startsWith('terrain_contact.'))return input.terrain_contact?.active===true;
 if(path.startsWith('earthquake.'))return input.earthquake?.active===true;
 if(path.startsWith('hydro_mechanical_coupling.'))return input.hydro_mechanical_coupling?.enabled===true;
 return !path.startsWith('body.')||!Object.entries(input.body??{}).some(([key,b])=>path.startsWith('body.'+key+'.')&&b.active===false);
}
export function serialize(input){return JSON.stringify(input,null,2)+'\n';}
export function bodyIdentities(input){return Object.keys(input.body??{}).sort().flatMap(k=>{const b=input.body[k];if(b.active===false)return [];if(b.type==='gmsh')return Object.keys(b.physical_to_material??{}).sort().filter(g=>b.physical_to_material[g]>0).map(g=>k+' / '+g);return [k];});}
export function remapBodyReferences(input,before){
 const after=bodyIdentities(input);
 for(const c of Object.values(input.contact??{}))for(const k of ['master_id','slave_id']){const name=before[c[k]-1];c[k]=name&&after.includes(name)?after.indexOf(name)+1:0;}
}
