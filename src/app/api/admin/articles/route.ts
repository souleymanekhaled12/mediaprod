import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createServerClient } from '@supabase/ssr';
import { verifyAdminCredentials, getCurrentUser } from "@/lib/auth";

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

/**
 * Verify the request has admin authentication
 */
async function verifyAdminAuth(request: NextRequest): Promise<boolean> {
  // Check for admin session cookie
  const adminSession = request.cookies.get("admin-session");
  if (adminSession?.value === "true") {
    return true;
  }
  
  // Also check env vars (for server-side calls)
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword && adminEmail.length > 0 && adminPassword.length > 0) {
    return true;
  }
  
  // Fallback: check Supabase user
  const user = await getCurrentUser();
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.role === "EDITOR";
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const isAuthorized = await verifyAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    const supabase = await createServiceClient();
    const { searchParams } = request.nextUrl;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    let query = supabase
      .from("articles")
      .select(`
        *,
        users!articles_author_id_fkey (id, name, avatar),
        categories (id, name, slug, color)
      `, { count: "exact" });

    if (status) {
      query = query.eq("status", status.toUpperCase());
    }

    const { data: articles, count, error } = await query
      .order("created_at", { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ 
      articles: articles || [], 
      total: count || 0, 
      page, 
      limit 
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication
    const isAuthorized = await verifyAdminAuth(request);
    if (!isAuthorized) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }
    
    const supabase = await createServiceClient();
    const body = await request.json();
    const { title, subtitle, excerpt, content, categoryId, authorName, image, imageCaption, status, featured, breaking, tags } = body;

    if (!title || !excerpt || !content || !categoryId) {
      return NextResponse.json(
        { error: "title, excerpt, content, and categoryId are required" },
        { status: 400 }
      );
    }

    const slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100);

    // Check for existing slug
    const { data: existingSlug } = await supabase
      .from("articles")
      .select("slug")
      .eq("slug", slug)
      .single();

    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / 200));

    const { data: article, error } = await supabase
      .from("articles")
      .insert({
        slug: finalSlug,
        title,
        excerpt,
        content,
        featured_image: image || null,
        status: status === "published" ? "PUBLISHED" : "DRAFT",
        is_featured: featured || false,
        is_breaking: breaking || false,
        reading_time: readingTime,
        published_at: status === "published" ? new Date().toISOString() : null,
        category_id: categoryId,
        author_name: authorName || null,
      })
      .select(`
        *,
        categories (id, name, slug)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Handle tags
    if (tags && Array.isArray(tags) && tags.length > 0) {
      for (const tagName of tags) {
        const tagSlug = tagName
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        // Upsert tag
        const { data: tag } = await supabase
          .from("tags")
          .upsert({ name: tagName, slug: tagSlug }, { onConflict: "slug" })
          .select()
          .single();

        if (tag && article) {
          await supabase
            .from("article_tags")
            .insert({ article_id: article.id, tag_id: tag.id });
        }
      }
    }

    revalidatePath("/");
    revalidatePath(`/article/${finalSlug}`);
    revalidatePath("/admin");

    return NextResponse.json({ success: true, article }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
