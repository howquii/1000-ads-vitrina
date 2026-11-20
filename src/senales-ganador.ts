/**
 * Señales de que un anuncio de la Biblioteca de Meta está funcionando.
 *
 * La Biblioteca no muestra ventas ni gasto. Lo que sí muestra son decisiones del anunciante, y esas
 * decisiones cuestan plata: nadie paga tres meses un anuncio que no le deja ganancia, ni lo duplica
 * diez veces si perdió contra los demás. Este módulo convierte esas decisiones en un puntaje de 0 a 100
 * y en frases que cualquiera entiende.
 */

export type AnuncioPublico = {
  id: string;
  /** Página (marca) que paga el anuncio */
  paginaId: string | null;
  /** Primer texto del anuncio */
  texto: string | null;
  /** Días que lleva activo */
  dias: number;
  /** Copias del mismo creativo que el anunciante tiene activas */
  variantes: number;
  /** Anuncios de la misma página con al menos una semana activos en el país */
  anunciosSostenidosDeLaPagina: number;
  /** Dominio al que lleva el anuncio, o «WhatsApp» / «Messenger» */
  destino: string | null;
  /** Parte de los anuncios de la página que llevan a ese mismo destino (0 a 1) */
  shareDelDestino: number;
};

export type Puntaje = { total: number; dias: number; variantes: number; marca: number; destino: number };

/** Devuelve el valor del último escalón alcanzado: escalon(5, [[2, 8], [3, 15], [5, 20]]) = 20 */
export function escalon(valor: number, escalones: [minimo: number, puntos: number][]): number {
  let puntos = 0;
  for (const [minimo, p] of escalones) if (valor >= minimo) puntos = p;
  return puntos;
}

export function puntuar(a: AnuncioPublico): Puntaje {
  const dias = Math.round((Math.min(Math.max(a.dias, 0), 90) / 90) * 40);
  const variantes = escalon(Math.max(1, a.variantes), [[2, 8], [3, 15], [5, 20], [10, 25]]);
  const marca = escalon(a.anunciosSostenidosDeLaPagina, [[2, 8], [3, 15], [6, 20], [10, 25]]);
  const destino = a.destino && a.shareDelDestino >= 0.7 ? 10 : 0;
  return { total: dias + variantes + marca + destino, dias, variantes, marca, destino };
}

/** Primera frase del anuncio: lo que se lee antes del «ver más» */
export function gancho(texto: string | null): string | null {
  const primera = texto?.trim().split(/\n|(?<=[.!?])\s/)[0]?.trim();
  return primera ? primera.slice(0, 220) : null;
}

/** El porqué, en frases. Solo dice lo que las señales muestran. */
export function porQueFunciona(a: AnuncioPublico): string[] {
  const r: string[] = [];
  if (a.dias >= 90) r.push(`Lleva ${a.dias} días activo. Nadie paga tres meses un anuncio que no le deja ganancia.`);
  else if (a.dias >= 45) r.push(`Lleva ${a.dias} días activo: pasó el mes y medio en que la mayoría de anuncios se apagan.`);
  else if (a.dias >= 20) r.push(`Lleva ${a.dias} días activo: ya salió de la prueba y el anunciante lo sigue pagando.`);
  else r.push(`Lleva ${a.dias} días activo. Pasó la primera semana, que es donde se apagan los que no venden.`);
  if (a.variantes >= 10) r.push(`Tiene ${a.variantes} versiones del mismo creativo: cuando se duplica tanto, es porque ya les ganó a los demás.`);
  else if (a.variantes >= 3) r.push(`Tiene ${a.variantes} versiones del mismo creativo: lo están duplicando para darle más presupuesto.`);
  if (a.anunciosSostenidosDeLaPagina >= 10) r.push(`La marca tiene al menos ${a.anunciosSostenidosDeLaPagina} anuncios con más de una semana activos: invierte fuerte y sostenido.`);
  else if (a.anunciosSostenidosDeLaPagina >= 3) r.push(`La marca tiene al menos ${a.anunciosSostenidosDeLaPagina} anuncios con más de una semana activos: no es una prueba suelta.`);
  if (a.destino && a.shareDelDestino >= 0.7) {
    const lugar = a.destino === "WhatsApp" || a.destino === "Messenger" ? `un chat de ${a.destino}` : a.destino;
    r.push(`Casi todos sus anuncios llevan a ${lugar}: ya no está probando ofertas, está empujando la que funciona.`);
  }
  return r;
}

/**
 * Ordena por puntaje, quita copias del mismo anuncio (misma página y mismo texto) y deja como máximo
 * `porPagina` anuncios por marca, para que una sola marca grande no llene el ranking.
 */
export function ranking(anuncios: AnuncioPublico[], { cuantos = 30, porPagina = 3 } = {}) {
  const ordenados = anuncios
    .map((a) => ({ ...a, puntaje: puntuar(a) }))
    .sort((x, y) => y.puntaje.total - x.puntaje.total || y.dias - x.dias);
  const vistos = new Set<string>();
  const porMarca = new Map<string, number>();
  const top: (AnuncioPublico & { puntaje: Puntaje; puesto: number })[] = [];
  for (const a of ordenados) {
    const marca = a.paginaId ?? a.id;
    const copia = `${marca}|${(a.texto ?? a.id).slice(0, 160)}`;
    if (vistos.has(copia) || (porMarca.get(marca) ?? 0) >= porPagina) continue;
    vistos.add(copia);
    porMarca.set(marca, (porMarca.get(marca) ?? 0) + 1);
    top.push({ ...a, puesto: top.length + 1 });
    if (top.length === cuantos) break;
  }
  return top;
}
