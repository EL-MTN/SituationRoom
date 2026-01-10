import { BLUESKY_CONFIG } from '../../constants';
import type { BlueskySearchResponse, NormalizedPost } from '../../types';

interface SearchPostsParams {
  query: string;
  limit?: number;
}

export async function searchPosts(params: SearchPostsParams): Promise<NormalizedPost[]> {
  const { query, limit = 25 } = params;

  const searchParams = new URLSearchParams({
    q: query,
    limit: String(Math.min(limit, 100)),
  });

  const response = await fetch(`${BLUESKY_CONFIG.apiPath}?${searchParams}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch posts');
  }

  const data: BlueskySearchResponse = await response.json();

  return normalizePosts(data);
}

function normalizePosts(response: BlueskySearchResponse): NormalizedPost[] {
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
