/** GDELT DOC API article response */
export interface GdeltDocArticle {
  url: string;
  url_mobile: string;
  title: string;
  seendate: string;
  socialimage: string;
  domain: string;
  language: string;
  sourcecountry: string;
}

/** GDELT DOC API response wrapper */
export interface GdeltDocResponse {
  articles: GdeltDocArticle[];
}
