import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ShoppingBag, Heart, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "../../../types";
import { useWishlistStore } from "../../../store/wishlistStore";

const formatCurrency = (value: number, currency: string = 'USD') =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(value);

type ProductDetailModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
};

const AUTOPLAY_INTERVAL = 5000;

const ProductDetailModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplaying, setIsAutoplaying] = useState(true);
  const [localProduct, setLocalProduct] = useState<Product | null>(product);

  const { items: wishlistItems, toggleItem } = useWishlistStore();
  const isWishlisted = localProduct ? wishlistItems.some(i => i.id === localProduct.id) : false;

  useEffect(() => {
    if (product) {
      setLocalProduct(product);
      setActiveIndex(0);
      setIsAutoplaying(true);
    }
  }, [product]);

  const images = localProduct?.images || [];

  useEffect(() => {
    if (!isOpen || !isAutoplaying || images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isAutoplaying, isOpen, images.length]);

  const nextSlide = () => {
    setActiveIndex((prev: number) => (prev + 1) % images.length);
    setIsAutoplaying(false);
  };
  const prevSlide = () => {
    setActiveIndex((prev: number) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsAutoplaying(false);
  };

  if (!isOpen || !localProduct) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-xl"
      />
      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
        className="relative w-full h-full bg-white dark:bg-neutral-900 shadow-2xl overflow-y-auto md:overflow-hidden flex flex-col md:flex-row border-stone-100 dark:border-neutral-800"
      >
        {/* Navigation / Header (Mobile Only) */}
        <div className="md:hidden fixed top-0 inset-x-0 z-50 flex items-center justify-between p-6 pt-safe premium-blur">
          <button
            onClick={onClose}
            className="p-3 bg-white/40 dark:bg-black/40 backdrop-blur-2xl text-stone-900 dark:text-white rounded-2xl shadow-xl hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 dark:border-neutral-800"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex-1 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900 dark:text-white">Product Detail</span>
          </div>
          <button
            onClick={() => toggleItem(localProduct)}
            className={`p-3 rounded-2xl backdrop-blur-2xl transition-all ${isWishlisted ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900" : "bg-white/40 dark:bg-black/40 text-stone-500 border border-white/20 dark:border-neutral-800"}`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Desktop Close/Nav (Hidden on Mobile) */}
        <button
          onClick={onClose}
          className="hidden md:flex absolute top-10 right-10 z-50 p-4 bg-white/20 dark:bg-black/20 backdrop-blur-3xl text-stone-900 dark:text-white rounded-full shadow-2xl hover:scale-110 hover:rotate-90 active:scale-95 transition-all duration-300 border border-white/20 dark:border-neutral-800 group"
        >
          <X className="w-6 h-6 group-hover:scale-110" />
        </button>

        {/* Left: Gallery (60% Desktop, Edge-to-edge Mobile) */}
        <div className="w-full h-[70vh] md:h-full md:w-[60%] relative bg-stone-50 dark:bg-neutral-950 flex-shrink-0 group/gallery overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              src={images[activeIndex]}
              alt={localProduct?.name}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Gallery Overlay Controls */}
          <div className="absolute inset-0 bg-gradient-to-t from-white/20 dark:from-neutral-900/40 via-transparent to-transparent pointer-events-none" />

          {/* Desktop Direct Indicators (Thumbnails) */}
          <div className="absolute bottom-12 left-12 right-12 hidden md:flex gap-4 scroll-smooth no-scrollbar overflow-x-auto p-4 z-20">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                onClick={() => { setActiveIndex(idx); setIsAutoplaying(false); }}
                className={`relative flex-shrink-0 w-24 aspect-[3/4] rounded-xl overflow-hidden transition-all duration-500 border-2 ${idx === activeIndex
                  ? "border-white scale-110 shadow-2xl"
                  : "border-transparent opacity-60 hover:opacity-100"}`}
              >
                <img src={img} className="w-full h-full object-cover" alt="indicator" />
              </button>
            ))}
          </div>

          {/* Mobile Dot Indicators */}
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10 md:hidden">
            {images.map((_: any, idx: number) => (
              <div
                key={idx}
                className={`h-1 rounded-full transition-all duration-500 ${idx === activeIndex ? "w-8 bg-stone-900 dark:bg-white" : "w-1.5 bg-stone-300 dark:bg-neutral-700"}`}
              />
            ))}
          </div>

          {/* Navigation Arrows (Desktop) */}
          {images.length > 1 && (
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none hidden md:flex">
              <button onClick={prevSlide} className="pointer-events-auto p-5 bg-white/10 dark:bg-black/10 backdrop-blur-3xl text-white rounded-full hover:bg-white hover:text-stone-900 transition-all border border-white/20">
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button onClick={nextSlide} className="pointer-events-auto p-5 bg-white/10 dark:bg-black/10 backdrop-blur-3xl text-white rounded-full hover:bg-white hover:text-stone-900 transition-all border border-white/20">
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          )}
        </div>

        {/* Right: Info (40% Desktop, Flow Mobile) */}
        <div className="w-full md:w-[40%] flex flex-col h-full bg-white dark:bg-neutral-900 relative">
          <div className="flex-1 overflow-y-auto px-8 md:px-16 pt-12 md:pt-24 pb-32">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <div className="flex items-center gap-4 mb-8">
                <span className="px-4 py-1.5 bg-stone-100 dark:bg-neutral-800 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-stone-500 dark:text-stone-400">
                  {localProduct.category}
                </span>
                <div className="h-px flex-1 bg-stone-100 dark:bg-neutral-800" />
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-stone-900 dark:text-white mb-6 uppercase tracking-tighter leading-tight">
                {localProduct.name}
              </h2>

              <div className="flex items-baseline gap-4 mb-12">
                <span className="text-4xl md:text-5xl font-black text-stone-900 dark:text-white tracking-tight">
                  {formatCurrency(localProduct.price, localProduct.currency)}
                </span>
                <span className="text-stone-400 font-bold text-sm uppercase tracking-widest">Available Piece</span>
              </div>

              <div className="space-y-10">
                <div className="space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900 dark:text-white flex items-center gap-3">
                    <span className="w-2 h-2 bg-stone-900 dark:bg-white rounded-full" />
                    Archive Note
                  </h3>
                  <p className="text-base text-stone-600 dark:text-stone-400 leading-relaxed font-medium">
                    {localProduct.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-8 py-10 border-y border-stone-100 dark:border-neutral-800">
                  <div className="space-y-2">
                    <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Stock Status</span>
                    <p className="text-xs font-black uppercase text-stone-900 dark:text-white">
                      {localProduct.inStock ? "Exclusivity Reserved" : "Archive Only"}
                    </p>
                  </div>
                  <div className="space-y-2 text-right">
                    <span className="text-[8px] font-black text-stone-400 uppercase tracking-widest">Client Reviews</span>
                    <div className="flex items-center justify-end gap-1.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-black uppercase text-stone-900 dark:text-white">{localProduct.rating} / 5.0</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-900 dark:text-white">Specifications</h3>
                  <div className="grid grid-cols-1 gap-4">
                    {['Premium Craftsmanship', 'Limited Aura Edition', 'Hand-Selected Materials'].map(spec => (
                      <div key={spec} className="flex items-center gap-4 p-4 bg-stone-50 dark:bg-neutral-800/50 rounded-2xl border border-stone-100 dark:border-neutral-800">
                        <div className="w-1.5 h-1.5 bg-stone-300 dark:bg-neutral-700 rounded-full" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-stone-600 dark:text-stone-400">{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Action Bar */}
          <div className="absolute bottom-0 inset-x-0 p-8 md:p-12 pb-safe border-t border-stone-100 dark:border-neutral-800 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl z-40 flex gap-4">
            <button
              onClick={() => {
                if (localProduct.inStock) {
                  onAddToCart?.(localProduct);
                  onClose();
                }
              }}
              disabled={!localProduct.inStock}
              className={`flex-[3] relative overflow-hidden group h-20 md:h-24 rounded-[1.5rem] transition-all duration-500 ${localProduct.inStock
                ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-2xl hover:scale-[1.02] active:scale-[0.98]"
                : "bg-stone-50 dark:bg-neutral-800 text-stone-300 dark:text-stone-600 cursor-not-allowed"
                }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-4">
                <ShoppingBag className="w-6 h-6 transition-transform group-hover:rotate-12" />
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">
                  {localProduct.inStock ? "Acquire Piece" : "Sold Out"}
                </span>
              </div>
              {localProduct.inStock && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              )}
            </button>

            <button
              onClick={() => toggleItem(localProduct)}
              className={`flex-1 h-20 md:h-24 rounded-[1.5rem] border-2 flex items-center justify-center transition-all duration-500 ${isWishlisted
                ? "border-stone-900 bg-stone-900 dark:border-white dark:bg-white text-white dark:text-stone-900 shadow-xl"
                : "border-stone-200 dark:border-neutral-800 hover:border-stone-900 dark:hover:border-white text-stone-300 hover:text-stone-900 dark:hover:text-white"
                }`}
            >
              <Heart className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetailModal;
