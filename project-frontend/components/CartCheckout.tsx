import React, { FormEvent, useMemo, useState } from "react";
import { X, ShoppingBag, Phone, MapPin, User, CheckCircle2 } from "lucide-react";
import axios from "axios";
import type { CartItem } from "../store/cartStore";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

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

  const orderTotal = useMemo(
    () =>
      items.reduce((total, item) => total + item.product.price * item.quantity, 0),
    [items]
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!fullName.trim() || !phone.trim() || !address.trim() || !size.trim()) {
      setError("Please fill in all required details before submitting.");
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      // Format items for backend
      const orderItems = items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      }));

      // Submit order to backend
      await axios.post("http://localhost:5000/api/orders", {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        size,
        items: orderItems,
      });

      // Show success state locally first
      setIsSuccess(true);
      
      // Trigger parent handler
      onSubmitOrder({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        size,
      });

      // Reset form fields
      setFullName("");
      setPhone("");
      setAddress("");
      setSize(sizes[2]);
    } catch (err) {
      console.error("Order submission error:", err);
      setError("Failed to submit order. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  if (!isOpen) {
    return null;
  }

  const hasItems = items.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-950/40 px-4 py-6 backdrop-blur-sm transition-all duration-300"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative flex w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white dark:bg-neutral-900 shadow-2xl ring-1 ring-gray-200 dark:ring-neutral-800 transition-all duration-300">
        
        {/* Header with Close Button */}
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-neutral-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-stone-900 dark:text-white" />
            <span className="font-bold text-gray-900 dark:text-white">Checkout</span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-neutral-800 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-col md:flex-row h-full max-h-[80vh] overflow-hidden">
          
          {/* Success View */}
          {isSuccess ? (
             <div className="flex w-full flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-300">
              <div className="mb-6 rounded-full bg-green-100 p-6 dark:bg-green-900/30">
                <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">Order Confirmed!</h2>
              <div className="max-w-md rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 p-6 mt-4">
                <p className="text-lg font-medium text-green-800 dark:text-green-300">
                  We will call you shortly to confirm the delivery details.
                </p>
              </div>
              <p className="mt-6 text-gray-500 dark:text-gray-400">
                Thank you for shopping with LuxeLayer.
              </p>
              <button
                onClick={handleClose}
                className="mt-8 rounded-xl bg-gray-900 px-8 py-3 font-semibold text-white hover:bg-gray-800 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <>
              {/* Left Side: Order Summary */}
              <div className="w-full md:w-5/12 bg-gray-50/50 dark:bg-neutral-900/50 p-6 md:p-8 overflow-y-auto border-b md:border-b-0 md:border-r border-gray-100 dark:border-neutral-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Summary</h3>
                
                {!hasItems ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 dark:text-gray-400">
                    <ShoppingBag className="h-12 w-12 mb-3 opacity-20" />
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  <ul className="space-y-6">
                    {items.map((item) => (
                      <li key={item.product.id} className="flex gap-4">
                        <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
                          <img
                            src={item.product.images[0]}
                            alt={item.product.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900 dark:text-white line-clamp-1">{item.product.name}</h4>
                            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">{item.product.category}</p>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(item.product.price)}
                            </span>
                            <div className="flex items-center gap-3 bg-white dark:bg-neutral-800 rounded-lg border border-gray-200 dark:border-neutral-700 px-2 py-0.5">
                               <button 
                                onClick={() => onUpdateQuantity(item.product.id, Math.max(0, item.quantity - 1))}
                                className="text-gray-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                               >
                                 -
                               </button>
                               <span className="text-xs font-medium w-4 text-center dark:text-gray-200">{item.quantity}</span>
                               <button 
                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                className="text-gray-400 hover:text-stone-900 dark:hover:text-white transition-colors"
                               >
                                 +
                               </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {hasItems && (
                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-gray-900 dark:text-white">Total</span>
                      <span className="text-2xl font-bold text-stone-900 dark:text-white">
                        {orderTotal.toLocaleString("en-US", { style: "currency", currency: "USD" })}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Shipping Form */}
              <div className="w-full md:w-7/12 p-6 md:p-8 overflow-y-auto bg-white dark:bg-neutral-900">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Shipping Details</h3>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <User className="h-4 w-4" />
                        </div>
                        <input
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="John Doe"
                          required
                          disabled={submitting}
                          className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 pl-10 pr-4 py-3 text-sm focus:border-stone-500 focus:ring-2 focus:ring-stone-500/20 outline-none transition-all dark:text-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Phone className="h-4 w-4" />
                        </div>
                        <input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 234 567 890"
                          required
                          disabled={submitting}
                          className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 pl-10 pr-4 py-3 text-sm focus:border-stone-500 focus:ring-2 focus:ring-stone-500/20 outline-none transition-all dark:text-white placeholder:text-gray-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Delivery Address</label>
                    <div className="relative">
                      <div className="absolute left-3 top-3 text-gray-400">
                          <MapPin className="h-4 w-4" />
                      </div>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street, City, Zip Code"
                        required
                        disabled={submitting}
                        rows={3}
                        className="w-full rounded-xl border border-gray-200 dark:border-neutral-700 bg-gray-50 dark:bg-neutral-800 pl-10 pr-4 py-3 text-sm focus:border-stone-500 focus:ring-2 focus:ring-stone-500/20 outline-none transition-all dark:text-white placeholder:text-gray-400 resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Size Preference</label>
                    <div className="grid grid-cols-5 gap-2">
                        {sizes.map((s) => (
                            <button
                                key={s}
                                type="button"
                                onClick={() => setSize(s)}
                                disabled={submitting}
                                className={`py-2 rounded-lg text-sm font-medium transition-all ${
                                    size === s
                                    ? 'bg-stone-900 dark:bg-white text-white dark:text-black shadow-lg shadow-stone-500/30'
                                    : 'bg-gray-50 dark:bg-neutral-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-neutral-700 hover:border-stone-300 dark:hover:border-neutral-500'
                                }`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                  </div>

                  {error && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={!hasItems || submitting}
                    className="w-full rounded-xl bg-gradient-to-r bg-stone-900 dark:bg-white py-4 text-sm font-bold text-white shadow-lg shadow-stone-500/25 transition-all hover:bg-black dark:hover:bg-gray-200 dark:text-black active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
                  >
                    {submitting ? (
                        <span className="flex items-center justify-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
                            Processing...
                        </span>
                    ) : (
                        "Confirm Request"
                    )}
                  </button>
                  
                  <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-4">
                      By confirming, you agree to our Terms of Service.
                  </p>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartCheckout;
