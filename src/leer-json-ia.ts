/**
 * Lee el JSON que devuelve un modelo de lenguaje.
 *
 * Los modelos a veces envuelven el JSON en texto («Aquí está tu plan: {...}»), en bloques de código
 * o lo devuelven con comas sobrantes antes de `}` o `]`. JSON.parse falla con todo eso.
 *
 * Origen: en 1000% Ads, el brief del quiz fallaba con «Unexpected token ']'» porque el modelo
 * devolvía `[..., ]`. Esta función lo tolera; si aun así no se puede leer, lanza el error de JSON
 * para que quien llama decida si reintenta con otro modelo.
 */
export function leerJsonIA<T = unknown>(texto: string): T {
  const inicio = primerInicio(texto);
  if (inicio < 0) throw new SyntaxError("La respuesta no trae JSON");
  const cierre = texto[inicio] === "{" ? "}" : "]";
  const fin = texto.lastIndexOf(cierre);
  if (fin < inicio) throw new SyntaxError("El JSON de la respuesta está incompleto");
  const crudo = texto.slice(inicio, fin + 1);
  try {
    return JSON.parse(crudo) as T;
  } catch {
    return JSON.parse(sinComasSobrantes(crudo)) as T;
  }
}

function primerInicio(texto: string): number {
  const llave = texto.indexOf("{");
  const corchete = texto.indexOf("[");
  if (llave < 0) return corchete;
  if (corchete < 0) return llave;
  return Math.min(llave, corchete);
}

/** Quita las comas antes de `}` o `]`, sin tocar las que están dentro de un texto entre comillas. */
export function sinComasSobrantes(json: string): string {
  let salida = "";
  let enTexto = false;
  for (let i = 0; i < json.length; i++) {
    const c = json[i];
    if (enTexto) {
      salida += c;
      if (c === "\\") { salida += json[++i] ?? ""; continue; }
      if (c === '"') enTexto = false;
      continue;
    }
    if (c === '"') { enTexto = true; salida += c; continue; }
    if (c === ",") {
      let j = i + 1;
      while (j < json.length && /\s/.test(json[j])) j++;
      if (json[j] === "}" || json[j] === "]") continue;
    }
    salida += c;
  }
  return salida;
}
