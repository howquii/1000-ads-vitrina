import { test } from "node:test";
import assert from "node:assert/strict";
import { leerJsonIA, sinComasSobrantes } from "../src/leer-json-ia.ts";

test("lee un JSON limpio", () => {
  assert.deepEqual(leerJsonIA('{"a":1}'), { a: 1 });
});

test("ignora el texto alrededor y los bloques de código", () => {
  assert.deepEqual(leerJsonIA('Aquí está tu plan:\n```json\n{"partes":["gancho"]}\n```\n¡Éxito!'), { partes: ["gancho"] });
});

test("tolera comas sobrantes (el error real de producción)", () => {
  assert.deepEqual(leerJsonIA('{"partes":["gancho","cierre",],"ok":true,}'), { partes: ["gancho", "cierre"], ok: true });
});

test("no toca comas dentro de un texto", () => {
  assert.equal(sinComasSobrantes('{"t":"hola, ]","x":[1,]}'), '{"t":"hola, ]","x":[1]}');
});

test("respeta comillas escapadas dentro de un texto", () => {
  assert.deepEqual(leerJsonIA('{"t":"dice \\"sí,\\" ]",}'), { t: 'dice "sí," ]' });
});

test("lee una lista en la raíz", () => {
  assert.deepEqual(leerJsonIA("Resultado: [1, 2, 3,]"), [1, 2, 3]);
});

test("falla con un error claro si no hay JSON", () => {
  assert.throws(() => leerJsonIA("lo siento, no puedo"), /no trae JSON/);
});
