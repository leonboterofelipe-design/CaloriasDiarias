import { createContext, useContext } from 'react';
import { useDietTracker } from '../hooks/useDietTracker';
import { useFoodDatabase } from '../hooks/useFoodDatabase';

const DietContext = createContext(null);

export function DietProvider({ children }) {
  const diet = useDietTracker();
  const foodDb = useFoodDatabase();
  return (
    <DietContext.Provider value={{ ...diet, ...foodDb }}>
      {children}
    </DietContext.Provider>
  );
}

export function useDiet() {
  const ctx = useContext(DietContext);
  if (!ctx) {
    throw new Error('useDiet debe usarse dentro de un DietProvider');
  }
  return ctx;
}
