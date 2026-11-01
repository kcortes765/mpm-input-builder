import {sections,fieldsOf,initial,VERSION,INPUT_SPEC} from './catalog.js';
import {freshInput,parseInput,changeType,validate,serialize,safeName,bodyIdentities,remapBodyReferences} from './model.js';
import {attachmentIssues} from './attachments.js';
import {zipSync,strToU8} from 'fflate';
import {t,setLocale,getLocale,LANGUAGES,registerSpecificationTranslations} from './i18n.js';
import {inspectInputSource} from './compatibility.js';
import sourceContract from './input-contract.json';
import {readerPackage} from './reader-package.js';
import './style.css';

registerSpecificationTranslations(INPUT_SPEC);
let preferred='es';try{preferred=localStorage.getItem('mpm-input-language')??globalThis.navigator?.language?.split('-')[0]??'es';}catch{}
setLocale(preferred);document.documentElement.lang=getLocale();document.title=t('Entrada de simulación · MPM');
const textSources=new WeakMap(),attributeSources=new WeakMap();
const el=(tag,attrs={},...children)=>{const x=document.createElement(tag);for(const[k,v]of Object.entries(attrs)){if(k==='class')x.className=v;else if(k.startsWith('on'))x.addEventListener(k.slice(2),v);else if(k==='text')x.textContent=t(v);else if(v!==undefined){if(['aria-label','title'].includes(k)){const sources=attributeSources.get(x)??{};sources[k]=v;attributeSources.set(x,sources);x.setAttribute(k,t(v));}else x.setAttribute(k,v);}}for(const c of children.flat(Infinity))if(c!==undefined&&c!==null){if(c instanceof Node)x.append(c);else{const node=document.createTextNode(t(String(c)));textSources.set(node,String(c));x.append(node);}}return x;};
function translateTree(node){if(textSources.has(node))node.textContent=t(textSources.get(node));for(const[k,v]of Object.entries(attributeSources.get(node)??{}))node.setAttribute(k,t(v));for(const child of [...node.childNodes])translateTree(child);}
const button=(text,action,attrs={})=>el('button',{type:'button',onclick:action,...attrs},text);
const labels={elastic:'Elástico','mohr-coulomb':'Mohr–Coulomb',newtonian:'Fluido newtoniano',cuboid:'Cuboide',sphere:'Esfera',polygon_2d:'Polígono extruido',particles:'Partículas explícitas',particles_list:'Partículas desde archivo',particles_from_file:'Partículas desde archivo · alias',gmsh:'Malla Gmsh',linear:'Lineal',all:'Todos los campos',none:'Ninguno',id:'Identificador',body:'Cuerpo',material:'Material',mass:'Masa',volume:'Volumen',active:'Estado activo',displacement:'Desplazamiento',velocity:'Velocidad',stress:'Tensión',plastic_strain:'Deformación plástica',pressure:'Presión',pore_pressure:'Presión de poros',external_force:'Fuerza externa',distance_levelset:'Distancia a la superficie',density_levelset:'Densidad de nivel',master:'Maestro',slave:'Esclavo',collinear:'Colineal',fixed:'Fijo',sliding:'Deslizante',free:'Libre',local:'Local',kinetic:'Relajación dinámica cinética',exponential:'Exponencial',barycentric:'Baricéntrica',gaussian:'Gaussiana',one_way:'Unidireccional'};
let data=freshInput(),active='calculation',revision=0,attached=new Map(),fileIssues=[],uploadSequence=0;
const app=document.querySelector('#app');
const nav=el('nav',{'aria-label':'Configuración'}),form=el('form',{onsubmit:e=>e.preventDefault()}),summary=el('div',{class:'summary','aria-live':'polite'}),issues=el('div',{class:'issues'}),preview=el('pre',{'aria-label':'Vista previa del archivo JSON'});
const importer=el('input',{type:'file',accept:'.json,application/json',hidden:'','aria-label':'Importar entrada JSON'});
const source=el('small',{},'Esquema compartido · v'+INPUT_SPEC.version+' · '+VERSION.slice(0,7));
const info=el('p',{class:'muted'},'Configure el caso y descargue input.json');
const download=button('Descargar input.json',()=>save(false),{class:'primary'}),packageButton=button('Descargar paquete',()=>save(true));
const help=el('details',{},el('summary',{},'Alcance de las comprobaciones'),el('p',{},'Se comprueban formatos, referencias entre elementos, parámetros y archivos necesarios. Esto no determina si el modelo físico representa correctamente su problema. No se ejecutan simulaciones desde este generador.'),source);
const sourcePicker=el('input',{type:'file',accept:'.cpp,text/plain',hidden:'','aria-label':'Comprobar Input.cpp'}),sourceStatus=el('p',{class:'hint',role:'status','aria-live':'polite'});
let sourceSequence=0;
help.append(el('p',{},'Seleccione su Input.cpp para compararlo con la versión del formulario. El archivo permanece en su navegador.'),button('Comprobar Input.cpp',()=>sourcePicker.click()),sourcePicker,sourceStatus);
help.append(el('p',{},'Los formularios y las comprobaciones básicas del lector se generan desde un archivo común. La adaptación del lector se instala por separado.'),button('Descargar integración del lector',async()=>{try{downloadBytes(await readerPackage(INPUT_SPEC),'application/zip','integracion-lector.zip');}catch{alert(t('No se pudo preparar la integración'));}}));
sourcePicker.addEventListener('change',async()=>{
 const file=sourcePicker.files?.[0],sequence=++sourceSequence;if(!file)return;
 sourceStatus.replaceChildren(el('span',{},'Comparando archivo…'));
 try{if(file.size>2*1024*1024)throw Error('Source size limit');const report=await inspectInputSource(await file.text(),sourceContract);if(sequence!==sourceSequence)return;sourceStatus.replaceChildren(el('span',{class:report.matches?'':'warning'},report.matches?'Input.cpp coincide con la versión del formulario':'Input.cpp cambió. Revise el catálogo antes de usar esta entrada con esa versión'));}
 catch{if(sequence===sourceSequence)sourceStatus.replaceChildren(el('span',{class:'error'},'No se pudo comprobar el archivo'));}
 finally{if(sequence===sourceSequence)sourcePicker.value='';}
});
let dark=false;try{dark=localStorage.getItem('mpm-input-theme')==='dark';}catch{}
const theme=button('',()=>{dark=!dark;document.documentElement.dataset.theme=dark?'dark':'light';updateThemeButton();try{localStorage.setItem('mpm-input-theme',dark?'dark':'light');}catch{}},{class:'theme-toggle'});
function updateThemeButton(){
 const label=dark?'Modo claro':'Modo oscuro';
 theme.setAttribute('aria-label',t(label));theme.setAttribute('title',t(label));theme.setAttribute('aria-pressed',String(dark));
 theme.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(dark?'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/>':'<path d="M20.9 13A9 9 0 0 1 11 3.1 9 9 0 1 0 20.9 13Z"/>')+'</svg>';
}
updateThemeButton();
document.documentElement.dataset.theme=dark?'dark':'light';
const title=el('div',{},el('h1',{},'Entrada MPM'),info);
const language=el('select',{class:'language-select','aria-label':'Idioma',title:'Idioma'});
for(const[code,name]of Object.entries(LANGUAGES)){const option=el('option',{value:code,lang:code},name);option.selected=code===getLocale();language.append(option);}
language.addEventListener('change',()=>{setLocale(language.value);document.documentElement.lang=getLocale();document.title=t('Entrada de simulación · MPM');try{localStorage.setItem('mpm-input-language',getLocale());}catch{}translateTree(app);updateThemeButton();render();});
const heading=el('header',{},title,el('div',{class:'toolbar'},language,theme,button('Importar entrada',()=>importer.click()),button('Nuevo modelo',()=>{if(!confirm(t('¿Crear un modelo nuevo? La configuración actual se reemplazará.')))return;uploadSequence++;data=freshInput();attached.clear();fileIssues=[];revision++;render();})));
app.append(heading,importer,el('div',{class:'layout'},nav,el('main',{},form),el('aside',{},summary,el('div',{class:'exports'},download,packageButton),issues,el('details',{},el('summary',{},'Vista previa del JSON'),preview),help)));

