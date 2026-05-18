/**
 * @deprecated Use Supabase client instead (@/lib/supabase/server or @/lib/supabase/client)
 * This file is a stub for backwards compatibility with Prisma code.
 */
import { createClient } from "@/lib/supabase/server";

const articleStub = {
  findMany: async (opts?: any) => {
    const supabase = await createClient();
    let query = supabase.from("articles").select("*");
    if (opts?.where?.status) query = query.eq("status", opts.where.status);
    if (opts?.orderBy?.published_at) query = query.order("published_at", { ascending: opts.orderBy.published_at === "asc" });
    if (opts?.take) query = query.limit(opts.take);
    const { data } = await query;
    return data || [];
  },
  findUnique: async (opts: any) => {
    const supabase = await createClient();
    const { data } = await supabase.from("articles").select("*").eq("id", opts.where.id).single();
    return data;
  },
  count: async () => 0,
};

export const prisma = {
  $queryRawUnsafe: async (query: string, ...params: any[]) => {
    console.log("Deprecated prisma call:", query, params);
    return [{ ok: 1 }];
  },
  // Alias for backward compatibility
  article: articleStub,
  articles: articleStub,
  user: {
    findMany: async (opts?: any) => {
      const supabase = await createClient();
      let query = supabase.from("users").select("*");
      if (opts?.where?.role?.in) query = query.in("role", opts.where.role.in);
      const { data } = await query;
      return data || [];
    },
    findUnique: async (opts: any) => {
      const supabase = await createClient();
      const { data } = await supabase.from("users").select("*").eq("id", opts.where.id).single();
      return data;
    },
    findFirst: async (opts: any) => {
      const supabase = await createClient();
      let query = supabase.from("users").select("*");
      if (opts?.where?.role) query = query.eq("role", opts.where.role);
      const { data } = await query;
      return data?.[0] || null;
    },
  },
  users: {
    findMany: async () => [],
    findUnique: async () => null,
  },
  categories: {
    findMany: async () => [],
    findUnique: async () => null,
  },
  category: {
    findUnique: async (opts: any) => {
      const supabase = await createClient();
      const { data } = await supabase.from("categories").select("*").eq("slug", opts.where.slug).single();
      return data;
    },
    findMany: async (opts?: any) => {
      const supabase = await createClient();
      let query = supabase.from("categories").select("*");
      if (opts?.take) query = query.limit(opts.take);
      const { data } = await query;
      return data || [];
    },
  },
};

export default prisma;