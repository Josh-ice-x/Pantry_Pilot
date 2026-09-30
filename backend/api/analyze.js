// Deploy this as a Vercel serverless function: backend/api/analyze.js
// Env var required: GEMINI_API_KEY (set in Vercel project settings, never in client code)
//
// Handles two request shapes from the app:
//   { mode: "identify", image: "<base64 jpeg>" }              -> { ingredients: string[] }
//   { mode: "recipes", ingredients: string[], constraints }   -> { recipes: Recipe[] }

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Use POST' });
  }

  const { mode } = req.body;
  try {
    if (mode === 'identify') {
      const ingredients = await identifyIngredients(req.body.image);
      return res.status(200).json({ ingredients });
    }
    if (mode === 'recipes') {
      const recipes = await generateRecipes(req.body.ingredients, req.body.constraints);
      return res.status(200).json({ recipes });
    }
    return res.status(400).json({ error: 'Unknown mode' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Gemini request failed' });
  }
}

async function callGemini(parts, responseSchema) {
  const resp = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema,
      },
    }),
  });
  if (!resp.ok) throw new Error(`Gemini error: ${resp.status} ${await resp.text()}`);
  const data = await resp.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  return JSON.parse(text);
}

async function identifyIngredients(base64Image) {
  const parts = [
    { inline_data: { mime_type: 'image/jpeg', data: base64Image } },
    {
      text:
        'List only the edible food ingredients visible in this photo. Short, lowercase, no quantities.',
    },
  ];
  const schema = {
    type: 'OBJECT',
    properties: { ingredients: { type: 'ARRAY', items: { type: 'STRING' } } },
    required: ['ingredients'],
  };
  const result = await callGemini(parts, schema);
  return result.ingredients;
}

async function generateRecipes(ingredients, constraints) {
  const prompt = `Given these on-hand ingredients: ${ingredients.join(', ')}.
Constraints: ${JSON.stringify(constraints)}.
Suggest 4 recipes, preferring ones that need few or no missing items.
Do NOT include calorie counts, macros, or restrictive diet framing — just practical cooking.`;

  const schema = {
    type: 'OBJECT',
    properties: {
      recipes: {
        type: 'ARRAY',
        items: {
          type: 'OBJECT',
          properties: {
            id: { type: 'STRING' },
            title: { type: 'STRING' },
            minutes: { type: 'INTEGER' },
            servings: { type: 'INTEGER' },
            cuisine: { type: 'STRING' },
            usesOnHand: { type: 'ARRAY', items: { type: 'STRING' } },
            missing: { type: 'ARRAY', items: { type: 'STRING' } },
            steps: { type: 'ARRAY', items: { type: 'STRING' } },
          },
          required: ['id', 'title', 'minutes', 'servings', 'cuisine', 'usesOnHand', 'missing', 'steps'],
        },
      },
    },
    required: ['recipes'],
  };

  const result = await callGemini([{ text: prompt }], schema);
  return result.recipes;
}