function at(path){return path.reduce((o,k)=>o?.[k],data);}
function set(path,value){let o=data;for(const k of path.slice(0,-1))o=o[k];if(value===undefined)delete o[path.at(-1)];else o[path.at(-1)]=value;revision++;refresh();}
function mutate(action){const before=bodyIdentities(data);action();remapBodyReferences(data,before);revision++;render();}
function render(){
 nav.replaceChildren(...Object.entries(sections).map(([key,s],i)=>button(s.label,()=>{active=key;render();form.querySelector('h2').focus();},{class:active===key?'selected':'','aria-current':active===key?'step':'false'})));
 form.replaceChildren(el('h2',{tabindex:'-1'},sections[active].label));
 const root=sections[active];for(const[k,s]of Object.entries(root.fields))form.append(field(s,[k]));refresh();
}
function field(s,path){
 const val=at(path),name=path.map(String).join('.'),wrap=el('div',{class:'field kind-'+s.kind,'data-path':name});
 const label=el('span',{class:'field-label'},s.label);
 if(s.optional){const box=el('input',{type:'checkbox','aria-label':'Incluir '+s.label});box.checked=val!==undefined;box.addEventListener('change',()=>{set(path,box.checked?initial(s):undefined);render();});wrap.append(el('label',{class:'optional'},box,label));if(val===undefined)return wrap;}
 else if(!['object','map','list'].includes(s.kind))wrap.append(label);
 if(s.note)wrap.append(el('p',{class:'hint'},s.note));
 if(s.phase===2&&data.n_phases!==2)wrap.append(el('p',{class:'hint'},'Requiere dos fases')); 
 if(s.kind==='object'){
  if(!s.optional)wrap.append(el('h3',{},s.label));
  if(!val||typeof val!=='object'||Array.isArray(val)){wrap.append(el('p',{class:'error'},'La estructura importada no es compatible'),button('Restablecer sección',()=>{set(path,initial(s));render();}));return wrap;}
  const grid=el('div',{class:'fields'});for(const[k,d]of Object.entries(fieldsOf(s,val)))grid.append(field(d,[...path,k]));wrap.append(grid);return wrap;
 }
 if(s.kind==='map'||s.kind==='list'){
  if(!s.optional)wrap.append(el('h3',{},s.label));
  if(val===null||typeof val!=='object'||(s.kind==='list'&&!Array.isArray(val))){wrap.append(el('p',{class:'error'},'La lista importada no es compatible'),button('Restablecer lista',()=>{set(path,initial(s));render();}));return wrap;}
  const rows=Object.entries(val).sort(([a],[b])=>s.kind==='list'?Number(a)-Number(b):a<b?-1:a>b?1:0);
  for(const[k,v]of rows){
   const sub=el('section',{class:'entry'});
   const keyInput=el('input',{value:k,'aria-label':'Nombre de '+s.label});
   keyInput.addEventListener('change',()=>{const target=keyInput.value.trim();if(!safeName(target)||target!==k&&Object.hasOwn(val,target)){keyInput.setCustomValidity(t('Nombre inválido o repetido'));keyInput.reportValidity();return;}keyInput.setCustomValidity('');mutate(()=>{const value=val[k];delete val[k];val[target]=value;});});
   const caption=s.kind==='map'?keyInput:el('span',{},'Elemento '+(Number(k)+1));
   sub.append(el('div',{class:'entry-head'},caption,button('Quitar',()=>mutate(()=>{if(s.kind==='list')val.splice(Number(k),1);else delete val[k];}),{'aria-label':'Quitar '+s.label+' '+k})));
   if(path[0]==='body'){const identities=bodyIdentities(data);sub.append(el('p',{class:'hint'},'Identificadores nativos de cuerpo: '+identities.flatMap((key,i)=>key===k||key.startsWith(k+' / ')?[String(i+1)]:[]).join(', ')));}
   sub.append(field(s.item,[...path,s.kind==='list'?Number(k):k]));wrap.append(sub);
  }
  wrap.append(button('Añadir '+s.label.toLowerCase(),()=>mutate(()=>{
   let v=initial(s.item);if(v&&typeof v==='object'&&!Array.isArray(v)&&'id'in v){const used=new Set(Object.values(val).map(x=>x.id));let id=1;while(used.has(id))id++;v.id=id;}
   if(s.kind==='list'){if(s.item.kind==='integer'&&/Identificadores/.test(s.label))v=Math.max(0,...val.filter(Number.isSafeInteger))+1;val.push(v);}
   else{let n=1;while(Object.hasOwn(val,(s.prefix??'grupo')+'_'+String(n).padStart(3,'0')))n++;val[(s.prefix??'grupo')+'_'+String(n).padStart(3,'0')]=v;}
  }),{class:'add'}));return wrap;
 }
 if(s.kind==='vector'||s.kind==='pair'){
  const vv=s.kind==='pair'?val:[val];
  for(let row=0;row<(s.kind==='pair'?2:1);row++){
   const inputs=el('div',{class:'vector'});if(s.kind==='pair')wrap.append(el('small',{},row===0?'Posición [m]':'Fuerza [N]'));
   for(let i=0;i<3;i++){
    const inp=el('input',{type:'number',step:s.integer?'1':'any',inputmode:'decimal',value:vv?.[row]?.[i]??'', 'aria-label':s.label+' · '+(s.kind==='pair'?(row===0?'posición':'fuerza')+' · ':'')+['X','Y','Z'][i]});
    inp.addEventListener('input',()=>{const raw=at(path),valid=s.kind==='pair'?Array.isArray(raw)&&raw.length===2&&raw.every(q=>Array.isArray(q)&&q.length===3):Array.isArray(raw)&&raw.length===3;const q=structuredClone(valid?raw:initial(s));if(s.kind==='pair')q[row][i]=inp.value===''?null:Number(inp.value);else q[i]=inp.value===''?null:Number(inp.value);set(path,q);});
    inputs.append(el('label',{},el('small',{},['X','Y','Z'][i]),inp));
   }wrap.append(inputs);
  }return wrap;
 }
 let control;
 if(s.kind==='boolean'){control=el('input',{type:'checkbox','aria-label':s.label});control.checked=val===true;control.addEventListener('change',()=>{set(path,control.checked);render();});}
 else if(s.kind==='choice'){
  control=el('select',{'aria-label':s.label});for(const v of s.choices){const opt=el('option',{value:String(v)},labels[v]??String(v));opt.selected=val===v;control.append(opt);}control.addEventListener('change',()=>{
   const value=s.choices.find(x=>String(x)===control.value);
   if(path.at(-1)==='type'){
    const parent=path.slice(0,-1),parentSchema=findSchema(parent);set(parent,changeType(at(parent),parentSchema,value));
   }else set(path,value);render();
  });
 }else{
  control=el('input',{type:['number','integer'].includes(s.kind)?'number':'text',step:s.kind==='integer'?'1':'any',value:val??'','aria-label':s.label});
  control.addEventListener('input',()=>{set(path,['number','integer'].includes(s.kind)?control.value===''?null:Number(control.value):control.value);});
 }
 const id='control-'+name.replace(/[^a-zA-Z0-9_-]/g,'-');control.id=id;label.setAttribute('id',id+'-label');control.setAttribute('aria-labelledby',id+'-label');wrap.append(control);
 if(s.file){
  const upload=el('input',{type:'file',accept:s.file,'aria-label':'Adjuntar '+s.label});
  upload.addEventListener('change',async()=>{
   const f=upload.files?.[0],stamp=revision,seq=++uploadSequence;if(!f)return;
   if(f.size>32*1024*1024){alert(t('El archivo supera 32 MiB'));return;}
   const bytes=new Uint8Array(await f.arrayBuffer());if(seq!==uploadSequence||stamp!==revision)return;
   let filename=f.name.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9_. -]/g,'_');if(!safeName(filename))filename='archivo'+s.file;if(filename.toLowerCase()==='input.json')filename='archivo_input.json';
   if(attached.has(filename)&&attached.get(filename).file!==f){alert(t('Ya existe un adjunto con ese nombre, use nombres distintos'));return;}
   attached.set(filename,{bytes,file:f});set(path,filename);await checkFiles();render();
  });wrap.append(upload,el('small',{class:'hint'},val&&attached.has(val)?'Archivo adjunto · '+attached.get(val).bytes.length.toLocaleString('es')+' bytes':'Sin archivo adjunto'));
 }return wrap;
}
function findSchema(path){let s={kind:'object',fields:Object.assign({},...Object.values(sections).map(x=>x.fields))},v=data;for(const k of path){s=s.kind==='map'||s.kind==='list'?s.item:fieldsOf(s,v)[k];v=v?.[k];}return s;}
function refresh(){
 fileIssues=attachmentIssues(data,attached);
 const result=validate(data,{attachments:attached,requireFiles:true});
 const all=[...result.issues,...fileIssues],errors=all.filter(x=>x.severity==='error'),warnings=all.filter(x=>x.severity!=='error');
 summary.replaceChildren(el('strong',{},errors.length?errors.length+' '+(errors.length===1?'aspecto por completar':'aspectos por completar'):'Configuración completa'));
 issues.replaceChildren(...all.map(x=>button((x.severity==='error'?'Completar: ':'Revisar: ')+x.message,()=>focusIssue(x.path),{class:x.severity==='error'?'issue error':'issue warning',title:x.path})));
 download.disabled=errors.length>0;packageButton.disabled=errors.length>0;
 download.hidden=result.files.length>0;packageButton.hidden=result.files.length===0;
 preview.textContent=serialize(data);
 for(const node of form.querySelectorAll('[data-path]'))node.classList.toggle('invalid',errors.some(e=>e.path===node.dataset.path));
}
function focusIssue(path){const root=path.split(/[.[]/)[0],key=Object.keys(sections).find(k=>root in sections[k].fields);if(key)active=key;render();const match=[...form.querySelectorAll('[data-path]')].find(x=>x.dataset.path===path);(match?.querySelector('input,select,button')??form.querySelector('h2')).focus();}
async function checkFiles(){
 refresh();
}
async function save(pack){
 const stamp=revision;await checkFiles();if(stamp!==revision)return;
 const result=validate(data,{attachments:attached,requireFiles:true});if(!result.valid||fileIssues.some(x=>x.severity==='error'))return;
 let bytes,type,name;if(pack){const content={'input.json':strToU8(serialize(data))};for(const ref of result.files)content[ref.name]=attached.get(ref.name).bytes;bytes=zipSync(content,{level:6});type='application/zip';name='entrada-mpm.zip';}
 else{bytes=serialize(data);type='application/json';name='input.json';}
 downloadBytes(bytes,type,name);
}
function downloadBytes(bytes,type,name){const url=URL.createObjectURL(new Blob([bytes],{type})),a=el('a',{href:url,download:name});document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);}
importer.addEventListener('change',async()=>{
 const file=importer.files?.[0],seq=++uploadSequence,stamp=revision;if(!file)return;
 try{const content=await file.text();if(seq!==uploadSequence||stamp!==revision)return;const parsed=parseInput(content);if(!confirm(t('¿Reemplazar la configuración actual por este archivo?')))return;data=parsed;attached.clear();fileIssues=[];revision++;active='calculation';render();}
 catch(e){alert(t('No se pudo importar la entrada: '+e.message));}finally{importer.value='';}
});
render();
