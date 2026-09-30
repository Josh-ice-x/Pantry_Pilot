// Calls our own backend proxy (see /backend), which forwards requests to
// Gemini 2.0 Flash. The Gemini API key never lives on-device — see
// backend/README.md for deploy instructions.

const API_PROXY_URL = 'https://YOUR_DEPLOYED_PROXY.vercel.app/api/analyze'; // <-- replace after deploying /backend

export type Recipe = {
  id: string;
  title: string;
  minutes: number;
  servings: number;
  usesOnHand: string[];
  missing: string[];
  steps: string[];
  cuisine: string;
};

export type PantryConstraints = {
  people: number;
  minutes: number;
  budget: 'low' | 'medium' | 'any';
  cuisine: string; // e.g. "any", "italian", "mexican"
  equipment: string[]; // e.g. ["stovetop", "oven", "microwave"]
};

export async function identifyIngredients(base64Image: string): Promise<string[]> {
  const res = await fetch(API_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'identify',
      image: base64Image,
    }),
  });
  if (!res.ok) throw new Error('Ingredient detection failed');
  const data = await res.json();
  return data.ingredients as string[]; // e.g. ["eggs", "tomatoes", "onions", "rice"]
}

export async function generateRecipes(
  ingredients: string[],
  constraints: PantryConstraints
): Promise<Recipe[]> {
  const res = await fetch(API_PROXY_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      mode: 'recipes',
      ingredients,
      constraints,
    }),
  });
  if (!res.ok) throw new Error('Recipe generation failed');
  const data = await res.json();
  return data.recipes as Recipe[];
}
