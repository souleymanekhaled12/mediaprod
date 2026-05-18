import { NextRequest, NextResponse } from "next/server";
import { signIn, verifyAdminCredentials, isAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const result = await signIn(email, password);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Identifiants incorrects" },
        { status: 401 }
      );
    }

    // Verify the user has admin access
    const isAdminUser = await verifyAdminCredentials(email, password);
    if (!isAdminUser) {
      // Also try Supabase auth
      const supabaseAdmin = await isAdmin();
      if (!supabaseAdmin) {
        return NextResponse.json(
          { error: "Accès admin requis" },
          { status: 403 }
        );
      }
    }

    // Create response with session cookie
    const response = NextResponse.json({ 
      success: true, 
      user: { ...result.user, role: "ADMIN" }
    });

    // Set admin session cookie (valid for 24 hours)
    response.cookies.set("admin-session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
