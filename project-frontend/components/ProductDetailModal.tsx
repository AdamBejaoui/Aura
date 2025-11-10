import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { Product } from "../App";

type ProductDetailModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart?: (product: Product) => void;
};

const AUTOPLAY_INTERVAL = 4000;

const ProductDetailModal = ({ product, isOpen, onClose, onAddToCart }: ProductDetailModalProps) => {
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

  const nextSlide = () => { setActiveIndex((prev) => (prev + 1) % images.length); setIsAutoplaying(false); };
  const prevSlide = () => { setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1)); setIsAutoplaying(false); };

  if (!isOpen || !product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur">
      <div className="relative w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_30px_120px_-50px_rgba(15,23,42,0.65)]">
        <button onClick={onClose} className="absolute right-4 top-4 z-10 h-10 w-10 rounded-full bg-white/80 text-slate-600 shadow transition hover:bg-white cursor-pointer">
          <X className="h-5 w-5" />
        </button>

        <div className="grid gap-0 md:grid-cols-[1.15fr_1fr]">
          <div className="relative aspect-[4/5] w-full overflow-hidden bg-slate-100 md:rounded-r-none">
            {images.map((img, idx) => (
              <div key={idx} className={`absolute inset-0 transition-opacity duration-500 ${idx === activeIndex ? "opacity-100" : "opacity-0"}`}>
                <img src={img} alt={`${product.name} ${idx + 1}`} className="h-full w-full object-cover" />
              </div>
            ))}

            {images.length > 1 && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2">
                <button onClick={prevSlide} className="h-10 w-10 rounded-full bg-white/90 text-slate-700 shadow cursor-pointer">‹</button>
                <button onClick={nextSlide} className="h-10 w-10 rounded-full bg-white/90 text-slate-700 shadow cursor-pointer">›</button>
                <button onClick={() => setIsAutoplaying(!isAutoplaying)} className="h-10 w-10 rounded-full bg-white/90 text-slate-700 shadow cursor-pointer">
                  {isAutoplaying ? "⏸" : "▶"}
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-6 p-6 sm:p-8">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-600">{product.category}</p>
              <h2 className="text-2xl font-serif font-light text-slate-900 sm:text-3xl">{product.name}</h2>
              <p className="text-base leading-relaxed text-slate-600 sm:text-lg">{product.description}</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-base font-semibold text-white sm:text-lg">
                {product.price.toLocaleString("en-US", { style: "currency", currency: "USD" })}
              </span>
            </div>

            <button onClick={() => { onAddToCart?.(product); onClose(); }}
              className="inline-flex min-h-touch items-center justify-center rounded-full bg-amber-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-amber-700 cursor-pointer">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
