# 🎬 Watchers Heaven

![Watchers Heaven Banner](https://image.tmdb.org/t/p/original/1pdfLvkbY9ohJlCjQH2JGqqUT1e.jpg)

**Watchers Heaven** is a beautifully designed, modern movie and TV show exploration application built with **Next.js 15 (App Router)**, **React**, and **Tailwind CSS**. It leverages the powerful **TMDB API** to fetch the latest trending movies, top-rated shows, detailed cast information, and beautifully curated cinematic collections.

Designed with a premium, sleek UI, Watchers Heaven features fluid micro-animations, glassmorphism elements, dynamic image masking, and full internationalization support.

---

## ✨ Features

* **🎥 Comprehensive Database**: Browse thousands of movies, TV shows, and anime.
* **🌐 Internationalization (i18n)**: Full support for English, Amharic, Oromo, Tigrinya, and Somali via `next-intl`.
* **🎨 Premium UI/UX**: 
  * Beautiful glassmorphic floating navigation.
  * Creative SVG clip-path masking on hero sections and detail pages.
  * Seamless responsive grid layouts for all device sizes.
* **📂 Curated Collections**: Explore legendary franchises (e.g., Star Wars, MCU, Harry Potter) in a dedicated collections page.
* **🔖 Watchlist**: Easily bookmark your favorite movies and shows to your local watchlist.
* **🔍 Search & Filter**: Robust search capabilities to quickly find any title.
* **📺 Watch Integration**: Directly watch trailers and episodes.

---

## 🛠️ Tech Stack

* **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components)
* **Language**: [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **Icons**: [Lucide React](https://lucide.dev/)
* **Internationalization**: [next-intl](https://next-intl-docs.vercel.app/)
* **API**: [TMDB (The Movie Database)](https://developer.themoviedb.org/docs)

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
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your TMDB API key:
   ```env
   TMDB_API_KEY=your_api_key_here
   ```
   *(Note: The app has a fallback key for testing purposes, but it is highly recommended to use your own.)*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── [locale]/           # Main application routes with i18n support
│   │   ├── anime/          # Anime section
│   │   ├── collections/    # Curated cinematic collections
│   │   ├── k-drama/        # K-Drama section
│   │   ├── live/           # Live TV section
│   │   ├── movie/          # Movie detail pages
│   │   ├── search/         # Search functionality
│   │   ├── settings/       # App settings (theme, language)
│   │   ├── tv/             # TV show detail pages
│   │   ├── watchlist/      # User bookmarks
│   │   ├── watch/          # Video player integration
│   │   ├── layout.tsx      # Root layout (fonts, providers, nav)
│   │   └── page.tsx        # Homepage (Hero, Trending rows)
│   └── globals.css         # Global Tailwind styles & custom animations
├── components/
│   ├── cards/              # Reusable UI cards (PosterCard, CarouselRow)
│   ├── hero/               # Hero section components (HeroFeature)
│   └── layout/             # Shared layout components (FloatingNav, Footer)
├── i18n/                   # next-intl configuration files
├── lib/
│   └── api/                # TMDB API gateway and fetching logic
└── messages/               # Localization JSON files (en, am, om, ti, so)
```

---

## 🌍 Localization

Watchers Heaven supports multiple languages. To update or add new translations, simply modify the JSON files in the `messages/` directory:
* `en.json` (English)
* `am.json` (Amharic)
* `om.json` (Oromo)
* `ti.json` (Tigrinya)
* `so.json` (Somali)

The translation logic is managed by `next-intl` and configured in `src/i18n/request.ts` and `src/i18n/routing.ts`.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<p align="center">
  Built with ❤️ for movie lovers everywhere.
</p>
