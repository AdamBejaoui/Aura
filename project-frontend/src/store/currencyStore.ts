import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Currency = 'TND' | 'USD' | 'EUR' | 'GBP';

type CurrencyState = {
    currency: Currency;
    rates: Record<Currency, number>;
    setCurrency: (currency: Currency) => void;
    formatPrice: (amount: number) => string;
};

export const useCurrencyStore = create<CurrencyState>()(
    persist(
        (set, get) => ({
            currency: 'TND',
            // Default rates relative to TND (1 TND = ...)
            rates: {
                TND: 1,
                USD: 0.32,
                EUR: 0.30,
                GBP: 0.25
            },
            setCurrency: (currency) => set({ currency }),
            formatPrice: (amount) => {
                const { currency, rates } = get();
                const rate = rates[currency] || 1;
                const convertedAmount = amount * rate;

                return new Intl.NumberFormat(currency === 'TND' ? 'fr-TN' : 'en-US', {
                    style: 'currency',
                    currency: currency,
                    maximumFractionDigits: 0,
                }).format(convertedAmount);
            },
        }),
        {
            name: 'aura-currency',
        }
    )
);
