import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/data/categories";
import { authors } from "@/lib/data/authors";
import { articles as localArticles } from "@/lib/data/articles";

export async function POST() {
  try {
    const supabase = await createClient();

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

    // Get editor info
    const editor = authors[0];

    // Check if user exists in auth (we need a real auth user for this)
    // For now, we'll check if there's any admin user
    const { data: existingUsers } = await supabase
      .from("users")
      .select("*")
      .eq("role", "EDITOR")
      .limit(1);

    let userId = existingUsers?.[0]?.id;

    // If no editor exists, we can't seed articles without a real auth user
    // The trigger will create the user profile when someone signs up
    if (!userId) {
      return NextResponse.json({
        success: true,
        message: "Categories seeded. Please sign up a user first to seed articles.",
        categoriesSeeded: categories.length,
        articlesSeeded: 0,
      });
    }

    // Seed articles
    const { data: dbCategories } = await supabase
      .from("categories")
      .select("id, slug");

    const catMap = new Map((dbCategories || []).map((c) => [c.slug, c.id]));

    let seededCount = 0;
    for (const art of localArticles) {
      const categoryId = catMap.get(art.categorySlug);
      if (!categoryId) continue;

      // Check if article exists
      const { data: existing } = await supabase
        .from("articles")
        .select("slug")
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
          author_id: userId,
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
