import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { calcFoodCalories, calcFoodGrams, DAILY_CALORIE_LIMIT } from '../utils/calories';

export const MEAL_DEFS = [
  { id: 'desayuno', name: 'Desayuno', icon: '🌅', time: '07:00' },
  { id: 'media-manana', name: 'Media mañana', icon: '🍎', time: '10:00' },
  { id: 'almuerzo', name: 'Almuerzo', icon: '🍛', time: '12:30' },
  { id: 'merienda', name: 'Merienda', icon: '🍪', time: '16:00' },
  { id: 'cena', name: 'Cena', icon: '🍽️', time: '19:00' },
  { id: 'adicional', name: 'Adicional', icon: '✨', time: 'Libre' },
];

const STORAGE_KEY = 'diet-tracker-day';
const GOAL_STORAGE_KEY = 'diet-tracker-calorie-goal';

function todayKey() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function uid() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function emptyMeals() {
  return MEAL_DEFS.map((m) => ({
    id: m.id,
    name: m.name,
    icon: m.icon,
    time: m.time,
    items: [],
  }));
}

function loadInitialState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.date === todayKey() && Array.isArray(parsed.meals)) {
        return { date: parsed.date, meals: parsed.meals };
      }
    }
  } catch (err) {
    /* almacenamiento no disponible o JSON inválido: se inicia limpio */
  }
  return { date: todayKey(), meals: emptyMeals() };
}

function loadGoal() {
  try {
    const raw = localStorage.getItem(GOAL_STORAGE_KEY);
    if (raw !== null) {
      const n = Number(raw);
      if (Number.isFinite(n) && n > 0) return n;
    }
  } catch (err) {
    /* ignorar */
  }
  return DAILY_CALORIE_LIMIT;
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const meals = state.meals.map((meal) =>
        meal.id === action.mealId
          ? { ...meal, items: [...meal.items, action.item] }
          : meal
      );
      return { ...state, meals };
    }
    case 'REMOVE_ITEM': {
      const meals = state.meals.map((meal) =>
        meal.id === action.mealId
          ? { ...meal, items: meal.items.filter((i) => i.id !== action.itemId) }
          : meal
      );
      return { ...state, meals };
    }
    case 'CLEAR_MEAL': {
      const meals = state.meals.map((meal) =>
        meal.id === action.mealId ? { ...meal, items: [] } : meal
      );
      return { ...state, meals };
    }
    case 'RESET_DAY': {
      return { date: todayKey(), meals: emptyMeals() };
    }
    default:
      return state;
  }
}

/**
 * Hook principal de estado: gestiona las comidas, sus alimentos y la meta
 * calórica diaria, persistiendo el día y la meta en localStorage.
 */
export function useDietTracker() {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitialState);
  const [calorieGoal, setCalorieGoalState] = useState(loadGoal);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      /* cuota excedida o almacenamiento bloqueado: se ignora */
    }
  }, [state]);

  useEffect(() => {
    try {
      localStorage.setItem(GOAL_STORAGE_KEY, String(calorieGoal));
    } catch (err) {
      /* ignorar */
    }
  }, [calorieGoal]);

  const setCalorieGoal = useCallback((goal) => {
    const n = Number(goal);
    if (Number.isFinite(n) && n > 0) {
      setCalorieGoalState(Math.round(n));
    }
  }, []);

  const addItem = useCallback((mealId, food, qty, qtyType) => {
    const item = {
      id: uid(),
      name: food.name,
      category: food.category,
      portion_g: food.portion_g,
      calories_per_portion: food.calories_per_portion,
      qtyType,
      qty,
      grams: calcFoodGrams(food, qty, qtyType),
      calories: calcFoodCalories(food, qty, qtyType),
    };
    dispatch({ type: 'ADD_ITEM', mealId, item });
  }, []);

  const removeItem = useCallback((mealId, itemId) => {
    dispatch({ type: 'REMOVE_ITEM', mealId, itemId });
  }, []);

  const clearMeal = useCallback((mealId) => {
    dispatch({ type: 'CLEAR_MEAL', mealId });
  }, []);

  const resetDay = useCallback(() => {
    dispatch({ type: 'RESET_DAY' });
  }, []);

  return useMemo(
    () => ({
      meals: state.meals,
      date: state.date,
      calorieGoal,
      setCalorieGoal,
      addItem,
      removeItem,
      clearMeal,
      resetDay,
    }),
    [
      state.meals,
      state.date,
      calorieGoal,
      setCalorieGoal,
      addItem,
      removeItem,
      clearMeal,
      resetDay,
    ]
  );
}
