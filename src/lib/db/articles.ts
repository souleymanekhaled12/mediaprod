import { createClient } from "@/lib/supabase/server";
import type { Article as ArticleType } from "@/types";

interface DbArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  status: string;
  is_featured: boolean;
  is_breaking: boolean;
  view_count: number;
  reading_time: number;
  published_at: string | null;
  created_at: string;
  author_id: string | null;
  author_name: string | null;
  category_id: string | null;
  categories: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    color: string;
  } | null;
}

function toArticle(a: DbArticle): ArticleType {
  // Use author_name if available, otherwise use default
  const authorName = a.author_name || "Ligne Rouge";
  const authorSlug = authorName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return {
    id: a.id,
    slug: a.slug,
    title: a.title,
    subtitle: "",
    excerpt: a.excerpt || "",
    body: a.content || "",
    category: a.categories ? {
      id: a.categories.id,
      name: a.categories.name,
      slug: a.categories.slug,
      description: a.categories.description || "",
      color: a.categories.color,
    } : {
      id: "",
      name: "Non classé",
      slug: "non-classe",
      description: "",
      color: "#6B7280",
    },
    categorySlug: a.categories?.slug || "non-classe",
    author: {
      id: "",
      name: authorName,
      slug: authorSlug,
      bio: "",
      avatar: "/images/team/default-avatar.jpg",
      role: "AUTHOR",
    },
    authorSlug,
    image: a.featured_image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=1200&auto=format&fit=crop",
    imageCaption: undefined,
    publishedAt: (a.published_at || a.created_at),
    readTime: a.reading_time,
    views: a.view_count,
    status: a.status === "PUBLISHED" ? "published" : a.status === "DRAFT" ? "draft" : "scheduled",
    featured: a.is_featured,
    breaking: a.is_breaking,
    tags: [],
    locale: "fr" as "fr" | "en",
  };
}

export async function getPublishedArticles(limit = 50): Promise<ArticleType[]> {
  const supabase = await createClient();
  
  const { data: articles, error } = await supabase
    .from("articles")
    .select(`
      *,
      categories (id, name, slug, description, color)
    `)
    .eq("status", "PUBLISHED")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching articles:", error);
    return [];
  }

  return (articles || []).map((a) => toArticle(a as unknown as DbArticle));
}

export async function getArticleBySlugFromDb(slug: string): Promise<ArticleType | null> {
  const supabase = await createClient();
  
  const { data: article, error } = await supabase
    .from("articles")
    .select(`
      *,
      
      categories (id, name, slug, description, color)
    `)
    .eq("slug", slug)
    .single();

  if (error || !article) {
    return null;
  }

  return toArticle(article as unknown as DbArticle);
}

export async function getArticlesByCategoryFromDb(categorySlug: string, limit = 10): Promise<ArticleType[]> {
  const supabase = await createClient();
  
  const { data: articles, error } = await supabase
    .from("articles")
    .select(`
      *,
      
      categories!inner (id, name, slug, description, color)
    `)
    .eq("status", "PUBLISHED")
    .eq("categories.slug", categorySlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("Error fetching articles by category:", error);
    return [];
  }

  return (articles || []).map((a) => toArticle(a as unknown as DbArticle));
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const supabase = await createClient();
  
  const { data: articles, error } = await supabase
    .from("articles")
    .select("slug")
    .eq("status", "PUBLISHED");

  if (error) {
    return [];
  }

  return (articles || []).map((a) => a.slug);
}

export async function getRelatedArticlesFromDb(articleId: string, categoryId: string, limit = 3): Promise<ArticleType[]> {
  const supabase = await createClient();
  
  const { data: articles, error } = await supabase
    .from("articles")
    .select(`
      *,
      
      categories (id, name, slug, description, color)
    `)
    .eq("status", "PUBLISHED")
    .eq("category_id", categoryId)
    .neq("id", articleId)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (articles || []).map((a) => toArticle(a as unknown as DbArticle));
}

export async function searchArticlesInDb(query: string): Promise<ArticleType[]> {
  const supabase = await createClient();
  
  const { data: articles, error } = await supabase
    .from("articles")
    .select(`
      *,
      
      categories (id, name, slug, description, color)
    `)
    .eq("status", "PUBLISHED")
    .or(`title.ilike.%${query}%,excerpt.ilike.%${query}%,content.ilike.%${query}%`)
    .order("published_at", { ascending: false })
    .limit(20);

  if (error) {
    console.error("Error searching articles:", error);
    return [];
  }

  return (articles || []).map((a) => toArticle(a as unknown as DbArticle));
}

export async function getFeaturedArticles(limit = 5): Promise<ArticleType[]> {
  const supabase = await createClient();
  
  const { data: articles, error } = await supabase
    .from("articles")
    .select(`
      *,
      
      categories (id, name, slug, description, color)
    `)
    .eq("status", "PUBLISHED")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error) {
    return [];
  }

  return (articles || []).map((a) => toArticle(a as unknown as DbArticle));
}

// User and Category helper functions
export async function getUserById(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();
  return data;
}

export async function getUsersByRole(roles: string[]) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('users')
    .select('*')
    .in('role', roles);
  return data || [];
}

export async function getFirstAdminUser() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('role', 'ADMIN')
    .order('created_at', { ascending: true })
    .limit(1)
    .single();
  return data || null;
}

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return data || [];
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();
  return data || null;
}
