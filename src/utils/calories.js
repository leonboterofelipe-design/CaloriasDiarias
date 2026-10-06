export const DAILY_CALORIE_LIMIT = 2000;

/**
 * Estados visuales progresivos según la proximidad al límite calórico.
 * `color` se usa para rellenos/barras/gráfica; `textColor` es una variante
 * más oscura y accesible para textos sobre fondos claros.
 */
export const STATUS = {
  good: { label: 'Dentro de lo previsto', color: '#4ADE80', textColor: '#16a34a' },
  caution: { label: 'Más de 60% consumido', color: '#FACC15', textColor: '#a16207' },
  warning: { label: 'Cerca del límite', color: '#FB923C', textColor: '#c2410c' },
  over: { label: 'Meta superada', color: '#EF4444', textColor: '#b91c1c' },
};

/** Calorías de un alimento para una cantidad dada (porciones o gramos). */
export function calcFoodCalories(food, qty, qtyType = 'portion') {
  if (!food || !qty || qty <= 0) return 0;
  if (qtyType === 'grams') {
    return (food.calories_per_portion * qty) / food.portion_g;
  }
  return food.calories_per_portion * qty;
}

/** Gramos totales consumidos para una cantidad dada (porciones o gramos). */
export function calcFoodGrams(food, qty, qtyType = 'portion') {
  if (!food || !qty || qty <= 0) return 0;
  if (qtyType === 'grams') return qty;
  return food.portion_g * qty;
}

export function calcMealCalories(meal) {
  if (!meal || !Array.isArray(meal.items)) return 0;
  return meal.items.reduce((sum, item) => sum + (item.calories || 0), 0);
}

export function calcDailyCalories(meals) {
  if (!Array.isArray(meals)) return 0;
  return meals.reduce((sum, meal) => sum + calcMealCalories(meal), 0);
}

export function formatCalories(n) {
  return Math.round(n).toLocaleString('es-CO');
}

/** Devuelve el estado (color/label) y los porcentajes según lo consumido. */
export function getCalorieStatus(consumed, max = DAILY_CALORIE_LIMIT) {
  const percent = max > 0 ? consumed / max : 0;

  let key = 'good';
  if (percent >= 1) key = 'over';
  else if (percent >= 0.85) key = 'warning';
  else if (percent >= 0.6) key = 'caution';

  const status = STATUS[key];

  return {
    key,
    percent: Math.min(percent, 1),
    rawPercent: Math.min(percent * 100, 100),
    consumed,
    max,
    remaining: Math.max(0, max - consumed),
    label: status.label,
    color: status.color,
    textColor: status.textColor,
  };
}
