import { NextResponse } from "next/server";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    const authenticated = !!user;
    const admin = await isAdmin();

    return NextResponse.json({ 
      authenticated, 
      isAdmin: admin,
      user: user ? {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      } : null
    });
  } catch {
    return NextResponse.json({ authenticated: false, isAdmin: false, user: null });
  }
}
