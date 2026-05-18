import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  name: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();
    const { email, name } = newsletterSchema.parse(body);

    const { error } = await supabase
      .from("newsletters")
      .upsert({
        email,
        name: name || null,
        is_active: true,
        subscribed_at: new Date().toISOString(),
      }, { onConflict: "email" });

    if (error) {
      return NextResponse.json(
        { success: false, message: "Une erreur est survenue." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Inscription réussie ! Merci de votre intérêt.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: "Une erreur est survenue." },
      { status: 500 }
    );
  }
}
