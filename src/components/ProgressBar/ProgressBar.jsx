import styles from './ProgressBar.module.css';

export default function ProgressBar({ percent = 0, color = '#34c98e', max = 2000, consumed = 0 }) {
  const clamped = Math.min(Math.max(percent, 0), 100);

  return (
    <div
      className={styles.wrap}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(consumed)}
      aria-label="Progreso calórico diario"
    >
      <div className={styles.track}>
        <div
          className={styles.fill}
          style={{ transform: `scaleX(${clamped / 100})`, backgroundColor: color }}
        />
      </div>
      <div className={styles.labels}>
        <span>0 kcal</span>
        <span>{max.toLocaleString('es-CO')} kcal</span>
      </div>
    </div>
  );
}
