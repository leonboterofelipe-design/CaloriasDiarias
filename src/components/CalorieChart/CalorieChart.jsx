import styles from './CalorieChart.module.css';
import { formatCalories } from '../../utils/calories';

const R = 80;
const CIRCUMFERENCE = 2 * Math.PI * R;

export default function CalorieChart({ consumed, max, remaining, percent, color }) {
  const clamped = Math.min(Math.max(percent, 0), 1);
  const dashOffset = CIRCUMFERENCE * (1 - clamped);
  const isOver = percent >= 1;

  return (
    <div className={styles.chart}>
      <svg
        viewBox="0 0 200 200"
        className={styles.svg}
        role="img"
        aria-label={`Consumido ${formatCalories(consumed)} de ${formatCalories(max)} calorías`}
      >
        <circle className={styles.track} cx="100" cy="100" r={R} />
        <circle
          className={styles.progress}
          cx="100"
          cy="100"
          r={R}
          stroke={color}
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
        />
      </svg>
      <div className={styles.center}>
        <span className={styles.consumed}>{formatCalories(consumed)}</span>
        <span className={styles.consumedUnit}>kcal consumidas</span>
        <span className={styles.remaining}>
          {isOver
            ? 'Sobre el límite'
            : `${formatCalories(remaining)} kcal restantes`}
        </span>
      </div>
    </div>
  );
}
