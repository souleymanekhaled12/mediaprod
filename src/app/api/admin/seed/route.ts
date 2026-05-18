import { NextResponse } from "next/server";
import { createServerClient } from '@supabase/ssr';
import { categories } from "@/lib/data/categories";
import { articles as localArticles } from "@/lib/data/articles";

async function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return []; },
        setAll() {}
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    // For seed, we allow it if env vars are set
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { success: false, error: "Admin non configuré" },
        { status: 401 }
      );
    }
    const supabase = await createServiceClient();

    // Seed categories
    for (const cat of categories) {
      await supabase
        .from("categories")
        .upsert({
          name: cat.name,
          slug: cat.slug,
          description: cat.description ?? "",
          color: cat.color,
        }, { onConflict: "slug" });
    }

    // Get categories mapping
    const { data: dbCategories } = await supabase
      .from("categories")
      .select("id, slug");

    const catMap = new Map((dbCategories || []).map((c) => [c.slug, c.id]));

    // Seed articles
    let seededCount = 0;
    for (const art of localArticles) {
      const categoryId = catMap.get(art.categorySlug);
      if (!categoryId) continue;

      // Check if article exists
      const { data: existing } = await supabase
        .from("articles")
        .select("id")
        .eq("slug", art.slug)
        .single();

      if (existing) continue;

      await supabase
        .from("articles")
        .insert({
          slug: art.slug,
          title: art.title,
          excerpt: art.excerpt,
          content: art.body,
          featured_image: art.image,
          status: art.status === "published" ? "PUBLISHED" : "DRAFT",
          is_featured: art.featured,
          is_breaking: art.breaking,
          reading_time: art.readTime,
          view_count: art.views,
          published_at: new Date(art.publishedAt).toISOString(),
          category_id: categoryId,
        });
      seededCount++;
    }

    return NextResponse.json({
      success: true,
      categoriesSeeded: categories.length,
      articlesSeeded: seededCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
