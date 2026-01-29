import { AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../store/uiStore';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';
import CartCheckout from '../features/cart/CartCheckout';
import WishlistSidebar from '../features/wishlist/WishlistSidebar';
import AccountSidebar from '../features/auth/AccountSidebar';
import OrderHistorySidebar from '../features/order/OrderHistorySidebar';
import AuthModal from '../features/auth/AuthModal';
import ProductDetailModal from '../features/product/ProductDetailModal';

const GlobalSidebars = () => {
    const {
        isCartOpen, toggleCart,
        isWishlistOpen, toggleWishlist,
        isProfileOpen, toggleProfile,
        isOrdersOpen, toggleOrders,
        isProductDetailOpen, setProductDetailOpen,
        selectedProduct, setSelectedProduct
    } = useUIStore();

    const { isAuthOpen, setAuthOpen } = useAuthStore();
    const { items, updateQuantity, confirmationMessage, setConfirmationMessage } = useCartStore();

    return (
        <AnimatePresence>
            {isCartOpen && (
                <CartCheckout
                    isOpen={isCartOpen}
                    items={items}
                    confirmationMessage={confirmationMessage}
                    onClose={() => toggleCart(false)}
                    onUpdateQuantity={updateQuantity}
                    onSubmitOrder={() => { }}
                />
            )}
            {isWishlistOpen && (
                <WishlistSidebar />
            )}
            {isProfileOpen && (
                <AccountSidebar isOpen={isProfileOpen} onClose={() => toggleProfile(false)} />
            )}
            {isOrdersOpen && (
                <OrderHistorySidebar isOpen={isOrdersOpen} onClose={() => toggleOrders(false)} />
            )}
            {isAuthOpen && (
                <AuthModal isOpen={isAuthOpen} onClose={() => setAuthOpen(false)} />
            )}
            {isProductDetailOpen && (
                <ProductDetailModal
                    product={selectedProduct}
                    isOpen={isProductDetailOpen}
                    onClose={() => {
                        setProductDetailOpen(false);
                        setSelectedProduct(null);
                    }}
                />
            )}
        </AnimatePresence>
    );
};

export default GlobalSidebars;
