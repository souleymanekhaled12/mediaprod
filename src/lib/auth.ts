import { createClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    return null;
  }

  // Fetch user profile from our users table
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function isAdmin() {
  const user = await getCurrentUser();
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.role === "EDITOR";
}

export async function getAdminSession() {
  // Check environment variables for admin credentials
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  // This allows simple admin auth via environment variables
  // The session is stored in a cookie by the middleware
  if (adminEmail && adminPassword) {
    return true;
  }
  
  // Also try Supabase auth
  const isSupabaseAdmin = await isAdmin();
  return isSupabaseAdmin;
}

export async function signIn(email: string, password: string) {
  // First try: Supabase auth
  const supabase = await createClient();
  let { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error && (error.message.includes("Invalid") || error.message.includes("invalid"))) {
    // Fallback: check against environment admin credentials
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    
    if (email === adminEmail && password === adminPassword) {
      // Create a mock user for admin login
      return { 
        success: true, 
        user: { 
          id: "admin", 
          email: adminEmail,
          role: "ADMIN"
        } 
      };
    }
  }

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}

export async function signUp(email: string, password: string, name?: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
        `${process.env.NEXT_PUBLIC_SITE_URL || ''}/auth/callback`,
      data: {
        name: name || email.split('@')[0],
      },
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, user: data.user };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
