import React, { FormEvent, useMemo, useState } from "react";
import { X, Phone, MapPin, User, CheckCircle2, CreditCard, Banknote, ShoppingBag, Ticket, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import type { CartItem } from "../../../store/cartStore";
import { useAuthStore } from "../../../store/authStore";
import { useCurrencyStore } from "../../../store/currencyStore";



export type CheckoutDetails = {
  fullName: string;
  phone: string;
  address: string;
};

type CartCheckoutProps = {
  isOpen: boolean;
  items: CartItem[];
  confirmationMessage: string | null;
  onClose: () => void;
  onUpdateQuantity: (productId: string, nextQuantity: number, size?: string) => void;
  onSubmitOrder: (details: CheckoutDetails) => void;
};

const CartCheckout = ({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onSubmitOrder,
}: CartCheckoutProps) => {
  // const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountPercent: number } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);

  const { user } = useAuthStore();
  const { formatPrice } = useCurrencyStore();

  React.useEffect(() => {
    if (user) {
      setFullName(user.name || "");
    }
  }, [user]);

  const orderSubtotal = useMemo(
    () =>
      items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [items]
  );

  const discountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    return (orderSubtotal * appliedCoupon.discountPercent) / 100;
  }, [orderSubtotal, appliedCoupon]);

  const orderTotal = orderSubtotal - discountAmount;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    try {
      const response = await axios.post("/api/coupons/validate", { code: couponCode });
      setAppliedCoupon(response.data);
      setCouponCode("");
    } catch (err: any) {
      setCouponError(err.response?.data?.message || "Invalid coupon");
      setAppliedCoupon(null);
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim()) {
      setError("Please ensure all fields are correctly completed.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const response = await axios.post("/api/orders", {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price,
          size: item.size
        })),
        paymentMethod,
        userId: user ? user.id : undefined,
        email: user ? user.email : undefined,
        couponCode: appliedCoupon?.code,
      });

      setPlacedOrderId(response.data._id);
      setIsSuccess(true);

      setFullName("");
      setPhone("");
      setAddress("");
      setAppliedCoupon(null);
      setCouponCode("");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) return null;

  const hasItems = items.length > 0;

  return (
    <div className="fixed inset-0 z-[70] flex justify-end">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-md bg-white dark:bg-neutral-900 h-full shadow-premium flex flex-col border-l border-stone-200 dark:border-neutral-800 md:rounded-l-3xl p-8 md:p-10 pt-safe overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8 bg-transparent z-20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-stone-50 dark:bg-neutral-800 rounded-2xl border border-stone-100 dark:border-neutral-800">
              <ShoppingBag className="w-5 h-5 text-stone-900 dark:text-white" />
            </div>
            <h2 className="text-xl font-black text-stone-900 dark:text-white uppercase tracking-tighter flex items-center gap-2">
              Checkout
              <span className="text-[10px] font-black text-stone-400 bg-stone-50 dark:bg-neutral-800 px-3 py-1 rounded-full border border-stone-100 dark:border-neutral-800">
                {items.length}
              </span>
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="p-3 text-stone-400 hover:text-stone-900 dark:hover:text-white bg-stone-50 dark:bg-neutral-800 rounded-2xl border border-stone-100 dark:border-neutral-800 transition-all hover:scale-110 hover:rotate-90 duration-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar -mx-8 md:-mx-10">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col items-center justify-center p-12 text-center"
              >
                <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl flex items-center justify-center mb-8 border border-emerald-100 dark:border-emerald-900/20">
                  <CheckCircle2 className="w-12 h-12 text-black dark:text-white" />
                </div>
                <h2 className="text-3xl font-black text-stone-900 dark:text-white uppercase tracking-tighter mb-2">Acquisition Confirmed</h2>
                {placedOrderId && (
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-8">Ref. #{placedOrderId.slice(-8).toUpperCase()}</p>
                )}

                <div className="w-full max-w-sm bg-stone-50 dark:bg-neutral-800/50 rounded-3xl p-6 border border-stone-100 dark:border-neutral-800 mb-10 text-left">
                  <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-4">Investment Summary</h3>
                  <div className="space-y-3">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-stone-500 uppercase">{item.quantity}x {item.product.name}</span>
                        <span className="dark:text-white font-black">{formatPrice(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div className="h-px bg-stone-200 dark:bg-neutral-700 my-2" />
                    <div className="flex justify-between items-center pt-1">
                      <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-widest">Total Transaction</span>
                      <span className="text-sm font-black dark:text-white">{formatPrice(orderTotal)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <button
                    onClick={() => {
                      onClose();
                      onSubmitOrder({
                        fullName: fullName.trim(),
                        phone: phone.trim(),
                        address: address.trim(),
                      });
                      setIsSuccess(false);
                    }}
                    className="w-full py-5 bg-stone-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-[1.02] transition-all"
                  >
                    Return to Collection
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onSubmitOrder({
                        fullName: fullName.trim(),
                        phone: phone.trim(),
                        address: address.trim(),
                      });
                      setIsSuccess(false);
                    }}
                    className="w-full py-4 bg-transparent text-stone-400 text-[9px] font-black uppercase tracking-[0.1em] hover:text-stone-900 dark:hover:text-white transition-colors"
                  >
                    Safe Exit
                  </button>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Order Summary */}
                <div className="w-full bg-stone-50 dark:bg-neutral-800/50 p-6 md:p-8 pt-0 border-b border-stone-100 dark:border-neutral-800 pb-8 flex-shrink-0">
                  <div className="mb-6">
                    <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Archives</h3>
                  </div>

                  <div className="space-y-4">
                    {items.map((item, idx) => (
                      <div key={`${item.product.id}-${item.size || idx}`} className="flex gap-3 group">
                        <div className="w-12 h-16 bg-white dark:bg-neutral-800 rounded-xl overflow-hidden border border-stone-100 dark:border-neutral-700 flex-shrink-0">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <h4 className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-tight line-clamp-1">{item.product.name}</h4>
                            <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">{item.product.category} {item.size && `• SIZE ${item.size}`}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-stone-900 dark:text-white tracking-wider">{formatPrice(item.product.price)}</span>
                            <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-lg px-2 py-0.5 border border-stone-100 dark:border-neutral-700">
                              <button onClick={() => onUpdateQuantity(item.product.id, Math.max(0, item.quantity - 1), item.size)} className="text-stone-300 hover:text-stone-900 dark:hover:text-white text-[10px]">-</button>
                              <span className="text-[9px] font-black dark:text-white w-3 text-center">{item.quantity}</span>
                              <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1, item.size)} className="text-stone-300 hover:text-stone-900 dark:hover:text-white text-[10px]">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Subtotal</span>
                      <span className="text-xs font-black text-stone-900 dark:text-white tracking-widest">{formatPrice(orderSubtotal)}</span>
                    </div>
                    {appliedCoupon && (
                      <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
                        <span className="text-[10px] font-black uppercase tracking-widest">Aura Privilege ({appliedCoupon.discountPercent}%)</span>
                        <span className="text-xs font-black tracking-widest">-{formatPrice(discountAmount)}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-widest">Total Investment</span>
                      <span className="text-lg font-black text-stone-900 dark:text-white tracking-widest">{formatPrice(orderTotal)}</span>
                    </div>
                  </div>

                  {/* Coupon Input */}
                  <div className="mt-8">
                    <div className="relative group">
                      <Ticket className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300 group-focus-within:text-stone-900 dark:group-focus-within:text-white transition-colors" />
                      <input
                        value={couponCode}
                        onChange={(e) => {
                          setCouponCode(e.target.value);
                          setCouponError(null);
                        }}
                        placeholder="PRIVILEGE CODE"
                        className="w-full bg-white dark:bg-neutral-800 border border-stone-100 dark:border-neutral-700 rounded-2xl pl-12 pr-24 py-3.5 text-[10px] font-black focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white uppercase tracking-widest placeholder:text-stone-300"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={!couponCode.trim() || isApplyingCoupon}
                        className="absolute right-2 top-2 bottom-2 px-6 bg-stone-900 dark:bg-white text-white dark:text-black rounded-xl text-[9px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center min-w-[80px]"
                      >
                        {isApplyingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : "Apply"}
                      </button>
                    </div>
                    {couponError && (
                      <p className="mt-2 ml-4 text-[9px] font-bold text-rose-500 uppercase tracking-widest">{couponError}</p>
                    )}
                    {appliedCoupon && (
                      <div className="mt-3 flex items-center justify-between px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
                        <div className="flex items-center gap-2">
                          <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                            {appliedCoupon.code} Applied
                          </span>
                        </div>
                        <button
                          onClick={() => setAppliedCoupon(null)}
                          className="text-[9px] font-black text-stone-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex-1 p-6 md:p-8 pt-6 bg-white dark:bg-neutral-900 pb-32">
                  <div className="mb-6">
                    <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Logistics</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="flex flex-col gap-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Identity</label>
                        <div className="relative">
                          {user?.avatar ? (
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full overflow-hidden border border-stone-200 dark:border-neutral-700">
                              <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                          )}
                          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="FULL NAME" required className="w-full bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-800 rounded-[1.5rem] pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white placeholder:text-stone-300" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Communication</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="PHONE NUMBER" required className="w-full bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-800 rounded-[1.5rem] pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white placeholder:text-stone-300" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Destination</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="PHYSICAL ADDRESS" required className="w-full bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-800 rounded-[1.5rem] pl-12 pr-6 py-4 text-[10px] font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white placeholder:text-stone-300" />
                      </div>
                    </div>

                    {/* Global preference removed as sizes are now per-item */}

                    <div className="space-y-3">
                      <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Settlement</label>
                      <div className="flex flex-col gap-3">
                        <button type="button" onClick={() => setPaymentMethod('cod')} className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${paymentMethod === 'cod' ? 'bg-stone-50 dark:bg-neutral-800/50 border-stone-900 dark:border-white' : 'bg-white dark:bg-neutral-900 border-stone-100 dark:border-neutral-800'}`}>
                          <div className={`p-2 rounded-xl ${paymentMethod === 'cod' ? 'bg-stone-900 text-white dark:bg-white dark:text-black' : 'bg-stone-50 dark:bg-neutral-800 text-stone-300'}`}><Banknote className="w-5 h-5" /></div>
                          <div className="text-left"><span className="block text-[10px] font-black uppercase tracking-tight dark:text-white">Pay on Delivery</span><span className="block text-[8px] font-bold text-stone-400 uppercase tracking-widest">Standard Service</span></div>
                        </button>
                        <button type="button" disabled className="flex items-center gap-3 p-3 rounded-2xl border border-stone-100 dark:border-neutral-800 bg-stone-50/50 dark:bg-neutral-900/50 opacity-50 cursor-not-allowed">
                          <div className="p-2 rounded-xl bg-stone-50 dark:bg-neutral-950 text-stone-300"><CreditCard className="w-5 h-5" /></div>
                          <div className="text-left"><span className="block text-[10px] font-black uppercase tracking-tight dark:text-white">Secure Credit</span><span className="block text-[8px] font-bold text-stone-400 uppercase tracking-widest">Soon</span></div>
                        </button>
                      </div>
                    </div>

                    {error && <div className="p-3 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight text-center">{error}</div>}

                    <button type="submit" disabled={!hasItems || submitting} className="w-full py-4 bg-stone-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                      {submitting ? "Processing Transaction..." : "Place Shipment Order"}
                    </button>
                  </form>
                </div>
              </>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default CartCheckout;
