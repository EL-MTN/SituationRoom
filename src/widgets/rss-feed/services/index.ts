import type { FeedItem, ParsedFeed } from '../types';

/** Public CORS proxy for fetching RSS feeds */
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

/**
 * Fetch RSS feed via public CORS proxy
 */
export async function fetchRssFeed(feedUrl: string): Promise<string> {
  const response = await fetch(`${CORS_PROXY}${encodeURIComponent(feedUrl)}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
  }

  return response.text();
}

/**
 * Parse RSS 2.0 or Atom feed XML into normalized format
 */
export function parseRssFeed(xml: string, feedUrl: string): ParsedFeed {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid XML: Unable to parse feed');
  }

  // Detect feed type and parse accordingly
  const rssChannel = doc.querySelector('channel');
  const atomFeed = doc.querySelector('feed');

  if (rssChannel) {
    return parseRss2Feed(rssChannel, feedUrl);
  } else if (atomFeed) {
    return parseAtomFeed(atomFeed, feedUrl);
  }

  throw new Error('Unknown feed format: Not RSS 2.0 or Atom');
}

/**
 * Parse RSS 2.0 format
 */
function parseRss2Feed(channel: Element, feedUrl: string): ParsedFeed {
  const title = getTextContent(channel, 'title') || 'Untitled Feed';
  const description = getTextContent(channel, 'description');
  const link = getTextContent(channel, 'link');
  const sourceName = extractDomain(feedUrl);

  const items: FeedItem[] = [];
  const itemElements = channel.querySelectorAll('item');

  itemElements.forEach((item, index) => {
    const itemTitle = getTextContent(item, 'title') || 'Untitled';
    const itemLink = getTextContent(item, 'link') || '';
    const itemDescription = getTextContent(item, 'description');
    const pubDateStr = getTextContent(item, 'pubDate');
    const author = getTextContent(item, 'author') || getTextContent(item, 'dc\\:creator');
    const guid = getTextContent(item, 'guid') || itemLink || `${feedUrl}-${index}`;

    // Try to extract image from various sources
    const imageUrl = extractImage(item, itemDescription);

    items.push({
      id: guid,
      title: itemTitle,
      link: itemLink,
      description: stripHtml(itemDescription),
      pubDate: pubDateStr ? parseDate(pubDateStr) : undefined,
      author,
      imageUrl,
      sourceName,
    });
  });

  return { title, description, link, items };
}

/**
 * Parse Atom format
 */
function parseAtomFeed(feed: Element, feedUrl: string): ParsedFeed {
  const title = getTextContent(feed, 'title') || 'Untitled Feed';
  const subtitle = getTextContent(feed, 'subtitle');
  const linkEl = feed.querySelector('link[rel="alternate"]') || feed.querySelector('link');
  const link = linkEl?.getAttribute('href') || undefined;
  const sourceName = extractDomain(feedUrl);

  const items: FeedItem[] = [];
  const entryElements = feed.querySelectorAll('entry');

  entryElements.forEach((entry, index) => {
    const entryTitle = getTextContent(entry, 'title') || 'Untitled';
    const entryLinkEl = entry.querySelector('link[rel="alternate"]') || entry.querySelector('link');
    const entryLink = entryLinkEl?.getAttribute('href') || '';
    const content = getTextContent(entry, 'content') || getTextContent(entry, 'summary');
    const updatedStr = getTextContent(entry, 'updated') || getTextContent(entry, 'published');
    const authorEl = entry.querySelector('author');
    const author = authorEl ? getTextContent(authorEl, 'name') : undefined;
    const id = getTextContent(entry, 'id') || entryLink || `${feedUrl}-${index}`;

    // Try to extract image
    const imageUrl = extractImage(entry, content);

    items.push({
      id,
      title: entryTitle,
      link: entryLink,
      description: stripHtml(content),
      pubDate: updatedStr ? parseDate(updatedStr) : undefined,
      author,
      imageUrl,
      sourceName,
    });
  });

  return { title, description: subtitle, link, items };
}

/**
 * Get text content of first matching element
 */
function getTextContent(parent: Element, selector: string): string | undefined {
  const el = parent.querySelector(selector);
  return el?.textContent?.trim() || undefined;
}

/**
 * Try to extract image URL from various sources
 */
function extractImage(item: Element, description?: string): string | undefined {
  // Check for enclosure (common for podcasts and media)
  const enclosure = item.querySelector('enclosure[type^="image"]');
  if (enclosure) {
    const url = enclosure.getAttribute('url');
    if (url) return url;
  }

  // Check for media:content or media:thumbnail
  const mediaContent = item.querySelector('media\\:content, content');
  if (mediaContent) {
    const url = mediaContent.getAttribute('url');
    const medium = mediaContent.getAttribute('medium');
    if (url && (!medium || medium === 'image')) return url;
  }

  const mediaThumbnail = item.querySelector('media\\:thumbnail, thumbnail');
  if (mediaThumbnail) {
    const url = mediaThumbnail.getAttribute('url');
    if (url) return url;
  }

  // Try to extract first image from description/content HTML
  if (description) {
    const imgMatch = description.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch?.[1]) return imgMatch[1];
  }

  return undefined;
}

/**
 * Strip HTML tags from string
 */
function stripHtml(html?: string): string | undefined {
  if (!html) return undefined;
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

/**
 * Parse various date formats
 */
function parseDate(dateStr: string): Date | undefined {
  try {
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch {
    // Ignore parse errors
  }
  return undefined;
}

/**
 * Extract domain name from URL for source attribution
 */
function extractDomain(url: string): string {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'Unknown';
  }
}
