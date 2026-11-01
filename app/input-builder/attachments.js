import {validate,parseJSON} from './model.js';
const cache=new WeakMap();
function inspect(record,name){
 let saved=cache.get(record);if(saved)return saved;
 const text=new TextDecoder('utf-8',{fatal:true}).decode(record.bytes);
 saved={text};if(name.toLowerCase().endsWith('.json'))saved.json=parseJSON(text);
 cache.set(record,saved);return saved;
}
const finite=n=>typeof n==='number'&&Number.isFinite(n);
const vec=v=>Array.isArray(v)&&v.length===3&&v.every(finite);
export function attachmentIssues(input,attached){
 const issues=[],refs=validate(input,{attachments:attached}).files;
 for(const ref of refs){const record=attached.get(ref.name);if(!record)continue;
  try{
   const {text,json}=inspect(record,ref.name),lower=ref.name.toLowerCase();
   if(lower.endsWith('.json')){
    if(!Array.isArray(json)||!json.length)throw Error('Se necesita una lista no vacía');
    if(ref.path==='load_state_file'){
     const seen=new Set();for(const r of json){if(!r||!Number.isInteger(r.index)||r.index<0||seen.has(r.index)||!Array.isArray(r.stress)||r.stress.length!==3||!r.stress.every(vec))throw Error('Se necesita un índice único no negativo y un tensor 3×3 finito por registro');seen.add(r.index);}
    }else if(ref.path.includes('pore_pressure_field')){
     if(json.some(r=>!r||!vec(r.position)||!finite(r.pressure)))throw Error('Cada registro necesita posición de tres componentes y presión finita');
    }else if(ref.path.startsWith('body.')){
     const b=Object.entries(input.body??{}).find(([name])=>ref.path==='body.'+name+'.file')?.[1];
     const ids=new Set(Object.values(input.material??{}).map(m=>m.id));
     for(const r of json){if(!r||!vec(r.position)||!finite(r.volume)||r.volume<=0)throw Error('Cada partícula necesita posición de tres componentes y volumen positivo');if(b?.material_id===undefined&&(!Number.isInteger(r.material_id)||!ids.has(r.material_id)))throw Error('El material de una partícula no existe');}
    }
   }else if(ref.path==='earthquake.file'){
    const lines=text.trim().split(/\r?\n/);if(input.earthquake.header)lines.shift();let previous=-Infinity;if(!lines.length)throw Error('Registro vacío');
    for(const line of lines){const cells=line.trim().split(/\s+/).map(Number);if(cells.length!==4||cells.some(x=>!Number.isFinite(x))||cells[0]<=previous)throw Error('Se necesitan cuatro columnas numéricas y tiempo estrictamente creciente');previous=cells[0];}
   }else if(lower.endsWith('.msh')){
    if(!/\$MeshFormat\s+4\.1\s+0\s+8/.test(text)||!text.includes('$Nodes')||!text.includes('$Elements'))throw Error('Se necesita una malla Gmsh ASCII 4.1 con nodos y elementos');
    const names=new Set([...text.matchAll(/^\s*3\s+\d+\s+"([^"]+)"/gm)].map(m=>m[1]));
    const b=Object.entries(input.body??{}).find(([name])=>ref.path==='body.'+name+'.mesh_file')?.[1];
    for(const name of Object.keys(b?.physical_to_material??{}))if(!names.has(name))throw Error('No existe el grupo físico volumétrico '+name+' en la malla');
   }else if(lower.endsWith('.stl')){
    if(!text.trimStart().startsWith('solid')||!text.includes('endsolid'))throw Error('Se necesita un archivo STL ASCII completo');
    const facets=[...text.matchAll(/facet\s+normal\s+([^\n]+)[\s\S]*?endfacet/g)];if(!facets.length)throw Error('La superficie no contiene triángulos');
    for(const facet of facets){const ns=facet[1].trim().split(/\s+/).map(Number),vertices=[...facet[0].matchAll(/vertex\s+([^\n]+)/g)].map(m=>m[1].trim().split(/\s+/).map(Number));if(!vec(ns)||vertices.length!==3||!vertices.every(vec))throw Error('Un triángulo STL no contiene una normal y tres vértices finitos');}
   }
  }catch(e){issues.push({path:ref.path,message:ref.name+': '+e.message,severity:'error'});}
 }return issues;
}
