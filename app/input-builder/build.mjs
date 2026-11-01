import {build} from 'esbuild';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {assertCompatibleInput} from './check-input.mjs';
import {prepareSharedReader} from './shared-reader.mjs';
await assertCompatibleInput();
const shared=await prepareSharedReader();
const root=fileURLToPath(new URL('.',import.meta.url));
const result=await build({entryPoints:[root+'main.js'],bundle:true,write:false,outdir:root+'dist',format:'iife',platform:'browser',target:'es2022',minify:true,legalComments:'eof',loader:{'.h':'text','.py':'text','.patch':'text','.txt':'text'}});
const program=result.outputFiles.find(x=>x.path.endsWith('.js')).text,css=result.outputFiles.find(x=>x.path.endsWith('.css')).text;
const js='try{'+program+'}catch(error){const node=document.getElementById("app"),lang=globalThis.navigator?.language?.slice(0,2)??"es";if(node)node.textContent=({es:"No se pudo cargar la definición de entrada. Revise el esquema.",en:"Could not load the input definition. Check the schema.",pt:"Não foi possível carregar a definição de entrada. Verifique o esquema."})[lang]??"Could not load the input definition. Check the schema.";console.error("MPM_INPUT_DEFINITION_ERROR");}';
const notice=await readFile(new URL('../../licenses/fflate.txt',import.meta.url),'utf8');
const html='<!doctype html>\n<!-- Bundled ZIP library: fflate\n'+notice+'\n-->\n<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Entrada de simulación · MPM</title><style>'+css+'</style></head><body><div id="app"></div><script>'+js.replace(/<\/script/gi,'<\\/script')+'</script></body></html>\n';
await mkdir(root+'dist',{recursive:true});await mkdir(new URL('../../dist/',import.meta.url),{recursive:true});await writeFile(root+'dist/index.html',html);await writeFile(new URL('../../dist/generador-mpm.html',import.meta.url),html);console.log('Standalone HTML:',Buffer.byteLength(html),'bytes');
if(process.argv.includes('--web')){
 const destination=fileURLToPath(new URL('../../dist/web/',import.meta.url));
 await mkdir(destination,{recursive:true});
 const webHtml='<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Entrada de simulación · MPM</title><link rel="stylesheet" href="./input-builder.css"></head><body><div id="app" data-schema="external"></div><script src="./input-schema.js"></script><script src="./input-builder.js"></script></body></html>\n';
 await writeFile(destination+'input-builder.html',webHtml);
 await writeFile(destination+'input-builder.js',js);
 await writeFile(destination+'input-builder.css',css);
 await writeFile(destination+'input-schema.js','globalThis.__MPM_INPUT_SPEC__='+JSON.stringify(JSON.parse(shared.schema))+';\n');
 console.log('Web assets: input-builder.html, input-builder.js, input-builder.css, input-schema.js');
}
