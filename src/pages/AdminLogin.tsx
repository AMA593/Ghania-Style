import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-ghania-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-ghania-200"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="bg-ghania-400 p-4 rounded-2xl mb-4 text-white shadow-lg shadow-ghania-400/30">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Portal</h1>
          <p className="text-slate-500 text-sm text-center mt-2 font-light">
            Sign in with an authorized Google account to manage Ghania Style collections. (Limited to registered admins)
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 break-words">
            {error}
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3.5 px-4 bg-slate-900 text-white rounded-xl font-semibold hover:bg-slate-800 hover:shadow-lg hover:shadow-slate-800/30 transition-all duration-300 disabled:opacity-70 flex justify-center items-center gap-2 tracking-wide"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            'Sign In With Google'
          )}
        </button>

        <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center">
          <button 
            onClick={() => navigate('/')} 
            className="text-sm border border-ghania-200 flex items-center gap-2 text-ghania-400 hover:text-ghania-400 hover:bg-ghania-100 py-1.5 px-4 rounded-full transition-colors"
          >
            <ShoppingBag size={14} /> Kembali ke Toko
          </button>
        </div>
      </motion.div>
    </div>
  );
}
