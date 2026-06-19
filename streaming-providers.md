# Streaming Providers API Reference

> All embed URLs are generated through `ApiGateway` in `src/lib/api/gateway.ts`.  
> Providers are ordered by best fit per content type. ⭐ = recommended for that type.

---

## Provider Ranking by Content Type

| Rank | 🎬 Movies | 📺 TV Shows | 🎌 Anime |
|------|-----------|-------------|---------|
| 1 ⭐ | Vyla | Vyla | Videasy |
| 2 ⭐ | VidFast | VidRock | VidRock |
| 3 | VidRock | VidFast | VidFast |
| 4 | Videasy | Videasy | VidLink |
| 5 | VidLink | VidLink | Vidsrc |
| 6 | Vidsrc | Vidsrc | Vidsrc.to |
| 7 | Vidsrc.to | Vidsrc.to | VidKing |
| 8 | VidKing | VidKing | ScreenScape |
| 9 | ScreenScape | ScreenScape | TouStream |
| 10 | TouStream | TouStream | RiveStream |
| 11 | RiveStream | RiveStream | — |
| 12 | VidSync (last) | VidSync (last) | — |

### Full Comparison: Vyla vs iframe providers

| Feature | Vyla | VidSync | VidFast | VidRock | Videasy |
|---------|:----:|:-------:|:-------:|:-------:|:-------:|
| **Stream type** | Real HLS/MP4 | iframe | iframe | iframe | iframe |
| **Multi-provider fanout** | ✅ parallel SSE | ❌ | ❌ | ❌ | ❌ |
| **Live stream verification** | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Built-in HLS proxy** | ✅ CORS-safe | ❌ | ❌ | ❌ | ❌ |
| **Subtitles (VTT/SRT)** | ✅ multi-lang | ❌ | ✅ `sub=` | ✅ `lang=` | ❌ |
| **Resume via param** | ✅ SSE startAt | ✅ `startTime` | ✅ `startAt` | ❌ | ✅ `progress` |
| **Server picker** | ✅ SSE sources | ✅ `defaultServer` | ❌ | ❌ | ❌ |
| **Rich event payload** | ✅ native events | ✅ title+poster | ✅ | ✅ | partial |
| **Download endpoint** | ✅ `/downloads` | ❌ | ❌ | ✅ | ❌ |
| **Health monitoring** | ✅ `/health` | ❌ | ❌ | ❌ | ❌ |
| **No auth required** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Anime support** | ❌ | ❌ | ❌ | ❌ | ✅ AniList |
| **IMDB IDs** | ❌ TMDB only | ❌ TMDB only | ✅ | ✅ | ✅ TMDB |

**Why Vyla leads:** It's the only provider that gives you **actual stream URLs** (not iframes) with live verification — dead sources are silently dropped before they reach your player. It fans out to 14+ backend providers simultaneously and streams results via SSE so your player starts on the first working source without waiting. It also includes subtitles, download links, and a health endpoint.

**Why Videasy stays ⭐ for anime:** Vyla doesn't support anime (no AniList integration). Videasy remains the only provider with native AniList ID support and sub/dub auto-selection.

---

## Vyla ⭐ Movies & TV Shows

**Base URL:** `https://missourimonster-vyla.hf.space`  
**Type:** Real HLS/MP4 streams via SSE — NOT an iframe  
**Auth:** None required · CORS: `*`

Unlike every other provider, Vyla returns **actual verified stream URLs** you play in a native `<video>` element. It fans out to 14+ backend providers in parallel, drops dead sources, and streams results back one at a time via Server-Sent Events.

### Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/movie?id=:tmdbId` | GET (SSE) | Stream sources + meta for a movie |
| `/tv?id=:tmdbId&season=:s&episode=:e` | GET (SSE) | Stream sources + meta for a TV episode |
| `/subtitles?id=:tmdbId&type=movie` | GET | Subtitle tracks only |
| `/downloads/movie/:tmdbId` | GET | Download links for a movie |
| `/downloads/tv/:tmdbId/:season/:episode` | GET | Download links for a TV episode |
| `/health` | GET | Per-provider health check with latency |

### SSE Event Flow

