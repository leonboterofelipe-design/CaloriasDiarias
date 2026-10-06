// Función serverless de Vercel para analizar una comida con Gemini.
// Variables de entorno:
//   GEMINI_API_KEY  (obligatoria; la API key de Google AI Studio, empieza con "AIza")
//   GEMINI_MODEL    (por defecto gemini-flash-latest)

const MEAL_IDS = ['desayuno', 'media-manana', 'almuerzo', 'merienda', 'cena', 'adicional'];

function extractJson(content) {
  const text = String(content || '').trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) return JSON.parse(fence[1].trim());
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start !== -1 && end > start) return JSON.parse(text.slice(start, end + 1));
  return JSON.parse(text);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Gemini no configurado (GEMINI_API_KEY)' });
  }

  try {
    const body = req.body && typeof req.body === 'object' ? req.body : JSON.parse(req.body || '{}');
    const { text } = body;
    if (!text) return res.status(400).json({ error: 'Falta el texto' });

    const model = process.env.GEMINI_MODEL || process.env.LLM_MODEL || 'gemini-flash-latest';
    const baseUrl = (
      process.env.GEMINI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta'
    ).replace(/\/+$/, '');

    const foods = Array.isArray(body.foods) ? body.foods : [];
    const catalog = foods.map((f) => ({
      id: f.id || f.name,
      name: f.name,
      category: f.category,
      portion_g: f.portion_g,
      calories_per_portion: f.calories_per_portion,
    }));

    const system = [
      'Eres un asistente que convierte descripciones de comidas en español en datos estructurados para una app de dieta.',
      'Responde ÚNICAMENTE con un objeto JSON válido (sin markdown ni texto adicional) con esta forma exacta:',
      `{"mealId": "<uno de: ${MEAL_IDS.join('|')}>", "items": [ ... ]}`,
      'Cada elemento de "items" es uno de estos dos tipos:',
      '1) Coincidencia del catálogo: {"kind":"matched","foodId":"<id exacto del catálogo>","qty":1,"qtyType":"portion"}',
      '2) Alimento nuevo (no está en el catálogo): {"kind":"new","name":"Trucha","category":"Pescados y mariscos","portion_g":100,"calories_per_portion":120,"qty":1,"qtyType":"portion"}',
      'Reglas:',
      '- Detecta mealId por las palabras (almorcé/almuerzo, cené/cena, desayuné/desayuno, merendé/merienda/algo, media mañana/onces). Si no hay pista, usa "almuerzo".',
      '- qty es la cantidad; qtyType es "portion" o "grams". Si no se indica cantidad, usa qty=1 y qtyType="portion".',
      '- Si un alimento del texto coincide con uno del catálogo, usa "matched" con su foodId exacto.',
      '- Si no existe en el catálogo, crea uno "new" con nombre, categoría, porción en gramos y calorías por porción estimadas razonables.',
      '- No inventes campos extra ni incluyas texto fuera del JSON.',
    ].join('\n');

    const user =
      'Catálogo de alimentos (JSON):\n' +
      JSON.stringify(catalog) +
      '\n\nTexto del usuario: "' +
      text +
      '"';

    const upstream = await fetch(`${baseUrl}/models/${model}:generateContent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { temperature: 0, responseMimeType: 'application/json' },
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text().catch(() => '');
      return res.status(502).json({
        error: 'Error de Gemini',
        status: upstream.status,
        detail: detail.slice(0, 500),
      });
    }

    const data = await upstream.json();
    const content = (data?.candidates?.[0]?.content?.parts || [])
      .map((p) => p.text || '')
      .join('');
    const parsed = extractJson(content);

    if (!parsed || !Array.isArray(parsed.items)) {
      return res.status(502).json({ error: 'Respuesta de Gemini inválida' });
    }

    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: 'Error interno', message: String(err?.message || err) });
  }
}
