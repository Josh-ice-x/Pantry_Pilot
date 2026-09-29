# PantryPilot

Snap a photo of your fridge or pantry → get meal ideas ranked by what you already have.

## What's here

A working Expo/React Native scaffold:

- `App.tsx` — navigation + RevenueCat init
- `src/screens/HomeScreen.tsx` — camera/library capture, kicks off ingredient detection
- `src/screens/ResultsScreen.tsx` — filters (people, time, cuisine, budget) + recipe cards
- `src/screens/RecipeDetailScreen.tsx` — full steps for one recipe
- `src/screens/PaywallScreen.tsx` — RevenueCat offering display + purchase flow
- `src/services/visionService.ts` — calls our backend proxy, which talks to Gemini 2.0 Flash
- `src/services/revenuecat.ts` — RevenueCat SDK wrapper
- `src/context/AppContext.tsx` — shared state (ingredients, recipes, free-tier usage count, premium status)
- `backend/` — deployable Vercel serverless function that holds the Gemini API key and does the actual AI calls

## To get this running

1. **Install deps**
   ```
   cd PantryPilot
   npm install
   ```

2. **Deploy the backend proxy.** Don't call Gemini directly from the app — your API key would ship inside the binary. See `backend/README.md` for full deploy steps (Vercel, ~5 minutes). Once deployed, set `API_PROXY_URL` at the top of `src/services/visionService.ts` to your real endpoint.

3. **Gemini API key** — grab one free at https://aistudio.google.com/apikey and add it as `GEMINI_API_KEY` when you deploy the backend (step 2).

4. **RevenueCat setup**
   - Create a project at [app.revenuecat.com](https://app.revenuecat.com), add your iOS/Android apps.
   - Create an entitlement called `premium`.
   - Create a "default" offering with your subscription packages (e.g. weekly $4.99, annual $29.99).
   - Drop your public SDK keys into `src/services/revenuecat.ts` (`REVENUECAT_API_KEY_IOS` / `_ANDROID`).

4. **Run it**
   ```
   npx expo start
   ```
   RevenueCat purchases won't work in Expo Go — use a development build (`npx expo run:ios` / `run:android`) or EAS Build once you're testing purchases.

5. **App icon / screenshots for Devpost submission**
   - Replace `assets/icon.png` with your 1024×1024 icon before building.
   - You'll need a 1179×2556 screenshot with no device frame for the submission form.

## Not yet built (next steps)

- Weekly meal-planning calendar screen (Premium feature)
- Auto-generated shopping list screen (Premium feature)
- Persisting the free-tier weekly usage counter (currently resets on app restart — wire up `AsyncStorage` with a stored week-start timestamp in `AppContext.tsx`)
- Onboarding / equipment selection (currently defaults to stovetop + oven)
- RevenueCat Ads integration for the free tier (sponsored recipe packs), if you want to also target the Catvertising Award

## Hackathon fit

Built for the RevenueCat Shipaton 2026 — Nutrition & Healthy Eating category. No calorie counts, no macros, no restrictive meal plans — just "here's what to cook with what you've got."
