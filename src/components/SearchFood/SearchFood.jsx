import { useId, useMemo, useState } from 'react';
import FoodCard from '../FoodCard/FoodCard';
import { normalizeSearchText } from '../../utils/text';
import styles from './SearchFood.module.css';

export default function SearchFood({
  foods,
  onSelect,
  placeholder = 'Buscar alimento…',
}) {
  const [query, setQuery] = useState('');
  const inputId = useId();

  const results = useMemo(() => {
    const q = normalizeSearchText(query);
    if (!q) return [];
    return foods
      .filter(
        (f) =>
          normalizeSearchText(f.name).includes(q) ||
          normalizeSearchText(f.category).includes(q)
      )
      .slice(0, 8);
  }, [foods, query]);

  const handleSelect = (food) => {
    onSelect(food);
    setQuery('');
  };

  return (
    <div className={styles.search}>
      <label className={styles.label} htmlFor={inputId}>
        Buscar alimento
      </label>

      <div className={styles.inputWrap}>
        <span className={styles.searchIcon} aria-hidden="true">
          🔍
        </span>
        <input
          id={inputId}
          className={styles.input}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
          spellCheck="false"
        />
        {query && (
          <button
            type="button"
            className={styles.clear}
            onClick={() => setQuery('')}
            aria-label="Limpiar búsqueda"
          >
            ×
          </button>
        )}
      </div>

      {query.trim() && (
        <div className={styles.results}>
          {results.length === 0 ? (
            <p className={styles.empty}>
              No se encontraron alimentos para “{query}”.
            </p>
          ) : (
            <>
              <p className={styles.count}>
                {results.length} resultado{results.length !== 1 ? 's' : ''}
              </p>
              <ul className={styles.list} role="list">
                {results.map((food) => (
                  <li key={food.id}>
                    <FoodCard food={food} onSelect={handleSelect} />
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}
