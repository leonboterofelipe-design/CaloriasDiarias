import styles from './FoodCard.module.css';
import { formatCalories } from '../../utils/calories';
import { getCategoryColor } from '../../utils/categories';

export default function FoodCard({ food, onSelect }) {
  const color = getCategoryColor(food.category);
  const portionText = food.description || `${food.portion_g} g`;

  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <div className={styles.top}>
          <h4 className={styles.name}>{food.name}</h4>
          <span
            className={styles.category}
            style={{ backgroundColor: `${color}CC`, color: '#3a3a48' }}
          >
            {food.category}
          </span>
        </div>
        <p className={styles.meta}>
          {portionText} · {formatCalories(food.calories_per_portion)} kcal/porción
        </p>
      </div>
      <button
        type="button"
        className={styles.addBtn}
        onClick={() => onSelect(food)}
        aria-label={`Seleccionar ${food.name}`}
      >
        Agregar
      </button>
    </div>
  );
}
