import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, LogOut, Image as ImageIcon, Link as LinkIcon, DollarSign, Tag, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db, storage } from '../lib/firebase';
import type { Product } from '../types';

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Hijab',
    imageUrl: '',
    affiliateLink: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const adminEmails = ['ahmadmaiyah35@gmail.com', 'admin2@gmail.com'];
        if (user.email && adminEmails.includes(user.email)) {
          fetchProducts();
        } else {
          // If not an admin, sign out immediately
          signOut(auth).then(() => {
             alert('Akses Ditolak: Email tidak terdaftar sebagai admin.');
             navigate('/admin/login');
          });
        }
      } else {
        navigate('/admin/login');
      }
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const qs = await getDocs(collection(db, 'products'));
      const data = qs.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      data.sort((a, b) => ((b.createdAt as any)?.toMillis?.() || 0) - ((a.createdAt as any)?.toMillis?.() || 0));
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category: product.category,
        imageUrl: product.imageUrl,
        affiliateLink: product.affiliateLink
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Hijab',
        imageUrl: '',
        affiliateLink: ''
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setFormData(prev => ({
        ...prev,
        imageUrl: URL.createObjectURL(file) // temporary preview URL
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let finalImageUrl = formData.imageUrl;
      
      // Upload image to Firebase Storage if a new file is selected
      if (imageFile) {
        const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
        const snapshot = await uploadBytes(storageRef, imageFile);
        finalImageUrl = await getDownloadURL(snapshot.ref);
      }

      const payload = {
        ...formData,
        imageUrl: finalImageUrl,
        price: parseFloat(formData.price)
      };

      if (editingProduct) {
        const productRef = doc(db, 'products', editingProduct.id.toString());
        await updateDoc(productRef, {
          ...payload,
          updatedAt: serverTimestamp()
        });
      } else {
        const newProductRef = doc(collection(db, 'products'));
        await setDoc(newProductRef, {
          ...payload,
          createdAt: serverTimestamp()
        });
      }
      
      setIsModalOpen(false);
      setImageFile(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan. Pastikan aturan Storage dan Firestore Firebase anda mengizinkan operasi ini.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string | number) => {
    if (!confirm('Apakah anda yakin ingin menghapus produk ini?')) return;
    
    try {
      await deleteDoc(doc(db, 'products', id.toString()));
      fetchProducts();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus produk.');
    }
  };

  if (authChecking) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ghania-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fdfafb] font-sans">
      <nav className="bg-white/80 backdrop-blur-md border-b border-rose-100 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <div className="bg-slate-900 text-white p-2 rounded-xl shadow-lg">
                <Tag size={20} />
              </div>
              <span className="font-bold text-xl text-slate-800 tracking-tight">Admin Portal</span>
            </div>
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate('/')} 
                className="text-sm font-medium text-slate-500 hover:text-rose-600 transition-colors"
              >
                View Store
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-sm text-slate-600 bg-slate-100 hover:bg-rose-50 hover:text-rose-600 px-4 py-2 rounded-full transition-all"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-10">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Product Management</h1>
            <p className="text-slate-500 text-sm mt-1 font-light">Add, edit, or remove products from Ghania Style.</p>
          </div>
          <button 
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-slate-900 hover:bg-rose-500 text-white px-6 py-3 rounded-xl font-medium shadow-xl hover:shadow-rose-500/30 hover:-translate-y-0.5 transition-all duration-300"
          >
            <Plus size={18} /> New Product
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-ghania-400"></div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-gray-600">
                    <th className="p-4 font-semibold text-sm">Produk</th>
                    <th className="p-4 font-semibold text-sm">Harga</th>
                    <th className="p-4 font-semibold text-sm">Kategori</th>
                    <th className="p-4 font-semibold text-sm">Link</th>
                    <th className="p-4 font-semibold text-sm text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-gray-500">
                        Belum ada produk. Tambahkan produk pertama Anda.
                      </td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
                              <img 
                                src={product.imageUrl || "https://images.unsplash.com/photo-1590499648937-236b281b37df?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80"} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590499648937-236b281b37df?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80' }}
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{product.name}</div>
                              <div className="text-xs text-gray-500 line-clamp-1 max-w-[200px]">{product.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 font-medium text-gray-800">
                          Rp {product.price.toLocaleString('id-ID')}
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-ghania-100 text-ghania-400">
                            {product.category}
                          </span>
                        </td>
                        <td className="p-4">
                          <a href={product.affiliateLink} target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:text-pink-800 flex items-center gap-1 text-sm bg-pink-50 w-max px-2 py-1 rounded">
                            <LinkIcon size={14} /> Kunjungi
                          </a>
                        </td>
                        <td className="p-4 text-right space-x-2">
                          <button 
                            onClick={() => openModal(product)}
                            className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors inline-block"
                            title="Edit"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(product.id)}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors inline-block"
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center z-10">
                <h3 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Ubah Produk' : 'Tambah Produk Baru'}
                </h3>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ghania-300 focus:border-ghania-400 outline-none transition-shadow"
                    placeholder="Contoh: Hijab Pashmina Plisket"
                  />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                    <select 
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ghania-300 focus:border-ghania-400 outline-none transition-shadow"
                    >
                      <option value="Hijab">Hijab</option>
                      <option value="Abaya">Abaya</option>
                      <option value="Tas">Tas</option>
                      <option value="Atasan">Atasan</option>
                      <option value="Aksesoris">Aksesoris</option>
                      <option value="More">More</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={16} className="text-gray-400" />
                      </div>
                      <input 
                        type="number" 
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ghania-300 focus:border-ghania-400 outline-none transition-shadow"
                        placeholder="35000"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Link Shopee Affiliate</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LinkIcon size={16} className="text-gray-400" />
                    </div>
                    <input 
                      type="url" 
                      required
                      value={formData.affiliateLink}
                      onChange={(e) => setFormData({...formData, affiliateLink: e.target.value})}
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ghania-300 focus:border-ghania-400 outline-none transition-shadow"
                      placeholder="https://shope.ee/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Cover Foto</label>
                  <label className="relative flex cursor-pointer items-center justify-center w-full px-4 py-8 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-ghania-400 transition-colors">
                    <div className="flex flex-col items-center">
                      <ImageIcon size={32} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">Pilih dari galeri/file manager</span>
                    </div>
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </label>

                  {formData.imageUrl && (
                    <div className="mt-3 relative inline-block">
                      <p className="text-xs text-gray-500 mb-1">Preview Foto:</p>
                      <img src={formData.imageUrl} alt="Preview" className="h-32 w-32 object-cover rounded-lg border border-gray-200" onError={(e) => (e.target as HTMLImageElement).src='https://via.placeholder.com/150?text=Error'} />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
                  <textarea 
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-ghania-300 focus:border-ghania-400 outline-none transition-shadow resize-none"
                    placeholder="Jelaskan detail bahan, ukuran, dll..."
                  />
                </div>

                <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-gray-700 font-medium hover:bg-gray-100 rounded-xl transition-colors"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex justify-center items-center min-w-[150px] px-6 py-2.5 bg-ghania-400 text-white font-medium rounded-xl hover:bg-ghania-300 focus:ring-4 focus:ring-ghania-400/30 transition-all shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      editingProduct ? 'Simpan Perubahan' : 'Tambah Produk'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
