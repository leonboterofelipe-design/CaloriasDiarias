import { DietProvider } from './context/DietContext';
import Home from './pages/Home/Home';

export default function App() {
  return (
    <DietProvider>
      <Home />
    </DietProvider>
  );
}