```
EventSource open
  → meta    (immediate) — TMDB info + subtitles
  → source  (one per working provider)
  → source
  → source  ← player auto-starts on first source
  → ...
  → done    — total working source count
```

### SSE Event Shapes

```ts
// meta — fires immediately before any provider resolves
{ type: "meta",
  meta: { id, title, release_date, runtime, vote_average },
  subtitles: [{ label, file, type: "vtt"|"srt", source }] }

// source — one per working provider
{ type: "source",
  source: { source: "provider-key", label: "Provider Name",
            url: "https://missourimonster-vyla.hf.space/api?url=...&pp=1" } }

// done — stream complete
{ type: "done", total: 14 }
```

### Source URL

The `url` in each `source` event is a fully-proxied CORS-safe stream URL:
- **HLS** (`.m3u8`): pass directly to `hls.loadSource()` — segment and key URIs are pre-rewritten
- **MP4**: set as `video.src` directly

### Gateway component

```ts
// In VylaPlayer.tsx — opens SSE, collects sources, loads first into hls.js
<VylaPlayer
  id={tmdbId}
  type="movie" | "tv"
  season={1}
  episode={1}
  accentColor="007bff"
  startAt={resumeSeconds}
  onProgress={(currentTime, duration) => saveProgress(currentTime, duration)}
/>
```

### Download endpoint

```
GET https://missourimonster-vyla.hf.space/downloads/movie/550
→ {
    "downloads": [
      { "url": "https://...", "quality": "720p", "size": "996 MB", "type": "mkv", "active": true },
      { "url": "https://...", "quality": "1080p", "size": "3.73 GB", "type": "mkv", "active": true }
    ]
  }

GET https://missourimonster-vyla.hf.space/downloads/tv/1396/1/1
→ { "downloads": [...] }
```

Fields: `url` (direct link), `quality` (`720p`, `1080p`, `2160p`), `size` (human-readable), `type` (`mkv`, `mp4`), `active` (boolean — filter to `true` only).

### Caching

- 5-minute in-memory TTL per source
- Cache key: `source_key + tmdb_id + season + episode`
- Cache resets on server restart (hosted on Hugging Face Spaces)

### Examples

```
https://missourimonster-vyla.hf.space/movie?id=550
https://missourimonster-vyla.hf.space/tv?id=1399&season=1&episode=1
https://missourimonster-vyla.hf.space/downloads?id=550&type=movie
https://missourimonster-vyla.hf.space/health
```

---

## VidSync ⭐ Movies

**Base URL:** `https://vidsync.live/embed`  
**Accepts:** TMDB ID only  
**Events:** `VIDSYNC_PLAYER_EVENT` + `VIDSYNC_MEDIA_DATA` (richest payload of all providers)

```
https://vidsync.live/embed/movie/{tmdbId}
https://vidsync.live/embed/tv/{tmdbId}/{season}/{episode}
```

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `autoPlay` | boolean | Auto-start playback |
| `startTime` | number | Resume position in seconds |
| `defaultServer` | string | Preferred server name (e.g. `cinevault`) |
| `theme` | string | Hex color without `#` |
| `nextButton` | boolean | TV only — show next episode button at 90% |
| `autoNext` | boolean | TV only — auto-play next (requires `nextButton`) |

**Gateway method**

```ts
ApiGateway.getVidSyncUrl(id, type, season?, episode?, options?)
```

**Events**

VidSync uses prefixed event types and includes the full normalized progress entry:

```ts
window.addEventListener('message', (event) => {
  const msg = event.data;
  if (!msg || typeof msg !== 'object') return;

  if (msg.type === 'VIDSYNC_PLAYER_EVENT') {
    const { event: name, currentTime, duration, title, poster, progress } = msg.data;
    // progress.watched, progress.duration, progress.lastUpdated
  }

  if (msg.type === 'VIDSYNC_MEDIA_DATA') {
    // msg.data.entry — full normalized object, ready to persist
    // stored locally under localStorage['vidSyncProgress']
  }
});
```

**On-demand status request** (unique to VidSync):

```ts
iframeRef.contentWindow?.postMessage(
  { type: 'VIDSYNC_PLAYER_COMMAND', action: 'getMediaData' },
  '*'
);
```

