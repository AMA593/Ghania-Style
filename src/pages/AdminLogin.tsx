import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShoppingBag } from 'lucide-react';
import { motion } from 'motion/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await signInWithEmailAndPassword(auth, email, password);
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
            Sign in with an authorized account to manage Ghania Style collections.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 break-words">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-ghania-200 outline-none focus:border-ghania-400 focus:ring-2 focus:ring-ghania-200 transition-all font-mono text-ghania-400"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-ghania-200 outline-none focus:border-ghania-400 focus:ring-2 focus:ring-ghania-200 transition-all font-mono tracking-widest text-ghania-400"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-ghania-400 text-white rounded-xl font-semibold hover:bg-ghania-300 hover:shadow-lg hover:shadow-ghania-300/30 transition-all duration-300 disabled:opacity-70 flex justify-center items-center gap-2 tracking-wide"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              'Masuk Dashboard'
            )}
          </button>
        </form>

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
