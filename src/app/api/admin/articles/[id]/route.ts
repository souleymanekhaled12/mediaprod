import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { data: article, error } = await supabase
      .from("articles")
      .select(`
        *,
        users!articles_author_id_fkey (id, name, avatar),
        categories (id, name, slug, color),
        article_tags (
          tags (id, name, slug)
        )
      `)
      .eq("id", id)
      .single();

    if (error || !article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const body = await request.json();
    const { title, subtitle, excerpt, content, categoryId, image, imageCaption, status, featured, breaking } = body;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (excerpt !== undefined) updateData.excerpt = excerpt;
    if (content !== undefined) updateData.content = content;
    if (categoryId !== undefined) updateData.category_id = categoryId;
    if (image !== undefined) updateData.featured_image = image;
    if (featured !== undefined) updateData.is_featured = featured;
    if (breaking !== undefined) updateData.is_breaking = breaking;

    if (status !== undefined) {
      updateData.status = status === "published" ? "PUBLISHED" : status === "draft" ? "DRAFT" : status.toUpperCase();
      if (status === "published") {
        const { data: existing } = await supabase
          .from("articles")
          .select("published_at")
          .eq("id", id)
          .single();
          
        if (existing && !existing.published_at) {
          updateData.published_at = new Date().toISOString();
        }
      }
    }

    if (content) {
      const wordCount = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
      updateData.reading_time = Math.max(1, Math.ceil(wordCount / 200));
    }

    const { data: article, error } = await supabase
      .from("articles")
      .update(updateData)
      .eq("id", id)
      .select(`
        *,
        users!articles_author_id_fkey (id, name),
        categories (id, name, slug)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, article });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    
    const { error } = await supabase
      .from("articles")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
