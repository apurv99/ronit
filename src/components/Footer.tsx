import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { categoryService, Category, settingsService, SiteSettings } from '../lib/services';

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<SiteSettings>({
    siteName: 'Aaj Tak Clone',
    tickerSpeed: 30,
    contactEmail: 'contact@aajtakclone.com'
  });

  useEffect(() => {
    categoryService.getAll().then(setCategories);
    settingsService.get().then(data => data && setSettings(data));
  }, []);

  return (
    <footer className="bg-[#1A1A1A] text-white py-12 font-sans mt-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-white/10 pb-12">
          <div className="col-span-1 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="bg-white text-[#E11D24] font-black text-2xl px-2 py-1 rounded italic uppercase tracking-tighter">
                {settings.siteName === 'Aaj Tak Clone' ? 'Aaj Tak' : settings.siteName}
              </div>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              {settings.siteName}'s most trusted news channel, bringing you the latest news, breaking news, and in-depth analysis from across the globe.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold uppercase text-sm mb-6 tracking-widest text-[#E11D24]">Categories</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {categories.map(cat => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="hover:text-white transition-colors">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase text-sm mb-6 tracking-widest text-[#E11D24]">Support</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link to="#" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="#" className="hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase text-sm mb-6 tracking-widest text-[#E11D24]">Newsletter</h4>
            <p className="text-gray-400 text-sm mb-4">Get daily news updates directly in your inbox.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-white/5 border border-white/10 rounded px-3 py-2 text-sm w-full focus:outline-none focus:border-[#E11D24]"
              />
              <button className="bg-[#E11D24] text-white px-4 py-2 rounded text-sm font-bold uppercase hover:bg-[#C1181E] transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>
        
        <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500 uppercase tracking-widest">
          <p>© 2026 {settings.siteName}. All Rights Reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-white transition-colors">Facebook</Link>
            <Link to="#" className="hover:text-white transition-colors">Twitter</Link>
            <Link to="#" className="hover:text-white transition-colors">Instagram</Link>
            <Link to="#" className="hover:text-white transition-colors">YouTube</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
