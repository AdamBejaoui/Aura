import React, { FormEvent, useMemo, useState } from "react";
import { X } from "lucide-react";
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
  confirmationMessage,
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
      const orderItems = items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity
      }));

      // Submit order to backend
      await axios.post("http://localhost:5000/api/orders", {
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        size,
        items: orderItems
      });

      // Show success message
      onSubmitOrder({
        fullName: fullName.trim(),
        phone: phone.trim(),
        address: address.trim(),
        size,
      });

      // Reset form
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

  if (!isOpen) {
    return null;
  }

  const hasItems = items.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 dark:bg-slate-950/80 px-4 py-6 backdrop-blur-sm transition-all duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-checkout-heading"
    >
      <div className="relative flex w-full max-w-4xl flex-col gap-6 overflow-hidden rounded-3xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl p-6 shadow-2xl border border-white/20 dark:border-slate-700/50 sm:p-10 transition-all duration-300">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 shadow-sm transition hover:bg-pink-50 dark:hover:bg-slate-700 hover:text-pink-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-500"
          aria-label="Close cart"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <header className="flex flex-col gap-2 pr-12">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-pink-500 dark:text-pink-400">
            LuxeLayer Cart
          </span>
          <h2 id="cart-checkout-heading" className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl tracking-tight">
            Review your selection
          </h2>
        </header>

        <section className="flex flex-col gap-5 rounded-2xl border border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/30 p-4 sm:p-6 max-h-[30vh] overflow-y-auto">
          {!hasItems ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                Your cart is currently empty.
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Add a piece you love to continue.
              </p>
            </div>
          ) : (
            <>
              <ul className="space-y-5">
                {items.map((item) => (
                  <li
                    key={item.product.id}
                    className="flex items-start justify-between gap-5 pb-5 border-b border-gray-100 dark:border-slate-700/50 last:border-0 last:pb-0"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight">
                          {item.product.name}
                        </h4>
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-1">
                          {item.product.category}
                        </p>
                        <p className="text-sm font-bold mt-2 text-pink-600 dark:text-pink-400">
                          {formatCurrency(item.product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Quantity */}
                      <div className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 shadow-sm">
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="text-lg font-medium text-slate-400 hover:text-pink-500 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-6 text-center font-bold text-slate-900 dark:text-white text-sm">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="text-lg font-medium text-slate-400 hover:text-pink-500 transition-colors"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove button */}
                      <button
                        type="button"
                        onClick={() => onUpdateQuantity(item.product.id, 0)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                        aria-label={`Remove ${item.product.name} from cart`}
                      >
                        <span className="text-lg">×</span>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              {hasItems && (
                <div className="pt-4 flex justify-between border-t border-gray-200 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Total</span>
                  <span className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {orderTotal.toLocaleString("en-US", {
                      style: "currency",
                      currency: "USD",
                    })}
                  </span>
                </div>
              )}
            </>
          )}
        </section>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="grid gap-5 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Full name
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Elena Marques"
                className="rounded-xl border-0 bg-gray-100/50 dark:bg-slate-800/50 px-4 py-3.5 text-base text-slate-900 dark:text-white shadow-inner ring-1 ring-inset ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-pink-500 transition-all placeholder:text-slate-400"
                required
                disabled={submitting}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              Phone number
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1 555 010 2045"
                className="rounded-xl border-0 bg-gray-100/50 dark:bg-slate-800/50 px-4 py-3.5 text-base text-slate-900 dark:text-white shadow-inner ring-1 ring-inset ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-pink-500 transition-all placeholder:text-slate-400"
                required
                disabled={submitting}
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            Delivery address
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="123 Atelier Lane, Suite 4B, New York, NY 10013"
              className="min-h-[96px] rounded-xl border-0 bg-gray-100/50 dark:bg-slate-800/50 px-4 py-3.5 text-base text-slate-900 dark:text-white shadow-inner ring-1 ring-inset ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-pink-500 transition-all placeholder:text-slate-400 resize-none"
              required
              disabled={submitting}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 sm:w-1/3">
            Preferred size
            <div className="relative">
              <select
                value={size}
                onChange={(event) => setSize(event.target.value)}
                className="w-full appearance-none rounded-xl border-0 bg-gray-100/50 dark:bg-slate-800/50 px-4 py-3.5 text-base text-slate-900 dark:text-white shadow-inner ring-1 ring-inset ring-gray-200 dark:ring-slate-700 focus:ring-2 focus:ring-inset focus:ring-pink-500 transition-all cursor-pointer"
                disabled={submitting}
              >
                {sizes.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd" />
                </svg>
              </div>
            </div>
          </label>

          {error && <p className="text-sm font-medium text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">{error}</p>}
          {confirmationMessage && (
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-4 py-3 text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              {confirmationMessage}
            </div>
          )}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pt-2">
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
              A stylist from LuxeLayer will review your request and confirm availability shortly.
            </p>
            <button
              type="submit"
              className="inline-flex min-h-[50px] items-center justify-center rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-pink-500/25 transition-all hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none"
              disabled={!hasItems || submitting}
            >
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                "Confirm Request"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CartCheckout;