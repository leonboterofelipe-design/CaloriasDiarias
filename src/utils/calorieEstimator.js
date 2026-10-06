import { normalizeSearchText } from './text';

// Calorías aproximadas por 100 g. Gana la primera palabra clave que coincida.
const KEYWORD_CALORIES = [
  // Proteínas
  ['pechuga', 165], ['pollo', 165], ['res', 250], ['carne', 250], ['cerdo', 242],
  ['lomo', 143], ['jamon', 112], ['salchicha', 300], ['chorizo', 316], ['tocino', 540],
  ['trucha', 120], ['pescado', 120], ['tilapia', 96], ['mojarra', 96], ['salmon', 208],
  ['atun', 116], ['camaron', 99], ['marisc', 100], ['huevo', 155],
  // Cereales
  ['arroz', 130], ['arepa', 220], ['pasta', 158], ['pan', 265], ['avena', 380],
  ['maiz', 96], ['choclo', 96], ['quinua', 120], ['galleta', 450], ['tostada', 400],
  ['tortilla', 200], ['cereal', 380], ['harina', 360],
  // Tubérculos
  ['papa', 87], ['yuca', 160], ['batata', 91], ['name', 118], ['platano', 122],
  ['patacon', 220], ['arracacha', 101],
  // Leguminosas
  ['frijol', 127], ['lenteja', 116], ['garbanzo', 164], ['arveja', 81],
  // Verduras
  ['brocoli', 36], ['espinaca', 25], ['zanahoria', 41], ['tomate', 18], ['lechuga', 16],
  ['pepino', 15], ['cebolla', 40], ['habichuela', 31], ['verdura', 26], ['ensalada', 26],
  ['mazorca', 96], ['calabaza', 26], ['remolacha', 43], ['repollo', 25],
  // Frutas
  ['manzana', 52], ['banano', 89], ['naranja', 47], ['mandarina', 53], ['mango', 60],
  ['papaya', 43], ['pina', 50], ['fresa', 32], ['sandia', 30], ['uva', 69], ['guayaba', 68],
  ['mora', 43], ['aguacate', 160], ['fruta', 60], ['pera', 57], ['kiwi', 61],
  // Lácteos
  ['leche', 62], ['yogurt', 60], ['queso', 280], ['suero', 180], ['kumis', 60], ['cuajada', 120],
  // Grasas
  ['aceite', 884], ['mantequilla', 720], ['almendra', 600], ['mani', 570], ['nuez', 600],
  // Azúcares / postres
  ['azucar', 400], ['panela', 380], ['miel', 300], ['chocolate', 496], ['bocadillo', 300],
  ['mermelada', 250], ['dulce', 350], ['postre', 250], ['mazamorra', 100],
  // Bebidas
  ['gaseosa', 42], ['jugo', 45], ['cafe', 1], ['te', 1], ['aromatica', 5], ['aguapanela', 25],
  ['cerveza', 41], ['vino', 83], ['aguardiente', 230], ['bebida', 45], ['refresco', 42],
  // Fritos / callejera
  ['empanada', 250], ['bunuelo', 305], ['frito', 300], ['pizza', 266], ['hamburguesa', 250],
  ['perro', 250], ['salchipapa', 250],
  // Salsas
  ['salsa', 100], ['mayonesa', 680], ['mostaza', 66], ['ketchup', 106], ['aderezo', 200], ['aji', 40],
];

const CATEGORY_DEFAULT = {
  'Carnes y derivados': 200,
  'Pescados y mariscos': 120,
  'Huevos y derivados': 155,
  'Cereales y derivados': 200,
  'Leguminosas y derivados': 130,
  'Verduras, hortalizas y derivados': 40,
  'Frutas y derivados': 60,
  'Leche y derivados': 120,
  'Grasas y aceites': 700,
  'Productos azucarados': 350,
  'Bebidas (alcohólicas y no alcohólicas)': 45,
  'Salsas y aderezos': 150,
  'Preparados y fritos': 280,
  'Proteína': 200,
  'Carbohidrato': 200,
  'Leguminosa': 130,
  'Verdura': 40,
  'Fruta': 60,
  'Lácteo': 120,
  'Aceite / Grasa': 700,
  'Bebida': 45,
  'Otros': 200,
  'Comida callejera': 260,
};

/** Estima las calorías por 100 g de un alimento según su nombre/categoría. */
export function estimateCaloriesPer100g(name, category) {
  const n = normalizeSearchText(name);
  for (const [kw, kcal] of KEYWORD_CALORIES) {
    if (n.includes(kw)) return kcal;
  }
  if (category && CATEGORY_DEFAULT[category] !== undefined) return CATEGORY_DEFAULT[category];
  return 200;
}
