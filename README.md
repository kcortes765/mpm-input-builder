# Generador de entradas MPM

Formulario para preparar `input.json` de MPM-Geomechanics, con español, inglés y portugués. Importa entradas, comprueba campos y prepara un ZIP cuando hay archivos adjuntos. No ejecuta simulaciones.

## Usar sin instalar

Descargue **generador-mpm.html** desde [la última entrega](https://github.com/kcortes765/mpm-input-builder/releases/latest) y ábralo en su navegador. Es un único archivo y funciona sin conexión. Para conservarlo, descargue el archivo; no copie únicamente el enlace de la vista previa de GitHub.

Versión web: https://mpm-geomechanics.onrender.com/entradas/

## Hacer fork y generar su versión

Pulse **Fork** en GitHub y clone su copia. Requiere Node.js 22.12 o posterior y npm. No necesita compilador C++, Python, Render ni una cuenta de Supabase para generar el HTML.

```sh
npm ci
npm test
npm run build
```

El resultado es `dist/generador-mpm.html`. La instalación inicial de dependencias requiere internet; el HTML generado funciona sin conexión. Las pruebas usan DOM sintético, no certifican el aspecto visual en todos los navegadores.

Para publicar con JavaScript y CSS separados: `npm run build:web`. Los cuatro archivos quedan en `dist/web/`, con entrada `input-builder.html`.

## Mantener las opciones

- `input-spec/input-schema.json`: campos, tipos, opciones, textos y traducciones del formulario
- `app/input-builder/`: presentación, importación, comprobaciones y construcción
- `integrations/shared-input-reader/`: adaptación opcional del lector C++, con instrucciones y parche
- `solver/src/Input.cpp`: referencia pública original, incluida únicamente para detectar cambios; no es un motor compilable

Edite la definición, ejecute las pruebas y reconstruya el HTML. La página no interpreta automáticamente cambios arbitrarios de Input.cpp. `npm run check:source` comprueba la identidad del lector de referencia; para contrastar otra copia use `node app/input-builder/check-input.mjs --input ruta/Input.cpp`.

La referencia es el commit público [6ed2aa8](https://github.com/fabricix/MPM-Geomechanics/tree/6ed2aa869726178234caa97f231cf6cf4344157b). Cambiar esta referencia requiere revisar el esquema y comprobar las entradas con el lector correspondiente, no simplemente actualizar un hash.

## Alcance

Las comprobaciones revisan estructura, tipos, referencias y dependencias de los campos. No certifican el modelo físico, estabilidad ni ejecución de la simulación. Las comprobaciones de mallas y archivos externos son básicas. Los campos desconocidos se conservan y se advierten.

La adaptación C++ se entrega por separado y no está incorporada al motor de la web ni a otras ramas. Añadir una variable al formulario no implementa su comportamiento en el simulador. Los valores iniciales del formulario no sustituyen los defaults del lector.

Este repositorio contiene solo el generador y su adaptación opcional. No incluye el simulador web, infraestructura, datos de usuarios ni credenciales. Se conserva la licencia MIT de MPM-Geomechanics.
