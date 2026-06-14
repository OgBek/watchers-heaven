import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const path = resolvedParams.path.join('/');
    const searchParams = request.nextUrl.searchParams;
    
    const apiKey = process.env.TMDB_API_KEY || '9d12b6b90ce72ac7663cd7cb98428a6a';
    
    const targetUrl = new URL(`https://api.themoviedb.org/3/${path}`);
    targetUrl.searchParams.append('api_key', apiKey);
    searchParams.forEach((value, key) => {
      if (key !== 'api_key') {
        targetUrl.searchParams.append(key, value);
      }
    });

    const res = await fetch(targetUrl.toString(), {
      headers: {
        'Accept': 'application/json'
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });
    
    if (!res.ok) {
      return new NextResponse(res.statusText, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
