# Tech Stack Context — Paperclip

> **Diese Datei wird beim ersten Setup durch `/init` befüllt.**
> Personas referenzieren diesen Kontext um Stack-spezifische Empfehlungen zu geben.

---

## Frontend

| Aspekt | Technologie |
|---|---|
| Framework | [z.B. React 18, Vue 3, Next.js 14, Svelte] |
| Sprache | [z.B. TypeScript 5.x] |
| Styling | [z.B. TailwindCSS, Vanilla CSS, Styled Components] |
| State | [z.B. TanStack Query, Zustand, Redux, Context] |
| Routing | [z.B. React Router, Next.js App Router] |
| Animation | [z.B. Framer Motion, GSAP] |
| Build | [z.B. Vite, Webpack, Turbopack] |

---

## Backend

| Aspekt | Technologie |
|---|---|
| Runtime | [z.B. Node.js, Deno, Python, Go] |
| API | [z.B. Supabase Edge Functions, Express, FastAPI] |
| Database | [z.B. PostgreSQL (Supabase), MongoDB, Firebase] |
| Auth | [z.B. Supabase Auth, Auth0, Clerk] |
| Storage | [z.B. Supabase Storage, S3, Cloudflare R2] |

---

## AI/ML (falls zutreffend)

| Aspekt | Technologie |
|---|---|
| Provider | [z.B. Google Vertex AI, OpenAI, Anthropic] |
| Modelle | [z.B. Gemini Pro, GPT-4, Claude 3.5] |
| Embeddings | [z.B. text-embedding-004, text-embedding-3-small] |
| Vector DB | [z.B. Supabase pgvector, Pinecone, Chroma] |
| PII-Scrubbing | [z.B. Ja/Nein — Pflicht vor Provider-Calls?] |

---

## Mobile (falls zutreffend)

| Aspekt | Technologie |
|---|---|
| Framework | [z.B. Capacitor, React Native, Flutter, Swift] |
| Plattform | [z.B. iOS, Android, Both] |
| Native Plugins | [z.B. HealthKit, Camera, Push Notifications] |

---

## Deployment

| Aspekt | Technologie |
|---|---|
| Hosting | [z.B. Vercel, Netlify, Cloudflare Pages] |
| CI/CD | [z.B. GitHub Actions, Vercel Auto-Deploy] |
| Domain | [z.B. example.com] |
| Monitoring | [z.B. Sentry, LogRocket, Supabase Dashboard] |

---

## Datenfluss

```
[Beschreibe hier wie Daten durch das System fließen]

Beispiel:
User → React UI → TanStack Query → Supabase Edge Function → PostgreSQL
                                  → AI Provider (Vertex) → Response → UI
```
