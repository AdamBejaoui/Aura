import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ShoppingBag, Heart, Star, ShieldCheck, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "../../../types";
import ReviewSection from "./ReviewSection";
import { useWishlistStore } from "../../../store/wishlistStore";

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
        className="relative w-full max-w-6xl bg-white dark:bg-neutral-900 rounded-t-[3rem] md:rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row h-[92vh] md:h-[85vh] border-t md:border border-stone-100 dark:border-neutral-800 self-end md:self-center"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 md:right-8 md:top-8 z-50 p-4 bg-white/40 dark:bg-black/40 backdrop-blur-2xl text-stone-900 dark:text-white rounded-full shadow-2xl hover:scale-110 hover:rotate-90 active:scale-90 transition-all duration-300 border border-white/20 dark:border-neutral-800"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Gallery Section */}
        <div className="w-full h-1/2 md:h-full md:w-1/2 relative bg-stone-50 dark:bg-neutral-950 flex-shrink-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              src={images[activeIndex]}
              alt={localProduct?.name}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent md:hidden" />

          {/* Navigation Controls */}
          {images.length > 1 && (
            <>
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-6 pointer-events-none">
                <button onClick={prevSlide} className="pointer-events-auto p-4 bg-white/20 backdrop-blur-xl text-white rounded-2xl hover:bg-white hover:text-stone-900 transition-all border border-white/20">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button onClick={nextSlide} className="pointer-events-auto p-4 bg-white/20 backdrop-blur-xl text-white rounded-2xl hover:bg-white hover:text-stone-900 transition-all border border-white/20">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>

              {/* Indicators */}
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                {images.map((_unused: any, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => { setActiveIndex(idx); setIsAutoplaying(false); }}
                    className={`h-1 rounded-full transition-all duration-500 ${idx === activeIndex ? "w-12 bg-white" : "w-3 bg-white/40 hover:bg-white/60"}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Category Badge */}
          <div className="absolute top-8 left-8">
            <span className="px-4 py-2 bg-stone-900 dark:bg-white text-white dark:text-stone-900 text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-2xl">
              {localProduct.category}
            </span>
          </div>
        </div>

        {/* Info Section */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-neutral-900 relative h-1/2 md:h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 md:p-16 h-full">
            {/* Header Info */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 px-3 py-1 bg-amber-50 dark:bg-amber-900/10 rounded-full border border-amber-100 dark:border-amber-900/20">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 uppercase tracking-widest">{localProduct.rating || '5.0'}</span>
                </div>
                {localProduct.inStock ? (
                  <span className="flex items-center gap-1.5 text-[8px] font-black text-emerald-500 uppercase tracking-[0.2em]">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    In Archive
                  </span>
                ) : (
                  <span className="text-[8px] font-black text-rose-500 uppercase tracking-[0.2em]">Archived Selection</span>
                )}
              </div>
              <h2 className="text-4xl md:text-6xl font-black text-stone-900 dark:text-white uppercase tracking-tighter leading-[0.85] mb-8">
                {localProduct.name}
              </h2>
              <p className="text-4xl font-black text-stone-900 dark:text-white tracking-tighter opacity-90">
                {localProduct.price.toLocaleString("en-US", {
                  style: "currency",
                  currency: localProduct.currency || "USD",
                })}
              </p>
            </div>

            {/* Description */}
            <div className="mb-12">
              <h4 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-4">Manifesto</h4>
              <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed font-medium">
                {localProduct.description}
              </p>
            </div>

            {/* Specifications */}
            <div className="grid grid-cols-2 gap-8 mb-12 p-8 bg-stone-50 dark:bg-neutral-800/50 rounded-[2.5rem] border border-stone-100 dark:border-neutral-800">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-2xl border border-stone-100 dark:border-neutral-700 shadow-sm">
                  <ShieldCheck className="w-5 h-5 text-stone-400" />
                </div>
                <div>
                  <span className="block text-[8px] font-black text-stone-400 uppercase tracking-widest mb-0.5">Assurance</span>
                  <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase">Pure Quality</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white dark:bg-neutral-900 rounded-2xl border border-stone-100 dark:border-neutral-700 shadow-sm">
                  <Truck className="w-5 h-5 text-stone-400" />
                </div>
                <div>
                  <span className="block text-[8px] font-black text-stone-400 uppercase tracking-widest mb-0.5">Logistics</span>
                  <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase">Swift Service</span>
                </div>
              </div>
            </div>

            {/* Review Section */}
            <div className="mb-8">
              <ReviewSection
                productId={localProduct.id}
                reviews={localProduct.reviews || []}
                onReviewAdded={(updated) => setLocalProduct({ ...localProduct, ...updated })}
              />
            </div>
          </div>

          {/* Action Bar */}
          <div className="p-6 md:p-12 border-t border-stone-100 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl z-20 flex gap-4 sticky bottom-0">
            <button
              onClick={() => {
                if (localProduct.inStock) {
                  onAddToCart?.(localProduct);
                  onClose();
                }
              }}
              disabled={!localProduct.inStock}
              className={`flex-[3] flex items-center justify-center gap-4 h-16 md:h-20 rounded-[1.5rem] transition-all duration-700 ${localProduct.inStock
                ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 shadow-2xl hover:scale-[1.02] active:scale-[0.95] group"
                : "bg-stone-50 dark:bg-neutral-800 text-stone-300 dark:text-stone-600 cursor-not-allowed"
                }`}
            >
              <ShoppingBag className="w-5 h-5 md:w-6 md:h-6 transition-transform group-hover:rotate-12" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                {localProduct.inStock ? "Secure Piece" : "Archived"}
              </span>
            </button>

            <button
              onClick={() => toggleItem(localProduct)}
              className={`flex-1 h-16 md:h-20 rounded-[1.5rem] border-2 flex items-center justify-center transition-all duration-700 ${isWishlisted
                ? "border-stone-900 bg-stone-900 dark:border-white dark:bg-white text-white dark:text-stone-900"
                : "border-stone-100 dark:border-neutral-800 hover:border-stone-900 dark:hover:border-white text-stone-300 hover:text-stone-900 dark:hover:text-white active:scale-90"
                }`}
            >
              <Heart className={`w-5 h-5 md:w-6 md:h-6 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default ProductDetailModal;
