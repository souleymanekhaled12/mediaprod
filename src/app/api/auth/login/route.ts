import { NextRequest, NextResponse } from "next/server";
import { signIn } from "@/lib/auth";

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

    return NextResponse.json({ success: true, user: result.user });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erreur serveur";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
