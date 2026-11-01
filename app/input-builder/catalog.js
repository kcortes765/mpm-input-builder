import bundledSpecification from '../../input-spec/input-schema.json' with {type:'json'};
import {validateSpecification} from './specification.js';
if(globalThis.document?.getElementById('app')?.getAttribute('data-schema')==='external'&&!globalThis.__MPM_INPUT_SPEC__)throw Error('Shared input specification not loaded');
const specification=globalThis.__MPM_INPUT_SPEC__??bundledSpecification;
validateSpecification(specification);
export const INPUT_SPEC=specification;
export const VERSION=specification.sourceCommit;
export const SCHEMA_VERSION=specification.version;
export const sections=specification.sections;
export const material=sections.materials.fields.material.item;
export const body=sections.bodies.fields.body.item;
export function fieldsOf(schema,value){return {...(schema.fields??{}),...(schema.variants?.[value?.type]??{})};}
export function initial(schema){
 if(schema.initial!==undefined)return structuredClone(schema.initial);
 if(schema.kind==='object'){
  const o={};for(const[k,s]of Object.entries(schema.fields))if(!s.optional)o[k]=initial(s);
  for(const[k,s]of Object.entries(schema.variants?.[o.type]??{}))if(!s.optional)o[k]=initial(s);
  return o;
 }
 if(schema.kind==='map'){const o={};if(schema.minItems)o[(schema.prefix??'grupo')+'_001']=initial(schema.item);return o;}
 if(schema.kind==='list')return [];
 return structuredClone(schema.value);
}
export function freshInput(){return Object.assign({},...Object.values(sections).map(initial));}
