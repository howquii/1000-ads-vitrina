# Decisiones de diseño

Registro corto de las decisiones que más pesan, con el porqué.

## 1. Base propia en lugar de consultar a Meta en vivo

**Decisión:** recolectar y guardar los anuncios en nuestra base, y servir las búsquedas desde ahí.

**Por qué:** la Biblioteca de Meta no ordena por desempeño, sus enlaces a medios vencen y los anuncios desaparecen cuando se apagan. Con base propia, la búsqueda es instantánea, no gasta créditos por consulta y conserva la historia de cada anuncio. Con el tiempo, esa historia por rubro y país es lo más difícil de copiar.

## 2. Medir «ganador» con señales públicas, sin inventar métricas

**Decisión:** el puntaje usa solo lo que la Biblioteca muestra: días activo, versiones del creativo, cuántos anuncios sostiene la marca y si todos llevan al mismo destino. Ver [`src/senales-ganador.ts`](../src/senales-ganador.ts).

**Por qué:** no vemos ventas ni gasto. Lo que sí vemos son decisiones del anunciante que cuestan plata. El texto que acompaña al puntaje solo afirma lo que esas señales muestran, y deja lo que no se puede medir en una lista de cosas por revisar antes de copiar.

## 3. *Done with you*, no *done for you*

**Decisión:** el producto entrega el plano del anuncio (brief, guion y referencias); el cliente lo produce con su celular o su diseñador.

**Por qué:** prometer «te hacemos el anuncio» rompe la confianza cuando llega un brief. La promesa es la que el producto cumple: encontramos el anuncio ganador que hoy no estás haciendo y te ayudamos a armar el tuyo.

## 4. IA con respaldo y costo registrado

**Decisión:** una sola capa para todas las llamadas a IA, con varios proveedores, reintento automático y registro de costo por llamada.

**Por qué:** los proveedores gratuitos o baratos fallan por límites de uso. El respaldo evita que el usuario vea el error, y el registro permite saber el costo exacto de cada función antes de ponerle precio.

## 5. Respuestas de IA que no rompen la pantalla

**Decisión:** leer el JSON de los modelos con tolerancia y, si aun así falla, reintentar una vez con un modelo más fuerte. Ver [`src/leer-json-ia.ts`](../src/leer-json-ia.ts).

**Por qué:** un modelo devolvió una lista con una coma sobrante y el brief del quiz mostró un error de JSON al usuario. Se arregló la causa y no solo el síntoma.

## 6. Publicar sin romper nada

**Decisión:** cada publicación sale de una copia limpia del repositorio en el commit exacto, se revisa en vivo en el celular y queda en una bitácora. Cada error encontrado se registra con su causa raíz (5 porqués) y cómo prevenirlo.

**Por qué:** varias líneas de trabajo avanzan a la vez sobre el mismo repositorio. Publicar desde la carpeta de trabajo arrastraba cambios a medio hacer.
