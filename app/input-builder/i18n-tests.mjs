import test from 'node:test';
import assert from 'node:assert/strict';
import {sections} from './catalog.js';
import {t,hasTranslation} from './i18n.js';
test('Every catalogue label and explanatory note has English and Portuguese coverage',()=>{
 const missing=new Set();
 function walk(s){for(const name of ['label','note'])if(s[name]&&!hasTranslation(s[name]))missing.add(s[name]);for(const v of Object.values(s.fields??{}))walk(v);for(const v of Object.values(s.variants??{}))Object.values(v).forEach(walk);if(s.item)walk(s.item);}
 Object.values(sections).forEach(walk);assert.deepEqual([...missing],[]);
});
test('Dynamic messages translate without changing units, attachment names or JSON field names',()=>{
 assert.equal(t('Falta Módulo de Young [Pa]','en'),"Missing Young's modulus [Pa]");
 assert.equal(t('2 aspectos por completar','pt'),'2 itens a completar');
 assert.equal(t('state.json: Se necesita una lista no vacía','en'),'state.json: A non-empty list is required');
 assert.equal(t('Identificadores nativos de cuerpo: 1, 2','en'),'Native body identifiers: 1, 2');
 assert.equal(t('No existe el grupo físico volumétrico suelo en la malla','en'),'Volume physical group suelo is missing from the mesh');
 assert.equal(t('hydraulic_conductivity','pt'),'hydraulic_conductivity');
 assert.equal(t('Archivo pendiente de adjuntar: Materiales ejemplo.json','en'),'File not attached: Materiales ejemplo.json');
});
