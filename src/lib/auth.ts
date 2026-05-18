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
  // Check environment variables first - if configured, always admin
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (adminEmail && adminPassword) {
    return true;
  }
  
  // Otherwise check Supabase auth
  const user = await getCurrentUser();
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.role === "EDITOR";
}

export async function getAdminSession() {
  // Check environment variables for admin credentials
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  // Check if env vars are set (both must be set)
  if (adminEmail && adminPassword && adminEmail.length > 0 && adminPassword.length > 0) {
    return true;
  }
  
  // Also check Supabase auth - this returns true if user has admin role
  const user = await getCurrentUser();
  return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" || user?.role === "EDITOR";
}

/**
 * Verify admin credentials for API routes
 * Returns true only if ADMIN_EMAIL and ADMIN_PASSWORD match
 */
export async function verifyAdminCredentials(email: string, password: string): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  return email === adminEmail && password === adminPassword;
}

export async function signIn(email: string, password: string) {
  // Check admin credentials first
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (email === adminEmail && password === adminPassword) {
    // Create a mock admin session - this bypasses Supabase auth
    return { 
      success: true, 
      user: { 
        id: "admin-session", 
        email: adminEmail,
        role: "ADMIN"
      } 
    };
  }
  
  // Try Supabase auth as fallback
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

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
