import { useId, useState } from 'react';
import styles from './AddFoodForm.module.css';

const EMPTY = {
  name: '',
  category: '',
  portion_g: '',
  calories_per_portion: '',
  description: '',
  protein_g: '',
  carbs_g: '',
  fat_g: '',
};

function validate(fields) {
  const errors = {};

  if (!fields.name.trim()) errors.name = 'El nombre es obligatorio.';
  if (!fields.category.trim()) errors.category = 'Elige o escribe una categoría.';

  const portion = Number(fields.portion_g);
  if (fields.portion_g === '' || !Number.isFinite(portion) || portion <= 0) {
    errors.portion_g = 'Indica una porción en gramos mayor a 0.';
  }

  const calories = Number(fields.calories_per_portion);
  if (fields.calories_per_portion === '' || !Number.isFinite(calories) || calories < 0) {
    errors.calories_per_portion = 'Indica las calorías de la porción (0 o más).';
  }

  ['protein_g', 'carbs_g', 'fat_g'].forEach((key) => {
    const value = fields[key];
    if (value !== '' && (!Number.isFinite(Number(value)) || Number(value) < 0)) {
      errors[key] = 'Debe ser un número válido (0 o más).';
    }
  });

  return errors;
}

export default function AddFoodForm({ categoryOptions = [], onSubmit, onCancel }) {
  const [fields, setFields] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const categoryListId = useId();
  const errorId = useId();

  const setField = (key, value) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
    setSuccess('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(fields);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const result = onSubmit(fields);
    if (result && result.ok) {
      setFields(EMPTY);
      setErrors({});
      setSuccess(`✓ "${fields.name.trim()}" se agregó a la base de alimentos.`);
    } else if (result && result.errors) {
      setErrors(result.errors);
    }
  };

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>
            Nombre <span className={styles.required} aria-hidden="true">*</span>
          </span>
          <input
            className={styles.input}
            type="text"
            value={fields.name}
            onChange={(e) => setField('name', e.target.value)}
            placeholder="Ej. Pechuga de pollo"
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? `${errorId}-name` : undefined}
          />
          {errors.name && (
            <span id={`${errorId}-name`} className={styles.error} role="alert">
              {errors.name}
            </span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            Categoría <span className={styles.required} aria-hidden="true">*</span>
          </span>
          <input
            className={styles.input}
            type="text"
            list={categoryListId}
            value={fields.category}
            onChange={(e) => setField('category', e.target.value)}
            placeholder="Elige o escribe una categoría"
            required
            aria-invalid={!!errors.category}
            aria-describedby={errors.category ? `${errorId}-category` : undefined}
          />
          <datalist id={categoryListId}>
            {categoryOptions.map((name) => (
              <option key={name} value={name} />
            ))}
          </datalist>
          {errors.category && (
            <span id={`${errorId}-category`} className={styles.error} role="alert">
              {errors.category}
            </span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            Porción estándar (g){' '}
            <span className={styles.required} aria-hidden="true">*</span>
          </span>
          <input
            className={styles.input}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={fields.portion_g}
            onChange={(e) => setField('portion_g', e.target.value)}
            placeholder="Ej. 100"
            required
            aria-invalid={!!errors.portion_g}
            aria-describedby={errors.portion_g ? `${errorId}-portion_g` : undefined}
          />
          {errors.portion_g && (
            <span id={`${errorId}-portion_g`} className={styles.error} role="alert">
              {errors.portion_g}
            </span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>
            Calorías por porción{' '}
            <span className={styles.required} aria-hidden="true">*</span>
          </span>
          <input
            className={styles.input}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={fields.calories_per_portion}
            onChange={(e) => setField('calories_per_portion', e.target.value)}
            placeholder="Ej. 165"
            required
            aria-invalid={!!errors.calories_per_portion}
            aria-describedby={
              errors.calories_per_portion ? `${errorId}-calories_per_portion` : undefined
            }
          />
          {errors.calories_per_portion && (
            <span id={`${errorId}-calories_per_portion`} className={styles.error} role="alert">
              {errors.calories_per_portion}
            </span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Descripción de la porción</span>
          <input
            className={styles.input}
            type="text"
            value={fields.description}
            onChange={(e) => setField('description', e.target.value)}
            placeholder="Ej. 1 unidad (~50 g)"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Proteína (g)</span>
          <input
            className={styles.input}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={fields.protein_g}
            onChange={(e) => setField('protein_g', e.target.value)}
            placeholder="Opcional"
            aria-invalid={!!errors.protein_g}
            aria-describedby={errors.protein_g ? `${errorId}-protein_g` : undefined}
          />
          {errors.protein_g && (
            <span id={`${errorId}-protein_g`} className={styles.error} role="alert">
              {errors.protein_g}
            </span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Carbohidratos (g)</span>
          <input
            className={styles.input}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={fields.carbs_g}
            onChange={(e) => setField('carbs_g', e.target.value)}
            placeholder="Opcional"
            aria-invalid={!!errors.carbs_g}
            aria-describedby={errors.carbs_g ? `${errorId}-carbs_g` : undefined}
          />
          {errors.carbs_g && (
            <span id={`${errorId}-carbs_g`} className={styles.error} role="alert">
              {errors.carbs_g}
            </span>
          )}
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Grasas (g)</span>
          <input
            className={styles.input}
            type="number"
            inputMode="decimal"
            min="0"
            step="0.1"
            value={fields.fat_g}
            onChange={(e) => setField('fat_g', e.target.value)}
            placeholder="Opcional"
            aria-invalid={!!errors.fat_g}
            aria-describedby={errors.fat_g ? `${errorId}-fat_g` : undefined}
          />
          {errors.fat_g && (
            <span id={`${errorId}-fat_g`} className={styles.error} role="alert">
              {errors.fat_g}
            </span>
          )}
        </label>
      </div>

      {success && (
        <p className={styles.success} role="status">
          {success}
        </p>
      )}

      <div className={styles.actions}>
        <button type="button" className={styles.cancel} onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className={styles.submit}>
          Guardar alimento
        </button>
      </div>
    </form>
  );
}
