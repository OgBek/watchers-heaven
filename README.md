# 🎬 Watchers Heaven

**Watchers Heaven** is a beautifully designed, modern movie and TV show exploration application built with **Next.js 16**, **React 19**, and **Tailwind CSS 4**. It leverages the **TMDB API** through a resilient server-side proxy to fetch trending movies, top-rated shows, live TV channels, detailed cast information, and beautifully curated cinematic collections.

Designed with a premium, cinematic UI, Watchers Heaven features fluid micro-animations via Framer Motion, glassmorphism elements, SVG clip-path masking, smooth scrolling with Lenis, and full internationalization across five languages.

---

<img width="1920" height="984" alt="Screenshot 2026-06-16 001913" src="https://github.com/user-attachments/assets/2cdf4fb1-5098-4ed3-8302-dc2daee5ed13" />
<img width="1920" height="973" alt="Screenshot 2026-06-16 002110" src="https://github.com/user-attachments/assets/d1ff34c1-62c3-4a79-bffa-2e4382e71422" />

---

## ✨ Features

### Core
* **🎥 Comprehensive Database**: Browse thousands of movies, TV shows, and anime with detailed metadata.
* **🌐 Internationalization (i18n)**: Full support for English, Amharic, Oromo, Tigrinya, and Somali via `next-intl`.
* **🎨 Premium UI/UX**:
  * Glassmorphic floating navigation with smooth scroll.
  * Creative SVG clip-path masking on hero sections and detail pages.
  * Seamless responsive grid layouts for all device sizes.
  * Cinema mode with auto-dimming ambient lighting.
* **📂 Curated Collections**: Explore 76+ legendary franchises (Star Wars, MCU, Harry Potter, etc.) in a dedicated collections page with instant cached loading.
* **📺 Live TV**: Stream 200+ live channels via TouStream integration with progressive two-phase loading.
* **🎞️ Watch Player**: Embedded video player with multi-provider server switching, provider-specific resume progress, and redesigned glassmorphic navigation modals.
* **🔖 Watchlist**: Easily bookmark your favorite movies and shows to your local watchlist (localStorage-backed).
* **🔍 Search & Filter**: Robust search to quickly find any title across movies, shows, and collections.
* **📊 Stats**: Track your viewing statistics and watch history.
* **📅 Schedule**: View upcoming movie and show release schedules.
* **📚 Library**: Manage your personal media library.

### Performance & Resilience
* **⚡ Server-Side Proxy**: All TMDB API calls are proxied through a Next.js API route, keeping API keys secure and enabling server-side caching.
* **🔁 Smart Retry Logic**: Intelligent retries with exponential backoff — automatically skips non-retryable errors (404, 5xx) to avoid wasting time.
* **🛡️ Circuit Breaker**: Protects against cascading failures with a configurable threshold; HTTP errors don't trip the breaker.
* **💾 Client-Side Cache**: In-memory caching with TTL-based expiration and request deduplication to prevent redundant API calls.
* **📦 Progressive Loading**:
  * **Live TV**: Shows the first 30 channels instantly, then silently loads the remaining 200 in the background.
  * **Collections**: Fetches all collection metadata once on first visit, caches in `sessionStorage` for 24h — subsequent visits are instant.
