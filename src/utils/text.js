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
