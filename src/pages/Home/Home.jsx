import { useState } from 'react';
import { useDiet } from '../../context/DietContext';
import { useCalorieProgress } from '../../hooks/useCalorieProgress';
import { CATEGORIES } from '../../utils/categories';
import CalorieChart from '../../components/CalorieChart/CalorieChart';
import ProgressBar from '../../components/ProgressBar/ProgressBar';
import MealSection from '../../components/MealSection/MealSection';
import AddFoodForm from '../../components/AddFoodForm/AddFoodForm';
import styles from './Home.module.css';
import { formatCalories } from '../../utils/calories';

export default function Home() {
  const {
    meals,
    date,
    foods,
    calorieGoal,
    setCalorieGoal,
    addCustomFood,
    addItem,
    removeItem,
    clearMeal,
    resetDay,
  } = useDiet();
  const { consumed, status, totalItems } = useCalorieProgress(meals, calorieGoal);
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [goalInput, setGoalInput] = useState(String(calorieGoal));

  const commitGoal = () => {
    const n = Number(goalInput);
    if (Number.isFinite(n) && n > 0) {
      setCalorieGoal(n);
      setGoalInput(String(Math.round(n)));
    } else {
      setGoalInput(String(calorieGoal));
    }
  };

  const handleGoalKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      commitGoal();
      e.currentTarget.blur();
    }
  };

  const dateLabel = new Intl.DateTimeFormat('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${date}T00:00:00`));

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            🥗
          </span>
          <div>
            <h1 className={styles.title}>Dieta Diaria</h1>
            <p className={styles.subtitle}>{dateLabel}</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.addFoodBtn}
            onClick={() => setShowFoodForm((v) => !v)}
            aria-expanded={showFoodForm}
          >
            {showFoodForm ? 'Cerrar' : '+ Nuevo alimento'}
          </button>
          <button type="button" className={styles.resetBtn} onClick={resetDay}>
            Reiniciar día
          </button>
        </div>
      </header>

      {showFoodForm && (
        <section className={`${styles.addFoodCard} glass`} aria-label="Agregar alimento">
          <div className={styles.addFoodHeader}>
            <h2 className={styles.addFoodTitle}>Agregar alimento a la base</h2>
            <button
              type="button"
              className={styles.addFoodClose}
              onClick={() => setShowFoodForm(false)}
              aria-label="Cerrar formulario"
            >
              ×
            </button>
          </div>
          <p className={styles.addFoodHint}>
            Completa los campos obligatorios (*) para registrar un alimento nuevo.
            Quedará disponible en la búsqueda de todas las comidas.
          </p>
          <AddFoodForm
            categories={CATEGORIES}
            onSubmit={addCustomFood}
            onCancel={() => setShowFoodForm(false)}
          />
        </section>
      )}

      <main className={styles.main}>
        <section className={`${styles.summary} glass`}>
          <div className={styles.chartWrap}>
            <CalorieChart
              consumed={consumed}
              max={status.max}
              remaining={status.remaining}
              percent={status.percent}
              color={status.color}
            />

            <label className={styles.goalField}>
              <span className={styles.goalLabel}>Meta diaria</span>
              <span className={styles.goalInputWrap}>
                <input
                  className={styles.goalInput}
                  type="number"
                  inputMode="numeric"
                  min="100"
                  step="50"
                  value={goalInput}
                  onChange={(e) => setGoalInput(e.target.value)}
                  onBlur={commitGoal}
                  onKeyDown={handleGoalKeyDown}
                  aria-label="Meta calórica diaria en kcal"
                />
                <span className={styles.goalUnit}>kcal</span>
              </span>
            </label>
          </div>

          <div className={styles.summaryInfo}>
            <div className={styles.summaryStats}>
              <div className={styles.stat}>
                <span className={styles.statValue} style={{ color: status.textColor }}>
                  {formatCalories(consumed)}
                </span>
                <span className={styles.statLabel}>kcal consumidas</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{formatCalories(status.remaining)}</span>
                <span className={styles.statLabel}>kcal restantes</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statValue}>{Math.round(status.rawPercent)}%</span>
                <span className={styles.statLabel}>de la meta</span>
              </div>
            </div>

            <div
              className={styles.statusChip}
              style={{
                backgroundColor: `${status.color}22`,
                color: status.textColor,
              }}
            >
              <span
                className={styles.statusDot}
                style={{ backgroundColor: status.color }}
                aria-hidden="true"
              />
              {status.label}
            </div>

            <ProgressBar
              percent={status.rawPercent}
              color={status.color}
              max={status.max}
              consumed={consumed}
            />
          </div>
        </section>

        <section className={styles.mealsSection}>
          <div className={styles.mealsHeader}>
            <h2 className={styles.mealsTitle}>Comidas del día</h2>
            <span className={styles.mealsCount}>
              {totalItems} alimento{totalItems !== 1 ? 's' : ''} registrado
              {totalItems !== 1 ? 's' : ''}
            </span>
          </div>

          <div className={styles.mealsGrid}>
            {meals.map((meal) => (
              <MealSection
                key={meal.id}
                meal={meal}
                foods={foods}
                onAddItem={addItem}
                onRemoveItem={removeItem}
                onClear={clearMeal}
              />
            ))}
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>
          La meta calórica es configurable (referencia: 2000 kcal diarias). Los
          valores nutricionales son aproximados.
        </p>
      </footer>
    </div>
  );
}
