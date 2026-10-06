import categories from '../data/categories.json';

export const CATEGORIES = categories;

/** Devuelve el color pastel de una categoría (gris por defecto). */
export function getCategoryColor(name) {
  const found = categories.find((c) => c.name === name);
  return found ? found.color : '#E2E2E2';
}

/** Lista de nombres de categorías para selects/datalists. */
export function getCategoryNames() {
  return categories.map((c) => c.name);
}
