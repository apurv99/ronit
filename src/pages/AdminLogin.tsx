import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { LogIn, ShieldAlert } from 'lucide-react';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/admin');
    } catch (err: any) {
      console.error(err);
      setError('Failed to login. Make sure you are an authorized admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-10 text-center">
        <div className="w-20 h-20 bg-[#E11D24] rounded-full flex items-center justify-center text-white mx-auto mb-8 shadow-lg">
          <ShieldAlert size={40} />
        </div>
        <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Admin Portal</h1>
        <p className="text-gray-500 mb-10 text-sm uppercase tracking-widest font-bold">Authorized Access Only</p>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8 text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 rounded-xl hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#E11D24]"></div>
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              Sign in with Google
            </>
          )}
        </button>
        
        <p className="mt-8 text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
          Protected by Firebase Security
        </p>
      </div>
    </div>
  );
}
