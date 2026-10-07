/**
 * Validación compartida de alimentos (nuevos y personalizados).
 *
 * Acepta un objeto con los campos de un alimento y devuelve un objeto de errores
 * indexado por nombre de campo. Es la única fuente de verdad de validación y la
 * usan:
 *   - `AddFoodForm` (formulario de alimentos nuevos)
 *   - `useFoodDatabase.addCustomFood` (persistencia de alimentos personalizados)
 *   - `MealDialog.handleAddAll` (alimentos nuevos detectados por la IA)
 *
 * `portion_g` y `calories_per_portion` pueden llegar como string (formulario) o
 * como number (parser de IA), por eso se normalizan con `Number()`.
 */
export function validateFoodFields(fields = {}) {
  const name = String(fields.name ?? '').trim();
  const category = String(fields.category ?? '').trim();
  const portionRaw = fields.portion_g;
  const caloriesRaw = fields.calories_per_portion;

  const errors = {};

  if (!name) errors.name = 'El nombre es obligatorio.';
  if (!category) errors.category = 'Elige o escribe una categoría.';

  const portion = Number(portionRaw);
  if (
    portionRaw === '' ||
    portionRaw === null ||
    portionRaw === undefined ||
    !Number.isFinite(portion) ||
    portion <= 0
  ) {
    errors.portion_g = 'Indica una porción en gramos mayor a 0.';
  }

  const calories = Number(caloriesRaw);
  if (
    caloriesRaw === '' ||
    caloriesRaw === null ||
    caloriesRaw === undefined ||
    !Number.isFinite(calories) ||
    calories < 0
  ) {
    errors.calories_per_portion = 'Indica las calorías de la porción (0 o más).';
  }

  ['protein_g', 'carbs_g', 'fat_g'].forEach((key) => {
    const value = fields[key];
    if (
      value !== '' &&
      value !== null &&
      value !== undefined &&
      (!Number.isFinite(Number(value)) || Number(value) < 0)
    ) {
      errors[key] = 'Debe ser un número válido (0 o más).';
    }
  });

  return errors;
}
