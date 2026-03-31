import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsService, NewsArticle, categoryService, Category } from '../lib/services';
import NewsCard from '../components/NewsCard';
import NewsTicker from '../components/NewsTicker';
import { TrendingUp, Clock, ChevronRight, Zap } from 'lucide-react';

export default function Home() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const { category: categorySlug } = useParams<{ category?: string }>();

  useEffect(() => {
    const unsubscribeNews = newsService.subscribe((data) => {
      setNews(data);
      setLoading(false);
    });
    
    categoryService.getAll().then(setCategories);

    return () => {
      unsubscribeNews();
    };
  }, []);

  const filteredNews = categorySlug 
    ? news.filter(n => {
        const cat = categories.find(c => c.slug === categorySlug);
        return n.category === cat?.name;
      })
    : news;

  const breakingNews = news.filter(n => n.isBreaking).map(n => n.title);
  const mainArticle = filteredNews[0];
  const secondaryArticles = filteredNews.slice(1, 4);
  const trendingArticles = news.filter(n => n.isTrending).slice(0, 5);
  const recentArticles = filteredNews.slice(4, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E11D24]"></div>
      </div>
    );
  }

  // If viewing a category page
  if (categorySlug) {
    const currentCategory = categories.find(c => c.slug === categorySlug);
    return (
      <main className="max-w-7xl mx-auto px-4 py-6 font-sans">
        <div className="mb-8 border-b-4 border-[#E11D24] pb-2 inline-block">
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">
            {currentCategory?.name || categorySlug}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-8">
            {mainArticle ? (
              <>
                <NewsCard article={mainArticle} variant="large" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredNews.slice(1).map(article => (
                    <NewsCard key={article.id} article={article} variant="horizontal" />
                  ))}
                </div>
              </>
            ) : (
              <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest">
                No news found in this category.
              </div>
            )}
          </div>
          <aside className="lg:col-span-4">
            <TrendingSidebar articles={trendingArticles} />
          </aside>
        </div>
      </main>
    );
  }

  // Homepage view
  return (
    <main className="max-w-7xl mx-auto px-4 py-6 font-sans">
      <NewsTicker news={breakingNews.length ? breakingNews : ["Welcome to Aaj Tak Clone - Your source for real-time news updates.", "Stay tuned for the latest headlines from across India and the world."]} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        {/* Main Content */}
        <div className="lg:col-span-8 space-y-12">
          {/* Hero Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-[#E11D24] text-white px-2 py-0.5 text-[10px] font-black uppercase italic">Top Stories</div>
            </div>
            {mainArticle && <NewsCard article={mainArticle} variant="large" />}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              {secondaryArticles.map((article) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>
          </section>

          {/* Category Sections (The "Best content from all pages" part) */}
          {categories.map(cat => {
            // "Best content" = Featured articles in this category, or just latest if none featured
            let catNews = news.filter(n => n.category === cat.name);
            const featuredInCat = catNews.filter(n => n.isFeatured);
            
            // If we have featured items, show them first, otherwise show latest
            const displayNews = featuredInCat.length > 0 
              ? [...featuredInCat, ...catNews.filter(n => !n.isFeatured)].slice(0, 3)
              : catNews.slice(0, 3);

            if (displayNews.length === 0) return null;
            return (
              <section key={cat.id} className="border-t border-gray-100 pt-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black uppercase tracking-tighter border-l-4 border-[#E11D24] pl-4">
                    {cat.name}
                  </h2>
                  <Link to={`/category/${cat.slug}`} className="text-xs font-bold uppercase text-[#E11D24] hover:underline flex items-center gap-1">
                    More in {cat.name} <ChevronRight size={14} />
                  </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {displayNews.map(article => (
                    <NewsCard key={article.id} article={article} />
                  ))}
                </div>
              </section>
            );
          })}

          {/* Latest News List */}
          <section className="border-t border-gray-100 pt-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                <Clock size={20} className="text-[#E11D24]" />
                Latest Updates
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentArticles.map((article) => (
                <NewsCard key={article.id} article={article} variant="horizontal" />
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 space-y-8">
          <TrendingSidebar articles={trendingArticles} />

          {/* App Promo */}
          <section className="bg-[#E11D24] text-white p-8 rounded-xl text-center shadow-lg sticky top-24">
            <h3 className="text-2xl font-black uppercase italic mb-4">Aaj Tak App</h3>
            <p className="text-sm opacity-90 mb-6">Get the fastest news updates on your mobile. Download now!</p>
            <div className="flex flex-col gap-3">
              <button className="bg-white text-[#E11D24] font-bold uppercase px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors text-xs">
                App Store
              </button>
              <button className="bg-black text-white font-bold uppercase px-6 py-3 rounded-lg hover:bg-gray-900 transition-colors text-xs border border-white/20">
                Google Play
              </button>
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function TrendingSidebar({ articles }: { articles: NewsArticle[] }) {
  return (
    <section className="bg-gray-50 p-6 rounded-xl border border-gray-100">
      <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2 mb-6">
        <TrendingUp size={20} className="text-[#E11D24]" />
        Trending Now
      </h2>
      <div className="space-y-6">
        {articles.length > 0 ? articles.map((article, i) => (
          <div key={article.id} className="flex gap-4 group">
            <span className="text-3xl font-black text-gray-200 group-hover:text-[#E11D24] transition-colors">0{i + 1}</span>
            <NewsCard article={article} variant="horizontal" />
          </div>
        )) : (
          <p className="text-gray-400 text-sm italic">No trending news at the moment.</p>
        )}
      </div>
    </section>
  );
}
