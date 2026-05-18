/**
 * Social Media Configuration & Integration
 * Supports 8+ platforms with analytics tracking
 */

export interface SocialPlatform {
  id: string;
  name: string;
  url: string;
  icon: string;
  users: number;
  estimatedShare: number;
  hashtags: string[];
  optimalTiming?: string;
}

export interface ShareEventData {
  platform: string;
  articleId: string;
  articleTitle: string;
  timestamp: string;
  userId?: string;
  source?: string;
}

export interface SocialMetaTags {
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  ogUrl: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  twitterCreator?: string;
}

// Social Platforms Configuration
export const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    url: 'https://www.facebook.com',
    icon: 'facebook',
    users: 3070000000,
    estimatedShare: 0.25,
    hashtags: ['#SocialMedia', '#News', '#Trending'],
    optimalTiming: '13:00-16:00 et 20:00-22:00',
  },
  twitter: {
    id: 'twitter',
    name: 'X (Twitter)',
    url: 'https://twitter.com',
    icon: 'twitter',
    users: 541000000,
    estimatedShare: 0.15,
    hashtags: ['#News', '#Breaking', '#Trending'],
    optimalTiming: '08:00-10:00 et 17:00-19:00',
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    url: 'https://www.linkedin.com',
    icon: 'linkedin',
    users: 950000000,
    estimatedShare: 0.1,
    hashtags: ['#Business', '#Industry', '#News'],
    optimalTiming: '07:30-09:00 et 17:30-19:00',
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    url: 'https://www.instagram.com',
    icon: 'instagram',
    users: 2000000000,
    estimatedShare: 0.2,
    hashtags: ['#News', '#Lifestyle', '#Trending'],
    optimalTiming: '11:00-13:00 et 19:00-21:00',
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    url: 'https://www.whatsapp.com',
    icon: 'whatsapp',
    users: 2000000000,
    estimatedShare: 0.12,
    hashtags: [],
    optimalTiming: 'Anytime',
  },
  telegram: {
    id: 'telegram',
    name: 'Telegram',
    url: 'https://telegram.org',
    icon: 'telegram',
    users: 900000000,
    estimatedShare: 0.08,
    hashtags: ['#News', '#Breaking'],
    optimalTiming: '12:00-14:00 et 18:00-20:00',
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit',
    url: 'https://www.reddit.com',
    icon: 'reddit',
    users: 500000000,
    estimatedShare: 0.05,
    hashtags: ['r/news', 'r/worldnews', 'r/technology'],
    optimalTiming: '12:00-14:00 et 19:00-21:00',
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest',
    url: 'https://www.pinterest.com',
    icon: 'pinterest',
    users: 507000000,
    estimatedShare: 0.05,
    hashtags: ['#Inspiration', '#Trending', '#Ideas'],
    optimalTiming: '14:00-16:00 et 20:00-22:00',
  },
};

// Share URL Templates
export const SHARE_URLS = {
  facebook: (url: string, title: string) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,

  twitter: (url: string, text: string, via?: string) => {
    let twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`;
    if (via) twitterUrl += `&via=${via}`;
    return twitterUrl;
  },

  linkedin: (url: string, title: string, summary?: string) =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}${summary ? `&summary=${encodeURIComponent(summary)}` : ''}`,

  whatsapp: (text: string, url: string) =>
    `https://wa.me/?text=${encodeURIComponent(`${text}\n${url}`)}`,

  telegram: (text: string, url: string) =>
    `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,

  reddit: (url: string, title: string) =>
    `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,

  pinterest: (url: string, title: string, image: string) =>
    `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(title)}`,

  email: (subject: string, body: string) =>
    `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
};

// Trending Hashtags by Platform
export const TRENDING_HASHTAGS: Record<string, string[]> = {
  twitter: ['#Trending', '#News', '#Breaking', '#Politics', '#Technology'],
  instagram: ['#News', '#Lifestyle', '#Travel', '#Food', '#Fashion'],
  facebook: ['#News', '#Viral', '#Trending', '#Social', '#Community'],
  linkedin: ['#Business', '#Leadership', '#Innovation', '#Career', '#Growth'],
  tiktok: ['#FYP', '#Trending', '#Viral', '#Challenge', '#NewMusic'],
};

/**
 * Generate OpenGraph meta tags for social sharing
 */
export function generateSocialMetaTags(data: {
  title: string;
  description: string;
  imageUrl: string;
  articleUrl: string;
  author?: string;
  publishedDate?: string;
  twitterHandle?: string;
}): SocialMetaTags {
  return {
    ogTitle: data.title,
    ogDescription: data.description,
    ogImage: data.imageUrl,
    ogUrl: data.articleUrl,
    twitterCard: 'summary_large_image',
    twitterTitle: data.title,
    twitterDescription: data.description,
    twitterImage: data.imageUrl,
    twitterCreator: data.twitterHandle,
  };
}

/**
 * Track share events
 */
export async function trackShareEvent(data: ShareEventData): Promise<void> {
  try {
    await fetch('/api/analytics/shares', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Failed to track share event:', error);
  }
}

/**
 * Get trending hashtags for a platform
 */
export function getTrendingHashtags(
  platform: keyof typeof TRENDING_HASHTAGS,
  count: number = 5
): string[] {
  return (TRENDING_HASHTAGS[platform] || []).slice(0, count);
}

/**
 * Format share count
 */
export function formatShareCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M`;
  }
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K`;
  }
  return count.toString();
}

/**
 * Calculate engagement rate
 */
export function calculateEngagementRate(
  shares: number,
  totalFollowers: number
): number {
  if (totalFollowers === 0) return 0;
  return Math.round((shares / totalFollowers) * 100);
}

/**
 * Get estimated reach
 */
export function getEstimatedReach(
  platform: keyof typeof SOCIAL_PLATFORMS,
  shares: number
): number {
  const p = SOCIAL_PLATFORMS[platform];
  return Math.round(p.users * p.estimatedShare * (shares / 100));
}

/**
 * Recommend best platforms for sharing
 */
export function recommendPlatforms(
  contentType: 'news' | 'article' | 'blog' | 'visual' | 'professional'
): string[] {
  const recommendations: Record<string, string[]> = {
    news: ['twitter', 'facebook', 'linkedin'],
    article: ['linkedin', 'facebook', 'twitter'],
    blog: ['facebook', 'twitter', 'linkedin'],
    visual: ['instagram', 'pinterest', 'facebook'],
    professional: ['linkedin', 'twitter', 'facebook'],
  };
  return recommendations[contentType] || Object.keys(SOCIAL_PLATFORMS);
}
