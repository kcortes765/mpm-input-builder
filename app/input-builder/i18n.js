// Presentation only: JSON keys, enum values and numbers are never translated.
export const LANGUAGES={es:'Español',en:'English',pt:'Português'};
let locale='es';
export const getLocale=()=>locale;
export function setLocale(value){locale=Object.hasOwn(LANGUAGES,value)?value:'es';return locale;}
const rows=`
Entrada MPM|MPM input|Entrada MPM
Esquema compartido|Shared definition|Definição compartilhada
Descargar integración del lector|Download reader integration|Baixar integração do leitor
No se pudo preparar la integración|Could not prepare the integration|Não foi possível preparar a integração
Los formularios y las comprobaciones básicas del lector se generan desde un archivo común. La adaptación del lector se instala por separado.|Forms and basic reader checks are generated from a shared file. The reader adaptation is installed separately.|Os formulários e as verificações básicas do leitor são gerados a partir de um arquivo comum. A adaptação do leitor é instalada separadamente.
Entrada de simulación · MPM|Simulation input · MPM|Entrada de simulação · MPM
Configure el caso y descargue input.json|Configure the case and download input.json|Configure o caso e baixe input.json
Idioma|Language|Idioma
Configuración|Configuration|Configuração
Importar entrada JSON|Import JSON input|Importar entrada JSON
Importar entrada|Import input|Importar entrada
Nuevo modelo|New model|Novo modelo
Modo claro|Light mode|Modo claro
Modo oscuro|Dark mode|Modo escuro
Descargar input.json|Download input.json|Baixar input.json
Descargar paquete|Download package|Baixar pacote
Vista previa del archivo JSON|JSON file preview|Prévia do arquivo JSON
Vista previa del JSON|JSON preview|Prévia do JSON
Alcance de las comprobaciones|Scope of checks|Escopo das verificações
Se comprueban formatos, referencias entre elementos, parámetros y archivos necesarios. Esto no determina si el modelo físico representa correctamente su problema. No se ejecutan simulaciones desde este generador.|Formats, references, parameters and required files are checked. This does not establish whether the physical model represents your problem correctly. This editor does not run simulations.|São verificados formatos, referências, parâmetros e arquivos necessários. Isso não determina se o modelo físico representa corretamente seu problema. Este editor não executa simulações.
Compatibilidad con Input.cpp · versión del 22 de octubre de 2026|Input.cpp compatibility · version of 22 October 2026|Compatibilidade com Input.cpp · versão de 22 de outubro de 2026
Compatibilidad con Input.cpp|Input.cpp compatibility|Compatibilidade com Input.cpp
Comprobar Input.cpp|Check Input.cpp|Verificar Input.cpp
Seleccione su Input.cpp para compararlo con la versión del formulario. El archivo permanece en su navegador.|Select your Input.cpp to compare it with the form version. The file stays in your browser.|Selecione seu Input.cpp para compará-lo com a versão do formulário. O arquivo permanece no seu navegador.
Input.cpp coincide con la versión del formulario|Input.cpp matches the form version|Input.cpp corresponde à versão do formulário
Input.cpp cambió. Revise el catálogo antes de usar esta entrada con esa versión|Input.cpp has changed. Review the catalogue before using this input with that version|Input.cpp foi alterado. Revise o catálogo antes de usar esta entrada com essa versão
No se pudo comprobar el archivo|Could not check the file|Não foi possível verificar o arquivo
Comparando archivo…|Comparing file…|Comparando arquivo…
¿Crear un modelo nuevo? La configuración actual se reemplazará.|Create a new model? The current configuration will be replaced.|Criar um novo modelo? A configuração atual será substituída.
¿Reemplazar la configuración actual por este archivo?|Replace the current configuration with this file?|Substituir a configuração atual por este arquivo?
Configuración completa|Configuration complete|Configuração completa
Requiere dos fases|Requires two phases|Requer duas fases
La estructura importada no es compatible|The imported structure is not compatible|A estrutura importada não é compatível
La lista importada no es compatible|The imported list is not compatible|A lista importada não é compatível
Restablecer sección|Reset section|Restaurar seção
Restablecer lista|Reset list|Restaurar lista
Nombre inválido o repetido|Invalid or duplicate name|Nome inválido ou repetido
Quitar|Remove|Remover
El archivo supera 32 MiB|The file exceeds 32 MiB|O arquivo excede 32 MiB
Ya existe un adjunto con ese nombre, use nombres distintos|An attachment with that name already exists; use different names|Já existe um anexo com esse nome; use nomes diferentes
Archivo adjunto|Attached file|Arquivo anexado
Sin archivo adjunto|No file attached|Nenhum arquivo anexado
Cálculo|Calculation|Cálculo
Duración|Duration|Duração
Paso temporal|Time step|Passo de tempo
0: automático|0: automatic|0: automático
Factor de paso crítico|Critical time step factor|Fator de passo crítico
Esquema de actualización|Update scheme|Esquema de atualização
Interpolación|Interpolation|Interpolação
Número de fases|Number of phases|Número de fases
Hilos de cálculo|Computation threads|Threads de cálculo
Gravedad|Gravity|Gravidade
Amortiguamiento|Damping|Amortecimento
Tipo|Type|Tipo
Coeficiente|Coefficient|Coeficiente
Coeficiente α|Coefficient α|Coeficiente α
alternativa a value|alternative to value|alternativa a value
Malla|Mesh|Malha
Malla de fondo|Background mesh|Malha de fundo
Origen|Origin|Origem
Dimensión de celda|Cell dimensions|Dimensões da célula
Celdas por dirección|Cells per direction|Células por direção
Restricciones del sólido|Solid constraints|Restrições do sólido
Restricciones del fluido|Fluid constraints|Restrições do fluido
Materiales|Materials|Materiais
Material|Material|Material
Modelo|Model|Modelo
Identificador|Identifier|Identificador
Densidad del fluido|Fluid density|Densidade do fluido
Porosidad|Porosity|Porosidade
Módulo volumétrico del fluido|Fluid bulk modulus|Módulo volumétrico do fluido
Conductividad hidráulica|Hydraulic conductivity|Condutividade hidráulica
Módulo de Young|Young's modulus|Módulo de Young
Coeficiente de Poisson|Poisson's ratio|Coeficiente de Poisson
Densidad|Density|Densidade
Cohesión|Cohesion|Coesão
Ángulo de fricción|Friction angle|Ângulo de atrito
Ángulo de dilatancia|Dilatancy angle|Ângulo de dilatância
Resistencia a tracción|Tensile strength|Resistência à tração
Factor de resistencia no drenada|Undrained strength factor|Fator de resistência não drenada
Ablandamiento|Softening|Amolecimento
Parámetro exponencial η|Exponential parameter η|Parâmetro exponencial η
Ablandamiento de fricción|Friction softening|Amolecimento do atrito
Ablandamiento de cohesión|Cohesion softening|Amolecimento da coesão
Ablandamiento de tracción|Tensile softening|Amolecimento da tração
Ablandamiento de dilatancia|Dilatancy softening|Amolecimento da dilatância
Valor residual|Residual value|Valor residual
Viscosidad dinámica|Dynamic viscosity|Viscosidade dinâmica
Módulo volumétrico|Bulk modulus|Módulo volumétrico
Geometría|Geometry|Geometria
Cuerpos|Bodies|Corpos
Cuerpo|Body|Corpo
Activo|Active|Ativo
Vértice mínimo|Minimum corner|Vértice mínimo
Vértice máximo|Maximum corner|Vértice máximo
Velocidad inicial|Initial velocity|Velocidade inicial
Centro|Centre|Centro
Diámetro|Diameter|Diâmetro
Partículas por dirección|Particles per direction|Partículas por direção
Vértices del polígono|Polygon vertices|Vértices do polígono
Punto|Point|Ponto
Dirección de extrusión|Extrusion direction|Direção de extrusão
Espesor de extrusión|Extrusion thickness|Espessura de extrusão
Separación de puntos|Point spacing|Espaçamento entre pontos
Partículas|Particles|Partículas
Identificadores|Identifiers|Identificadores
Posiciones|Positions|Posições
Posición|Position|Posição
Volúmenes|Volumes|Volumes
Volumen|Volume|Volume
Archivo de partículas|Particle file|Arquivo de partículas
Lista de objetos con posición, volumen y material_id|List of objects with position, volume and material_id|Lista de objetos com posição, volume e material_id
Material homogéneo|Homogeneous material|Material homogêneo
Malla Gmsh|Gmsh mesh|Malha Gmsh
Grupos físicos y materiales|Physical groups and materials|Grupos físicos e materiais
Distribución en elementos|Distribution in elements|Distribuição nos elementos
Cargas y presiones|Loads and pressures|Cargas e pressões
Cargas nodales|Nodal loads|Cargas nodais
posición y fuerza|position and force|posição e força
Carga nodal|Nodal load|Carga nodal
Fuerza por caja|Force by box|Força por caixa
Carga|Load|Carga
Fuerza|Force|Força
Presión inicial por caja|Initial pressure by box|Pressão inicial por caixa
Presión|Pressure|Pressão
Presión inicial|Initial pressure|Pressão inicial
Presión prescrita por caja|Prescribed pressure by box|Pressão prescrita por caixa
Presión inicial por material|Initial pressure by material|Pressão inicial por material
El lector comprueba material y lee material_id, ambos deben coincidir|The reader checks material and reads material_id; both must match|O leitor verifica material e lê material_id; ambos devem coincidir
compatibilidad del lector|reader compatibility|compatibilidade do leitor
Fuerza de presión por caja|Pressure force by box|Força de pressão por caixa
Contacto|Contact|Contato
Activar contacto entre cuerpos|Enable body contact|Ativar contato entre corpos
Corrección de distancia real|Real distance correction|Correção de distância real
Pares de contacto|Contact pairs|Pares de contato
Coeficiente de fricción|Friction coefficient|Coeficiente de atrito
Cuerpo maestro|Master body|Corpo mestre
Cuerpo esclavo|Slave body|Corpo escravo
Normal de contacto|Contact normal|Normal de contato
Contacto con superficie STL|STL surface contact|Contato com superfície STL
Superficie STL|STL surface|Superfície STL
Fricción|Friction|Atrito
Umbral de distancia|Distance threshold|Limite de distância
Contacto por penalización|Penalty contact|Contato por penalidade
Rigidez de penalización|Penalty stiffness|Rigidez de penalidade
Estados y acoplamiento|States and coupling|Estados e acoplamento
Cargar estado inicial|Load initial state|Carregar estado inicial
Archivo de tensiones iniciales|Initial stress file|Arquivo de tensões iniciais
Guardar estado final|Save final state|Salvar estado final
Nombre del estado de salida|Output state filename|Nome do arquivo do estado final
Acoplamiento hidromecánico unidireccional|One-way hydromechanical coupling|Acoplamento hidromecânico unidirecional
Campo de presión de poros|Pore pressure field|Campo de pressão de poros
Sismicidad|Seismicity|Sismicidade
Registro sísmico|Seismic record|Registro sísmico
Registro|Record|Registro
Cuatro columnas numéricas: tiempo y aceleraciones en X, Y, Z|Four numeric columns: time and accelerations in X, Y, Z|Quatro colunas numéricas: tempo e acelerações em X, Y, Z
Primera línea de encabezado|Header in the first line|Cabeçalho na primeira linha
Resultados|Results|Resultados
Archivos de salida|Output files|Arquivos de saída
Intervalos de salida|Output intervals|Intervalos de saída
Conservar resultados anteriores|Keep previous results|Manter resultados anteriores
Campos de partículas|Particle fields|Campos de partículas
Campo|Field|Campo
Campos de nodos|Nodal fields|Campos de nós
Campos de contacto STL|STL contact fields|Campos de contato STL
Elástico|Elastic|Elástico
Fluido newtoniano|Newtonian fluid|Fluido newtoniano
Cuboide|Cuboid|Cuboide
Esfera|Sphere|Esfera
Polígono extruido|Extruded polygon|Polígono extrudado
Partículas explícitas|Explicit particles|Partículas explícitas
Partículas desde archivo|Particles from file|Partículas de arquivo
Lineal|Linear|Linear
Todos los campos|All fields|Todos os campos
Ninguno|None|Nenhum
Masa|Mass|Massa
Estado activo|Active status|Estado ativo
Desplazamiento|Displacement|Deslocamento
Velocidad|Velocity|Velocidade
Tensión|Stress|Tensão
Deformación plástica|Plastic strain|Deformação plástica
Presión de poros|Pore pressure|Pressão de poros
Fuerza externa|External force|Força externa
Distancia a la superficie|Surface distance|Distância à superfície
Densidad de nivel|Level-set density|Densidade de nível
Maestro|Master|Mestre
Esclavo|Slave|Escravo
Colineal|Collinear|Colinear
Fijo|Fixed|Fixo
Deslizante|Sliding|Deslizante
Libre|Free|Livre
Local|Local|Local
Relajación dinámica cinética|Kinetic dynamic relaxation|Relaxação dinâmica cinética
Exponencial|Exponential|Exponencial
Baricéntrica|Barycentric|Baricêntrica
Gaussiana|Gaussian|Gaussiana
Unidireccional|One-way|Unidirecional
La entrada debe ser un objeto|The input must be an object|A entrada deve ser um objeto
Se esperaba un valor|A value was expected|Era esperado um valor
Separación inválida|Invalid separator|Separador inválido
Valor inválido|Invalid value|Valor inválido
Se esperaba un nombre|A name was expected|Era esperado um nome
Texto incompleto|Incomplete text|Texto incompleto
El archivo JSON supera el tamaño permitido|The JSON file exceeds the size limit|O arquivo JSON excede o tamanho permitido
Contenido adicional después de la entrada|Extra content after the input|Conteúdo adicional após a entrada
La entrada define material y materials a la vez|The input defines both material and materials|A entrada define material e materials ao mesmo tempo
Esta opción requiere dos fases|This option requires two phases|Esta opção requer duas fases
Se necesita un conjunto de propiedades|A set of properties is required|É necessário um conjunto de propriedades
Parámetro no reconocido por el formulario, se conserva pero debe revisarse|The form does not recognise this parameter; it is preserved but needs review|Parâmetro não reconhecido pelo formulário; foi mantido, mas precisa ser revisado
Añada al menos un elemento|Add at least one item|Adicione pelo menos um elemento
Nombre de elemento inválido|Invalid item name|Nome de elemento inválido
Se necesita una lista|A list is required|É necessária uma lista
Lista incompleta|Incomplete list|Lista incompleta
Se necesitan dos vectores de tres componentes|Two three-component vectors are required|São necessários dois vetores de três componentes
Se necesitan tres componentes|Three components are required|São necessários três componentes
Seleccione sí o no|Select yes or no|Selecione sim ou não
Opción no admitida por el lector|Option not supported by the reader|Opção não suportada pelo leitor
El material indicado no existe|The specified material does not exist|O material indicado não existe
El cuerpo indicado no existe|The specified body does not exist|O corpo indicado não existe
Se necesita texto|Text is required|É necessário texto
Seleccione un archivo con nombre simple, sin carpetas|Select a file with a simple name, without folders|Selecione um arquivo com nome simples, sem pastas
input.json está reservado para la entrada principal|input.json is reserved for the main input|input.json está reservado para a entrada principal
Introduzca un número finito|Enter a finite number|Insira um número finito
Se necesita un entero|An integer is required|É necessário um inteiro
Valor fuera del intervalo permitido|Value outside the allowed range|Valor fora do intervalo permitido
Los identificadores de material deben ser únicos|Material identifiers must be unique|Os identificadores de material devem ser únicos
Active el ablandamiento exponencial para utilizar sus parámetros|Enable exponential softening to use its parameters|Ative o amolecimento exponencial para usar seus parâmetros
El ángulo residual debe ser menor que 90°|The residual angle must be less than 90°|O ângulo residual deve ser menor que 90°
Todos o ninguno se seleccionan sin otros campos|All or none must be selected without other fields|Todos ou nenhum devem ser selecionados sem outros campos
Se necesita al menos un cuerpo activo|At least one active body is required|É necessário pelo menos um corpo ativo
El paso temporal supera la duración|The time step exceeds the duration|O passo de tempo excede a duração
Complete las propiedades del fluido|Complete the fluid properties|Preencha as propriedades do fluido
Los identificadores de partícula se repiten|Particle identifiers are duplicated|Os identificadores de partícula estão repetidos
Todas las listas deben tener la misma cantidad de partículas|All lists must have the same number of particles|Todas as listas devem ter a mesma quantidade de partículas
Los vértices deben estar en un plano perpendicular a la extrusión|Vertices must lie in a plane perpendicular to the extrusion|Os vértices devem estar em um plano perpendicular à extrusão
El polígono tiene área nula|The polygon has zero area|O polígono tem área nula
El vértice mínimo debe preceder al máximo|The minimum corner must precede the maximum corner|O vértice mínimo deve preceder o máximo
material y material_id deben coincidir en esta versión del lector|material and material_id must match in this reader version|material e material_id devem coincidir nesta versão do leitor
Añada los pares de contacto|Add the contact pairs|Adicione os pares de contato
Maestro y esclavo deben ser distintos|Master and slave must be different|Mestre e escravo devem ser diferentes
ID de contacto repetido|Duplicate contact ID|ID de contato repetido
Adjunte el estado inicial|Attach the initial state|Anexe o estado inicial
Nombre de salida inválido|Invalid output filename|Nome de arquivo de saída inválido
Adjunte la superficie STL|Attach the STL surface|Anexe a superfície STL
La penalización requiere rigidez positiva|The penalty requires positive stiffness|A penalidade requer rigidez positiva
Adjunte el registro sísmico|Attach the seismic record|Anexe o registro sísmico
Adjunte el campo de presión de poros|Attach the pore pressure field|Anexe o campo de pressão de poros
Se necesita una lista no vacía|A non-empty list is required|É necessária uma lista não vazia
Se necesita un índice único no negativo y un tensor 3×3 finito por registro|Each record needs a unique non-negative index and a finite 3×3 tensor|Cada registro precisa de um índice único não negativo e um tensor 3×3 finito
Cada registro necesita posición de tres componentes y presión finita|Each record needs a three-component position and finite pressure|Cada registro precisa de uma posição de três componentes e pressão finita
Cada partícula necesita posición de tres componentes y volumen positivo|Each particle needs a three-component position and positive volume|Cada partícula precisa de uma posição de três componentes e volume positivo
El material de una partícula no existe|A particle material does not exist|O material de uma partícula não existe
Registro vacío|Empty record|Registro vazio
Se necesitan cuatro columnas numéricas y tiempo estrictamente creciente|Four numeric columns and strictly increasing time are required|São necessárias quatro colunas numéricas e tempo estritamente crescente
Se necesita una malla Gmsh ASCII 4.1 con nodos y elementos|A Gmsh ASCII 4.1 mesh with nodes and elements is required|É necessária uma malha Gmsh ASCII 4.1 com nós e elementos
Se necesita un archivo STL ASCII completo|A complete ASCII STL file is required|É necessário um arquivo STL ASCII completo
La superficie no contiene triángulos|The surface contains no triangles|A superfície não contém triângulos
Un triángulo STL no contiene una normal y tres vértices finitos|An STL triangle lacks a finite normal and three finite vertices|Um triângulo STL não contém uma normal finita e três vértices finitos
`;
const dictionary=new Map(rows.trim().split('\n').map(row=>{const [es,en,pt]=row.split('|');if(!es||!en||!pt)throw Error('Incomplete translation');return [es.toLocaleLowerCase('es'),{es,en,pt}];}));
const prefixes=[['Completar: ','Complete: ','Completar: '],['Revisar: ','Review: ','Revisar: '],['Falta ','Missing ','Falta '],['Incluir ','Include ','Incluir '],['Adjuntar ','Attach ','Anexar '],['Añadir ','Add ','Adicionar '],['Quitar ','Remove ','Remover '],['Nombre de ','Name of ','Nome de '],['No se pudo importar la entrada: ','Could not import the input: ','Não foi possível importar a entrada: '],['La entrada contiene una clave repetida: ','The input contains a duplicate key: ','A entrada contém uma chave repetida: '],['Nombre reservado: ','Reserved name: ','Nome reservado: '],['El archivo debe ser ','The file must be ','O arquivo deve ser '],['Archivo pendiente de adjuntar: ','File not attached: ','Arquivo não anexado: '],['Identificadores nativos de cuerpo: ','Native body identifiers: ','Identificadores nativos de corpo: ']];
export function t(source,language=locale){
 if(typeof source!=='string'||language==='es')return source;
 const row=dictionary.get(source.toLocaleLowerCase('es'));
 if(row){const out=row[language];return source[0]===source[0]?.toLocaleLowerCase('es')?out[0].toLocaleLowerCase(language)+out.slice(1):out;}
 for(const [es,en,pt]of prefixes)if(source.startsWith(es)){const tail=source.slice(es.length),literal=['La entrada contiene una clave repetida: ','Nombre reservado: ','El archivo debe ser ','Archivo pendiente de adjuntar: ','Identificadores nativos de cuerpo: '].includes(es);return (language==='en'?en:pt)+(literal?tail:t(tail,language));}
 let m=source.match(/^(\d+) aspectos? por completar$/);if(m)return language==='en'?`${m[1]} item${m[1]==='1'?'':'s'} to complete`:`${m[1]} ${m[1]==='1'?'item':'itens'} a completar`;
 m=source.match(/^Elemento (\d+)$/);if(m)return (language==='en'?'Item ':'Elemento ')+m[1];
 m=source.match(/^Plano ([XYZ][0n])$/);if(m)return (language==='en'?'Plane ':'Plano ')+m[1];
 m=source.match(/^No existe el grupo físico volumétrico (.+) en la malla$/);if(m)return language==='en'?`Volume physical group ${m[1]} is missing from the mesh`:`O grupo físico volumétrico ${m[1]} não existe na malha`;
 m=source.match(/^(.*?) (\[[^\]]+\])$/);if(m)return t(m[1],language)+' '+m[2];
 if(source.includes(' · '))return source.split(' · ').map(x=>t(x,language)).join(' · ');
 // Attachment names and field paths stay literal; only their explanation changes.
 const colon=source.indexOf(': ');if(colon>0)return source.slice(0,colon+2)+t(source.slice(colon+2),language);
 // Remove actions append a literal collection key after the translated label.
 for(const [es,row]of dictionary)if(source.toLocaleLowerCase('es').startsWith(es+' '))return t(source.slice(0,es.length),language)+source.slice(es.length);
 return source;
}
export function hasTranslation(source){
 if(dictionary.has(source.toLocaleLowerCase('es')))return true;
 if(/^(?:ID|Mohr–Coulomb|USL|MUSL|GIMP|[xyz]|alias|friction|cohesion|tensile|dilation|t ax ay az)$/.test(source))return true;
 if(/^Plano [XYZ][0n]$/.test(source))return true;
 const m=source.match(/^(.*?) \[[^\]]+\]$/);if(m)return hasTranslation(m[1]);
 if(source.includes(' · '))return source.split(' · ').every(hasTranslation);
 return false;
}
export function registerSpecificationTranslations(spec){
 function walk(s){for(const[source,translations]of [[s.label,s.translations],[s.note,s.noteTranslations]])if(source&&translations)dictionary.set(source.toLocaleLowerCase('es'),{es:source,...translations});for(const child of Object.values(s.fields??{}))walk(child);for(const v of Object.values(s.variants??{}))Object.values(v).forEach(walk);if(s.item)walk(s.item);}
 Object.values(spec.sections).forEach(walk);
}
