import { useEffect, useRef, useState } from 'react';
import styles from './MealDialog.module.css';
import { parseMealText } from '../../utils/mealParser';
import { analyzeMealText } from '../../utils/mealAI';
import { MEAL_DEFS } from '../../hooks/useDietTracker';
import { formatCalories } from '../../utils/calories';
import { getCategoryColor } from '../../utils/categories';

function MatchedRow({ item, index, updateItem, removeItem }) {
  return (
    <>
      <span
        className={styles.check}
        style={{ backgroundColor: getCategoryColor(item.food.category) }}
        aria-hidden="true"
      >
        ✓
      </span>
      <div className={styles.itemInfo}>
        <span className={styles.itemName} title={item.food.name}>
          {item.food.name}
        </span>
        <span className={styles.itemMeta}>
          {formatCalories(item.food.calories_per_portion)} kcal/porción
        </span>
      </div>
      <div className={styles.qtyWrap}>
        <input
          className={styles.qtyInput}
          type="number"
          min="0.1"
          step="0.1"
          value={item.qty}
          onChange={(e) => updateItem(index, { qty: e.target.value })}
          aria-label="Cantidad"
        />
        <span className={styles.qtyUnit}>{item.qtyType === 'grams' ? 'g' : 'porc.'}</span>
      </div>
      <button
        type="button"
        className={styles.remove}
        onClick={() => removeItem(index)}
        aria-label="Quitar"
      >
        ×
      </button>
    </>
  );
}

function NewRow({ item, index, categoryOptions, updateItem, removeItem }) {
  return (
    <>
      <span className={styles.newBadge} aria-hidden="true">
        +
      </span>
      <div className={styles.newFields}>
        <input
          className={styles.input}
          type="text"
          value={item.name}
          onChange={(e) => updateItem(index, { name: e.target.value })}
          placeholder="Nombre del alimento"
          aria-label="Nombre del alimento nuevo"
        />
        <input
          className={styles.input}
          type="text"
          list={`ai-cat-${index}`}
          value={item.category}
          onChange={(e) => updateItem(index, { category: e.target.value })}
          placeholder="Categoría"
          aria-label="Categoría del alimento nuevo"
        />
        <datalist id={`ai-cat-${index}`}>
          {categoryOptions.map((name) => (
            <option key={name} value={name} />
          ))}
        </datalist>
        <div className={styles.newRow2}>
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.1"
            value={item.portion_g}
            onChange={(e) => updateItem(index, { portion_g: e.target.value })}
            placeholder="Porción (g)"
            aria-label="Porción en gramos"
          />
          <input
            className={styles.input}
            type="number"
            min="0"
            step="0.1"
            value={item.calories_per_portion}
            onChange={(e) => updateItem(index, { calories_per_portion: e.target.value })}
            placeholder="kcal/porción"
            aria-label="Calorías por porción"
          />
        </div>
      </div>
      <div className={styles.qtyWrap}>
        <input
          className={styles.qtyInput}
          type="number"
          min="0.1"
          step="0.1"
          value={item.qty}
          onChange={(e) => updateItem(index, { qty: e.target.value })}
          aria-label="Cantidad"
        />
        <span className={styles.qtyUnit}>porc.</span>
      </div>
      <button
        type="button"
        className={styles.remove}
        onClick={() => removeItem(index)}
        aria-label="Quitar"
      >
        ×
      </button>
    </>
  );
}

