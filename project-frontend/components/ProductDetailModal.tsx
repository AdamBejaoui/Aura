import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import type { Product } from "../App";
import ReviewSection from "./ReviewSection";
import { useWishlistStore } from "../store/wishlistStore";
import { Heart } from "lucide-react";

type ProductDetailModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
};

const AUTOPLAY_INTERVAL = 4000;

const ProductDetailModal = ({
  product,
  isOpen,
  onClose,
  onAddToCart,
}: ProductDetailModalProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplaying, setIsAutoplaying] = useState(true);
  const [localProduct, setLocalProduct] = useState<Product | null>(product);

  const { items, toggleItem } = useWishlistStore();
  const isWishlisted = items.some(i => i.id === localProduct?.id);

  useEffect(() => {
    setLocalProduct(product);
  }, [product]);

  const images = localProduct?.images || [];

  useEffect(() => {
    if (isOpen) {
      setActiveIndex(0);
      setIsAutoplaying(true);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !isAutoplaying || images.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, AUTOPLAY_INTERVAL);
    return () => clearInterval(timer);
  }, [isAutoplaying, isOpen, images.length]);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % images.length);
    setIsAutoplaying(false);
  };
  const prevSlide = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    setIsAutoplaying(false);
  };

  if (!isOpen || !localProduct) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 px-2 sm:px-4 py-4 sm:py-6 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="relative w-[95%] h-[85vh] md:h-[70vh] md:max-w-5xl overflow-hidden bg-white dark:bg-neutral-900 shadow-2xl ring-1 ring-gray-200 dark:ring-neutral-800 transition-all flex flex-col rounded-2xl md:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 z-20 flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white md:text-gray-500 md:bg-white md:shadow-sm md:hover:bg-gray-100 dark:md:bg-neutral-800 dark:md:text-gray-400 transition-all hover:scale-105"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <div className="flex flex-col md:grid md:grid-cols-2 h-full overflow-hidden">
          {/* Image Gallery - Compact on Mobile */}
          <div className="relative h-[35%] md:h-full w-full overflow-hidden bg-gray-100 dark:bg-black flex-shrink-0">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${idx === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                  }`}
              >
                <img
                  src={img}
                  alt={`${localProduct.name} ${idx + 1}`}
                  className="h-full w-full object-cover"
                />
                {/* Gradient Overlay for text visibility on mobile */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent md:hidden"></div>
              </div>
            ))}

            {images.length > 1 && (
              <>
                <div className="absolute inset-0 z-20 flex items-center justify-between px-4 pointer-events-none">
                  <button
                    onClick={prevSlide}
                    className="pointer-events-auto flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                  >
                    <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="pointer-events-auto flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                  >
                    <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>

                {/* Dots Indicator */}
                <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setActiveIndex(idx); setIsAutoplaying(false); }}
                      className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                        }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Details Section - Scrollable Area */}
          <div className="flex flex-col flex-1 min-h-0 bg-white dark:bg-neutral-900">
            <div className="flex-1 overflow-y-auto p-5 sm:p-8 md:p-10 no-scrollbar">
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <span className="inline-block rounded-full bg-gray-100 dark:bg-stone-900/20 px-2.5 py-0.5 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-900 dark:text-stone-300 mb-2">
                    {localProduct.category}
                  </span>
                  <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                    {localProduct.name}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">
                    {localProduct.price.toLocaleString("en-US", {
                      style: "currency",
                      currency: localProduct.currency || "USD",
                    })}
                  </span>
                  {localProduct.inStock ? (
                    <span className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium px-2 py-0.5 bg-green-50 dark:bg-green-900/20 rounded">
                      In Stock
                    </span>
                  ) : (
                    <span className="text-xs sm:text-sm text-red-600 dark:text-red-400 font-medium px-2 py-0.5 bg-red-50 dark:bg-red-900/20 rounded">
                      Out of Stock
                    </span>
                  )}
                </div>
              </div>

              <div className="prose prose-sm dark:prose-invert">
                <p className="text-sm sm:text-base leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-3 md:line-clamp-none">
                  {localProduct.description}
                </p>
              </div>

              {/* Extra details */}
              <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 dark:border-neutral-800">
                <div>
                  <span className="block text-[10px] sm:text-xs text-gray-500 uppercase">Material</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Premium Cotton</span>
                </div>
                <div>
                  <span className="block text-[10px] sm:text-xs text-gray-500 uppercase">Fit</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">Regular Fit</span>
                </div>
              </div>

              {/* Reviews Section */}
              <ReviewSection
                productId={localProduct.id}
                reviews={localProduct.reviews || []}
                onReviewAdded={(updated) => setLocalProduct({ ...localProduct, ...updated })}
              />
            </div>


            {/* Pinned Action Button */}
            <div className="p-4 sm:p-8 sm:pt-4 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10 flex gap-3">
              <button
                onClick={() => {
                  if (localProduct.inStock) {
                    onAddToCart?.(localProduct);
                    onClose();
                  }
                }}
                disabled={!localProduct.inStock}
                className={`group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-xl px-6 py-3 sm:py-4 transition-all ${localProduct.inStock
                  ? "bg-stone-900 dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200 hover:shadow-lg hover:shadow-stone-900/25 dark:hover:shadow-white/10 active:scale-[0.98]"
                  : "bg-gray-200 dark:bg-neutral-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  }`}
              >
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:-translate-y-1 group-hover:rotate-12" />
                <span className="font-bold text-sm sm:text-lg">
                  {localProduct.inStock ? "Add to Cart" : "Out of Stock"}
                </span>
              </button>

              <button
                onClick={() => localProduct && toggleItem(localProduct)}
                className={`p-3 rounded-xl border-2 transition-all ${isWishlisted
                  ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500"
                  : "border-gray-200 dark:border-neutral-700 hover:border-gray-900 dark:hover:border-white text-gray-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
