<div align="center">

<img src="https://github.com/user-attachments/assets/30223fe4-1e65-4e2a-ad4d-760c4715fb66" alt="Watchers Heaven Banner" width="100%" />

# 🎬 Watchers Heaven

**A beautifully crafted, cinema-grade streaming discovery app.**  
Browse movies, TV shows, anime, and live channels — all in one place.

[![Next.js](https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

[![Deno Lint](https://github.com/OgBek/watchers-heaven/actions/workflows/deno.yml/badge.svg)](https://github.com/OgBek/watchers-heaven/actions/workflows/deno.yml)

[Live Demo](https://watchers-heaven.vercel.app) · [Report Bug](https://github.com/OgBek/watchers-heaven/issues) · [Request Feature](https://github.com/OgBek/watchers-heaven/issues)

</div>

---

## 📸 Screenshots

<div align="center">
<table>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/2cb9aa51-5de6-4081-9fb8-f6f918b119d1" alt="Home" /></td>
    <td><img src="https://github.com/user-attachments/assets/92bbfcde-d0d8-4886-b026-eb1efad2b783" alt="Movies" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/68eeee03-fc62-4b53-bb87-9dcc5a142545" alt="Detail" /></td>
    <td><img src="https://github.com/user-attachments/assets/2fb8e2ed-1d67-4564-9227-dda948109ed5" alt="Watch" /></td>
  </tr>
  <tr>
    <td><img src="https://github.com/user-attachments/assets/2e5dbe7f-a438-4beb-8cd0-7e5d4e7dc478" alt="Collections" /></td>
    <td><img src="https://github.com/user-attachments/assets/c5d19249-a244-400b-ad7f-2b024ecb331b" alt="Live TV" /></td>
  </tr>
</table>
</div>

---

## ✨ Features

<details>
<summary><b>🎥 Content & Discovery</b></summary>

- Trending movies, TV shows, and anime powered by the TMDB API
- **76+ curated franchise collections** (MCU, Star Wars, Harry Potter, etc.) with instant cached loading
- Anime browsing with Japanese-language filtering via TMDB Discover
- K-Drama section with dedicated genre filtering
- Robust search across movies, shows, and collections
- Upcoming release schedule and stats tracking

</details>

<details>
<summary><b>📺 Watch Player</b></summary>

- **10 streaming providers** with smart per-content-type ordering:
  - 🎬 Movies → VidFast ⭐, VidRock, Videasy, VidLink, Vidsrc, Vidsrc.to, VidKing, ScreenScape, TouStream, RiveStream
  - 📺 TV Shows → VidRock ⭐, VidFast, Videasy, VidLink, Vidsrc, Vidsrc.to, VidKing, ScreenScape, TouStream, RiveStream
  - 🎌 Anime → Videasy ⭐, VidRock, VidFast, VidLink, Vidsrc, Vidsrc.to, VidKing, ScreenScape, TouStream, RiveStream
- **AniList ID resolution** — anime content automatically resolves TMDB titles → AniList IDs so Videasy gets the correct anime embed
- **Provider-specific resume** — each server tracks its own progress independently in `localStorage`
- **Next episode auto-advance** with a glassmorphic countdown popup and 15-second cancel window
- **Resume watching prompt** with circular progress ring showing exact position
- Accent color theming synced to the player across all providers

</details>

<details>
<summary><b>📡 Live TV</b></summary>

- Stream 200+ live channels via TouStream integration
- Two-phase progressive loading — first 30 channels appear instantly, the rest load silently
- Channel search and filtering

</details>

<details>
<summary><b>🌐 Internationalization</b></summary>

Full i18n support via `next-intl` across 5 languages:

| Language | File |
|----------|------|
| English | `messages/en.json` |
| Amharic | `messages/am.json` |
| Oromo | `messages/om.json` |
| Tigrinya | `messages/ti.json` |
| Somali | `messages/so.json` |

</details>

<details>
<summary><b>⚡ Performance & Resilience</b></summary>

- **Server-side TMDB proxy** — API keys never exposed to the client, with in-memory LRU caching (TTL-based)
- **AniList GraphQL proxy** — `/api/anilist` caches responses for 10 min, respects 90 req/min rate limit
- **Circuit breaker** — CLOSED → OPEN → HALF_OPEN state machine; HTTP errors don't trip it, only connectivity failures
- **Smart retries** — exponential backoff + jitter; skips 404 and 5xx immediately, respects `Retry-After` on 429s
- **Request deduplication** — in-flight requests are merged so rapid navigation never fires duplicate API calls
- **Collections cache** — all 76+ collection metadata loaded once, stored in `sessionStorage` for 24h

</details>

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Next.js 16](https://nextjs.org/) (App Router, Turbopack) |
| Language | [TypeScript 5](https://www.typescriptlang.org/) |
| UI | [React 19](https://react.dev/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com/) |
| Icons | [Lucide React](https://lucide.dev/) |
| i18n | [next-intl](https://next-intl-docs.vercel.app/) |
| Movie Data | [TMDB API](https://developer.themoviedb.org/docs) |
| Anime Data | [AniList GraphQL API](https://docs.anilist.co/) |
| Live TV | [TouStream](https://toustream.xyz) |

---

## 🏗️ Architecture

### API Request Flow

```
Client Component
  → ApiGateway (gateway.ts)
    → dedupeRequest          ← prevents duplicate in-flight calls
      → withRetries           ← exponential backoff, skips 404/5xx
        → CircuitBreaker      ← opens after N failures, half-opens on recovery
          → fetchClient       ← timeout + Retry-After parsing
            → /api/tmdb/*     ← Next.js server proxy (cached, rate-limited)
              → TMDB API
```

### Anime ID Resolution Flow

```
Anime PosterCard clicked
  → /tv/{tmdbId} detail page
    → Watch page (type=anime in URL)
      → ApiGateway.fetchTmdb("/tv/{id}") → get title
        → ApiGateway.getAniListId(title)
          → POST /api/anilist (server proxy, cached 10min)
            → AniList GraphQL API
              → aniListId resolved
                → Videasy embed with correct /anime/{aniListId}/{episode}
```

### Server Proxy Routes

| Route | Purpose |
|-------|---------|
| `GET /api/tmdb/[...path]` | TMDB API proxy with caching, rate limiting, size guards |
| `POST /api/tmdb` (channels) | TouStream channels proxy (trims 12MB response to slug+name) |
| `POST /api/anilist` | AniList GraphQL proxy with 10-min response cache |

---

## 📂 Project Structure

```
src/
├── app/
│   ├── [locale]/
│   │   ├── anime/            # Anime browse (TMDB discover, ja language)
│   │   ├── collections/      # 76+ franchise collections (sessionStorage cached)
│   │   ├── k-drama/          # K-Drama section
│   │   ├── live/             # Live TV with progressive loading
│   │   ├── movie/[id]/       # Movie detail (cast, recommendations)
│   │   ├── movies/           # Movies browse + filters
│   │   ├── tv/[id]/          # TV show detail + episode browser
│   │   ├── watch/[id]/       # Multi-provider watch player
│   │   ├── watchlist/        # localStorage-backed bookmarks
│   │   ├── search/           # Global search
│   │   ├── stats/            # Viewing statistics
│   │   └── page.tsx          # Homepage (hero + carousel rows)
│   ├── api/
│   │   ├── tmdb/[...path]/   # TMDB proxy (GET + POST for channels)
│   │   └── anilist/          # AniList GraphQL proxy (POST)
│   └── globals.css
├── components/
│   ├── cards/                # PosterCard, FeatureCard, CarouselRow
│   ├── effects/              # CinemaModeProvider, ThemeScript
│   ├── hero/                 # HeroFeature
│   └── layout/               # FloatingNav, Footer
├── lib/
│   ├── api/
│   │   ├── gateway.ts        # All provider URL builders + TMDB/AniList methods
│   │   ├── client.ts         # fetch wrapper with timeout + error handling
│   │   ├── retries.ts        # withRetries (backoff, 404/5xx skip, 429 respect)
│   │   └── circuit-breaker.ts# CircuitBreaker state machine
│   ├── cache.ts              # MemoryCache (LRU + TTL)
│   ├── rate-limiter.ts       # Sliding window rate limiter
│   └── watchlist.ts          # localStorage watchlist helpers
├── i18n/                     # next-intl routing + request config
├── messages/                 # en, am, om, ti, so JSON translation files
└── middleware.ts             # Locale routing middleware
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18.17+
- **npm** / **yarn** / **pnpm**
- A free [TMDB API Key](https://www.themoviedb.org/documentation/api)

### Installation

```bash
# 1. Clone the repo
git clone https://github.com/OgBek/watchers-heaven.git
cd watchers-heaven

# 2. Install dependencies
npm install

# 3. Set environment variables
cp .env.local.example .env.local
# → Add your TMDB_API_KEY to .env.local

# 4. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `TMDB_API_KEY` | ✅ | Your TMDB v3 API key from [themoviedb.org](https://www.themoviedb.org/settings/api) |

> AniList does not require an API key — it's a public GraphQL API with a 90 req/min rate limit.

### Available Scripts

```bash
npm run dev      # Start development server (Turbopack)
npm run build    # Production build + TypeScript check
npm run start    # Serve production build
npm run lint     # ESLint
```

---

## 📖 API Documentation

Full streaming provider reference: [`docs/streaming-providers.md`](docs/streaming-providers.md)

Covers URL structures, parameters, event formats, and gateway methods for all 10 providers:

| Provider | Best For | Gateway Method |
|----------|----------|---------------|
| VidFast ⭐ | Movies | `getVidFastUrl()` |
| VidRock ⭐ | TV Shows | `getVidRockUrl()` |
| Videasy ⭐ | Anime | `getVideasyUrl()` |
| VidLink | General | `getVidLinkUrl()` |
| Vidsrc | General | `getVidsrcEmbedUrl()` |
| Vidsrc.to | General | `getVidsrcToUrl()` |
| VidKing | General | `getVidKingUrl()` |
| ScreenScape | English | `getScreenScapeUrl()` |
| TouStream | Live TV | `getTouStreamMovieUrl()` |
| RiveStream | Torrent | `getMovieEmbedUrl()` |

---

## 🤝 Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and open a pull request against `main`.

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feat/my-feature`
5. Open a pull request against [OgBek/watchers-heaven](https://github.com/OgBek/watchers-heaven)

---

## 📄 License

Distributed under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ for movie lovers everywhere.</sub>
</div>
