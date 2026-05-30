import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Instagram, Facebook, Twitter, Package, MapPin, Menu, X, ArrowUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const NavItem = ({ href, section, activeSection, onClick, children }: { href: string, section: string, activeSection: string, onClick: () => void, children: React.ReactNode }) => {
  const isActive = activeSection === section;
  const isLink = href.startsWith('/');
  const [isHovered, setIsHovered] = useState(false);

  const content = (
    <div 
      className="relative px-5 py-2.5 flex items-center justify-center overflow-hidden rounded-full group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <span className={`relative z-10 text-xs font-bold tracking-[0.15em] transition-all duration-500 ${isActive ? 'text-ghania-400' : 'text-slate-500 group-hover:text-ghania-400'}`}>
        {children}
      </span>
      
      {/* Active State Indicator (Glides magically) */}
      {isActive && (
        <motion.div
          layoutId="navBackground"
          className="absolute inset-0 bg-ghania-100/60 backdrop-blur-md shadow-[0_4px_15px_-3px_rgba(116,105,182,0.15)] border border-white/80 rounded-full z-0"
          initial={false}
          transition={{ type: "spring", bounce: 0.25, duration: 0.6 }}
        />
      )}

      {/* Glowing Dot that moves with the active tab */}
      {isActive && (
         <motion.div 
           layoutId="navDot"
           className="absolute bottom-1 w-1.5 h-1.5 bg-gradient-to-r from-ghania-300 to-ghania-400 rounded-full z-10 shadow-[0_0_8px_rgba(116,105,182,0.8)]"
           initial={false}
           transition={{ type: "spring", bounce: 0.25, duration: 0.6, delay: 0.05 }}
         />
      )}

      {/* Elegant Hover State Indicator */}
      <AnimatePresence>
        {isHovered && !isActive && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-slate-50 rounded-full z-0"
          />
        )}
      </AnimatePresence>
    </div>
  );

  return isLink ? <Link to={href}>{content}</Link> : <a href={href}>{content}</a>;
};