**VIDSYNC_PLAYER_EVENT payload shape:**

```json
{
  "type": "VIDSYNC_PLAYER_EVENT",
  "data": {
    "event": "timeupdate",
    "currentTime": 352.42,
    "duration": 2667.23,
    "tmdbId": 533535,
    "mediaType": "movie",
    "title": "Deadpool & Wolverine",
    "poster": "https://image.tmdb.org/...jpg",
    "playing": true,
    "muted": false,
    "volume": 1,
    "progress": {
      "watched": 352.42,
      "duration": 2667.23,
      "lastUpdated": 1746975000000
    }
  }
}
```

**Examples**

```
https://vidsync.live/embed/movie/299534?autoPlay=true&theme=007bff
https://vidsync.live/embed/movie/278?startTime=120&defaultServer=cinevault
https://vidsync.live/embed/tv/66732/1/5?nextButton=true&autoNext=true
```

---

## VidFast ⭐ Movies

**Base URL:** `https://vidfast.pro`  
**Accepts:** TMDB ID or IMDB ID  
**Events:** `PLAYER_EVENT` + `MEDIA_DATA`

```
https://vidfast.pro/movie/{id}
https://vidfast.pro/tv/{id}/{season}/{episode}
```

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `autoPlay` | boolean | Auto-start playback |
| `title` | boolean | Show media title overlay |
| `poster` | boolean | Show poster image |
| `startAt` | number | Resume position in seconds |
| `theme` | string | Hex color without `#` |
| `server` | string | Default server name |
| `hideServer` | boolean | Hide server selector |
| `fullscreenButton` | boolean | Show/hide fullscreen button |
| `chromecast` | boolean | Show/hide Chromecast button |
| `sub` | string | Default subtitle language (`en`, `es`, `fr`) |
| `nextButton` | boolean | TV only — show next episode button at 90% |
| `autoNext` | boolean | TV only — auto-play next (requires `nextButton`) |

**Gateway method**

```ts
ApiGateway.getVidFastUrl(id, type, season?, episode?, options?)
```

**Events**

```ts
const vidfastOrigins = [
  'https://vidfast.pro', 'https://vidfast.in', 'https://vidfast.io',
  'https://vidfast.me', 'https://vidfast.net', 'https://vidfast.pm', 'https://vidfast.xyz'
];

// PLAYER_EVENT
{ type: "PLAYER_EVENT", data: {
    event: "play" | "pause" | "seeked" | "ended" | "timeupdate" | "playerstatus",
    currentTime: number, duration: number,
    tmdbId: number, mediaType: "movie" | "tv",
    season?: number, episode?: number,
    playing: boolean, muted: boolean, volume: number
}}

// MEDIA_DATA — stored to localStorage["vidFastProgress"]
// Structure: { "m{id}": { ...movie }, "t{id}": { ...show } }
```

**Examples**

```
https://vidfast.pro/movie/533535?theme=007bff&autoPlay=true
https://vidfast.pro/tv/63174/1/5?autoPlay=true&sub=en
```

---

## VidRock ⭐ TV Shows

**Base URL:** `https://vidrock.ru`  
**Accepts:** TMDB ID or IMDB ID  
**Events:** `PLAYER_EVENT` + `MEDIA_DATA`

```
https://vidrock.ru/movie/{id}
https://vidrock.ru/tv/{id}/{season}/{episode}
```

**Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `autoplay` | boolean | `false` | Auto-start playback |
| `autonext` | boolean | `false` | Auto-play next TV episode |
| `theme` | string | `ffffff` | Hex color without `#` |
| `download` | boolean | `true` | Show/hide download button |
| `nextbutton` | boolean | `true` | Show/hide next episode notification |
| `episodeselector` | boolean | `true` | Show/hide episode selector |
| `lang` | string | browser | Subtitle language ISO code (`en`, `es`, `fr`) |

**Gateway method**

```ts
ApiGateway.getVidRockUrl(id, type, season?, episode?, options?)
```

**Events**

