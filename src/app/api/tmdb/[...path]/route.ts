import { NextRequest, NextResponse } from 'next/server';
import { tmdbCache, channelsCache, MemoryCache } from '@/lib/cache';
import { apiRateLimiter } from '@/lib/rate-limiter';

const TMDB_API_KEY: string = process.env.TMDB_API_KEY ?? (() => {
  throw new Error('TMDB_API_KEY environment variable is required');
})();
const MAX_RESPONSE_SIZE = 4 * 1024 * 1024; // 4 MB — reject oversized payloads

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

// ---------- TMDB proxy ----------

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  // ── Rate limit ──
  const ip = getClientIp(request);
  if (!apiRateLimiter.hit(ip)) {
    const retryAfter = apiRateLimiter.retryAfter(ip);
    return NextResponse.json(
      { error: 'Too many requests. Please slow down.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': '120',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const searchParams = request.nextUrl.searchParams;

    // ── Cache lookup ──
    const cacheKey = MemoryCache.buildKey(path, searchParams);
    const cached = tmdbCache.get(cacheKey);
    if (cached) {
      return new NextResponse(cached, {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        },
      });
    }

    // ── Build upstream URL ──
    const targetUrl = new URL(`https://api.themoviedb.org/3/${path}`);
    targetUrl.searchParams.append('api_key', TMDB_API_KEY);
    searchParams.forEach((value, key) => {
      if (key !== 'api_key') {
        targetUrl.searchParams.append(key, value);
      }
    });

    // ── Fetch with timeout + size guard ──
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000); // 10 s

    const res = await fetch(targetUrl.toString(), {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const headers: Record<string, string> = {};
      // Forward Retry-After header for 429 responses so client can back off
      const retryAfter = res.headers.get('retry-after');
      if (retryAfter) headers['Retry-After'] = retryAfter;
      return new NextResponse(res.statusText, { status: res.status, headers });
    }

    // Check Content-Length before reading the body
    const contentLength = Number(res.headers.get('content-length') || 0);
    if (contentLength > MAX_RESPONSE_SIZE) {
      return NextResponse.json(
        { error: 'Response too large' },
        { status: 413 }
      );
    }

    const text = await res.text();

    // Double-check actual size
    if (text.length > MAX_RESPONSE_SIZE) {
      return NextResponse.json(
        { error: 'Response too large' },
        { status: 413 }
      );
    }

    // ── Store in cache ──
    tmdbCache.set(cacheKey, text);

    return new NextResponse(text, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
      },
    });
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Upstream request timed out' },
        { status: 504 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// ---------- TouStream channels proxy (avoids 12 MB client-side parse crash) ----------

export async function POST(request: NextRequest) {
  // Re-use rate limiter
  const ip = getClientIp(request);
  if (!apiRateLimiter.hit(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  if (!body || body.action !== 'get-channels') {
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  const limit = Math.min(Math.max(Number(body.limit) || 200, 10), 200);
  const cacheKey = `toustream-channels:${limit}`;

  try {
    // Check cache first
    const cached = channelsCache.get(cacheKey);
    if (cached) {
      return new NextResponse(cached, {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'HIT' },
      });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 90_000); // 90s — large upstream payload

    const res = await fetch('https://toustream.xyz/tou/api/channels', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) throw new Error('Upstream returned ' + res.status);

    const text = await res.text();

    // Parse and trim to just the fields we need (slug + name only)
    try {
      const json = JSON.parse(text);
      const channels = Array.isArray(json)
        ? json.slice(0, limit).map((ch: any) => ({
            slug: ch.slug ?? '',
            name: ch.name ?? '',
          }))
        : [];

      if (channels.length === 0) {
        throw new Error('No channels found in response');
      }

      const safeText = JSON.stringify(channels);
      channelsCache.set(cacheKey, safeText);

      return new NextResponse(safeText, {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'X-Cache': 'MISS' },
      });
    } catch (parseErr: any) {
      return NextResponse.json(
        { error: `Failed to parse channels: ${parseErr.message}` },
        { status: 502 }
      );
    }
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Channel fetch timed out' },
        { status: 504 }
      );
    }
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
