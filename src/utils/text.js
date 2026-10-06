/**
 * Normaliza texto para búsquedas: minúsculas y sin tildes/acentos,
 * de modo que "MANÍ", "Mani", "maní" y "mani" coincidan.
 */
export function normalizeSearchText(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Convierte la primera letra de cada palabra a mayúscula. */
export function titleCase(value) {
  return String(value ?? '')
    .trim()
    .split(/\s+/)
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(' ');
}
