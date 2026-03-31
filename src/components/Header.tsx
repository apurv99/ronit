import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, Menu, X, User, LogOut } from 'lucide-react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { categoryService, Category, settingsService, SiteSettings } from '../lib/services';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(auth.currentUser);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Aaj Tak Clone',
    tickerSpeed: 30,
    contactEmail: 'contact@aajtakclone.com'
  });
  const location = useLocation();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    const unsubscribeCats = categoryService.subscribe((data) => {
      setCategories(data);
    });

    settingsService.get().then(data => data && setSettings(data));

    return () => {
      unsubscribeAuth();
      unsubscribeCats();
    };
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const navItems = [
    { name: 'Home', path: '/' },
    ...categories.map(cat => ({ name: cat.name, path: `/category/${cat.slug}` }))
  ];

  return (
    <header className="bg-[#E11D24] text-white sticky top-0 z-50 shadow-md font-sans">
      <div className="max-w-7xl mx-auto px-4">
        {/* Top Bar */}
        <div className="flex items-center justify-between h-16 border-b border-white/10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-white text-[#E11D24] font-black text-2xl px-2 py-1 rounded italic uppercase tracking-tighter">
                {settings.siteName === 'Aaj Tak Clone' ? 'Aaj Tak' : settings.siteName}
              </div>
              <span className="hidden sm:inline font-bold text-sm uppercase tracking-widest opacity-80">
                {settings.siteName === 'Aaj Tak Clone' ? 'Clone' : ''}
              </span>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-8 text-sm font-bold uppercase tracking-wide">
            {navItems.map((cat) => (
              <Link 
                key={cat.path} 
                to={cat.path}
                className={cn(
                  "hover:text-white/80 transition-colors relative py-5",
                  location.pathname === cat.path && "after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-white"
                )}
              >
                {cat.name}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Search size={20} />
            </button>
            {user ? (
              <div className="flex items-center gap-3">
                <Link to="/admin" className="hidden sm:flex items-center gap-2 text-xs font-bold uppercase bg-white/10 px-3 py-1.5 rounded-full hover:bg-white/20 transition-colors">
                  <User size={14} />
                  Admin
                </Link>
                <button 
                  onClick={handleLogout}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/admin/login" className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <User size={20} />
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-[#E11D24] border-t border-white/10">
          <div className="px-4 py-4 flex flex-col gap-4 font-bold uppercase text-sm">
            {categories.map((cat) => (
              <Link 
                key={cat.path} 
                to={cat.path}
                onClick={() => setIsMenuOpen(false)}
                className="hover:bg-white/10 p-2 rounded transition-colors"
              >
                {cat.name}
              </Link>
            ))}
            {user && (
              <Link 
                to="/admin" 
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 hover:bg-white/10 p-2 rounded transition-colors"
              >
                <User size={16} />
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
