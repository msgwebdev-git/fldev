// Client-safe types for stories (no server-only imports).

export interface StoryData {
  id: string;
  titleRo: string;
  titleRu: string;
  videoUrl: string;
  coverUrl?: string;
  ctaLabelRo?: string;
  ctaLabelRu?: string;
  ctaHref?: string;
}
