import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/auth";

const PROFANITY_PATTERNS = [
  /\bspam\b/i,
  /\bscam\b/i,
  /https?:\/\/[^\s]+\.(xyz|tk|ml|ga|cf)\b/i,
];

function moderateContent(content: string): { approved: boolean; reason?: string } {
  if (content.length < 3) return { approved: false, reason: "Comment too short" };
  if (content.length > 2000) return { approved: false, reason: "Comment too long" };
  for (const pattern of PROFANITY_PATTERNS) {
    if (pattern.test(content)) return { approved: false, reason: "Content flagged by moderation" };
  }
  return { approved: true };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const user = await getCurrentUser();
    const body = await request.json();
    const { articleId, content, parentId } = body;

    if (!articleId || !content) {
      return NextResponse.json(
        { error: "articleId and content are required" },
        { status: 400 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const moderation = moderateContent(content);

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        article_id: articleId,
        author_id: user.id,
        content: content.trim(),
        parent_id: parentId || null,
        is_approved: moderation.approved,
        is_flagged: !moderation.approved,
      })
      .select(`
        *,
        users!comments_author_id_fkey (id, name, avatar)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      comment,
      message: moderation.approved
        ? "Commentaire publié avec succès"
        : "Commentaire en attente de modération",
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");

    if (!articleId) {
      return NextResponse.json({ error: "articleId is required" }, { status: 400 });
    }

    const { data: comments, error, count } = await supabase
      .from("comments")
      .select(`
        *,
        users!comments_author_id_fkey (id, name, avatar)
      `, { count: "exact" })
      .eq("article_id", articleId)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      comments: comments || [],
      total: count || 0,
      articleId,
    });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
