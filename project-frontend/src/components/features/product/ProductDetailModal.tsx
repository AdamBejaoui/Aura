import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, ShoppingBag, Heart, Star, ArrowRight, MessageSquare, Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, Review } from "../../../types";
import { useWishlistStore } from "../../../store/wishlistStore";
import axios from 'axios';
import { toast } from 'sonner';
import { useCurrencyStore } from "../../../store/currencyStore";
import { useCartStore } from "../../../store/cartStore";

// Local formatter replaced by store

type ProductDetailModalProps = {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
};

const AUTOPLAY_INTERVAL = 5000;

const ProductDetailModal = ({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAutoplaying, setIsAutoplaying] = useState(true);
  const [localProduct, setLocalProduct] = useState<Product | null>(product);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '' });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [isJoiningWaitlist, setIsJoiningWaitlist] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const availableSizes = ["S", "M", "L", "XL"];

  const { items: wishlistItems, toggleItem } = useWishlistStore();
  const { formatPrice } = useCurrencyStore();
  const { addItem, toggleCheckout, setConfirmationMessage } = useCartStore();

  const isWishlisted = localProduct ? wishlistItems.some(i => i.id === localProduct.id) : false;

  useEffect(() => {
    if (product) {
      setLocalProduct(product);
      setReviews(product.reviews || []);
      setActiveIndex(0);
      setIsAutoplaying(true);
      setSelectedSize("M");
      setSelectedQuantity(1);
    }
  }, [product]);

  const images = localProduct?.images || [];

  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return 'https://placehold.co/600x800/f8fafc/94a3b8?text=No+Image';
    if (imagePath.startsWith('http')) return imagePath;
    if (imagePath.startsWith('/uploads')) return imagePath;

    const baseUrl = import.meta.env.VITE_API_BASE || '';
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

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

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localProduct) return;

    if (!newReview.name || !newReview.comment) {
      toast.error('Please provide both your name and a comment');
      return;
    }

    setIsSubmittingReview(true);
    try {
      const response = await axios.post(`/api/products/${localProduct.id}/reviews`, newReview);

      // Update local state with new review
      if (response.data && response.data.reviews) {
        setReviews(response.data.reviews);
        setLocalProduct(response.data); // Update rating/numReviews
        setNewReview({ rating: 5, comment: '', name: '' });
        toast.success('Review submitted successfully');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleJoinWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localProduct || !waitlistEmail) return;

    setIsJoiningWaitlist(true);
    try {
      await axios.post('/api/waitlist', {
        email: waitlistEmail,
        productId: localProduct.id
      });
      toast.success('Added to waitlist! We will notify you.');
      setWaitlistEmail("");
    } catch (error) {
      console.error('Failed to join waitlist:', error);
      toast.error('Failed to join waitlist');
    } finally {
      setIsJoiningWaitlist(false);
    }
  };

  if (!isOpen || !localProduct) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-0 md:p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, y: "100%" }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 300, mass: 0.8 }}
        className="relative w-full h-full md:h-[90vh] md:w-[90vw] md:max-w-7xl md:rounded-3xl bg-white dark:bg-neutral-900 shadow-2xl flex flex-col md:flex-row overflow-hidden border-stone-200 dark:border-neutral-800"
      >
        {/* Navigation / Header (Mobile Only - Sticky) */}
        <div className="md:hidden absolute top-0 inset-x-0 z-50 flex items-center justify-between p-6 pt-safe pointer-events-none">
          <button
            onClick={onClose}
            className="pointer-events-auto w-10 h-10 flex items-center justify-center bg-white/10 backdrop-blur-xl text-white rounded-full shadow-lg border border-white/20 active:scale-90 transition-all"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={() => toggleItem(localProduct)}
            className={`pointer-events-auto w-10 h-10 flex items-center justify-center rounded-full backdrop-blur-xl transition-all border border-white/20 shadow-lg ${isWishlisted ? "bg-white text-stone-900" : "bg-white/10 text-white"}`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
        </div>

        {/* Desktop Close Button */}
        <button
          onClick={onClose}
          className="hidden md:flex absolute top-6 right-6 z-50 p-2 bg-stone-100 dark:bg-neutral-800 text-stone-900 dark:text-white rounded-full hover:bg-stone-200 dark:hover:bg-neutral-700 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Main Content Area - Scrollable on Mobile, Split/Fixed on Desktop */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden no-scrollbar">

          {/* Left: Gallery (Mobile: Flows, Desktop: 55% Width/Full Height) */}
          <div className="w-full h-[50vh] md:h-full md:w-[55%] relative bg-black flex-shrink-0 group/gallery overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.7 }}
                src={getImageUrl(images[activeIndex])}
                alt={localProduct?.name}
                className="w-full h-full object-cover opacity-90"
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

            {/* Desktop Thumbnails */}
            <div className="absolute bottom-8 left-8 right-8 hidden md:flex gap-3 overflow-x-auto pb-2 scrollbar-none z-20">
              {images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => { setActiveIndex(idx); setIsAutoplaying(false); }}
                  className={`relative flex-shrink-0 w-16 aspect-[3/4] rounded-lg overflow-hidden transition-all duration-300 border-2 ${idx === activeIndex
                    ? "border-white scale-105 ring-2 ring-black/20"
                    : "border-transparent opacity-50 hover:opacity-100"}`}
                >
                  <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="thumbnail" />
                </button>
              ))}
            </div>

            {/* Mobile Indicators */}
            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-1.5 z-10 md:hidden">
              {images.map((_: any, idx: number) => (
                <div
                  key={idx}
                  className={`h-1 rounded-full transition-all duration-300 ${idx === activeIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"}`}
                />
              ))}
            </div>

            {/* Desktop Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/20 text-white backdrop-blur-sm rounded-full opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-black/40 hidden md:flex"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/20 text-white backdrop-blur-sm rounded-full opacity-0 group-hover/gallery:opacity-100 transition-all hover:bg-black/40 hidden md:flex"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Right: Info (Scrollable on Desktop too) */}
          <div className="w-full md:w-[45%] flex flex-col h-auto md:h-full bg-white dark:bg-neutral-900 relative">
            <div className="md:absolute md:inset-0 md:overflow-y-auto px-6 py-8 md:p-12 pb-32">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                {/* Header Info */}
                <div className="mb-8">
                  <span className="inline-block px-3 py-1 bg-stone-100 dark:bg-neutral-800 rounded-full text-[10px] font-bold uppercase tracking-widest text-stone-500 dark:text-stone-400 mb-4">
                    {localProduct.category}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-stone-900 dark:text-white uppercase tracking-tight leading-none mb-3">
                    {localProduct.name}
                  </h2>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-medium text-stone-900 dark:text-white">
                      {formatPrice(localProduct.price)}
                    </span>
                    {localProduct.rating > 0 && (
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-black dark:fill-white text-black dark:text-white" />
                        <span className="text-sm font-bold text-black dark:text-white">{localProduct.rating.toFixed(1)}</span>
                        <span className="text-xs text-stone-400">({localProduct.numReviews} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-10 text-stone-600 dark:text-stone-300 leading-relaxed text-sm md:text-base">
                  {localProduct.description}
                </div>

                {/* Specs Grid */}
                <div className="grid grid-cols-2 gap-4 mb-12">
                  <div className="p-4 bg-stone-50 dark:bg-neutral-800/40 rounded-2xl border border-stone-100 dark:border-neutral-800">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">Authenticity</div>
                    <div className="text-sm font-bold text-stone-900 dark:text-white">Guaranteed</div>
                  </div>
                </div>

                {/* Size & Quantity Selectors */}
                {localProduct.inStock && (
                  <div className="space-y-8 mb-12">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Select Size</label>
                        <button className="text-[9px] font-bold text-stone-400 uppercase tracking-widest border-b border-stone-200 dark:border-neutral-800 pb-0.5">Size Guide</button>
                      </div>
                      <div className="grid grid-cols-4 gap-3">
                        {availableSizes.map((s) => (
                          <button
                            key={s}
                            onClick={() => setSelectedSize(s)}
                            className={`py-4 rounded-2xl text-[10px] font-black transition-all border ${selectedSize === s
                              ? "bg-black dark:bg-white text-white dark:text-black border-transparent shadow-xl scale-105"
                              : "bg-stone-50 dark:bg-neutral-800 text-stone-400 border-stone-100 dark:border-neutral-800 hover:border-stone-300 dark:hover:border-neutral-700"
                              }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Quantity</label>
                      <div className="flex items-center gap-6 p-2 bg-stone-50 dark:bg-neutral-800 rounded-2xl w-fit border border-stone-100 dark:border-neutral-800">
                        <button
                          onClick={() => setSelectedQuantity(Math.max(1, selectedQuantity - 1))}
                          className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                        >
                          -
                        </button>
                        <span className="text-sm font-black text-stone-900 dark:text-white w-4 text-center">{selectedQuantity}</span>
                        <button
                          onClick={() => setSelectedQuantity(selectedQuantity + 1)}
                          className="w-10 h-10 flex items-center justify-center text-stone-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="h-px bg-stone-100 dark:bg-neutral-800 w-full mb-10" />

                {/* Reviews Section */}
                <div className="space-y-8">
                  <h3 className="text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Customer Reviews
                  </h3>

                  {/* Review Form */}
                  <form onSubmit={handleReviewSubmit} className="bg-stone-50 dark:bg-neutral-800 p-6 rounded-2xl space-y-4">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-stone-500 uppercase tracking-wider">Your Rating</label>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReview({ ...newReview, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star className={`w-6 h-6 ${star <= newReview.rating ? 'fill-black dark:fill-white text-black dark:text-white' : 'text-stone-300 dark:text-stone-600'}`} />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <input
                        type="text"
                        placeholder="Your Name"
                        value={newReview.name}
                        onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-transparent focus:border-stone-200 dark:focus:border-neutral-700 outline-none transition-all text-sm"
                      />
                    </div>
                    <div>
                      <textarea
                        placeholder="Write your thoughts..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-white dark:bg-neutral-900 border border-transparent focus:border-stone-200 dark:focus:border-neutral-700 outline-none transition-all text-sm min-h-[80px]"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingReview}
                      className="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 shadow-2xl"
                    >
                      {isSubmittingReview ? 'Processing...' : 'Commit Review'}
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>

                  {/* Review List */}
                  <div className="space-y-6">
                    {reviews.length === 0 ? (
                      <div className="text-center py-8 text-stone-400 text-sm">No reviews yet. Be the first!</div>
                    ) : (
                      reviews.slice().reverse().map((review: any, idx) => (
                        <div key={idx} className="border-b border-stone-100 dark:border-neutral-800 pb-6 last:border-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-stone-900 dark:text-white text-sm">{review.name}</span>
                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-black dark:fill-white text-black dark:text-white' : 'text-stone-200 dark:text-stone-700'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{review.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </motion.div>
            </div>

            {/* Bottom Action Bar (Fixed on Mobile & Desktop within this container) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 pb-safe md:pb-6 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-lg border-t border-stone-100 dark:border-neutral-800 flex gap-3 z-30">
              <button
                onClick={() => {
                  if (localProduct.inStock) {
                    addItem(localProduct, selectedSize, selectedQuantity);
                    toggleCheckout(true);
                    setConfirmationMessage(null);
                    toast.success(`Investment Confirmed: ${selectedQuantity}x ${localProduct.name} in Size ${selectedSize} added to archive.`);
                    onClose();
                  }
                }}
                disabled={!localProduct.inStock}
                className={`flex-1 py-4 px-6 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 transition-all ${localProduct.inStock
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-black hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-stone-100 dark:bg-neutral-800 text-stone-400 dark:text-stone-500 cursor-not-allowed opacity-60 border border-stone-200 dark:border-neutral-700'
                  }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {localProduct.inStock ? 'Commit to Cart' : 'Archived / Sold Out'}
              </button>
              {!localProduct.inStock && (
                <form onSubmit={handleJoinWaitlist} className="flex-1 flex gap-2">
                  <input
                    type="email"
                    placeholder="ENTER EMAIL FOR RESTOCK"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    required
                    className="flex-1 px-4 rounded-2xl bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-800 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white"
                  />
                  <button
                    type="submit"
                    disabled={isJoiningWaitlist}
                    className="px-6 rounded-2xl bg-stone-900 dark:bg-white text-white dark:text-black hover:scale-105 transition-all flex items-center justify-center disabled:opacity-50"
                  >
                    <Bell className="w-4 h-4" />
                  </button>
                </form>
              )}
              <button
                onClick={() => toggleItem(localProduct)}
                className={`w-14 rounded-2xl flex items-center justify-center border-2 transition-all ${isWishlisted
                  ? 'border-stone-900 dark:border-white text-stone-900 dark:text-white'
                  : 'border-stone-200 dark:border-neutral-700 text-stone-400 hover:border-stone-900 dark:hover:border-white'
                  }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
              </button>
            </div>
          </div>
        </div >
      </motion.div >
    </div >
  );
};

export default ProductDetailModal;