* **🎯 Provider-Specific Resume**: Each streaming provider tracks its own watch progress independently in localStorage, so switching servers doesn't carry stale resume data.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) |
| **UI Library** | [React 19](https://react.dev/) |
| **Styling** | [Tailwind CSS 4](https://tailwindcss.com/) |
| **Animations** | [Framer Motion 11](https://www.framer.com/motion/) |
| **Smooth Scroll** | [Lenis](https://lenis.darkroom.engineering/) |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **State Management** | [Zustand](https://zustand-demo.pmnd.rs/) |
| **Data Fetching** | [TanStack Query (React Query)](https://tanstack.com/query) |
| **Validation** | [Zod](https://zod.dev/) |
| **Internationalization** | [next-intl](https://next-intl-docs.vercel.app/) |
| **API** | [TMDB (The Movie Database)](https://developer.themoviedb.org/docs) + TouStream |

---

## 🏗️ Architecture

### API Layer (`src/lib/api/`)

The API layer follows a resilience-first design:

```
Client Component → ApiGateway → dedupeRequest → withRetries → CircuitBreaker → fetchClient → /api/tmdb/[...path] → TMDB
```

* **`fetchClient`** (`client.ts`): Thin fetch wrapper with configurable timeouts, error handling, and `Retry-After` header parsing for 429 responses.
* **`withRetries`** (`retries.ts`): Retry orchestrator with exponential backoff + jitter. Skips 404 and 5xx errors immediately (no wasted retries). Respects `Retry-After` headers on 429s.
* **`CircuitBreaker`** (`circuit-breaker.ts`): State machine (CLOSED → OPEN → HALF_OPEN) with configurable failure threshold. HTTP errors propagate but don't trip the breaker — only genuine connectivity failures count.
* **`gateway`** (`gateway.ts`): High-level API methods with in-memory caching (TTL-based), request deduplication, and graceful fallbacks.

### Server Proxy (`src/app/api/tmdb/[...path]/route.ts`)

All external API calls are proxied through a Next.js API route:
- **Security**: API keys never exposed to the client.
- **Server-side caching**: Redis-style in-memory cache with per-endpoint TTLs.
- **Rate limiting**: Built-in protection against API abuse.
- **Streaming support**: TouStream channels endpoint with configurable limit parameter (10–200).

### Collections Caching Strategy

The collections page uses a **load-all-once-and-cache** pattern:
1. **First visit**: Fetches metadata for all 76+ collections in batches of 10 with 200ms delays. Shows a progress bar during loading.
2. **Cache**: Stores results in `sessionStorage` for 24 hours. Failed collections (404) are silently excluded.
3. **Subsequent visits**: Loads the entire grid instantly from cache — no API calls, no spinners.

### Live TV Progressive Loading

The live TV page uses a **two-phase progressive loading** pattern:
1. **Phase 1**: Fetches first 30 channels (fast batch) and displays them immediately.
2. **Phase 2**: Silently fetches full list of 200 channels in the background with a subtle "Loading more..." indicator.

### Watch Player Features

* **Multi-provider switching**: Multiple streaming servers available per title.
* **Provider-specific resume**: Each provider tracks its own watch progress via localStorage key `watch-progress:{id}:{season}:{episode}:{provider}`.
* **Episode navigation modal**: Redesigned glassmorphic UI with SVG circular progress ring, rewatch option, and auto-advance countdown.
* **Resume prompt modal**: Shows remaining progress percentage with Start Over / Resume choices.

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── [locale]/               # Main application routes with i18n support
│   │   ├── add/                # Add content to library
│   │   ├── anime/              # Anime section
│   │   ├── collections/        # Curated cinematic collections (cached)
│   │   ├── k-drama/            # K-Drama section
│   │   ├── library/            # Personal media library
│   │   ├── live/               # Live TV (progressive loading)
│   │   ├── movie/[id]/         # Movie detail pages
│   │   ├── movies/             # Movies browse page
│   │   ├── schedule/           # Upcoming release schedule
│   │   ├── search/             # Search functionality
│   │   ├── settings/           # App settings (theme, language)
│   │   ├── stats/              # Viewing statistics
│   │   ├── theater/            # Theater mode
│   │   ├── tv/[id]/            # TV show detail & episode pages
│   │   ├── watch/[id]/         # Video player with multi-provider
│   │   ├── watchlist/          # User bookmarks (localStorage)
│   │   ├── layout.tsx          # Root layout (fonts, providers, nav)
│   │   └── page.tsx            # Homepage (Hero, Trending rows)
│   ├── api/tmdb/[...path]/     # Server-side TMDB proxy route
│   └── globals.css             # Global Tailwind styles & custom animations
├── components/
│   ├── cards/                  # PosterCard, FeatureCard, CarouselRow
│   ├── effects/                # CinemaModeProvider, ThemeScript
│   ├── hero/                   # HeroFeature section
│   ├── layout/                 # FloatingNav, Footer, SmoothScroll
│   └── typography/             # BalancedText
├── i18n/                       # next-intl configuration
├── lib/api/                    # API gateway, circuit breaker, retries, client
└── middleware.ts               # Auth/routing middleware
```

---

## 🚀 Getting Started

### Prerequisites

* **Node.js** (v18.17 or higher)
* **npm**, **yarn**, or **pnpm**
* A [TMDB API Key](https://www.themoviedb.org/documentation/api)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/watchers-heaven.git
   cd watchers-heaven
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory:
   ```env
   TMDB_API_KEY=your_api_key_here
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌍 Localization

Watchers Heaven supports multiple languages. To update or add new translations, modify the JSON files in the `messages/` directory:

| File | Language |
|------|----------|
| `en.json` | English |
| `am.json` | Amharic |
| `om.json` | Oromo |
| `ti.json` | Tigrinya |
| `so.json` | Somali |

Translation logic is managed by `next-intl` and configured in `src/i18n/request.ts` and `src/i18n/routing.ts`.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for movie lovers everywhere.
</p>
