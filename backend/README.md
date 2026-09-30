# PantryPilot backend proxy

A single serverless function that hides your Gemini API key from the client
and forwards ingredient-detection / recipe-generation requests to
**Gemini 2.0 Flash**.

## Deploy (Vercel — fastest path)

1. Get a free API key at https://aistudio.google.com/apikey
2. From this `backend/` folder:
   ```
   npm i -g vercel
   vercel
   ```
   Follow the prompts (link/create a project).
3. Add your key as an env var:
   ```
   vercel env add GEMINI_API_KEY
   ```
   Paste the key when prompted, select all environments.
4. Deploy for real:
   ```
   vercel --prod
   ```
   You'll get a URL like `https://pantrypilot-backend.vercel.app`. Your
   endpoint is `https://pantrypilot-backend.vercel.app/api/analyze`.

5. In the app, open `src/services/visionService.ts` and set:
   ```ts
   const API_PROXY_URL = 'https://pantrypilot-backend.vercel.app/api/analyze';
   ```

## Swapping to Groq instead

Groq's vision-capable models (Llama 3.2 Vision) are faster and cheaper, but
noticeably less accurate at identifying groceries in a cluttered fridge photo.
If you'd rather use Groq: same file, same request/response shape — just
replace `callGemini` in `api/analyze.js` with a call to
`https://api.groq.com/openai/v1/chat/completions` (OpenAI-compatible
schema, model `llama-3.2-90b-vision-preview` for the identify step, any Groq
text model for the recipes step since that step doesn't need vision). Happy
to write that version too if you switch.

## Local testing

```
npm i -g vercel
vercel dev
```
Then point `API_PROXY_URL` at `http://localhost:3000/api/analyze` while testing.
