// Synthetic DOM tests of the built artifact. Not a visual/browser certification.
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {parseHTML} from 'linkedom';
import {unzipSync,strFromU8} from 'fflate';
const html=await readFile(new URL('dist/index.html',import.meta.url),'utf8');
const bundle=html.match(/<script>([\s\S]*)<\/script>/)[1];
function setup(specification,external=false){
 const {window}=parseHTML('<html><head></head><body><div id="app"></div></body></html>');
 if(external)window.document.getElementById('app').setAttribute('data-schema','external');
 const blobs=[];const storage=new Map();const alerts=[];
 const sandbox={document:window.document,Node:window.Node,Event:window.Event,console,Uint8Array,Uint16Array,Uint32Array,Int32Array,Float32Array,Float64Array,ArrayBuffer,TextEncoder,TextDecoder,Blob,structuredClone,
  __MPM_INPUT_SPEC__:specification,crypto:webcrypto,setTimeout:()=>0,clearTimeout:()=>{},confirm:()=>true,alert:message=>alerts.push(message),localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},URL:{createObjectURL:b=>{blobs.push(b);return 'blob:test';},revokeObjectURL:()=>{}}};
 vm.runInNewContext(bundle,sandbox,{timeout:3000});
 const doc=window.document;
 const click=text=>{const b=[...doc.querySelectorAll('button')].find(x=>x.textContent===text||x.getAttribute('aria-label')===text);assert(b,'Missing button: '+text);assert(!b.disabled,'Button disabled: '+text);b.click();};
 const input=(label,value,event='input')=>{const el=doc.querySelector('[aria-label="'+label+'"]');assert(el,'Missing control: '+label);if(el.tagName==='SELECT'){const options=[...el.querySelectorAll('option')];for(const option of options)option.selected=false;options.find(o=>o.value===String(value)).selected=true;assert.equal(el.value,String(value),'Synthetic DOM must select the intended option');}else if(el.type==='checkbox')el.checked=value;else el.value=value;el.dispatchEvent(new window.Event(event));};
 const json=()=>JSON.parse(doc.querySelector('pre').textContent);
 const flush=()=>new Promise(resolve=>setImmediate(resolve));
 return {window,doc,blobs,alerts,click,input,json,flush,storage};
}
test('Built standalone artifact starts with a valid export and no simulation actions',()=>{
 const s=setup();assert(s.doc.body.textContent.includes('Configuración completa'));assert(!s.doc.body.textContent.includes('Ejecutar simulación'));
 assert.equal(s.doc.documentElement.dataset.theme,'light');
 s.click('Modo oscuro');assert.equal(s.doc.documentElement.dataset.theme,'dark');s.click('Modo claro');
});
test('Independent editor has a compact accessible theme action and no simulator links',()=>{
 const s=setup(),theme=s.doc.querySelector('.theme-toggle');
 assert.equal(theme.textContent,'');assert(theme.querySelector('svg'));
 assert.equal(theme.getAttribute('aria-label'),'Modo oscuro');
 assert.equal(theme.getAttribute('aria-pressed'),'false');
 s.click('Modo oscuro');assert.equal(theme.getAttribute('aria-label'),'Modo claro');
 assert.equal(theme.getAttribute('aria-pressed'),'true');
 assert.equal(s.doc.querySelector('header p').textContent,'Configure el caso y descargue input.json');
 assert.equal(s.doc.querySelectorAll('a').length,0);
 assert([...s.doc.querySelectorAll('details')].every(x=>!x.hasAttribute('open')));
});
test('Switch languages without changing the JSON, selected section or user values',()=>{
 const s=setup();s.input('Duración [s]','.123');s.click('Materiales');
 const before=JSON.stringify(s.json());s.input('Idioma','en','change');
 assert.equal(s.doc.documentElement.lang,'en');assert.equal(s.doc.querySelector('h2').textContent,'Materials');
 assert.equal(s.doc.querySelector('header p').textContent,'Configure the case and download input.json');
 assert(s.doc.querySelector('[aria-label="Young\'s modulus [Pa]"]'));
 assert.equal(JSON.stringify(s.json()),before);assert.equal(s.storage.get('mpm-input-language'),'en');
 s.input('Language','pt','change');assert.equal(s.doc.querySelector('h2').textContent,'Materiais');
 assert.equal(JSON.stringify(s.json()),before);s.input('Idioma','es','change');
 assert.equal(s.doc.querySelector('h2').textContent,'Materiales');assert.equal(JSON.stringify(s.json()),before);
});
test('Validation and export are localised while machine-readable input stays unchanged',async()=>{
 const s=setup();s.input('Idioma','en','change');s.input('Duration [s]','-1');
 assert(s.doc.querySelector('.issue.error').textContent.includes('Value outside the allowed range'));
 s.input('Language','pt','change');assert(s.doc.querySelector('.issue.error').textContent.includes('Valor fora do intervalo permitido'));
 s.input('Duração [s]','.02');s.click('Baixar input.json');await s.flush();
 assert.deepEqual(JSON.parse(await s.blobs.at(-1).text()),s.json());
});
test('Local source compatibility check does not alter the model and survives language changes',async()=>{
 const s=setup(),before=JSON.stringify(s.json()),input=s.doc.querySelector('input[aria-label="Comprobar Input.cpp"]');
 const raw=await readFile(new URL('../../solver/src/Input.cpp',import.meta.url),'utf8');
 async function upload(text){input.files=[{size:text.length,text:async()=>text}];input.dispatchEvent(new s.window.Event('change'));for(let n=0;n<30;n++){await s.flush();if(!s.doc.body.textContent.includes('Comparando archivo…')&&!s.doc.body.textContent.includes('Comparing file…'))break;}}
 await upload(raw);assert(s.doc.body.textContent.includes('Input.cpp coincide con la versión del formulario'));
 s.input('Idioma','en','change');assert(s.doc.body.textContent.includes('Input.cpp matches the form version'));
 await upload(raw+'\n// changed source');assert(s.doc.body.textContent.includes('Input.cpp has changed'));
 assert.equal(JSON.stringify(s.json()),before);
});
test('An updated shared file adds a translated control and packages the matching C++ definition without rebuilding the UI',async()=>{
 const spec=JSON.parse(await readFile(new URL('../../input-spec/input-schema.json',import.meta.url),'utf8'));
 spec.version=2;spec.sections.calculation.fields.shared_probe={kind:'number',label:'Parámetro de prueba',value:2,min:0,translations:{en:'Test parameter',pt:'Parâmetro de teste'}};
 const s=setup(spec,true);assert.equal(s.json().shared_probe,2);
 s.input('Parámetro de prueba',3);assert.equal(s.json().shared_probe,3);
 s.input('Idioma','en','change');assert(s.doc.querySelector('[aria-label="Test parameter"]'));
 s.click('Download reader integration');for(let n=0;n<30&&!s.blobs.length;n++)await s.flush();
 assert(s.blobs.length);const raw=new Uint8Array(await s.blobs.at(-1).arrayBuffer()),files=unzipSync(raw);
 assert.deepEqual(JSON.parse(strFromU8(files['input-schema.json'])),spec);
 assert(strFromU8(files['InputSchema.generated.h']).includes('shared_probe'));
 assert(strFromU8(files['Input.cpp.patch']).includes('InputSchema::validate'));
 await mkdir(new URL('../../test-output/',import.meta.url),{recursive:true});
 await writeFile(new URL('../../test-output/SHARED_MUTATION.zip',import.meta.url),raw);
});
test('The web editor refuses to silently use an old bundled definition when its shared file is missing',()=>{
 const s=setup(undefined,true);assert(s.doc.body.textContent.includes('No se pudo cargar la definición de entrada'));assert.equal(s.doc.querySelectorAll('input').length,0);
});
test('Navigate every configuration section and preserve the JSON',()=>{
 const s=setup(),before=JSON.stringify(s.json());
 for(const name of ['Malla','Materiales','Geometría','Cargas y presiones','Contacto','Estados y acoplamiento','Sismicidad','Resultados','Cálculo']){s.click(name);assert.equal(s.doc.querySelector('h2').textContent,name);}
 assert.equal(JSON.stringify(s.json()),before);
});
test('Changes show validation errors, prevent export and recover when corrected',()=>{
 const s=setup();s.input('Duración [s]','-1');assert(s.doc.querySelector('.issue.error'));assert(s.doc.querySelector('button.primary').disabled);
 s.input('Duración [s]','.1');assert(!s.doc.querySelector('.issue.error'));assert.equal(s.json().time,.1);
});
test('Material and geometry selectors build complete native variants',()=>{
 const s=setup();s.click('Materiales');s.input('Modelo','mohr-coulomb','change');assert.equal(s.json().material.material_001.type,'mohr-coulomb');assert.equal(s.json().material.material_001.cohesion,1000);
 s.click('Geometría');s.input('Geometría','sphere','change');assert.equal(s.json().body.cuerpo_001.type,'sphere');assert(s.json().body.cuerpo_001.center);assert(!('point_p1'in s.json().body.cuerpo_001));
});
test('Adding materials assigns unused IDs and removal exposes invalid references',()=>{
 const s=setup();s.click('Materiales');s.click('Añadir materiales');assert.equal(s.json().material.material_002.id,2);
 s.input('Identificador',3);assert(s.doc.body.textContent.includes('material indicado no existe'));
});
test('Repeated table rows can be added and removed',()=>{
 const s=setup();s.click('Geometría');s.input('Geometría','polygon_2d','change');assert.equal(s.json().body.cuerpo_001.points.length,4);s.click('Añadir vértices del polígono [m]');assert.equal(s.json().body.cuerpo_001.points.length,5);
});
test('Downloaded JSON equals the actual form configuration',async()=>{
 const s=setup();s.input('Duración [s]','.15');s.click('Descargar input.json');await s.flush();assert.equal(s.blobs.length,1);const d=JSON.parse(await s.blobs[0].text());assert.equal(d.time,.15);assert.deepEqual(d,s.json());
});
test('Import preserves analytical input keys without manually editing JSON',async()=>{
 const s=setup(),d=s.json();d.time=.12;d.material.material_001.type='mohr-coulomb';Object.assign(d.material.material_001,{cohesion:1000,friction:30,'softening.cohesion.active':true,softening:'exponential'});
 const upload=s.doc.querySelector('[aria-label="Importar entrada JSON"]');upload.files=[{text:async()=>JSON.stringify(d)}];upload.dispatchEvent(new s.window.Event('change'));await s.flush();assert.deepEqual(s.json(),d);assert.equal(s.alerts.length,0);
});
test('Import rejects duplicate properties without replacing the current configuration',async()=>{
 const s=setup(),before=JSON.stringify(s.json()),upload=s.doc.querySelector('[aria-label="Importar entrada JSON"]');upload.files=[{text:async()=>'{"time":1,"time":2}'}];upload.dispatchEvent(new s.window.Event('change'));await s.flush();assert.equal(JSON.stringify(s.json()),before);assert.equal(s.alerts.length,1);
});
test('Two-phase form enables fluid properties and exports a compatible configuration',async()=>{
 const s=setup();s.input('Número de fases',2,'change');s.click('Materiales');
 for(const label of ['Densidad del fluido [kg/m³]','Porosidad','Módulo volumétrico del fluido [Pa]','Conductividad hidráulica [m/s]'])s.input('Incluir '+label,true,'change');
 assert(!s.doc.querySelector('.issue.error'));s.click('Descargar input.json');await s.flush();assert.equal(JSON.parse(await s.blobs[0].text()).n_phases,2);
});
test('Uploading a state produces a portable ZIP with the exact UI input and attachment',async()=>{
 const s=setup();s.click('Estados y acoplamiento');s.input('Cargar estado inicial',true,'change');s.input('Incluir Archivo de tensiones iniciales',true,'change');
 const raw=JSON.stringify([{index:0,stress:[[1,0,0],[0,1,0],[0,0,1]]}]),bytes=new TextEncoder().encode(raw);
 const upload=s.doc.querySelector('[aria-label="Adjuntar Archivo de tensiones iniciales"]');upload.files=[{name:'state.json',size:bytes.length,arrayBuffer:async()=>bytes.buffer}];upload.dispatchEvent(new s.window.Event('change'));await s.flush();
 assert.equal(s.json().load_state_file,'state.json');assert(!s.doc.querySelector('.issue.error'));s.click('Descargar paquete');await s.flush();
 assert.equal(s.blobs.length,1);const zip=new Uint8Array(await s.blobs[0].arrayBuffer()),entries=unzipSync(zip);
 assert.deepEqual(JSON.parse(strFromU8(entries['input.json'])),s.json());assert.equal(strFromU8(entries['state.json']),raw);
 await writeFile(new URL('../../test-output/DOM_EXPORT.zip',import.meta.url),zip);
});
test('An external file named input.json is renamed instead of replacing the configuration',async()=>{
 const s=setup();s.click('Estados y acoplamiento');s.input('Cargar estado inicial',true,'change');s.input('Incluir Archivo de tensiones iniciales',true,'change');
 const raw=JSON.stringify([{index:0,stress:[[1,0,0],[0,1,0],[0,0,1]]}]),bytes=new TextEncoder().encode(raw);
 const upload=s.doc.querySelector('[aria-label="Adjuntar Archivo de tensiones iniciales"]');upload.files=[{name:'input.json',size:bytes.length,arrayBuffer:async()=>bytes.buffer}];upload.dispatchEvent(new s.window.Event('change'));await s.flush();
 assert.equal(s.json().load_state_file,'archivo_input.json');s.click('Descargar paquete');await s.flush();const entries=unzipSync(new Uint8Array(await s.blobs[0].arrayBuffer()));assert.equal(JSON.parse(strFromU8(entries['input.json'])).load_state_file,'archivo_input.json');
});
test('Late file reads do not overwrite edits made while the file was loading',async()=>{
 const s=setup();s.click('Estados y acoplamiento');s.input('Cargar estado inicial',true,'change');s.input('Incluir Archivo de tensiones iniciales',true,'change');
 let resolve;const pending=new Promise(r=>resolve=r),upload=s.doc.querySelector('[aria-label="Adjuntar Archivo de tensiones iniciales"]');upload.files=[{name:'state.json',size:10,arrayBuffer:()=>pending}];upload.dispatchEvent(new s.window.Event('change'));
 s.click('Cálculo');s.input('Duración [s]','.3');resolve(new TextEncoder().encode('[]').buffer);await s.flush();assert.equal(s.json().time,.3);assert.equal(s.json().load_state_file,'');
});
