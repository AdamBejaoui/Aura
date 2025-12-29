import React, { FormEvent, useMemo, useState } from "react";
import { X, Phone, MapPin, User, CheckCircle2, CreditCard, Banknote } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import type { CartItem } from "../../../store/cartStore";
import { useAuthStore } from "../../../store/authStore";

const sizes = ["XS", "S", "M", "L", "XL"] as const;

export type CheckoutDetails = {
  fullName: string;
  phone: string;
  address: string;
  size: string;
};

type CartCheckoutProps = {
  isOpen: boolean;
  items: CartItem[];
  confirmationMessage: string | null;
  onClose: () => void;
  onUpdateQuantity: (productId: string, nextQuantity: number) => void;
  onSubmitOrder: (details: CheckoutDetails) => void;
};

const CartCheckout = ({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onSubmitOrder,
}: CartCheckoutProps) => {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [size, setSize] = useState<string>(sizes[2]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');

  const { user } = useAuthStore();

  React.useEffect(() => {
    if (user) {
      setFullName(user.name || "");
    }
  }, [user]);

  const orderTotal = useMemo(
    () =>
      items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [items]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim() || !size.trim()) {
      setError("Please ensure all fields are correctly completed.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      await axios.post("/api/orders", {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        size,
        items: orderItems,
        paymentMethod,
        userId: user ? user.id : undefined,
        email: user ? user.email : undefined,
      });

      setIsSuccess(true);

      onSubmitOrder({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        size,
      });

      setFullName("");
      setPhone("");
      setAddress("");
      setSize(sizes[2]);
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
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-stone-950/40 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full max-w-5xl bg-white dark:bg-neutral-900 rounded-[3rem] shadow-[0_0_80px_rgba(0,0,0,0.15)] overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto md:max-h-[85vh] border border-stone-100 dark:border-neutral-800"
      >
        <AnimatePresence mode="wait">
          {isSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-12 text-center"
            >
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2.5rem] flex items-center justify-center mb-8 border border-emerald-100 dark:border-emerald-900/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-3xl font-black text-stone-900 dark:text-white uppercase tracking-tighter mb-4">Order Acquired</h2>
              <p className="text-[10px] font-black text-stone-400 uppercase tracking-[0.2em] mb-12">We will contact you shortly to confirm logistics</p>
              <button
                onClick={handleClose}
                className="px-12 py-5 bg-stone-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-105 transition-all"
              >
                Return to Collection
              </button>
            </motion.div>
          ) : (
            <>
              {/* Order Summary */}
              <div className="w-full md:w-[40%] bg-stone-50 dark:bg-neutral-800/50 p-8 md:p-12 overflow-y-auto no-scrollbar border-b md:border-b-0 md:border-r border-stone-100 dark:border-neutral-800">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Archives ({items.length})</h3>
                  <button onClick={handleClose} className="md:hidden p-2 hover:scale-110 hover:rotate-90 transition-all duration-300"><X className="w-5 h-5 text-stone-400" /></button>
                </div>

                <div className="space-y-8">
                  {items.map((item) => (
                    <div key={item.product.id} className="flex gap-6 group">
                      <div className="w-20 h-24 bg-white dark:bg-neutral-800 rounded-2xl overflow-hidden border border-stone-100 dark:border-neutral-700 flex-shrink-0">
                        <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <h4 className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-tight line-clamp-1">{item.product.name}</h4>
                          <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-1">{item.product.category}</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-stone-900 dark:text-white tracking-wider">${item.product.price}</span>
                          <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-xl px-3 py-1.5 border border-stone-100 dark:border-neutral-700">
                            <button onClick={() => onUpdateQuantity(item.product.id, Math.max(0, item.quantity - 1))} className="text-stone-300 hover:text-stone-900 dark:hover:text-white">-</button>
                            <span className="text-[10px] font-black dark:text-white w-4 text-center">{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} className="text-stone-300 hover:text-stone-900 dark:hover:text-white">+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-12 pt-8 border-t border-stone-200 dark:border-stone-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Investment</span>
                    <span className="text-2xl font-black text-stone-900 dark:text-white tracking-widest">${orderTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Form */}
              <div className="flex-1 p-8 md:p-12 bg-white dark:bg-neutral-900 overflow-y-auto no-scrollbar">
                <div className="flex items-center justify-between mb-12">
                  <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Logistics</h3>
                  <button onClick={handleClose} className="hidden md:block p-3 text-stone-300 hover:text-stone-900 dark:hover:text-white transition-all hover:scale-110 hover:rotate-90 duration-300">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Identity</label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required className="w-full bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-xs font-black focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Communication</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" required className="w-full bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-xs font-black focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Destination</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-5 w-4 h-4 text-stone-300" />
                      <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full Address" required rows={3} className="w-full bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-800 rounded-2xl pl-12 pr-6 py-4 text-xs font-black focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white resize-none" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Preference</label>
                    <div className="grid grid-cols-5 gap-3">
                      {sizes.map((s) => (
                        <button key={s} type="button" onClick={() => setSize(s)} className={`py-3 rounded-xl text-[10px] font-black transition-all border ${size === s ? 'bg-stone-900 dark:bg-white text-white dark:text-black border-transparent shadow-xl' : 'bg-stone-50 dark:bg-neutral-800 text-stone-400 border-stone-100 dark:border-neutral-800'}`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Settlement</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button type="button" onClick={() => setPaymentMethod('cod')} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${paymentMethod === 'cod' ? 'bg-stone-50 dark:bg-neutral-800/50 border-stone-900 dark:border-white' : 'bg-white dark:bg-neutral-900 border-stone-100 dark:border-neutral-800'}`}>
                        <div className={`p-2 rounded-xl ${paymentMethod === 'cod' ? 'bg-stone-900 text-white dark:bg-white dark:text-black' : 'bg-stone-50 dark:bg-neutral-800 text-stone-300'}`}><Banknote className="w-5 h-5" /></div>
                        <div className="text-left"><span className="block text-[10px] font-black uppercase tracking-tight dark:text-white">Pay on Delivery</span><span className="block text-[8px] font-bold text-stone-400 uppercase tracking-widest">Standard Service</span></div>
                      </button>
                      <button type="button" disabled className="flex items-center gap-4 p-4 rounded-2xl border border-stone-100 dark:border-neutral-800 bg-stone-50/50 dark:bg-neutral-900/50 opacity-50 cursor-not-allowed">
                        <div className="p-2 rounded-xl bg-stone-50 dark:bg-neutral-950 text-stone-300"><CreditCard className="w-5 h-5" /></div>
                        <div className="text-left"><span className="block text-[10px] font-black uppercase tracking-tight dark:text-white">Secure Credit</span><span className="block text-[8px] font-bold text-stone-400 uppercase tracking-widest">Coming Soon</span></div>
                      </button>
                    </div>
                  </div>

                  {error && <div className="p-4 bg-rose-50 dark:bg-rose-900/10 rounded-2xl border border-rose-100 dark:border-rose-900/20 text-[10px] font-black text-rose-600 dark:text-rose-400 uppercase tracking-tight text-center">{error}</div>}

                  <button type="submit" disabled={!hasItems || submitting} className="w-full py-5 bg-stone-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50">
                    {submitting ? "Processing Transaction..." : "Place Shipment Order"}
                  </button>
                </form>
              </div>
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default CartCheckout;
