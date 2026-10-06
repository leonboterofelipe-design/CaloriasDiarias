import { useCallback, useEffect, useMemo, useState } from 'react';
import baseFoods from '../data/foodDatabase.json';

const STORAGE_KEY = 'diet-tracker-custom-foods';

function slugify(name) {
  return name
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function loadCustomFoods() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    /* almacenamiento no disponible o JSON inválido */
  }
  return [];
}

/**
 * Combina la base estática (Excel) con alimentos agregados por el usuario,
 * persistidos en localStorage.
 */
export function useFoodDatabase() {
  const [customFoods, setCustomFoods] = useState(loadCustomFoods);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customFoods));
    } catch (err) {
      /* cuota excedida o almacenamiento bloqueado */
    }
  }, [customFoods]);

  const addCustomFood = useCallback((fields) => {
    const name = String(fields?.name ?? '').trim();
    const category = String(fields?.category ?? '').trim();
    const portion_g = Number(fields?.portion_g);
    const calories_per_portion = Number(fields?.calories_per_portion);

    const errors = {};
    if (!name) errors.name = 'El nombre es obligatorio.';
    if (!category) errors.category = 'Selecciona una categoría.';
    if (!Number.isFinite(portion_g) || portion_g <= 0) {
      errors.portion_g = 'Indica una porción en gramos mayor a 0.';
    }
    if (!Number.isFinite(calories_per_portion) || calories_per_portion < 0) {
      errors.calories_per_portion = 'Indica las calorías de la porción (0 o más).';
    }

    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }

    const num = (v) => (v === '' || v === null || v === undefined ? null : Number(v) || 0);

    const food = {
      id: `${slugify(name)}-${Date.now().toString(36)}`,
      name,
      portion_g,
      calories_per_portion,
      category,
      description: String(fields?.description ?? '').trim() || null,
      protein_g: num(fields?.protein_g),
      carbs_g: num(fields?.carbs_g),
      fat_g: num(fields?.fat_g),
      custom: true,
    };

    setCustomFoods((prev) => [...prev, food]);
    return { ok: true, food };
  }, []);

  const removeCustomFood = useCallback((id) => {
    setCustomFoods((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const foods = useMemo(() => {
    const seen = new Set();
    const withId = baseFoods.map((f) => {
      let id = slugify(f.name);
      let n = 2;
      while (seen.has(id)) id = `${slugify(f.name)}-${n++}`;
      seen.add(id);
      return { ...f, id };
    });
    return [...withId, ...customFoods];
  }, [customFoods]);

  return { foods, customFoods, addCustomFood, removeCustomFood };
}
