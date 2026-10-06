import { useMemo } from 'react';
import {
  calcDailyCalories,
  calcMealCalories,
  getCalorieStatus,
  DAILY_CALORIE_LIMIT,
} from '../utils/calories';

/**
 * Deriva los totales calóricos y el estado visual a partir de las comidas
 * y de la meta calórica configurada por el usuario.
 */
export function useCalorieProgress(meals, calorieGoal = DAILY_CALORIE_LIMIT) {
  return useMemo(() => {
    const consumed = calcDailyCalories(meals);
    const status = getCalorieStatus(consumed, calorieGoal);
    const byMeal = meals.map((meal) => ({
      id: meal.id,
      name: meal.name,
      icon: meal.icon,
      calories: calcMealCalories(meal),
      count: meal.items.length,
    }));
    const totalItems = byMeal.reduce((sum, m) => sum + m.count, 0);

    return { consumed, status, byMeal, totalItems, totalMeals: meals.length };
  }, [meals, calorieGoal]);
}
