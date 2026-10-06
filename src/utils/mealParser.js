import { normalizeSearchText, titleCase } from './text';
import { estimateCaloriesPer100g } from './calorieEstimator';

// Detección de la comida a partir de palabras clave (se evalúa en orden).
const MEAL_RULES = [
  { id: 'desayuno', words: ['desayuno', 'desayune', 'desayunaste', 'desayunamos'] },
  { id: 'media-manana', words: ['media manana', 'media tarde', 'once', 'onces'] },
  { id: 'almuerzo', words: ['almuerzo', 'almuerc', 'almorc', 'almuerce', 'almorzaste', 'almorzamos', 'lunch'] },
  { id: 'merienda', words: ['merienda', 'meriend', 'merende', 'snack', 'algo'] },
  { id: 'cena', words: ['cena', 'cene', 'cenaste', 'cenamos', 'cenar'] },
  { id: 'adicional', words: ['adicional', 'extra', 'antojito', 'antojo'] },
];

const SPLIT_RE = /\s+(?:con|y|mas|ademas|tambien)\s+|[,;\n.]/g;

const EATING_WORDS = [
  'comi', 'comio', 'comimos', 'comiste', 'tome', 'tomo', 'tomaste',
  'bebi', 'bebio', 'bebimos', 'hoy', 'ayer', 'anoche', 'me', 'ya', 'recien',
];

const NUMBER_WORDS = {
  un: 1, una: 1, uno: 1,
  dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6,
  siete: 7, ocho: 8, nueve: 9, diez: 10,
  media: 0.5, medio: 0.5, par: 2,
};

const STOP_TOKENS = new Set([
  'de', 'del', 'la', 'el', 'las', 'los', 'al', 'en', 'a', 'o', 'u', 'e',
  'mi', 'mis', 'su', 'sus', 'un', 'una', 'uno', 'unos', 'unas',
  'porcion', 'porciones', 'gramo', 'gramos', 'gr', 'g', 'kg', 'ml', 'litro', 'litros',
  'taza', 'vaso', 'cucharada', 'cucharadita', 'tajada', 'rebanada', 'unidad', 'unidades',
  'plato', 'pedazo', 'trozo', 'poco', 'poca', 'entero', 'entera', 'grande', 'mediano', 'mediana',
  'pequeno', 'pequena', 'regular', 'comun', 'tipo', 'variedad', 'sin', 'sal',
]);

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function tokensOf(str) {
  return normalizeSearchText(str)
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length >= 2 && !STOP_TOKENS.has(t));
}

function singular(t) {
  if (t.endsWith('es') && t.length > 4) return t.slice(0, -2);
  if (t.endsWith('s') && t.length > 3) return t.slice(0, -1);
  return t;
}

function tokenMatch(a, b) {
  if (a === b) return true;
  const sa = singular(a);
  const sb = singular(b);
  if (sa === sb) return true;
  if (sa.length >= 4 && sb.length >= 4 && (sa.startsWith(sb) || sb.startsWith(sa))) return true;
  return false;
}

function matchScore(phraseTokens, foodTokens) {
  let shared = 0;
  for (const pt of phraseTokens) {
    for (const ft of foodTokens) {
      if (tokenMatch(pt, ft)) { shared++; break; }
    }
  }
  if (shared === 0) return null;
  return {
    shared,
    phraseCoverage: shared / phraseTokens.length,
    foodCoverage: shared / foodTokens.length,
  };
}

function extractQuantity(normPhrase) {
  let qty = 1;
  let qtyType = 'portion';
  let rest = normPhrase.trim();

  const numMatch = rest.match(
    /^(\d+(?:[.,]\d+)?)\s*(g|gr|gramos?|kg|ml|litros?|porciones?|unidades?|unidad|tazas?|vasos?|tajadas?|rebanadas?)?\b/
  );
  if (numMatch) {
    qty = parseFloat(numMatch[1].replace(',', '.'));
    const unit = numMatch[2] || '';
    if (/^(g|gr|gramos?|kg|ml|litros?)$/.test(unit)) qtyType = 'grams';
    rest = rest.slice(numMatch[0].length).trim();
  } else {
    const first = rest.split(/\s+/)[0];
    if (first && NUMBER_WORDS[first] !== undefined) {
      qty = NUMBER_WORDS[first];
      rest = rest.slice(first.length).trim();
    }
  }

  return { qty, qtyType, phrase: rest };
}

function detectMeal(normText) {
  for (const rule of MEAL_RULES) {
    for (const w of rule.words) {
      if (normText.includes(w)) return rule.id;
    }
  }
  return null;
}

function detectMealByTime(date) {
  const h = date.getHours();
  if (h >= 5 && h < 10) return 'desayuno';
  if (h >= 10 && h < 12) return 'media-manana';
  if (h >= 12 && h < 15) return 'almuerzo';
  if (h >= 15 && h < 18) return 'merienda';
  if (h >= 18 && h < 23) return 'cena';
  return 'adicional';
}

