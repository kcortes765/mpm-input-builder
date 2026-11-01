# Definición de entrada

`input-schema.json` define los campos, tipos, opciones y traducciones del formulario. Usa el formato propio `mpm-input-definitions/1`.

`value` e `initial` son valores del formulario, no defaults del lector C++. Las claves y opciones exportadas conservan los nombres del lector.

El HTML incorpora su definición. La versión web carga `input-schema.js`; puede actualizarse por separado si el formato sigue siendo compatible.

El build genera el header del adaptador. También puede generarse con Python:

```sh
python integrations/shared-input-reader/generate_header.py input-spec/input-schema.json integrations/shared-input-reader/InputSchema.generated.h --web input-schema.js
```

Incremente `version` al cambiar el contrato y compruebe las entradas con el lector correspondiente. La adaptación está preparada para la versión pública 6ed2aa8; debe revisarse para otras ramas.

Añadir un campo no implementa su comportamiento físico en el motor. Nuevos tipos de control pueden requerir cambios en el formulario y el adaptador.
