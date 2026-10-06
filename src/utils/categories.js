import categories from '../data/categories.json';
import foodDatabase from '../data/foodDatabase.json';

export const CATEGORIES = categories;

// Mapeo de categorías granulares (tabla de composición) a las categorías
// amplias definidas en categories.json, para reutilizar sus colores pastel.
const CATEGORY_ALIASES = {
  'Cereales y derivados': 'Carbohidrato',
  'Leguminosas y derivados': 'Leguminosa',
  'Verduras, hortalizas y derivados': 'Verdura',
  'Frutas y derivados': 'Fruta',
  'Carnes y derivados': 'Proteína',
  'Pescados y mariscos': 'Proteína',
  'Huevos y derivados': 'Proteína',
  'Preparados y fritos': 'Comida callejera',
  'Leche y derivados': 'Lácteo',
  'Grasas y aceites': 'Aceite / Grasa',
  'Productos azucarados': 'Otros',
  'Bebidas (alcohólicas y no alcohólicas)': 'Bebida',
  'Salsas y aderezos': 'Otros',
};

const FALLBACK_PALETTE = [
  '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF',
  '#E0BBE4', '#F4B8D8', '#C7E9C0', '#FFD1DC', '#D4F0F0',
  '#FCE8B2', '#E6E6FA', '#D5F5E3', '#FADBD8', '#D6EAF8',
];

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

/** Devuelve el color pastel de una categoría (con alias y respaldo). */
export function getCategoryColor(name) {
  const direct = categories.find((c) => c.name === name);
  if (direct) return direct.color;

  const alias = CATEGORY_ALIASES[name];
  if (alias) {
    const mapped = categories.find((c) => c.name === alias);
    if (mapped) return mapped.color;
  }

  return FALLBACK_PALETTE[hashString(name) % FALLBACK_PALETTE.length];
}

export function getCategoryNames() {
  return categories.map((c) => c.name);
}

/** Todas las categorías posibles (amplias + granulares) para selects/datalists. */
export function getCategoryOptions() {
  const names = new Set(categories.map((c) => c.name));
  foodDatabase.forEach((f) => names.add(f.category));
  return Array.from(names).sort((a, b) => a.localeCompare(b, 'es'));
}
