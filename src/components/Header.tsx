import { Link } from "react-router-dom";
import { Search, ShoppingBag, Heart, Menu, X, User, Home, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from '@/contexts/CartContext';
import { useFavorites } from '@/contexts/FavoritesContext';
import { useState, useEffect, useRef } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function Header() {
  const { getTotalItems } = useCart();
  const { favorites } = useFavorites();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearchClose = () => {
    setIsSearchOpen(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const menuItems = [
    { icon: Home, label: 'Accueil', path: '/' },
    { icon: Package, label: 'Nos Parfums', path: '/parfums' },
    { icon: Heart, label: 'Favoris', path: '/favoris', badge: favorites.length },
    { icon: ShoppingBag, label: 'Panier', path: '/panier', badge: getTotalItems() },
    { icon: User, label: 'Mon Compte', path: '/compte' },
    { icon: Phone, label: 'Contact', path: '/contact' },
  ];

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-white/95 backdrop-blur-md shadow-sm py-2" 
          : "bg-white py-4"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="font-bold text-xl sm:text-2xl">
            PUFF
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/parfums" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Nos Parfums
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-purple-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Search */}
            <AnimatePresence>
              {isSearchOpen ? (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: "100%", opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  className="absolute inset-x-0 top-0 bg-white z-50 py-2 px-4 flex items-center gap-2"
                >
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Rechercher un parfum..."
                    className="flex-1 bg-gray-100 rounded-full px-4 py-2 text-sm focus:outline-none"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleSearchClose}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSearchOpen(true)}
                  className={cn(isMobile && "p-2")}
                >
                  <Search className="h-4 w-4" />
                </Button>
              )}
            </AnimatePresence>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/favoris">
                <Button variant="ghost" size="icon" className="relative">
                  <Heart className="h-4 w-4" />
                  {favorites.length > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {favorites.length}
                    </span>
                  )}
                </Button>
              </Link>
              <Link to="/panier">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingBag className="h-4 w-4" />
                  {getTotalItems() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                      {getTotalItems()}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            {/* Mobile Menu */}
            {isMobile && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="p-2">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] p-0">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b">
                      <h2 className="font-semibold text-lg">Menu</h2>
                    </div>
                    <nav className="flex-1 overflow-y-auto py-2">
                      {menuItems.map((item) => (
                        <SheetClose asChild key={item.path}>
                          <Link
                            to={item.path}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 transition-colors"
                          >
                            <item.icon className="h-5 w-5 text-gray-500" />
                            <span className="font-medium">{item.label}</span>
                            {item.badge ? (
                              <span className="ml-auto bg-purple-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {item.badge}
                              </span>
                            ) : null}
                          </Link>
                        </SheetClose>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}