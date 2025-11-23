import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ShoppingBag } from "lucide-react";
import type { Product } from "../App";

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
  const images = product?.images || [];

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

  if (!isOpen || !product) return null;

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 py-6 backdrop-blur-sm transition-opacity"
        onClick={onClose}
    >
      <div 
        className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-gray-200 dark:ring-slate-800 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white md:text-gray-500 md:bg-white md:shadow-sm md:hover:bg-gray-100 dark:md:bg-slate-800 dark:md:text-gray-400 transition-all hover:scale-105"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-0 md:grid-cols-2 h-full md:max-h-[85vh]">
          {/* Image Gallery */}
          <div className="relative aspect-[4/5] w-full h-full overflow-hidden bg-gray-100 dark:bg-slate-950">
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === activeIndex ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
              >
                <img
                  src={img}
                  alt={`${product.name} ${idx + 1}`}
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
                        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                        onClick={nextSlide}
                        className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                    >
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>
                
                {/* Dots Indicator */}
                <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2">
                    {images.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => { setActiveIndex(idx); setIsAutoplaying(false); }}
                        className={`h-2 rounded-full transition-all duration-300 ${
                        idx === activeIndex ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80"
                        }`}
                    />
                    ))}
                </div>
              </>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-between p-8 md:p-10 overflow-y-auto bg-white dark:bg-slate-900">
            <div className="space-y-6">
              <div>
                <span className="inline-block rounded-full bg-blue-50 dark:bg-blue-900/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-3">
                    {product.category}
                </span>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {product.name}
                </h2>
              </div>

              <div className="flex items-center gap-4">
                 <span className="text-2xl font-bold text-gray-900 dark:text-white">
                    {product.price.toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                    })}
                 </span>
                 <span className="text-sm text-green-600 dark:text-green-400 font-medium px-2 py-0.5 bg-green-50 dark:bg-green-900/20 rounded">
                    In Stock
                 </span>
              </div>

              <div className="prose prose-sm dark:prose-invert">
                <p className="text-base leading-relaxed text-gray-600 dark:text-gray-300">
                  {product.description}
                </p>
              </div>
              
              {/* Added: Extra details (dummy data for visual completeness) */}
              <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 dark:border-slate-800">
                 <div>
                    <span className="block text-xs text-gray-500 uppercase">Material</span>
                    <span className="font-medium text-gray-900 dark:text-white">Premium Cotton</span>
                 </div>
                 <div>
                    <span className="block text-xs text-gray-500 uppercase">Fit</span>
                    <span className="font-medium text-gray-900 dark:text-white">Regular Fit</span>
                 </div>
              </div>
            </div>

            <div className="mt-8 pt-4">
              <button
                onClick={() => {
                  onAddToCart?.(product);
                  onClose();
                }}
                className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-xl bg-gray-900 dark:bg-white px-8 py-4 text-white dark:text-gray-900 transition-all hover:bg-blue-600 dark:hover:bg-blue-50 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]"
              >
                <ShoppingBag className="h-5 w-5 transition-transform group-hover:-translate-y-1 group-hover:rotate-12" />
                <span className="font-bold text-lg">Add to Cart</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;