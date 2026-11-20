import { test } from "node:test";
import assert from "node:assert/strict";
import { escalon, gancho, porQueFunciona, puntuar, ranking, type AnuncioPublico } from "../src/senales-ganador.ts";

const base: AnuncioPublico = {
  id: "1", paginaId: "p1", texto: "¿Cansada de que tus zapatillas te lastimen? Tenemos la solución.",
  dias: 10, variantes: 1, anunciosSostenidosDeLaPagina: 1, destino: null, shareDelDestino: 0,
};

test("escalon devuelve el último escalón alcanzado", () => {
  assert.equal(escalon(1, [[2, 8], [3, 15]]), 0);
  assert.equal(escalon(4, [[2, 8], [3, 15]]), 15);
});

test("un anuncio de 90 días o más suma los 40 puntos de días", () => {
  assert.equal(puntuar({ ...base, dias: 200 }).dias, 40);
});

test("el puntaje máximo es 100", () => {
  const p = puntuar({ ...base, dias: 120, variantes: 12, anunciosSostenidosDeLaPagina: 15, destino: "WhatsApp", shareDelDestino: 0.9 });
  assert.deepEqual(p, { total: 100, dias: 40, variantes: 25, marca: 25, destino: 10 });
});

test("el gancho es la primera frase", () => {
  assert.equal(gancho(base.texto), "¿Cansada de que tus zapatillas te lastimen?");
  assert.equal(gancho(null), null);
});

test("el porqué solo habla de lo que muestran las señales", () => {
  const frases = porQueFunciona({ ...base, dias: 95, variantes: 4, destino: "WhatsApp", shareDelDestino: 0.8 });
  assert.equal(frases.length, 3);
  assert.match(frases[0], /95 días/);
  assert.match(frases[2], /chat de WhatsApp/);
});

test("el ranking quita copias y limita anuncios por marca", () => {
  const anuncios: AnuncioPublico[] = [
    { ...base, id: "a", dias: 80 },
    { ...base, id: "b", dias: 80 }, // misma página y mismo texto: copia
    { ...base, id: "c", dias: 70, texto: "Otro texto 1" },
    { ...base, id: "d", dias: 60, texto: "Otro texto 2" },
    { ...base, id: "e", dias: 50, texto: "Otro texto 3" }, // cuarto de la misma marca
    { ...base, id: "f", paginaId: "p2", dias: 30 },
  ];
  const top = ranking(anuncios, { porPagina: 3 });
  assert.deepEqual(top.map((a) => a.id), ["a", "c", "d", "f"]);
  assert.deepEqual(top.map((a) => a.puesto), [1, 2, 3, 4]);
});
