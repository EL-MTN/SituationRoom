'use client';

import { ExternalLink, Heart, MessageCircle, Repeat2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import type { NormalizedPost } from '../types';

interface PostCardProps {
  post: NormalizedPost;
  showMedia: boolean;
}

function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
}

function getPostUrl(post: NormalizedPost): string {
  // AT URI format: at://did:plc:xxx/app.bsky.feed.post/yyy
  // Convert to web URL: https://bsky.app/profile/handle/post/yyy
  const parts = post.uri.split('/');
  const postId = parts[parts.length - 1];
  return `https://bsky.app/profile/${post.author.handle}/post/${postId}`;
}

export function PostCard({ post, showMedia }: PostCardProps) {
  const postUrl = getPostUrl(post);

  return (
    <div className="h-full flex flex-col px-2 py-2 border-b border-[var(--color-border)] hover:bg-[var(--color-accent)] transition-colors">
      <div className="flex items-center gap-2 mb-1">
        {post.author.avatar && (
          <img
            src={post.author.avatar}
            alt={post.author.displayName || post.author.handle}
            className="w-6 h-6 flex-shrink-0"
          />
        )}
        <div className="flex items-center gap-1 min-w-0">
          <span className="font-medium text-xs truncate">
            {post.author.displayName || post.author.handle}
          </span>
          <span className="text-[var(--color-muted)] text-xs">
            @{post.author.handle}
          </span>
        </div>
        <span className="text-[10px] text-[var(--color-muted)] ml-auto flex-shrink-0">
          {formatDistanceToNow(post.createdAt, { addSuffix: true })}
        </span>
      </div>

      <p className="text-xs leading-relaxed line-clamp-3 mb-2">{post.text}</p>

      {showMedia && post.images && post.images.length > 0 && (
        <div className="flex gap-1 mb-2 overflow-hidden">
          {post.images.slice(0, 2).map((img, i) => (
            <img
              key={i}
              src={img.thumb}
              alt={img.alt || ''}
              className="h-16 w-auto object-cover flex-shrink-0"
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-4 text-[10px] text-[var(--color-muted)] mt-auto">
        <span className="flex items-center gap-1">
          <MessageCircle className="w-3 h-3" />
          {formatCount(post.metrics.replyCount)}
        </span>
        <span className="flex items-center gap-1">
          <Repeat2 className="w-3 h-3" />
          {formatCount(post.metrics.repostCount)}
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3 h-3" />
          {formatCount(post.metrics.likeCount)}
        </span>
        <a
          href={postUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto p-1 hover:bg-[var(--color-accent)]"
          title="Open on Bluesky"
        >
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