```ts
// Origin: https://vidrock.ru

// PLAYER_EVENT
{ type: "PLAYER_EVENT", data: {
    event: "play" | "pause" | "seeked" | "ended" | "timeupdate",
    currentTime: number, duration: number,
    tmdbId: number, mediaType: "movie" | "tv",
    season?: number, episode?: number
}}

// MEDIA_DATA — stored to localStorage["vidRockProgress"] as an array
[{
  "id": 52814, "type": "tv", "title": "Halo",
  "progress": { "watched": 0, "duration": 0 },
  "last_season_watched": "1", "last_episode_watched": "1",
  "show_progress": {
    "s1e1": { "season": "1", "episode": "1",
      "progress": { "watched": 3.79, "duration": 3536.79 },
      "last_updated": 1735651642940 }
  }
}]
```

**List all available content**

```
GET https://vidrock.ru/list/movie.json
GET https://vidrock.ru/list/tv.json
```

**Examples**

```
https://vidrock.ru/movie/tt4154796
https://vidrock.ru/tv/tt0903747/1/1?autoplay=true&theme=007bff&episodeselector=true
```

---

## Videasy ⭐ Anime

**Base URL:** `https://player.videasy.net`  
**Accepts:** TMDB ID (movie/tv) or AniList ID (anime)  
**Events:** JSON-stringified `postMessage`

```
https://player.videasy.net/movie/{tmdbId}
https://player.videasy.net/tv/{tmdbId}/{season}/{episode}
https://player.videasy.net/anime/{anilistId}/{episode}   ← anime show
https://player.videasy.net/anime/{anilistId}             ← anime movie
```

> Anime requires an **AniList ID**, not a TMDB ID. The watch page automatically resolves TMDB anime titles → AniList IDs via the `/api/anilist` proxy before building the Videasy URL.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `color` | string | Hex color without `#` |
| `progress` | number | Resume start position in seconds |
| `nextEpisode` | boolean | Show next episode button |
| `episodeSelector` | boolean | Built-in season/episode selector |
| `autoplayNextEpisode` | boolean | Auto-play next episode when current ends |
| `overlay` | boolean | Netflix-style overlay on pause (5s delay) |

**Gateway method**

```ts
ApiGateway.getVideasyUrl(id, type, season?, episode?, options?)
// type: 'movie' | 'tv' | 'anime'
```

**Events**

```ts
window.addEventListener("message", (event) => {
  const data = JSON.parse(event.data as string);
  // {
  //   id: string,
  //   type: 'movie' | 'tv' | 'anime',
  //   progress: number,     — 0–100
  //   timestamp: number,    — seconds
  //   duration: number,     — seconds
  //   season?: number,
  //   episode?: number,
  // }
});
```

**Finding content IDs**

