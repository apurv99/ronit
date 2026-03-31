import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { newsService, NewsArticle } from '../lib/services';
import { format } from 'date-fns';
import { Share2, Bookmark, MessageSquare, User, Calendar, Tag } from 'lucide-react';

export default function Article() {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      newsService.getById(id).then((data) => {
        setArticle(data || null);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#E11D24]"></div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
        <p className="text-gray-600 mb-8">The news article you are looking for does not exist or has been removed.</p>
        <Link to="/" className="bg-[#E11D24] text-white px-6 py-3 rounded-full font-bold uppercase">Back to Home</Link>
      </div>
    );
  }

  const formattedDate = article.createdAt?.toDate ? format(article.createdAt.toDate(), 'MMMM dd, yyyy • HH:mm') : '';

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 font-sans">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Link to={`/category/${article.category.toLowerCase()}`} className="bg-[#E11D24] text-white text-xs font-bold uppercase px-3 py-1 rounded">
            {article.category}
          </Link>
          {article.isBreaking && (
            <span className="bg-black text-white text-xs font-bold uppercase px-3 py-1 rounded italic">Breaking</span>
          )}
        </div>
        <h1 className="text-3xl md:text-5xl font-black leading-tight mb-6 tracking-tight">
          {article.title}
        </h1>
        
        <div className="flex flex-wrap items-center justify-between gap-4 py-6 border-y border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-[#E11D24]">
              <User size={24} />
            </div>
            <div>
              <p className="font-bold text-sm">{article.author || 'Aaj Tak Clone Team'}</p>
              <p className="text-gray-500 text-xs flex items-center gap-1">
                <Calendar size={12} /> {formattedDate}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors border border-gray-100 text-gray-600">
              <Share2 size={20} />
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors border border-gray-100 text-gray-600">
              <Bookmark size={20} />
            </button>
            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors border border-gray-100 text-gray-600">
              <MessageSquare size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="aspect-video mb-10 overflow-hidden rounded-2xl shadow-2xl">
        <img 
          src={article.imageUrl || `https://picsum.photos/seed/${article.id}/1200/800`} 
          alt={article.title}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="prose prose-lg max-w-none">
        <p className="text-xl font-medium text-gray-700 leading-relaxed mb-8 italic border-l-4 border-[#E11D24] pl-6">
          {article.summary}
        </p>
        <div className="text-gray-800 leading-loose space-y-6 whitespace-pre-wrap">
          {article.content}
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
          <Tag size={16} /> Tags
        </div>
        <div className="flex flex-wrap gap-2">
          {['India', 'News', article.category, 'Latest Updates'].map(tag => (
            <span key={tag} className="bg-gray-100 px-4 py-1.5 rounded-full text-xs font-medium hover:bg-gray-200 cursor-pointer transition-colors">
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}
