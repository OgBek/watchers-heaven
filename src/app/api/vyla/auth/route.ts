import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey = process.env.VYLA_API_KEY || 'public_api_key';

  try {
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${apiKey}`
    };

    const res = await fetch('https://missourimonster-vyla-v2.hf.space/api/auth', {
      method: 'POST',
      headers,
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`Vyla authentication failed: ${res.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Vyla auth failed with status ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error fetching Vyla token:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
