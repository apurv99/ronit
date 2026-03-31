import React, { useState, useEffect } from 'react';
import { newsService, NewsArticle, categoryService, Category, settingsService, SiteSettings, userService, UserProfile } from '../lib/services';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, Check, X, Image as ImageIcon, LayoutDashboard, FileText, Settings, LogOut, Tags, Users, Save } from 'lucide-react';
import { format } from 'date-fns';
import { doc, setDoc } from 'firebase/firestore';

type Tab = 'news' | 'categories' | 'settings' | 'users';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('news');
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Aaj Tak Clone',
    tickerSpeed: 30,
    contactEmail: 'contact@aajtakclone.com'
  });
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Form States
  const [currentArticle, setCurrentArticle] = useState<Partial<NewsArticle>>({
    title: '',
    content: '',
    summary: '',
    category: 'Politics',
    imageUrl: '',
    isBreaking: false,
    isTrending: false,
    isFeatured: false,
  });
  
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({
    name: '',
    slug: '',
  });

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/admin/login');
      } else {
        // Ensure user document exists for role-based rules
        try {
          await setDoc(doc(db, 'users', user.uid), {
            email: user.email,
            role: user.email === 'apurvhazra99@gmail.com' ? 'admin' : 'editor'
          }, { merge: true });
        } catch (e) {
          console.error("Error syncing user doc", e);
        }
      }
    });

    const unsubscribeNews = newsService.subscribe((data) => {
      setNews(data);
      setLoading(false);
    });

    const unsubscribeCats = categoryService.subscribe((data) => {
      setCategories(data);
    });

    const unsubscribeUsers = userService.subscribe((data) => {
      setUsers(data);
    });

    settingsService.get().then(data => data && setSettings(data));

    return () => {
      unsubscribeAuth();
      unsubscribeNews();
      unsubscribeCats();
      unsubscribeUsers();
    };
  }, [navigate]);

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!currentArticle.title || !currentArticle.content || !currentArticle.category) {
      setError('Please fill in all required fields.');
      return;
    }

    try {
      if (currentArticle.id) {
        await newsService.update(currentArticle.id, currentArticle);
        setSuccess('Article updated successfully!');
      } else {
        await newsService.create(currentArticle as Omit<NewsArticle, 'id' | 'createdAt'>);
        setSuccess('Article created successfully!');
      }
      setIsEditing(false);
      resetNewsForm();
    } catch (err: any) {
      console.error(err);
      setError('Failed to save article. Check your permissions.');
    }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCategory.name || !currentCategory.slug) return;
    try {
      if (currentCategory.id) {
        await categoryService.update(currentCategory.id, currentCategory);
        setSuccess('Category updated!');
      } else {
        await categoryService.create(currentCategory as Category);
        setSuccess('Category added!');
      }
      setCurrentCategory({ name: '', slug: '' });
    } catch (err) {
      setError('Failed to save category.');
    }
  };

  const handleSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await settingsService.update(settings);
      setSuccess('Settings updated!');
    } catch (err) {
      setError('Failed to update settings.');
    }
  };

  const resetNewsForm = () => {
    setCurrentArticle({
      title: '',
      content: '',
      summary: '',
      category: categories[0]?.name || 'Politics',
      imageUrl: '',
      isBreaking: false,
      isTrending: false,
      isFeatured: false,
    });
    setIsEditing(false);
  };

  if (loading) return <div className="p-8 text-center font-bold uppercase tracking-widest text-gray-400">Loading Dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1A1A1A] text-white hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="bg-white text-[#E11D24] font-black text-xl px-2 py-1 rounded italic uppercase tracking-tighter inline-block">
            Aaj Tak
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2">Admin Panel</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('news')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'news' ? 'bg-[#E11D24]' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <FileText size={18} /> News
          </button>
          <button 
            onClick={() => setActiveTab('categories')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'categories' ? 'bg-[#E11D24]' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <Tags size={18} /> Categories
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'users' ? 'bg-[#E11D24]' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <Users size={18} /> Users
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors ${activeTab === 'settings' ? 'bg-[#E11D24]' : 'hover:bg-white/5 text-gray-400'}`}
          >
            <Settings size={18} /> Settings
          </button>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 rounded-lg font-bold text-sm uppercase tracking-wide text-red-400 transition-colors"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <h1 className="text-3xl font-black uppercase italic tracking-tighter">
              {activeTab === 'news' ? (isEditing ? 'Edit Article' : 'News Management') : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            {activeTab === 'news' && !isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="bg-[#E11D24] text-white px-6 py-3 rounded-full font-bold uppercase text-xs flex items-center gap-2 shadow-lg hover:bg-[#C1181E] transition-colors"
              >
                <Plus size={16} /> New Article
              </button>
            )}
          </div>

          {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 border border-red-100 font-bold text-sm">{error}</div>}
          {success && <div className="bg-green-50 text-green-600 p-4 rounded-xl mb-6 border border-green-100 font-bold text-sm">{success}</div>}

          {/* News Tab */}
          {activeTab === 'news' && (
            <>
              {isEditing && (
                <form onSubmit={handleNewsSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 mb-12">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Headline *</label>
                        <input 
                          type="text" 
                          value={currentArticle.title}
                          onChange={(e) => setCurrentArticle({...currentArticle, title: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#E11D24]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Category *</label>
                        <select 
                          value={currentArticle.category}
                          onChange={(e) => setCurrentArticle({...currentArticle, category: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#E11D24]"
                        >
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                          {categories.length === 0 && <option>Politics</option>}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Image URL</label>
                        <input 
                          type="text" 
                          value={currentArticle.imageUrl}
                          onChange={(e) => setCurrentArticle({...currentArticle, imageUrl: e.target.value})}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#E11D24]"
                        />
                      </div>
                      <div className="flex gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={currentArticle.isBreaking} onChange={e => setCurrentArticle({...currentArticle, isBreaking: e.target.checked})} />
                          <span className="text-xs font-bold uppercase">Breaking</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={currentArticle.isTrending} onChange={e => setCurrentArticle({...currentArticle, isTrending: e.target.checked})} />
                          <span className="text-xs font-bold uppercase">Trending</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={currentArticle.isFeatured} onChange={e => setCurrentArticle({...currentArticle, isFeatured: e.target.checked})} />
                          <span className="text-xs font-bold uppercase">Featured</span>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Summary</label>
                        <textarea 
                          value={currentArticle.summary}
                          onChange={(e) => setCurrentArticle({...currentArticle, summary: e.target.value})}
                          rows={3}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#E11D24] resize-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Content *</label>
                        <textarea 
                          value={currentArticle.content}
                          onChange={(e) => setCurrentArticle({...currentArticle, content: e.target.value})}
                          rows={6}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:border-[#E11D24] resize-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-4 mt-8">
                    <button type="button" onClick={resetNewsForm} className="text-xs font-bold uppercase text-gray-400">Cancel</button>
                    <button type="submit" className="bg-[#E11D24] text-white px-8 py-3 rounded-xl font-bold uppercase text-xs">Save Article</button>
                  </div>
                </form>
              )}

              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {news.map(article => (
                    <div key={article.id} className="p-6 flex items-center justify-between hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-gray-100 rounded overflow-hidden">
                          <img src={article.imageUrl || `https://picsum.photos/seed/${article.id}/100/100`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm">{article.title}</h3>
                          <p className="text-[10px] text-gray-400 uppercase">{article.category} • {article.createdAt?.toDate ? format(article.createdAt.toDate(), 'MMM dd') : ''}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setCurrentArticle(article) || setIsEditing(true)} className="p-2 text-gray-400 hover:text-[#E11D24]"><Edit2 size={16} /></button>
                        <button onClick={() => newsService.delete(article.id!)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-8 rounded-2xl shadow-xl">
                <h2 className="text-lg font-bold mb-6 uppercase tracking-tight">Add Category</h2>
                <form onSubmit={handleCategorySubmit} className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Category Name" 
                    value={currentCategory.name}
                    onChange={e => setCurrentCategory({...currentCategory, name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                  />
                  <input 
                    type="text" 
                    placeholder="Slug (e.g. politics)" 
                    value={currentCategory.slug}
                    onChange={e => setCurrentCategory({...currentCategory, slug: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                  />
                  <button type="submit" className="w-full bg-[#E11D24] text-white py-3 rounded-xl font-bold uppercase text-xs">Save Category</button>
                </form>
              </div>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="divide-y divide-gray-100">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-4 flex items-center justify-between">
                      <div>
                        <p className="font-bold">{cat.name}</p>
                        <p className="text-xs text-gray-400">/{cat.slug}</p>
                      </div>
                      <button onClick={() => categoryService.delete(cat.id!)} className="text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-gray-400">
                  <tr>
                    <th className="p-6">Email</th>
                    <th className="p-6">Role</th>
                    <th className="p-6">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {users.map(u => (
                    <tr key={u.uid}>
                      <td className="p-6 text-sm font-medium">{u.email}</td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-6">
                        <select 
                          value={u.role}
                          onChange={(e) => userService.updateRole(u.uid, e.target.value as any)}
                          className="text-xs border rounded p-1"
                        >
                          <option value="editor">Editor</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <form onSubmit={handleSettingsSubmit} className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl">
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Site Name</label>
                  <input 
                    type="text" 
                    value={settings.siteName}
                    onChange={e => setSettings({...settings, siteName: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Ticker Speed (seconds)</label>
                  <input 
                    type="number" 
                    value={settings.tickerSpeed}
                    onChange={e => setSettings({...settings, tickerSpeed: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Contact Email</label>
                  <input 
                    type="email" 
                    value={settings.contactEmail}
                    onChange={e => setSettings({...settings, contactEmail: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                  />
                </div>
                <button type="submit" className="flex items-center gap-2 bg-[#E11D24] text-white px-8 py-3 rounded-xl font-bold uppercase text-xs">
                  <Save size={16} /> Save Settings
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
