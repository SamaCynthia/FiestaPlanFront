/**
 * Compara los valores actuales del formulario contra el snapshot original
 * y devuelve SOLO las propiedades que cambiaron.
 *
 * Cumple el principio de minimización de datos: nunca se envía el objeto
 * completo al backend, únicamente lo que el usuario realmente modificó.
 */
export function buildDiffPayload<T extends Record<string, any>>(
  original: T,
  actual: T,
  camposPermitidos: (keyof T)[],
): Partial<T> {
  const payload: Partial<T> = {};

  for (const campo of camposPermitidos) {
    const valorOriginal = original[campo] ?? '';
    const valorActual = actual[campo] ?? '';

    if (valorOriginal !== valorActual) {
      payload[campo] = actual[campo];
    }
  }

  return payload;
}
