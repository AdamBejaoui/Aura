import React, { FormEvent, useMemo, useState } from "react";
import { X, Phone, MapPin, User, CheckCircle2, CreditCard, Banknote, ShoppingBag } from "lucide-react";
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
        className="relative w-full max-w-md md:max-w-6xl bg-white dark:bg-neutral-900 h-full shadow-[0_0_50px_rgba(0,0,0,0.1)] flex flex-col border-l border-stone-100 dark:border-neutral-800 md:rounded-l-[3rem] p-8 md:p-10 pt-safe overflow-hidden"
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

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden -mx-8 md:-mx-10">
          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full flex flex-col items-center justify-center p-12 text-center"
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
                <div className="w-full md:w-[40%] bg-stone-50 dark:bg-neutral-800/50 p-6 md:p-8 pt-0 overflow-y-auto no-scrollbar border-b md:border-b-0 md:border-r border-stone-100 dark:border-neutral-800 pb-32 md:pb-8">
                  <div className="mb-6">
                    <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Archives</h3>
                  </div>

                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.product.id} className="flex gap-3 group">
                        <div className="w-12 h-16 bg-white dark:bg-neutral-800 rounded-xl overflow-hidden border border-stone-100 dark:border-neutral-700 flex-shrink-0">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                        </div>
                        <div className="flex-1 flex flex-col justify-between py-0.5">
                          <div>
                            <h4 className="text-[10px] font-black text-stone-900 dark:text-white uppercase tracking-tight line-clamp-1">{item.product.name}</h4>
                            <p className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-0.5">{item.product.category}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-stone-900 dark:text-white tracking-wider">${item.product.price}</span>
                            <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 rounded-lg px-2 py-0.5 border border-stone-100 dark:border-neutral-700">
                              <button onClick={() => onUpdateQuantity(item.product.id, Math.max(0, item.quantity - 1))} className="text-stone-300 hover:text-stone-900 dark:hover:text-white text-[10px]">-</button>
                              <span className="text-[9px] font-black dark:text-white w-3 text-center">{item.quantity}</span>
                              <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} className="text-stone-300 hover:text-stone-900 dark:hover:text-white text-[10px]">+</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Investment</span>
                      <span className="text-lg font-black text-stone-900 dark:text-white tracking-widest">${orderTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 p-6 md:p-8 pt-0 bg-white dark:bg-neutral-900 overflow-y-auto no-scrollbar pb-32 md:pb-8">
                  <div className="mb-6">
                    <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em]">Logistics</h3>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Identity</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                          <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" required className="w-full bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-800 rounded-2xl pl-12 pr-6 py-3 text-xs font-black focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Communication</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" required className="w-full bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-800 rounded-2xl pl-12 pr-6 py-3 text-xs font-black focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Destination</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-300" />
                        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Full Address" required className="w-full bg-stone-50 dark:bg-neutral-800 border border-stone-100 dark:border-neutral-800 rounded-2xl pl-12 pr-6 py-3 text-xs font-black focus:outline-none focus:ring-4 focus:ring-stone-900/5 transition-all dark:text-white" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Preference</label>
                      <div className="grid grid-cols-5 gap-2">
                        {sizes.map((s) => (
                          <button key={s} type="button" onClick={() => setSize(s)} className={`py-2 rounded-xl text-[10px] font-black transition-all border ${size === s ? 'bg-stone-900 dark:bg-white text-white dark:text-black border-transparent shadow-xl' : 'bg-stone-50 dark:bg-neutral-800 text-stone-400 border-stone-100 dark:border-neutral-800'}`}>{s}</button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[8px] font-black text-stone-400 uppercase tracking-widest ml-1">Settlement</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
