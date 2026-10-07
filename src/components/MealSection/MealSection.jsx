import { useState } from 'react';
import SearchFood from '../SearchFood/SearchFood';
import styles from './MealSection.module.css';
import {
  calcFoodCalories,
  calcFoodGrams,
  formatCalories,
} from '../../utils/calories';

export default function MealSection({ meal, foods, onAddItem, onRemoveItem, onClear }) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [qtyType, setQtyType] = useState('portion');
  const [qty, setQty] = useState('1');

  const subtotal = meal.items.reduce((sum, item) => sum + item.calories, 0);

  const qtyNumber = Number(qty);
  const validQty = Number.isFinite(qtyNumber) && qtyNumber > 0;
  const previewCalories = selected ? calcFoodCalories(selected, qtyNumber, qtyType) : 0;
  const previewGrams = selected ? calcFoodGrams(selected, qtyNumber, qtyType) : 0;

  const handleSelectFood = (food) => {
    setSelected(food);
    setQty('1');
    setQtyType('portion');
  };

  const handleAdd = () => {
    if (!selected || !validQty) return;
    onAddItem(meal.id, selected, qtyNumber, qtyType);
    setSelected(null);
    setQty('1');
  };

  return (
    <section className={styles.meal} aria-label={meal.name}>
      <header className={styles.mealHeader}>
        <div className={styles.title}>
          <span className={styles.icon} aria-hidden="true">
            {meal.icon}
          </span>
          <h3>{meal.name}</h3>
          {meal.time && <span className={styles.time}>{meal.time}</span>}
        </div>
        <div className={styles.subtotal}>
          <span className={styles.subtotalValue}>{formatCalories(subtotal)}</span>
          <span className={styles.subtotalUnit}>kcal</span>
        </div>
      </header>

      {meal.items.length > 0 ? (
        <ul className={styles.items} role="list">
          {meal.items.map((item) => (
            <li key={item.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <span className={styles.itemName} title={item.name}>
                  {item.name}
                </span>
                <span className={styles.itemMeta}>
                  {item.qtyType === 'portion'
                    ? `${item.qty} porción${item.qty !== 1 ? 'es' : ''} · ${Math.round(item.grams)} g`
                    : `${Math.round(item.grams)} g`}
                </span>
              </div>
              <span className={styles.itemCalories}>
                {formatCalories(item.calories)} kcal
              </span>
              <button
                type="button"
                className={styles.removeBtn}
                onClick={() => onRemoveItem(meal.id, item.id)}
                aria-label={`Eliminar ${item.name}`}
                title="Eliminar"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className={styles.placeholder}>
          Aún no has agregado alimentos a esta comida.
        </p>
      )}

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.addToggle}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          {open ? 'Cerrar' : '+ Agregar alimento'}
        </button>
        {meal.items.length > 0 && (
          <button
            type="button"
            className={styles.clearBtn}
            onClick={() => onClear(meal.id)}
          >
            Vaciar
          </button>
        )}
      </div>

      {open && (
        <div className={styles.addArea}>
          <SearchFood foods={foods} onSelect={handleSelectFood} />

          {selected && (
            <div className={styles.selector}>
              <div className={styles.selectorTitle}>
                <strong>{selected.name}</strong>
                <span>{selected.portion_g} g por porción</span>
              </div>

              <div className={styles.qtyRow}>
                <div
                  className={styles.unitToggle}
                  role="group"
                  aria-label="Unidad de medida"
                >
                  <button
                    type="button"
                    className={qtyType === 'portion' ? styles.unitActive : styles.unit}
                    onClick={() => setQtyType('portion')}
                    aria-pressed={qtyType === 'portion'}
                  >
                    Porciones
                  </button>
                  <button
                    type="button"
                    className={qtyType === 'grams' ? styles.unitActive : styles.unit}
                    onClick={() => setQtyType('grams')}
                    aria-pressed={qtyType === 'grams'}
                  >
                    Gramos
                  </button>
                </div>

                <label className={styles.qtyLabel}>
                  <span className={styles.qtyLabelText}>Cantidad</span>
                  <input
                    className={styles.qtyInput}
                    type="number"
                    inputMode="decimal"
                    min="0.01"
                    step="0.1"
                    value={qty}
                    onChange={(e) => setQty(e.target.value)}
                  />
                </label>
              </div>

              <div className={styles.preview}>
                ≈ {Math.round(previewGrams)} g · {formatCalories(previewCalories)} kcal
              </div>

              <div className={styles.selectorActions}>
                <button
                  type="button"
                  className={styles.cancel}
                  onClick={() => setSelected(null)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className={styles.confirm}
                  disabled={!validQty}
                  onClick={handleAdd}
                >
                  Agregar a {meal.name}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
