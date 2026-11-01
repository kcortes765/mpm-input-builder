# Generador de entradas MPM

Prepara `input.json` y sus archivos adjuntos en español, inglés o portugués.

[Usar en la web](https://mpm-geomechanics.onrender.com/entradas/) · [Descargar HTML sin conexión](https://github.com/kcortes765/mpm-input-builder/releases/latest/download/generador-mpm.html)

## Generar su versión

Haga fork, clone el repositorio y ejecute con Node.js 22.12 o posterior:

```sh
npm ci
npm test
npm run build
```

Abra `dist/generador-mpm.html`. Para generar archivos web separados, use `npm run build:web`; quedan en `dist/web/`.

## Modificar campos

Edite `input-spec/input-schema.json` y vuelva a generar el HTML. El código del formulario está en `app/input-builder/`.

La referencia es [Input.cpp, versión 6ed2aa8](https://github.com/fabricix/MPM-Geomechanics/blob/6ed2aa869726178234caa97f231cf6cf4344157b/src/Input.cpp). `npm run check:source` comprueba esa referencia; no incorpora automáticamente cambios del lector.

`integrations/shared-input-reader/` contiene una adaptación opcional del lector C++ y sus instrucciones. No está instalada en el motor publicado.

Las comprobaciones revisan la entrada, no validan la física ni ejecutan simulaciones. Licencia MIT; se conservan los avisos de MPM-Geomechanics y fflate.
