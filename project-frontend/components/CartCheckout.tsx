// CartCheckout.tsx
import React from "react";
import { FormEvent, useMemo, useState } from "react";
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
  onUpdateQuantity: (productId: number, nextQuantity: number) => void;
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cart-checkout-heading"
    >
      <div className="relative flex w-full max-w-4xl flex-col gap-6 overflow-hidden rounded-3xl bg-white p-6 shadow-[0_30px_120px_-50px_rgba(15,23,42,0.65)] sm:p-10">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
          aria-label="Close cart"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        <header className="flex flex-col gap-2 pr-12">
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-500">
            LuxeLayer Cart
          </span>
          <h2 id="cart-checkout-heading" className="text-2xl font-semibold text-slate-900 sm:text-3xl">
            Review your selection & share delivery details
          </h2>
        </header>

        <section className="flex flex-col gap-5 rounded-2xl border border-slate-100 bg-slate-50/60 p-4 sm:p-6">
{!hasItems ? (
  <p className="text-sm text-stone-500">
    Your cart is currently empty. Add a piece you love to continue.
  </p>
) : (
  <>
    <ul className="space-y-5">
      {items.map((item) => (
        <li
          key={item.product.id}
          className="flex items-start justify-between gap-5 pb-5 border-b border-stone-100 last:border-0 last:pb-0"
        >
          <div className="flex gap-4">
            <div className="w-20 h-24 flex-shrink-0 overflow-hidden rounded-lg border border-stone-200">
              <img
                src={item.product.image}
                alt={item.product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h4 className="font-serif font-light text-stone-900">
                {item.product.name}
              </h4>
              <p className="text-sm text-stone-500 mt-1">
                {item.product.category}
              </p>
              <p className="text-sm font-medium mt-2">
                {formatCurrency(item.product.price)}
              </p>
            </div>
          </div>

    <div className="flex items-center gap-3">
  {/* Quantity */}
  <div className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-1">
    <button
      type="button"
      onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
      className="text-lg font-semibold text-stone-500 hover:text-stone-900"
    >
      −
    </button>
    <span className="w-6 text-center font-semibold text-stone-900">
      {item.quantity}
    </span>
    <button
      type="button"
      onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
      className="text-lg font-semibold text-stone-500 hover:text-stone-900"
    >
      +
    </button>
  </div>

  {/* Remove button */}
  <button
    type="button"
    onClick={() => onUpdateQuantity(item.product.id, 0)} // quantity=0 → removes item
    className="text-stone-400 hover:text-rose-500 transition"
    aria-label={`Remove ${item.product.name} from cart`}
  >
    🗑️
  </button>
</div>  
        </li>
      ))}
    </ul>

    {hasItems && (
      <div className="pt-4 flex justify-between border-t border-stone-200">
        <span className="text-stone-500 font-medium">Total</span>
        <span className="text-xl font-serif font-light text-stone-900">
          {orderTotal.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
          })}
        </span>
      </div>
    )}
  </>
)}
     {hasItems && (
  <div className="pt-4 flex justify-between border-t border-stone-200">
    <span className="text-stone-500 font-medium">Total</span>
    <span className="text-xl font-serif font-light text-stone-900">
      {orderTotal.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
      })}
    </span>
  </div>
)}
        </section>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              Full name
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                placeholder="Elena Marques"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                required
                disabled={submitting}
              />
            </label>
            <label className="flex flex-col gap-2 text-sm text-slate-600">
              Phone number
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+1 555 010 2045"
                className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
                required
                disabled={submitting}
              />
            </label>
          </div>
          <label className="flex flex-col gap-2 text-sm text-slate-600">
            Delivery address
            <textarea
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              placeholder="123 Atelier Lane, Suite 4B, New York, NY 10013"
              className="min-h-[96px] rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
              required
              disabled={submitting}
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-slate-600 sm:w-52">
            Preferred size
            <select
              value={size}
              onChange={(event) => setSize(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-900 shadow-sm focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-200"
              disabled={submitting}
            >
              {sizes.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          {error && <p className="text-sm text-rose-500">{error}</p>}
          {confirmationMessage && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {confirmationMessage}
            </div>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              A stylist from LuxeLayer will review your request and confirm availability.
            </p>
            <button
              type="submit"
              className="inline-flex min-h-touch items-center justify-center rounded-full bg-rose-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-not-allowed disabled:bg-rose-300"
              disabled={!hasItems || submitting}
            >
              {submitting ? "Submitting..." : "Send request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CartCheckout;