export default function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);

      const kategoriEl = document.getElementById('kategori');
      const kontakEl = document.getElementById('kontak');

      const scrollPos = window.scrollY + 150; // offset for header

      if (kontakEl && scrollPos >= kontakEl.offsetTop) {
        setActiveSection('kontak');
      } else if (kategoriEl && scrollPos >= kategoriEl.offsetTop) {
        setActiveSection('kategori');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeMenu = () => setIsMenuOpen(false);

  const mobileNavLinkClass = (section: string) => 
    `block text-lg font-medium tracking-wide transition-colors py-3 ${
      activeSection === section 
        ? 'text-ghania-400' 
        : 'text-slate-500 hover:text-ghania-400'
    }`;

  return (
    <div className="min-h-screen flex flex-col font-sans bg-ghania-100 text-slate-800">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-ghania-200/50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between h-[72px] items-center">
            <Link to="/admin" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-ghania-300 to-ghania-400 text-white p-2.5 rounded-xl group-hover:rotate-12 transition-all duration-300 shadow-md shadow-ghania-300/40">
                <ShoppingBag size={22} />
              </div>
              <span className="font-bold text-2xl tracking-tight text-slate-800">
                Ghania<span className="text-ghania-400 font-light">Style</span>
              </span>
            </Link>
            <nav className="hidden md:flex gap-2">
              <NavItem href="/" section="home" activeSection={activeSection} onClick={() => { scrollToTop(); closeMenu(); }}>HOME</NavItem>
              <NavItem href="#kategori" section="kategori" activeSection={activeSection} onClick={closeMenu}>COLLECTION</NavItem>
              <NavItem href="#kontak" section="kontak" activeSection={activeSection} onClick={closeMenu}>CONTACT</NavItem>
            </nav>
            <div className="md:hidden flex items-center">
              <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 text-slate-800 hover:text-ghania-400 transition-colors">
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
            <div className="hidden md:block w-20"></div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden overflow-hidden bg-white border-t border-ghania-200/50 shadow-lg"
            >
              <div className="px-6 py-6 flex flex-col space-y-2 text-center h-screen">
                <Link to="/" onClick={() => { scrollToTop(); closeMenu(); }} className={mobileNavLinkClass('home')}>HOME</Link>
                <a href="#kategori" onClick={closeMenu} className={mobileNavLinkClass('kategori')}>COLLECTION</a>
                <a href="#kontak" onClick={closeMenu} className={mobileNavLinkClass('kontak')}>CONTACT</a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-grow w-full overflow-hidden">
        <Outlet />
      </main>

      <footer id="kontak" className="bg-slate-900 text-slate-300 py-24 mt-20 border-t-[8px] border-ghania-400 relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-ghania-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-ghania-300/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Brand Info */}
            <div className="md:col-span-4 space-y-8 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-4">
                <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-sm">
                  <ShoppingBag size={32} className="text-ghania-300" />
                </div>
                <span className="font-bold text-4xl text-white tracking-tight">Ghania<span className="font-light text-ghania-300">Style</span></span>
              </div>
              <p className="text-slate-400 text-base leading-relaxed max-w-sm mx-auto md:mx-0 font-light">
                Curating timeless elegance for the modern woman. Discover our premium hijab collections through our curated selections. Elevate your everyday style.
              </p>
              
              <div className="space-y-4">
                <div className="text-sm font-light flex items-center justify-center md:justify-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center">
                     <MapPin size={16} className="text-ghania-300" />
                  </div>
                  <span>Jakarta, Indonesia</span>
                </div>
              </div>
            </div>
            
            {/* Direct Message (WhatsApp) */}
            <div className="md:col-span-4 space-y-6">
              <h3 className="font-semibold tracking-wider text-sm uppercase text-slate-100 flex items-center gap-2 justify-center md:justify-start">
                <span className="w-8 h-px bg-ghania-400"></span> Reach Out to Us
              </h3>
              <p className="text-slate-400 text-sm font-light text-center md:text-left">
                Have a question or need assistance? Send us a direct message on WhatsApp.
              </p>
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const message = (e.currentTarget.elements.namedItem('message') as HTMLTextAreaElement).value;
                  window.open(`https://wa.me/6281234567890?text=${encodeURIComponent(message)}`, '_blank');
                  (e.currentTarget as HTMLFormElement).reset();
                }}
                className="space-y-4"
              >
                <textarea 
                  name="message"
                  required
                  rows={3}
                  placeholder="Hi, I would like to ask about..."
                  className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-ghania-400 focus:border-transparent transition-all resize-none"
                ></textarea>
                <button 
                  type="submit"
                  className="w-full bg-ghania-400 hover:bg-ghania-300 text-white font-medium py-3 px-6 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(116,105,182,0.3)] hover:shadow-[0_0_30px_rgba(116,105,182,0.5)] active:scale-[0.98]"
                >
                  Send to WhatsApp
                </button>
              </form>
            </div>
            
            {/* Social & Connect */}
            <div className="md:col-span-4 space-y-8 flex flex-col items-center md:items-start pl-0 md:pl-8 lg:pl-16">
               <div className="w-full">
                  <h3 className="font-semibold tracking-wider text-sm uppercase text-slate-100 flex items-center gap-2 justify-center md:justify-start mb-6">
                    <span className="w-8 h-px bg-ghania-400"></span> Follow Us
                  </h3>
                  <div className="flex justify-center md:justify-start gap-4">
                    <a href="#" className="group relative p-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl hover:bg-gradient-to-tr hover:from-purple-600 hover:to-pink-500 hover:text-white transition-all duration-500 transform hover:-translate-y-2 hover:rotate-3 hover:shadow-[0_10px_20px_rgba(219,39,119,0.3)]">
                      <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md scale-0 group-hover:scale-100 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
                      <Instagram size={24} className="relative z-10" />
                    </a>
                    <a href="#" className="group relative p-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl hover:bg-gradient-to-tr hover:from-blue-600 hover:to-blue-400 hover:text-white transition-all duration-500 transform hover:-translate-y-2 hover:-rotate-3 hover:shadow-[0_10px_20px_rgba(37,99,235,0.3)]">
                      <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md scale-0 group-hover:scale-100 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
                      <Facebook size={24} className="relative z-10" />
                    </a>
                    <a href="#" className="group relative p-4 bg-slate-800/50 backdrop-blur-sm rounded-2xl hover:bg-gradient-to-tr hover:from-sky-500 hover:to-blue-400 hover:text-white transition-all duration-500 transform hover:-translate-y-2 hover:rotate-3 hover:shadow-[0_10px_20px_rgba(14,165,233,0.3)]">
                      <div className="absolute inset-0 bg-white/20 rounded-2xl blur-md scale-0 group-hover:scale-100 transition-transform duration-500 opacity-0 group-hover:opacity-100"></div>
                      <Twitter size={24} className="relative z-10" />
                    </a>
                  </div>
               </div>
               
               <div className="w-full pt-4">
                  <h3 className="font-semibold tracking-wider text-sm uppercase text-slate-100 flex items-center gap-2 justify-center md:justify-start mb-4">
                     Quick Navigation
                  </h3>
                   <ul className="flex flex-col items-center md:items-start space-y-2 text-sm font-light">
                      <li><Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-ghania-300 transition-colors py-1 inline-block">Home Experience</Link></li>
                      <li><a href="#kategori" className="hover:text-ghania-300 transition-colors py-1 inline-block">Premium Collection</a></li>
                   </ul>
               </div>
            </div>
          </div>
          
          <div className="border-t border-slate-800/60 mt-20 pt-10 text-center flex flex-col items-center">
            <h2 className="text-xl md:text-2xl font-medium tracking-wide text-white mb-2">
              &copy; {new Date().getFullYear()} Ghania Style
            </h2>
             <p className="text-slate-500 text-sm md:text-base font-light">All rights reserved. Crafted with precision & elegance.</p>
          </div>
        </div>
      </footer>

      {/* Scroll to top button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            onClick={scrollToTop}
            className="fixed bottom-6 right-6 z-50 p-3 bg-slate-900 text-white rounded-full shadow-xl hover:bg-ghania-400 hover:shadow-ghania-400/50 hover:-translate-y-1 transition-all duration-300"
          >
            <ArrowUp size={24} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