- Movies / TV: [themoviedb.org](https://www.themoviedb.org) — `themoviedb.org/movie/{id}` or `themoviedb.org/tv/{id}`
- Anime: [anilist.co](https://anilist.co) — `anilist.co/anime/{id}`

**Examples**

```
https://player.videasy.net/movie/299534
https://player.videasy.net/tv/1399/1/1?nextEpisode=true&episodeSelector=true
https://player.videasy.net/anime/21/1
https://player.videasy.net/anime/145139
https://player.videasy.net/tv/1399/1/1?autoplayNextEpisode=true&overlay=true&color=8B5CF6
```

---

## AniList GraphQL API (via `/api/anilist` proxy)

**Endpoint:** `POST /api/anilist`  
**Upstream:** `https://graphql.anilist.co`  
**Rate limit:** 90 requests/min (AniList) — server proxy caches responses for 10 min  

The AniList proxy is used internally to resolve anime titles to AniList IDs for Videasy embeds. All queries go through the server to keep rate limits under control and cache results.

**Usage**

```ts
// Resolve a single anime ID by title
const anilistId = await ApiGateway.getAniListId('Attack on Titan');
// → 16498 (or null if not found)

// Search AniList for a list of anime
const results = await ApiGateway.searchAniList('demon slayer', 1, 20);
// → [{ id, title: { romaji, english }, coverImage: { large }, episodes, averageScore }]
```

**Direct proxy usage**

```ts
const res = await fetch('/api/anilist', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: `
      query ($search: String) {
        Media(search: $search, type: ANIME) {
          id
          title { romaji english }
          episodes
          averageScore
        }
      }
    `,
    variables: { search: 'One Piece' }
  })
});
const { data } = await res.json();
// data.Media.id → 21
```

**Caching**

| Layer | TTL | Storage |
|-------|-----|---------|
| Server proxy | 10 min | In-memory `MemoryCache` (200 entries) |
| Client `getAniListId` | 1 hour | `clientCache` + `sessionStorage` |
| Client `searchAniList` | 10 min | `clientCache` + `sessionStorage` |

---

## VidLink

**Base URL:** `https://vidlink.pro`  
**Events:** `PLAYER_EVENT` + `MEDIA_DATA` (same structure as VidFast)

```
https://vidlink.pro/movie/{id}
https://vidlink.pro/tv/{id}/{season}/{episode}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `primaryColor` | string | Hex color without `#` |
| `secondaryColor` | string | Hex color |
| `iconColor` | string | Hex color |
| `autoplay` | boolean | Auto-start |
| `nextButton` | boolean | Show next episode button |
| `title` | boolean | Show title overlay |

```ts
ApiGateway.getVidLinkUrl(id, type, season?, episode?, options?)
```

---

## Vidsrc

**Base URL:** `https://vidsrc-embed.ru/embed`

```
https://vidsrc-embed.ru/embed/movie/{id}
https://vidsrc-embed.ru/embed/tv/{id}/{season}-{episode}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `sub_url` | string | External subtitle file URL |
| `ds_lang` | string | Display language |
| `autoplay` | `0` \| `1` | Auto-start |

```ts
ApiGateway.getVidsrcEmbedUrl(id, type, season?, episode?, options?)
```

---

## Vidsrc.to

**Base URL:** `https://vidsrc.to/embed`

```
https://vidsrc.to/embed/movie/{id}
https://vidsrc.to/embed/tv/{id}/{season}/{episode}
```

No extra parameters.

```ts
ApiGateway.getVidsrcToUrl(id, type, season?, episode?)
```

---

## VidKing

**Base URL:** `https://www.vidking.net/embed`

```
https://www.vidking.net/embed/movie/{id}
https://www.vidking.net/embed/tv/{id}/{season}/{episode}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `color` | string | Hex color |
| `autoPlay` | boolean | Auto-start |
| `nextEpisode` | boolean | Show next episode button |
| `episodeSelector` | boolean | Show episode selector |
| `progress` | number | Resume timestamp in seconds |

```ts
ApiGateway.getVidKingUrl(id, type, season?, episode?, options?)
```

---

## ScreenScape

**Base URL:** `https://screenscape.me/embed`

```
https://screenscape.me/embed?tmdb={id}&type=movie
https://screenscape.me/embed?tmdb={id}&type=tv&s={season}&e={episode}
```

| Parameter | Type | Description |
|-----------|------|-------------|
| `lan` | string | Language code (`eng`, `spa`, …) |

```ts
ApiGateway.getScreenScapeUrl(id, type, season?, episode?, language?, isImdb?)
```

---

## TouStream

**Base URL:** `https://toustream.xyz/tou`

```
https://toustream.xyz/tou/movies/{tmdbId}
https://toustream.xyz/tou/live/{channelSlug}
```

```ts
ApiGateway.getTouStreamMovieUrl(tmdbId)
ApiGateway.getTouStreamLiveUrl(channelSlug)
ApiGateway.getTouStreamChannels(limit?)   // fetches channels via server proxy, limit 10–200
```

---

## RiveStream

**Base URL:** `https://rivestream.ru`

```
https://rivestream.ru/embed?type=movie&id={tmdbId}
https://rivestream.ru/embed?type=tv&id={tmdbId}&season={s}&episode={e}
https://rivestream.ru/embed/torrent?type=movie&id={tmdbId}
https://rivestream.ru/embed/agg?type=movie&id={tmdbId}
```

```ts
ApiGateway.getMovieEmbedUrl(tmdbId, type?)
ApiGateway.getTvEmbedUrl(tmdbId, season, episode, type?)
ApiGateway.getMovieDownloadUrl(tmdbId)
ApiGateway.getTvDownloadUrl(tmdbId, season, episode)
```

> RiveStream iframes are sandboxed with `allow-scripts allow-same-origin allow-forms allow-popups`.
