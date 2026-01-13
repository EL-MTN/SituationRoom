import type { BlueskySearchResponse, NormalizedPost } from '../types';

const BLUESKY_API = 'https://bsky.social/xrpc';
const CREDENTIALS_KEY = 'bluesky-credentials';

export interface BlueskyCredentials {
  handle: string;
  appPassword: string;
}

interface SessionCache {
  accessJwt: string;
  handle: string;
  expiresAt: number;
}

let cachedSession: SessionCache | null = null;

// Credential storage
export function saveCredentials(creds: BlueskyCredentials): void {
  localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(creds));
  cachedSession = null; // Clear session when credentials change
}

export function getCredentials(): BlueskyCredentials | null {
  const stored = localStorage.getItem(CREDENTIALS_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function clearCredentials(): void {
  localStorage.removeItem(CREDENTIALS_KEY);
  cachedSession = null;
}

// Session management
async function createSession(credentials: BlueskyCredentials): Promise<SessionCache> {
  const response = await fetch(`${BLUESKY_API}/com.atproto.server.createSession`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: credentials.handle,
      password: credentials.appPassword,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Authentication failed');
  }

  const data = await response.json();
  return {
    accessJwt: data.accessJwt,
    handle: data.handle,
    expiresAt: Date.now() + 60 * 60 * 1000, // Cache for 1 hour
  };
}

async function getSession(): Promise<SessionCache> {
  const credentials = getCredentials();
  if (!credentials) {
    throw new Error('Not authenticated. Please add your Bluesky credentials in settings.');
  }

  // Return cached session if still valid (with 5 min buffer)
  if (cachedSession && cachedSession.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cachedSession;
  }

  cachedSession = await createSession(credentials);
  return cachedSession;
}

export function getAuthStatus(): { authenticated: boolean; handle?: string } {
  if (cachedSession && cachedSession.expiresAt > Date.now()) {
    return { authenticated: true, handle: cachedSession.handle };
  }
  const credentials = getCredentials();
  return { authenticated: !!credentials, handle: credentials?.handle };
}

// API calls
interface SearchPostsParams {
  query: string;
  limit?: number;
}

export async function searchPosts(params: SearchPostsParams): Promise<NormalizedPost[]> {
  const { query, limit = 25 } = params;

  const session = await getSession();

  const searchParams = new URLSearchParams({
    q: query,
    limit: String(Math.min(limit, 100)),
  });

  const response = await fetch(`${BLUESKY_API}/app.bsky.feed.searchPosts?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${session.accessJwt}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    if (response.status === 401) {
      cachedSession = null; // Clear invalid session
      throw new Error('Session expired. Please try again.');
    }
    throw new Error(error.message || 'Failed to fetch posts');
  }

  const data: BlueskySearchResponse = await response.json();
  return normalizePosts(data);
}

function normalizePosts(response: BlueskySearchResponse): NormalizedPost[] {
  if (!response.posts) return [];

  return response.posts.map((post) => {
    const images = post.embed?.images?.map((img) => ({
      thumb: img.thumb,
      fullsize: img.fullsize,
      alt: img.alt,
    }));

    return {
      id: post.cid,
      uri: post.uri,
      text: post.record.text,
      createdAt: new Date(post.record.createdAt),
      author: post.author,
      metrics: {
        replyCount: post.replyCount,
        repostCount: post.repostCount,
        likeCount: post.likeCount,
        quoteCount: post.quoteCount,
      },
      images,
    };
  });
}