function removeWords(text, words) {
  let out = text;
  const multi = words.filter((w) => w.includes(' ')).sort((a, b) => b.length - a.length);
  for (const w of multi) out = out.split(w).join(' ');
  const single = words.filter((w) => !w.includes(' ')).sort((a, b) => b.length - a.length);
  if (single.length) {
    out = out.replace(new RegExp('\\b(?:' + single.map(escapeRe).join('|') + ')\\b', 'g'), ' ');
  }
  return out;
}

const CATEGORY_HINTS = [
  { re: /(pollo|res|carne|cerdo|jamon|salchicha|chorizo|pavo|lomo|bistec|churrasco|costilla)/, category: 'Carnes y derivados' },
  { re: /(pescado|trucha|tilapia|mojarra|salmon|atun|camaron|marisc|bagre|bocachico)/, category: 'Pescados y mariscos' },
  { re: /(huevo)/, category: 'Huevos y derivados' },
  { re: /(arroz|pan|arepa|pasta|avena|maiz|quinua|galleta|tostada|tortilla|cereal|harina)/, category: 'Cereales y derivados' },
  { re: /(frijol|frijoles|lenteja|garbanzo|arveja|legumbre)/, category: 'Leguminosas y derivados' },
  { re: /(papa|yuca|batata|name|platano|patacon|arracacha|brocoli|zanahoria|tomate|cebolla|lechuga|espinaca|pepino|habichuela|verdura|ensalada|mazorca|calabaza|remolacha|repollo)/, category: 'Verduras, hortalizas y derivados' },
  { re: /(manzana|banano|naranja|mandarina|mango|papaya|pina|fresa|sandia|uva|guayaba|mora|aguacate|fruta|pera|kiwi|melocoton)/, category: 'Frutas y derivados' },
  { re: /(leche|yogurt|queso|suero|kumis|cuajada)/, category: 'Leche y derivados' },
  { re: /(aceite|mantequilla|almendra|mani|nuez|grasa)/, category: 'Grasas y aceites' },
  { re: /(gaseosa|jugo|cafe|te|cerveza|vino|aguardiente|bebida|aromatica|refresco)/, category: 'Bebidas (alcohólicas y no alcohólicas)' },
  { re: /(chocolate|panela|azucar|miel|dulce|bocadillo|mermelada|postre)/, category: 'Productos azucarados' },
  { re: /(empanada|bunuelo|frito|pizza|hamburguesa|perro|salchipapa|papas|arepa.*huevo)/, category: 'Preparados y fritos' },
  { re: /(salsa|mayonesa|mostaza|ketchup|aderezo|aji)/, category: 'Salsas y aderezos' },
];

function guessCategory(name) {
  const n = normalizeSearchText(name);
  for (const hint of CATEGORY_HINTS) {
    if (hint.re.test(n)) return hint.category;
  }
  return 'Otros';
}

const REMOVE_WORDS = [
  ...MEAL_RULES.flatMap((r) => r.words),
  ...EATING_WORDS,
];

/**
 * Parsea una frase natural y devuelve la comida detectada y los alimentos
 * (coincidencias de la base + sugerencias de alimentos nuevos).
 */
export function parseMealText(text, foods, date = new Date()) {
  const normText = normalizeSearchText(text);
  const mealId = detectMeal(normText) || detectMealByTime(date);

  const foodText = removeWords(normText, REMOVE_WORDS);
  const phrases = foodText.split(SPLIT_RE).map((p) => p.trim()).filter(Boolean);

  const indexed = foods.map((food) => ({ food, tokens: tokensOf(food.name) }));

  const items = [];
  for (const rawPhrase of phrases) {
    const { qty, qtyType, phrase } = extractQuantity(rawPhrase);
    const pTokens = tokensOf(phrase);
    if (pTokens.length === 0) continue;

    let best = null;
    let bestScore = null;
    for (const { food, tokens } of indexed) {
      const sc = matchScore(pTokens, tokens);
      if (
        sc &&
        (!bestScore ||
          sc.phraseCoverage > bestScore.phraseCoverage ||
          (sc.phraseCoverage === bestScore.phraseCoverage && sc.foodCoverage > bestScore.foodCoverage))
      ) {
        best = food;
        bestScore = sc;
      }
    }

    if (best && bestScore.phraseCoverage >= 0.5) {
      items.push({ kind: 'matched', food: best, qty, qtyType });
    } else {
      const name = titleCase(phrase);
      const category = guessCategory(name);
      items.push({
        kind: 'new',
        name,
        category,
        portion_g: 100,
        calories_per_portion: estimateCaloriesPer100g(name, category),
        qty,
        qtyType,
      });
    }
  }

  return { mealId, items };
}
