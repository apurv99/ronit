import React from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { NewsArticle } from '../lib/services';

export interface NewsCardProps {
  article: NewsArticle;
  variant?: 'large' | 'horizontal' | 'small';
  key?: any;
}

export default function NewsCard({ article, variant = 'small' }: NewsCardProps) {
  const timeAgo = article.createdAt?.toDate ? formatDistanceToNow(article.createdAt.toDate(), { addSuffix: true }) : '';

  if (variant === 'large') {
    return (
      <Link to={`/article/${article.id}`} className="group block relative overflow-hidden rounded-lg bg-white shadow-lg">
        <div className="aspect-video overflow-hidden">
          <img 
            src={article.imageUrl || `https://picsum.photos/seed/${article.id}/800/450`} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-[#E11D24] text-white text-[10px] font-bold uppercase px-2 py-0.5 rounded">
              {article.category}
            </span>
            <span className="text-gray-500 text-xs font-medium uppercase tracking-wider">{timeAgo}</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold leading-tight group-hover:text-[#E11D24] transition-colors line-clamp-2">
            {article.title}
          </h2>
          <p className="mt-3 text-gray-600 line-clamp-3 text-sm leading-relaxed">
            {article.summary || article.content.substring(0, 150) + '...'}
          </p>
        </div>
      </Link>
    );
  }

  if (variant === 'horizontal') {
    return (
      <Link to={`/article/${article.id}`} className="group flex gap-4 bg-white p-3 rounded-lg hover:shadow-md transition-shadow">
        <div className="w-32 h-24 shrink-0 overflow-hidden rounded-md">
          <img 
            src={article.imageUrl || `https://picsum.photos/seed/${article.id}/300/200`} 
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="flex flex-col justify-center">
          <span className="text-[#E11D24] text-[10px] font-bold uppercase mb-1">{article.category}</span>
          <h3 className="font-bold text-sm leading-snug group-hover:text-[#E11D24] transition-colors line-clamp-2">
            {article.title}
          </h3>
          <span className="text-gray-400 text-[10px] mt-1 uppercase">{timeAgo}</span>
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/article/${article.id}`} className="group block bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300">
      <div className="aspect-[4/3] overflow-hidden">
        <img 
          src={article.imageUrl || `https://picsum.photos/seed/${article.id}/400/300`} 
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#E11D24] text-[10px] font-bold uppercase">{article.category}</span>
          <span className="text-gray-400 text-[10px] uppercase">• {timeAgo}</span>
        </div>
        <h3 className="font-bold text-base leading-snug group-hover:text-[#E11D24] transition-colors line-clamp-2">
          {article.title}
        </h3>
      </div>
    </Link>
  );
}
