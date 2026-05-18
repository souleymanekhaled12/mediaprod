"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Save, Eye, Loader2, CheckCircle2, X } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

interface DbCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export default function NewArticlePage() {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [featured, setFeatured] = useState(false);
  const [breaking, setBreaking] = useState(false);
  const [tags, setTags] = useState("");

  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [dbConnected, setDbConnected] = useState<boolean | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [savedSlug, setSavedSlug] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const catRes = await fetch("/api/admin/categories");

        if (catRes.ok) {
          const cats = await catRes.json();

          if (Array.isArray(cats) && cats.length > 0) {
            setCategories(cats);
            setCategoryId(cats[0].id);
          }

          setDbConnected(true);
        } else {
          setDbConnected(false);
        }
      } catch {
        setDbConnected(false);
      }
    }
    loadData();
  }, []);

  const handleSave = async () => {
    if (!title.trim() || !excerpt.trim() || !content.trim()) {
      setError("Titre, extrait et contenu sont obligatoires.");
      return;
    }
    if (!categoryId) {
      setError("Catégorie est obligatoire.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          excerpt,
          content: formatContent(content),
          categoryId,
          image,
          imageCaption,
          status,
          featured,
          breaking,
          tags: tags
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de la sauvegarde");
      }

      setSaved(true);
      setSavedSlug(data.article?.slug || null);
      setToast({ type: "success", message: "Succ\u00e8s : L\u2019article a \u00e9t\u00e9 publi\u00e9 avec succ\u00e8s !" });
      setTimeout(() => { setSaved(false); setToast(null); }, 5000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(msg);
      setToast({ type: "error", message: msg });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSaved(true);
        setError("");
        window.location.reload();
      } else {
        setError(data.error || "Erreur lors du seed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F1EE] dark:bg-[#0f0f1a]">
      {/* Header */}
      <div className="bg-[#0D1B2A] text-white px-4 sm:px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo variant="white" />
          <span className="text-xs font-semibold uppercase tracking-wider text-white/50 border-l border-white/20 pl-4">
            Nouvel article
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Dashboard
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {dbConnected === false && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-400 mb-2">
              Base de données non connectée
            </p>
            <p className="text-xs text-yellow-700 dark:text-yellow-500 mb-3">
              La base de données Supabase n&apos;est pas encore synchronisée. Cliquez ci-dessous pour initialiser les tables et importer les données existantes.
            </p>
            <button
              onClick={handleSeed}
              disabled={saving}
              className="bg-yellow-600 text-white text-xs font-bold px-4 py-2 rounded hover:bg-yellow-700 transition-colors disabled:opacity-50"
            >
              {saving ? "Initialisation..." : "Initialiser la base de données"}
            </button>
          </div>
        )}

        {dbConnected === true && (
          <>
            {error && (
              <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
                {error}
              </div>
            )}
            {saved && (
              <div className="mb-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 text-sm text-green-700 dark:text-green-400 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  <span className="font-semibold">Succès : L&apos;article a été publié avec succès !</span>
                </div>
                {savedSlug && (
                  <Link href={`/article/${savedSlug}`} className="text-xs font-bold underline hover:no-underline ml-4">
                    Voir l&apos;article →
                  </Link>
                )}
              </div>
            )}

            <div className="bg-white dark:bg-[#1a1a2e] rounded-lg border border-[#DEDBD4] dark:border-[#2a2a3e] p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider block mb-1.5">
                  Titre *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de l'article..."
                  className="w-full text-lg font-serif font-bold px-4 py-3 border border-[#DEDBD4] dark:border-[#3a3a4e] rounded-lg bg-transparent text-[#1A1A1A] dark:text-white outline-none focus:border-[#C01D35] transition-colors"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider block mb-1.5">
                  Sous-titre
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Sous-titre (optionnel)..."
                  className="w-full text-sm px-4 py-2.5 border border-[#DEDBD4] dark:border-[#3a3a4e] rounded-lg bg-transparent text-[#1A1A1A] dark:text-white outline-none focus:border-[#C01D35] transition-colors"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider block mb-1.5">
                  Extrait / Chapeau *
                </label>
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Résumé court de l'article..."
                  rows={2}
                  className="w-full text-sm px-4 py-2.5 border border-[#DEDBD4] dark:border-[#3a3a4e] rounded-lg bg-transparent text-[#1A1A1A] dark:text-white outline-none focus:border-[#C01D35] transition-colors resize-none"
                />
              </div>

              {/* Content */}
              <div>
                <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider block mb-1.5">
                  Contenu *{" "}
                  <span className="text-[#7A7A7A] font-normal normal-case">(HTML supporté)</span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Rédigez votre article ici... Vous pouvez utiliser du HTML pour le formatage (<p>, <h2>, <strong>, <blockquote>, etc.)"
                  rows={12}
                  className="w-full text-sm px-4 py-2.5 border border-[#DEDBD4] dark:border-[#3a3a4e] rounded-lg bg-transparent text-[#1A1A1A] dark:text-white outline-none focus:border-[#C01D35] transition-colors resize-y font-mono"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider block mb-1.5">
                  Image
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... ou[uploader une photo"
                    className="flex-1 text-sm px-4 py-2.5 border border-[#DEDBD4] dark:border-[#3a3a4e] rounded-lg bg-transparent text-[#1A1A1A] dark:text-white outline-none focus:border-[#C01D35] transition-colors"
                  />
                  <label className="cursor-pointer bg-[#F2F1EE] dark:bg-[#2a2a3e] border border-[#DEDBD4] dark:border-[#3a3a4e] px-4 py-2 rounded-lg text-sm font-medium text-[#4A4A4A] dark:text-[#a0a0b0] hover:text-[#0D1B2A] dark:hover:text-white transition-colors">
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        
                        const formData = new FormData();
                        formData.append("file", file);
                        
                        setSaving(true);
                        try {
                          const res = await fetch("/api/admin/upload", {
                            method: "POST",
                            body: formData,
                          });
                          const data = await res.json();
                          if (data.url) {
                            setImage(data.url);
                          }
                        } finally {
                          setSaving(false);
                        }
                      }}
                    />
                    {saving ? "..." : "Upload"}
                  </label>
                </div>
              </div>

              {/* Image Caption */}
              <div>
                <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider block mb-1.5">
                  Légende image
                </label>
                <input
                  type="text"
                  value={imageCaption}
                  onChange={(e) => setImageCaption(e.target.value)}
                  placeholder="Description de l'image..."
                  className="w-full text-sm px-4 py-2.5 border border-[#DEDBD4] dark:border-[#3a3a4e] rounded-lg bg-transparent text-[#1A1A1A] dark:text-white outline-none focus:border-[#C01D35] transition-colors"
                />
              </div>

              {/* Category + Author */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider block mb-1.5">
                    Catégorie *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full text-sm px-4 py-2.5 border border-[#DEDBD4] dark:border-[#3a3a4e] rounded-lg bg-white dark:bg-[#1a1a2e] text-[#1A1A1A] dark:text-white outline-none focus:border-[#C01D35] transition-colors"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider block mb-1.5">
                  Tags{" "}
                  <span className="text-[#7A7A7A] font-normal normal-case">(séparés par des virgules)</span>
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="politique, afrique, économie..."
                  className="w-full text-sm px-4 py-2.5 border border-[#DEDBD4] dark:border-[#3a3a4e] rounded-lg bg-transparent text-[#1A1A1A] dark:text-white outline-none focus:border-[#C01D35] transition-colors"
                />
              </div>

              {/* Options */}
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 text-sm text-[#4A4A4A] dark:text-[#a0a0b0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="w-4 h-4 accent-[#C01D35]"
                  />
                  Article à la une
                </label>
                <label className="flex items-center gap-2 text-sm text-[#4A4A4A] dark:text-[#a0a0b0] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={breaking}
                    onChange={(e) => setBreaking(e.target.checked)}
                    className="w-4 h-4 accent-[#C01D35]"
                  />
                  Breaking News
                </label>
              </div>

              {/* Status + Save */}
              <div className="flex items-center justify-between pt-4 border-t border-[#DEDBD4] dark:border-[#2a2a3e]">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setStatus("draft")}
                    className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                      status === "draft"
                        ? "bg-[#DEDBD4] dark:bg-[#3a3a4e] text-[#0D1B2A] dark:text-white"
                        : "text-[#7A7A7A] hover:bg-[#F2F1EE] dark:hover:bg-[#2a2a3e]"
                    }`}
                  >
                    Brouillon
                  </button>
                  <button
                    onClick={() => setStatus("published")}
                    className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${
                      status === "published"
                        ? "bg-green-600 text-white"
                        : "text-[#7A7A7A] hover:bg-[#F2F1EE] dark:hover:bg-[#2a2a3e]"
                    }`}
                  >
                    Publier
                  </button>
                </div>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-[#C01D35] text-white text-sm font-bold px-6 py-2.5 rounded-lg hover:bg-[#A01728] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {saving ? "Publication en cours..." : status === "published" ? "Publier" : "Sauvegarder"}
                </button>
              </div>
            </div>

            {/* Preview */}
            {title && (
              <div className="mt-8 bg-white dark:bg-[#1a1a2e] rounded-lg border border-[#DEDBD4] dark:border-[#2a2a3e] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="w-4 h-4 text-[#7A7A7A]" />
                  <span className="text-xs font-semibold text-[#7A7A7A] uppercase tracking-wider">
                    Aperçu
                  </span>
                </div>
                <h1 className="font-serif text-2xl font-bold text-[#0D1B2A] dark:text-white mb-2">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-[#4A4A4A] dark:text-[#a0a0b0] mb-4">{subtitle}</p>
                )}
                <p className="text-sm text-[#7A7A7A] italic mb-4">{excerpt}</p>
                <div
                  className="prose dark:prose-invert max-w-none text-sm"
                  dangerouslySetInnerHTML={{ __html: formatContent(content) }}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-lg shadow-2xl text-sm font-semibold text-white animate-slide-up ${
          toast.type === "success" ? "bg-green-600" : "bg-red-600"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <X className="w-5 h-5" />
          )}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function formatContent(text: string): string {
  if (text.includes("<p>") || text.includes("<h2>")) return text;
  return text
    .split("\n\n")
    .filter(Boolean)
    .map((p) => `<p>${p.replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}