export default function MealDialog({
  foods,
  categoryOptions,
  onAddItem,
  onAddCustomFood,
  onClose,
}) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [mealId, setMealId] = useState('almuerzo');
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [added, setAdded] = useState(0);
  const [loading, setLoading] = useState(false);

  const modalRef = useRef(null);
  const closeBtnRef = useRef(null);

  // A11y del diálogo: mueve el foco al abrir, permite cerrar con Escape y
  // mantiene el foco dentro del modal (focus trap). Al desmontar restaura el foco.
  useEffect(() => {
    const modal = modalRef.current;
    const previouslyFocused = document.activeElement;
    (closeBtnRef.current || modal)?.focus();

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !modal) return;

      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus();
      }
    };
  }, [onClose]);

  const handleAnalyze = async () => {
    const t = text.trim();
    if (!t) return;
    setLoading(true);
    let parsed = await analyzeMealText(t, foods);
    if (!parsed || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      parsed = parseMealText(t, foods);
    }
    setResult(parsed);
    setMealId(parsed.mealId);
    setErrors({});
    setDone(false);
    setLoading(false);
  };

  const updateItem = (index, patch) => {
    setResult((prev) => ({
      ...prev,
      items: prev.items.map((it, i) => (i === index ? { ...it, ...patch } : it)),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const removeItem = (index) => {
    setResult((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const handleAddAll = () => {
    if (!result) return;

    const errs = {};
    result.items.forEach((it, i) => {
      if (it.kind !== 'new') return;
      if (!it.name.trim()) errs[i] = 'Indica el nombre.';
      else if (!it.category.trim()) errs[i] = 'Elige una categoría.';
      else if (!Number.isFinite(Number(it.portion_g)) || Number(it.portion_g) <= 0)
        errs[i] = 'Porción inválida.';
      else if (
        it.calories_per_portion === '' ||
        !Number.isFinite(Number(it.calories_per_portion)) ||
        Number(it.calories_per_portion) < 0
      )
        errs[i] = 'Indica las calorías.';
    });

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    let count = 0;
    result.items.forEach((it) => {
      if (it.kind === 'matched') {
        onAddItem(mealId, it.food, Number(it.qty) || 1, it.qtyType);
        count++;
      } else {
        const res = onAddCustomFood({
          name: it.name.trim(),
          category: it.category.trim(),
          portion_g: Number(it.portion_g),
          calories_per_portion: Number(it.calories_per_portion),
          description: '',
          protein_g: '',
          carbs_g: '',
          fat_g: '',
        });
        if (res && res.ok && res.food) {
          onAddItem(mealId, res.food, Number(it.qty) || 1, it.qtyType);
          count++;
        }
      }
    });

    setAdded(count);
    setDone(true);
  };

  const selectedMeal = MEAL_DEFS.find((m) => m.id === mealId) || MEAL_DEFS[2];

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <div
        ref={modalRef}
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Registrar comida con IA"
        tabIndex={-1}
      >
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>✨ Registrar con IA</h2>
            <p className={styles.subtitle}>
              Describe lo que comiste y se asignará a la comida correspondiente.
            </p>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className={styles.close}
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </button>
        </header>

        {!result && (
          <>
            <textarea
              className={styles.textarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='Ej. "Almorcé trucha con patacón y frijoles, y mazamorra"'
              rows={4}
            />
            <div className={styles.actions}>
              <button type="button" className={styles.cancel} onClick={onClose}>
                Cancelar
              </button>
              <button
                type="button"
                className={styles.primary}
                onClick={handleAnalyze}
                disabled={!text.trim() || loading}
              >
                {loading ? 'Analizando…' : 'Analizar'}
              </button>
            </div>
          </>
        )}

        {result && !done && (
          <>
            <div className={styles.mealRow}>
              <label className={styles.mealLabel} htmlFor="ai-meal">
                Comida
              </label>
              <select
                id="ai-meal"
                className={styles.mealSelect}
                value={mealId}
                onChange={(e) => setMealId(e.target.value)}
              >
                {MEAL_DEFS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.icon} {m.name}
                  </option>
                ))}
              </select>
            </div>

            {result.items.length === 0 ? (
              <p className={styles.empty}>
                No se identificaron alimentos. Intenta describir con más detalle.
              </p>
            ) : (
              <ul className={styles.list} role="list">
                {result.items.map((it, i) => (
                  <li key={i} className={it.kind === 'matched' ? styles.item : styles.itemNew}>
                    {it.kind === 'matched' ? (
                      <MatchedRow item={it} index={i} updateItem={updateItem} removeItem={removeItem} />
                    ) : (
                      <NewRow
                        item={it}
                        index={i}
                        categoryOptions={categoryOptions}
                        updateItem={updateItem}
                        removeItem={removeItem}
                      />
                    )}
                    {errors[i] && <span className={styles.error}>{errors[i]}</span>}
                  </li>
                ))}
              </ul>
            )}

            <div className={styles.actions}>
              <button
                type="button"
                className={styles.cancel}
                onClick={() => {
                  setResult(null);
                  setText('');
                }}
              >
                Volver
              </button>
              <button
                type="button"
                className={styles.primary}
                onClick={handleAddAll}
                disabled={result.items.length === 0}
              >
                Agregar{result.items.length > 0 ? ` (${result.items.length})` : ''}
              </button>
            </div>
          </>
        )}

        {done && (
          <div className={styles.doneWrap}>
            <p className={styles.done}>
              ✓ Se agregaron {added} alimento{added !== 1 ? 's' : ''} a {selectedMeal.name}.
            </p>
            <div className={styles.actions}>
              <button type="button" className={styles.primary} onClick={onClose}>
                Listo
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
