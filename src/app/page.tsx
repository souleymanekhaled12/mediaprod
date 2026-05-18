import { HeroSection } from "@/components/articles/HeroSection";
import { ArticleCard } from "@/components/articles/ArticleCard";
import { NewsletterPreferences } from "@/components/articles/NewsletterPreferences";
import { FinanceWidget } from "@/components/widgets/FinanceWidget";
import { WeatherWidget } from "@/components/widgets/WeatherWidget";
import { getPublishedArticles, getArticlesByCategoryFromDb, getCategories } from "@/lib/db/articles";
import Link from "next/link";
import type { Article } from "@/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const latest = await getPublishedArticles(10);
  const mainArticle = latest[0];
  const sidebarArticles = latest.slice(1, 4);
  const trendingArticles = latest.slice(0, 4);

  const [politiqueArticles, techArticles, sportArticles, dbCategories] = await Promise.all([
    getArticlesByCategoryFromDb("politique", 3),
    getArticlesByCategoryFromDb("technologie", 3),
    getArticlesByCategoryFromDb("sport", 3),
    getCategories(),
  ]);

  if (!mainArticle) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-[#0D1B2A] dark:text-white mb-4">
            Bienvenue sur Ligne Rouge
          </h1>
          <p className="text-[#7A7A7A] mb-6">
            Aucun article publié pour le moment. Connectez-vous à{" "}
            <Link href="/admin" className="text-[#C01D35] underline">l&apos;administration</Link>{" "}
            pour publier votre premier article.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroSection main={mainArticle} sidebar={sidebarArticles} />

      {trendingArticles.length > 0 && (
        <section className="py-8 sm:py-10 bg-white dark:bg-[#1a1a2e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-[#DEDBD4] dark:border-[#2a2a3e]">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#0D1B2A] dark:text-white flex items-center gap-2.5">
                <span className="w-[3px] h-5 bg-[#C01D35] rounded-sm block shrink-0" />
                À la une
              </h2>
              <Link
                href="/search"
                className="text-xs font-semibold text-[#7A7A7A] tracking-wider border border-[#DEDBD4] dark:border-[#3a3a4e] px-3 sm:px-3.5 py-1.5 rounded-full hover:text-[#0D1B2A] dark:hover:text-white hover:border-[#0D1B2A] dark:hover:border-white transition-all whitespace-nowrap"
              >
                Tout voir →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {trendingArticles.map((article, i) => (
                <ArticleCard key={article.id} article={article} rank={i + 1} />
              ))}
            </div>
          </div>
        </section>
      )}

      {politiqueArticles.length > 0 && (
        <CategorySection title="Politique" slug="politique" articles={politiqueArticles} />
      )}

      <section className="py-8 sm:py-10 bg-white dark:bg-[#1a1a2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">
            <FinanceWidget />
            <WeatherWidget />
          </div>
        </div>
      </section>

      <NewsletterPreferences />

      {techArticles.length > 0 && (
        <CategorySection title="Technologie" slug="technologie" articles={techArticles} />
      )}

      {sportArticles.length > 0 && (
        <CategorySection title="Sport" slug="sport" articles={sportArticles} />
      )}

      {dbCategories.length > 0 && (
        <section className="py-12 sm:py-16 bg-white dark:bg-[#1a1a2e]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between mb-8 pb-3 border-b-2 border-[#DEDBD4] dark:border-[#2a2a3e]">
              <h2 className="font-serif text-lg sm:text-xl font-bold text-[#0D1B2A] dark:text-white flex items-center gap-2.5">
                <span className="w-[3px] h-5 bg-[#C01D35] rounded-sm block shrink-0" />
                Toutes les rubriques
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {dbCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="p-4 sm:p-6 rounded-lg border border-[#DEDBD4] dark:border-[#2a2a3e] hover:border-[#C01D35] hover:shadow-md transition-all group bg-[#F2F1EE] dark:bg-[#12121e]"
                >
                  <div
                    className="w-8 h-1 rounded mb-4"
                    style={{ backgroundColor: cat.color }}
                  />
                  <h3 className="font-serif font-bold text-[#0D1B2A] dark:text-white group-hover:text-[#C01D35] transition-colors mb-1">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#7A7A7A]">{cat.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function CategorySection({
  title,
  slug,
  articles,
}: {
  title: string;
  slug: string;
  articles: Article[];
}) {
  return (
    <section className="py-8 sm:py-10 bg-[#F2F1EE] dark:bg-[#0f0f1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-[#DEDBD4] dark:border-[#2a2a3e]">
          <h2 className="font-serif text-lg sm:text-xl font-bold text-[#0D1B2A] dark:text-white flex items-center gap-2.5">
            <span className="w-[3px] h-5 bg-[#C01D35] rounded-sm block shrink-0" />
            {title}
          </h2>
          <Link
            href={`/category/${slug}`}
            className="text-xs font-semibold text-[#7A7A7A] tracking-wider border border-[#DEDBD4] dark:border-[#3a3a4e] px-3.5 py-1.5 rounded-full hover:text-[#0D1B2A] dark:hover:text-white hover:border-[#0D1B2A] dark:hover:border-white transition-all"
          >
            Voir tout →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
