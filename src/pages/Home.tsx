import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'motion/react';
import { Search, ExternalLink, Filter, ChevronRight, ChevronLeft, ShoppingBag, X } from 'lucide-react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Product } from '../types';

const CATEGORIES = ["All", "Hijab", "Abaya", "Atasan", "Tas", "Aksesoris", "More"];

const SLIDES = [
  {
    image: "/abaya-1.jpg",
    title: "Timeless Elegance",
    subtitle: "Discover our premium curated collection."
  },
  {
    image: "/abaya-2.jpg",
    title: "Premium Abaya",
    subtitle: "Flowy, elegant, and perfectly styled."
  },
  {
    image: "/abaya-3.jpg",
    title: "Instant Grace",
    subtitle: "Effortless beauty for every moment."
  }
];

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95, filter: "blur(5px)" },
  show: { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", transition: { type: "spring", stiffness: 70, damping: 20 } }
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const yHeroText = useTransform(scrollYProgress, [0, 1], [0, 250]);
  const opacityHeroText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const yHeroImage = useTransform(scrollYProgress, [0, 1], [0, 150]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let q = collection(db, 'products');
      if (category !== "All") {
        q = query(q, where("category", "==", category));
      }
      
      const querySnapshot = await getDocs(q);
      let data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      
      if (search) {
        const s = search.toLowerCase();
        data = data.filter(p => p.name.toLowerCase().includes(s) || p.description.toLowerCase().includes(s));
      }
      // sort by createdAt desc in memory for simplicity over composite index
      data.sort((a, b) => ((b.createdAt as any)?.toMillis?.() || 0) - ((a.createdAt as any)?.toMillis?.() || 0));
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [category]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % SLIDES.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + SLIDES.length) % SLIDES.length);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { duration: 0.8 } }} exit={{ opacity: 0 }} className="flex flex-col gap-12 pb-16">
      {/* Hero Image Slider */}
      <section ref={heroRef} className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-slate-950 group perspective-1000">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1.2, ease: [0.22, 1, 0.36, 1] } }}
            transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
            className="absolute inset-0"
          >
            <motion.div style={{ y: yHeroImage }} className="absolute inset-0 w-full h-full">
              <div className="absolute inset-0 bg-slate-900/40 mix-blend-multiply z-10" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/20 to-transparent z-10 opacity-90" />
              <motion.img 
                initial={{ scale: 1.15 }}
                animate={{ scale: 1 }}
                transition={{ duration: 10, ease: "linear" }}
                src={SLIDES[currentSlide].image} 
                alt="Slide background" 
                className="w-full h-full object-cover object-top filter brightness-[0.85] contrast-110"
              />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* POINTER-EVENTS-NONE is added here so this overlay doesn't block slider buttons! */}
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          <motion.div 
            style={{ y: yHeroText, opacity: opacityHeroText }}
            className="pointer-events-auto"
            initial="hidden" animate="show"
            key={`text-${currentSlide}`}
            variants={{
              hidden: { opacity: 0 },
              show: { opacity: 1, transition: { staggerChildren: 0.15, delayChildren: 0.3 } }
            }}
          >
            <motion.div variants={{ hidden: { opacity: 0, y: 30, filter: "blur(10px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}>
              <h1 className="text-6xl md:text-8xl font-extrabold text-white mb-6 drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] tracking-tighter">
                {SLIDES[currentSlide].title}
              </h1>
            </motion.div>
            <motion.div variants={{ hidden: { opacity: 0, y: 30, filter: "blur(10px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}>
              <p className="text-xl md:text-2xl text-ghania-100 max-w-2xl font-light mx-auto tracking-widest drop-shadow-md">
                {SLIDES[currentSlide].subtitle}
              </p>
            </motion.div>
            <motion.div
              variants={{ hidden: { opacity: 0, y: 40, scale: 0.9 }, show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } } }}

              className="mt-10"
            >
               <a href="#kategori" className="px-10 py-4 bg-white/90 backdrop-blur text-slate-900 rounded-full font-medium shadow-2xl hover:bg-white hover:scale-105 active:scale-95 transition-all duration-300 inline-flex items-center gap-2 group/btn border border-white/40">
                 Explore Collection <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
               </a>
            </motion.div>
          </motion.div>
        </div>

        {/* Vertical Social Line */}
        <div className="absolute left-6 md:left-12 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-8 mix-blend-difference pointer-events-auto">
           <span className="text-white text-xs tracking-[0.3em] font-light rotate-180" style={{ writingMode: 'vertical-rl' }}>SCROLL TO EXPLORE</span>
           <div className="w-px h-24 bg-white/30 relative overflow-hidden">
             <motion.div 
               className="absolute top-0 left-0 w-full h-1/2 bg-white"
               animate={{ y: ["-100%", "200%"] }}
               transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity }}
             />
           </div>
        </div>

        {/* Slider Controls */}
        <div className="absolute right-6 md:right-12 bottom-12 z-30 flex gap-4 pointer-events-auto">
          <button onClick={prevSlide} className="p-4 border border-white/20 text-white rounded-full hover:bg-white hover:text-slate-900 transition-all duration-500 backdrop-blur-sm group overflow-hidden relative">
            <span className="absolute inset-0 bg-white scale-0 rounded-full group-hover:scale-110 transition-transform duration-500 ease-[0.22,1,0.36,1] z-0"></span>
            <ChevronLeft size={24} className="relative z-10" />
          </button>
          <button onClick={nextSlide} className="p-4 border border-white/20 text-white rounded-full hover:bg-white hover:text-slate-900 transition-all duration-500 backdrop-blur-sm group overflow-hidden relative">
             <span className="absolute inset-0 bg-white scale-0 rounded-full group-hover:scale-110 transition-transform duration-500 ease-[0.22,1,0.36,1] z-0"></span>
            <ChevronRight size={24} className="relative z-10" />
          </button>
        </div>

        {/* Progress Dots */}
        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex gap-3 pointer-events-none">
          {SLIDES.map((_, i) => (
            <div key={i} className="relative flex items-center justify-center p-2 cursor-pointer pointer-events-auto" onClick={() => setCurrentSlide(i)}>
              <div className={`h-1.5 rounded-full transition-all duration-700 ease-[0.22,1,0.36,1] ${i === currentSlide ? 'bg-white w-12' : 'bg-white/30 w-4 hover:bg-white/60'}`} />
              {i === currentSlide && (
                 <motion.div 
                    layoutId="activeSlideIndicator"
                    className="absolute inset-0 border border-white/50 rounded-full"
                    transition={{ type: "spring", stiffness: 60, damping: 15 }}
                 />
              )}
            </div>
          ))}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative" id="kategori">
        {/* Search & Filter Bar */}
        <motion.div 
          initial={{ y: 80, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white/80 backdrop-blur-xl p-3 md:p-4 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/60 flex flex-col md:flex-row gap-5 items-center justify-between mb-16 mt-[-80px] relative z-40 mx-4 lg:mx-0"
        >
          <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 flex-shrink-0 group">
            <div className="absolute inset-0 bg-gradient-to-r from-ghania-200 to-ghania-100 rounded-2xl blur opacity-0 group-focus-within:opacity-50 transition-opacity duration-500"></div>
            <input 
              type="text" 
              placeholder="Discover your style..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="relative w-full pl-12 pr-4 py-3.5 bg-slate-50/80 rounded-2xl border border-slate-200/60 focus:bg-white focus:border-ghania-300 focus:ring-0 outline-none transition-all placeholder:text-slate-400 text-slate-800 font-medium tracking-wide shadow-sm"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-ghania-400 transition-colors duration-300" size={20} />
            <button type="submit" className="hidden" />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto w-full pb-2 md:pb-0 hide-scrollbar sm:flex-nowrap px-2">
            <div className="bg-slate-100 p-2 rounded-xl mr-2">
               <Filter size={18} className="text-slate-500 flex-shrink-0" />
            </div>
            {CATEGORIES.map(c => (
              <button 
                key={c}
                onClick={() => setCategory(c)}
                className={`relative px-5 py-2.5 rounded-full whitespace-nowrap text-sm font-bold tracking-widest uppercase transition-all duration-500 overflow-hidden group flex-shrink-0 border ${
                  category === c 
                    ? 'border-transparent text-white' 
                    : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span className="relative z-10">{c}</span>
                {category === c && (
                  <motion.div
                     layoutId="activeCategoryPill"
                     className="absolute inset-0 bg-slate-900 rounded-full z-0 shadow-lg shadow-slate-900/20 mix-blend-multiply"
                     initial={false}
                     transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Product Grid Header */}
        <div className="mb-10 mt-4">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center text-center mb-16 relative"
          >
            <div className="absolute bg-ghania-400/5 w-64 h-64 rounded-full blur-3xl -top-10 -z-10"></div>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-slate-900 mb-6 tracking-tight drop-shadow-sm">
              {category === "All" ? "LATEST ARRIVALS" : category.toUpperCase()}
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-ghania-200 via-ghania-400 to-ghania-200 rounded-full mb-8 shadow-sm"></div>
            <p className="text-slate-500 max-w-2xl text-lg font-light tracking-wide">
              Elevate your daily wear with our meticulously curated selection. Where high-quality materials meet timeless, elegant designs.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center items-center py-40">
              <div className="relative">
                 <div className="animate-spin rounded-full h-16 w-16 border-4 border-slate-100 border-t-ghania-400"></div>
                 <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 bg-ghania-400/20"></div>
              </div>
            </div>
          ) : products.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="text-center py-32 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-dashed border-slate-300/60 shadow-[inset_0_0_100px_rgba(255,255,255,0.5)]"
            >
              <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-100">
                <ShoppingBag className="h-10 w-10 text-slate-300" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">No items found</h3>
              <p className="text-slate-500 text-lg font-light tracking-wide">Try adjusting your filters or search term.</p>
            </motion.div>
          ) : (
            <motion.div 
              className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-1 md:gap-8 mx-[-16px] md:mx-0 px-4 md:px-0"
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "100px" }}
            >
              {products.map(product => (
                <motion.div 
                  key={product.id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }}
                  onClick={() => setSelectedProduct(product)}
                  className="bg-white md:rounded-3xl overflow-hidden shadow-[inset_0_0_0_1px_rgba(0,0,0,0.03)] md:shadow-lg md:shadow-slate-200/40 hover:shadow-2xl hover:shadow-slate-300/60 transition-all duration-500 md:border border-white group flex flex-col cursor-pointer relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 z-10 pointer-events-none transition-opacity duration-500"></div>
                  
                  <div className="relative aspect-square md:aspect-[4/5] overflow-hidden bg-slate-50">
                    <img 
                      src={product.imageUrl || "https://images.unsplash.com/photo-1590499648937-236b281b37df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"} 
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-[0.22,1,0.36,1]"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1590499648937-236b281b37df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80' }}
                    />
                    <div className="hidden md:block absolute top-5 left-5 bg-white/90 backdrop-blur-md px-5 py-2 rounded-full text-[10px] font-black tracking-[0.2em] uppercase text-slate-800 shadow-xl border border-white/50 z-20 overflow-hidden group/badge">
                      <span className="relative z-10">{product.category}</span>
                      <div className="absolute inset-0 bg-ghania-100 scale-x-0 origin-left group-hover/badge:scale-x-100 transition-transform duration-300 ease-out z-0"></div>
                    </div>
                    {/* Dark gradient overlay on hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-slate-900/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out pointer-events-none z-10" />
                  </div>
                  
                  <div className="hidden md:flex p-7 flex-col flex-grow relative bg-white z-20">
                    <h3 className="font-bold text-slate-900 text-xl mb-3 line-clamp-1 group-hover:text-ghania-400 transition-colors duration-300">{product.name}</h3>
                    <p className="text-slate-500 text-sm mb-8 line-clamp-2 font-light flex-grow leading-relaxed">{product.description}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100/80">
                      <span className="font-extrabold text-slate-900 text-xl tracking-tight">
                        <span className="text-sm text-slate-400 font-medium mr-1">Rp</span>
                        {product.price.toLocaleString('id-ID')}
                      </span>
                      <span className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 text-slate-900 group-hover:bg-ghania-400 group-hover:text-white transition-colors duration-300 shadow-sm group-hover:shadow-lg group-hover:shadow-ghania-400/40">
                         <ChevronRight size={18} className="translate-x-0 group-hover:translate-x-0.5 transition-transform duration-300"/>
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Elegant Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.4, delay: 0.1 } }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-xl"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20, rotateX: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 30, duration: 0.6 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-white/20 relative flex flex-col max-h-[95vh] sm:max-h-[90vh]"
            >
              <button 
                className="absolute top-5 right-5 z-30 bg-white/20 hover:bg-white/90 text-white hover:text-slate-900 backdrop-blur-md rounded-full p-3 transition-all duration-300 shadow-lg" 
                onClick={() => setSelectedProduct(null)}
              >
                <X size={20} />
              </button>
              
              <div className="relative aspect-[4/3] w-full bg-slate-100 shrink-0 overflow-hidden perspective-1000">
                <motion.img 
                  initial={{ scale: 1.2, filter: "blur(10px)" }}
                  animate={{ scale: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  src={selectedProduct.imageUrl || "https://images.unsplash.com/photo-1590499648937-236b281b37df?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"} 
                  className="w-full h-full object-cover" 
                  alt={selectedProduct.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="absolute bottom-6 left-6 z-20"
                >
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-black tracking-[0.2em] uppercase px-4 py-1.5 rounded-full shadow-lg">
                    {selectedProduct.category}
                  </div>
                </motion.div>
              </div>
              
              <div className="p-8 overflow-y-auto bg-white relative z-20 rounded-t-3xl -mt-6">
                <motion.h3 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                  className="font-extrabold text-slate-900 text-3xl mb-4 tracking-tight leading-tight"
                >
                  {selectedProduct.name}
                </motion.h3>
                
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                  className="text-slate-500 text-base mb-8 leading-relaxed font-light"
                >
                  {selectedProduct.description}
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                  className="flex items-center justify-between pt-6 border-t border-slate-100"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Price</span>
                    <span className="font-black text-slate-900 text-3xl tracking-tighter">
                      Rp {selectedProduct.price.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <a 
                    href={selectedProduct.affiliateLink} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="relative overflow-hidden flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl text-base font-semibold transition-all duration-300 shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] hover:shadow-[0_15px_30px_-10px_rgba(116,105,182,0.6)] group hover:-translate-y-1 active:translate-y-0"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-ghania-400 to-ghania-300 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
                    <span className="relative z-10 tracking-wide uppercase">Shop Now</span> 
                    <ExternalLink size={18} className="relative z-10 group-hover:rotate-12 transition-transform duration-300" />
                  </a>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
