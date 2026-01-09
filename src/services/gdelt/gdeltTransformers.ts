import type {
  GdeltDocArticle,
  GdeltGeoFeature,
  NormalizedEvent,
  GeoEvent,
} from '../../types';

function parseGdeltDate(dateStr: string): Date {
  // GDELT date format: YYYYMMDDTHHmmssZ or similar
  if (!dateStr) return new Date();

  // Try ISO format first
  const isoDate = new Date(dateStr);
  if (!isNaN(isoDate.getTime())) {
    return isoDate;
  }

  // Parse GDELT format: 20250108T143000Z
  const match = dateStr.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
  if (match) {
    const [, year, month, day, hour, minute, second] = match;
    return new Date(
      Date.UTC(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour),
        parseInt(minute),
        parseInt(second)
      )
    );
  }

  return new Date();
}

function extractDomainName(domain: string): string {
  if (!domain) return 'Unknown';
  // Remove www. and get first part
  const clean = domain.replace(/^www\./, '');
  const parts = clean.split('.');
  // Capitalize first letter
  const name = parts[0] || 'Unknown';
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function generateId(url: string, date: string): string {
  // Create a deterministic ID from URL and date
  const str = `${url}-${date}`;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

export function transformDocArticle(article: GdeltDocArticle): NormalizedEvent {
  const publishedAt = parseGdeltDate(article.seendate);

  return {
    id: generateId(article.url, article.seendate),
    title: article.title || 'Untitled',
    url: article.url,
    urlMobile: article.url_mobile || undefined,
    sourceUrl: article.domain,
    sourceName: extractDomainName(article.domain),
    sourceCountry: article.sourcecountry || 'Unknown',
    language: article.language || 'en',
    publishedAt,
    seenAt: publishedAt,
    imageUrl: article.socialimage || undefined,
    locations: [],
    raw: article,
  };
}

export function transformGeoFeature(feature: GdeltGeoFeature): GeoEvent {
  const props = feature.properties;
  const [lng, lat] = feature.geometry.coordinates; // GeoJSON is [lng, lat]
  const publishedAt = parseGdeltDate(props.urlpubtimedate);

  return {
    id: generateId(props.url, props.urlpubtimedate),
    title: props.urltitle || props.name || 'Untitled',
    url: props.url,
    sourceUrl: props.domain,
    sourceName: extractDomainName(props.domain),
    sourceCountry: props.sourcecountry || 'Unknown',
    language: props.language || 'en',
    publishedAt,
    seenAt: publishedAt,
    imageUrl: props.urlsocialimage || undefined,
    tone: props.tone,
    locations: [
      {
        name: props.name,
        type: 'unknown',
        lat,
        lng,
      },
    ],
    coordinates: [lat, lng], // Leaflet uses [lat, lng]
    allMentionedNames: props.allmentionednames,
    raw: feature,
  };
}

export function transformDocResponse(articles: GdeltDocArticle[]): NormalizedEvent[] {
  if (!articles || !Array.isArray(articles)) return [];
  return articles.map(transformDocArticle);
}

export function transformGeoResponse(features: GdeltGeoFeature[]): GeoEvent[] {
  if (!features || !Array.isArray(features)) return [];
  return features.map(transformGeoFeature);
}
