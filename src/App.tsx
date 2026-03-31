import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Article from './pages/Article';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import { useEffect } from 'react';
import { testConnection } from './lib/services';

export default function App() {
  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-white">
        <Routes>
          {/* Admin routes without main header/footer */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          
          {/* Public routes with main header/footer */}
          <Route
            path="*"
            element={
              <>
                <Header />
                <div className="flex-1">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/article/:id" element={<Article />} />
                    <Route path="/category/:category" element={<Home />} />
                  </Routes>
                </div>
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}
