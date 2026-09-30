import React, { createContext, useContext, useState, useCallback } from 'react';
import { Recipe, PantryConstraints } from '../services/visionService';
import { isPremium as checkPremium } from '../services/revenuecat';

const FREE_WEEKLY_LIMIT = 3;

type AppState = {
  ingredients: string[];
  setIngredients: (i: string[]) => void;
  recipes: Recipe[];
  setRecipes: (r: Recipe[]) => void;
  constraints: PantryConstraints;
  setConstraints: (c: PantryConstraints) => void;
  isPremium: boolean;
  refreshPremiumStatus: () => Promise<void>;
  generationsUsedThisWeek: number;
  canGenerate: boolean;
  recordGeneration: () => void;
};

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [constraints, setConstraints] = useState<PantryConstraints>({
    people: 2,
    minutes: 30,
    budget: 'any',
    cuisine: 'any',
    equipment: ['stovetop', 'oven'],
  });
  const [premium, setPremium] = useState(false);
  const [used, setUsed] = useState(0); // TODO: persist + reset weekly (AsyncStorage + a stored week-start timestamp)

  const refreshPremiumStatus = useCallback(async () => {
    const p = await checkPremium();
    setPremium(p);
  }, []);

  const recordGeneration = useCallback(() => setUsed((u) => u + 1), []);

  const canGenerate = premium || used < FREE_WEEKLY_LIMIT;

  return (
    <AppContext.Provider
      value={{
        ingredients,
        setIngredients,
        recipes,
        setRecipes,
        constraints,
        setConstraints,
        isPremium: premium,
        refreshPremiumStatus,
        generationsUsedThisWeek: used,
        canGenerate,
        recordGeneration,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

export { FREE_WEEKLY_LIMIT };
