import { NextRequest, NextResponse } from 'next/server';

const BLUESKY_API = 'https://bsky.social/xrpc';

let cachedSession: { accessJwt: string; expiresAt: number } | null = null;

async function getSession(): Promise<string | null> {
  const handle = process.env.BLUESKY_HANDLE;
  const appPassword = process.env.BLUESKY_APP_PASSWORD;

  if (!handle || !appPassword) {
    return null;
  }

  // Return cached token if still valid (with 5 min buffer)
  if (cachedSession && cachedSession.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedSession.accessJwt;
  }

  try {
    const response = await fetch(`${BLUESKY_API}/com.atproto.server.createSession`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier: handle, password: appPassword }),
    });

    if (!response.ok) {
      console.error('Bluesky auth failed:', await response.text());
      return null;
    }

    const data = await response.json();
    // Cache for 1 hour (tokens last 2 hours)
    cachedSession = {
      accessJwt: data.accessJwt,
      expiresAt: Date.now() + 60 * 60 * 1000,
    };
    return data.accessJwt;
  } catch (error) {
    console.error('Bluesky auth error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get('q');
  const limit = searchParams.get('limit') || '25';

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter required' },
      { status: 400 }
    );
  }

  const accessToken = await getSession();
  if (!accessToken) {
    return NextResponse.json(
      { error: 'Bluesky not configured. Add BLUESKY_HANDLE and BLUESKY_APP_PASSWORD to .env.local' },
      { status: 503 }
    );
  }

  const url = new URL(`${BLUESKY_API}/app.bsky.feed.searchPosts`);
  url.searchParams.set('q', query);
  url.searchParams.set('limit', limit);

  try {
    const response = await fetch(url.toString(), {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Bluesky API error:', errorText);
      return NextResponse.json(
        { error: 'Bluesky API error', details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Bluesky fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from Bluesky API' },
      { status: 500 }
    );
  }
}
