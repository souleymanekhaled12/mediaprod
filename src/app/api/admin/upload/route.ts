import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "Aucun fichier" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Type non autorisé" }, { status: 400 });
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux" }, { status: 400 });
    }

    // Generate unique filename
    const ext = file.name.split(".").pop();
    const timestamp = Date.now();
    const filename = `${timestamp}-${Math.random().toString(36).slice(2)}.${ext}`;

    // Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    const { data, error } = await supabase.storage
      .from("images")
      .upload(filename, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(filename);

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: data.path
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}