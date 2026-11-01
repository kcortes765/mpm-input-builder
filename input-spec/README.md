# Definición compartida de entrada

`input-schema.json` es la fuente de los campos del formulario y de las
comprobaciones estructurales del adaptador C++. Es un formato propio
`mpm-input-definitions/1`, no una implementación de JSON Schema.

Cada sección contiene campos con `kind`, `label`, `value` y opciones como
`min`, `max`, `choices`, `fields`, `item`, `variants` o `optional`.
`translations` y `noteTranslations` permiten agregar rótulos EN/PT en el mismo
archivo. Los nombres de claves y las opciones exportadas son los del lector.

`value` e `initial` rellenan el formulario: no sustituyen los defaults históricos
del C++. Los campos ausentes se dejan al lector original. Los campos presentes
se comprueban en el adaptador; las reglas especiales entre materiales, cuerpos,
fases y archivos siguen teniendo sus comprobaciones específicas.

La versión web carga `input-schema.js` antes de arrancar. Puede publicarse una
definición actualizada sin editar ni reconstruir el código del formulario.
Si ese archivo no carga, se informa el error en lugar de usar datos antiguos.
El HTML offline incorpora una copia de la definición de su propia entrega.

Para generar el header del lector y el archivo web desde el mismo JSON:

```
python integrations/shared-input-reader/generate_header.py input-spec/input-schema.json integrations/shared-input-reader/InputSchema.generated.h --web input-schema.js
```

Después se recompila el lector y se publica el archivo web en la misma versión.
El build normal del generador también prepara ambos. Las pruebas deben ejecutarse
antes de publicar. Incrementar `version` al cambiar el contrato ayuda a identificarlo.

Agregar una definición genera su control y su comprobación de estructura.
No implementa cómo utiliza el motor una nueva variable. Un tipo de control
completamente nuevo también puede necesitar ampliar el renderer y el adaptador.

La integración para el lector de Fabricio es un parche explícito preparado
contra la versión pública 6ed2aa8. Debe revisarse al aplicarlo a otra rama.
