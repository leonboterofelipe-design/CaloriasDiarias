import { normalizeSearchText } from './text';

function toNumber(v, fallback) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

/**
 * Intenta usar el LLM vía /api/parse-meal. Devuelve null si no está
 * disponible o falla, para que el llamador use el parser local.
 */
export async function analyzeMealText(text, foods) {
  try {
    const res = await fetch('/api/parse-meal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, foods }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.items)) return null;

    const items = data.items.map((it) => {
      const qty = toNumber(it.qty, 1);
      const qtyType = it.qtyType === 'grams' ? 'grams' : 'portion';

      if (it && it.kind === 'matched') {
        const food =
          foods.find((f) => f.id === it.foodId) ||
          foods.find(
            (f) => normalizeSearchText(f.name) === normalizeSearchText(it.name || it.foodId || '')
          );
        if (food) {
          return { kind: 'matched', food, qty, qtyType };
        }
      }

      return {
        kind: 'new',
        name: it.name || 'Alimento',
        category: it.category || 'Otros',
        portion_g: toNumber(it.portion_g, 100),
        calories_per_portion: it.calories_per_portion ?? '',
        qty,
        qtyType,
      };
    });

    return { mealId: data.mealId || 'almuerzo', items };
  } catch (err) {
    return null;
  }
}
