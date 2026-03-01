import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import { cartService } from '../services';
import { useAuth } from '../context/AuthContext';
import { 
  getGuestCart, 
  updateGuestCartItem, 
  removeFromGuestCart 
} from '../utils/guestCart';

export function CartPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = !user;
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCart();
  }, [user]);

  const fetchCart = async () => {
    setLoading(true);
    try {
      if (isGuest) {
        const guestCart = getGuestCart();
        setCartItems(guestCart);
      } else {
        const response = await cartService.getCart();
        setCartItems(response.data);
      }
    } catch (error) {
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      if (isGuest) {
        const updated = updateGuestCartItem(itemId, newQuantity);
        setCartItems(updated);
      } else {
        await cartService.updateCartItem(itemId, { quantity: newQuantity });
        setCartItems(cartItems.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        ));
      }
      toast.success('Cart updated');
    } catch (error) {
      toast.error('Failed to update cart');
    }
  };

  const handleRemoveItem = async (itemId) => {
    try {
      if (isGuest) {
        const updated = removeFromGuestCart(itemId);
        setCartItems(updated);
      } else {
        await cartService.removeFromCart(itemId);
        setCartItems(cartItems.filter(item => item.id !== itemId));
      }
      toast.success('Item removed from cart');
    } catch (error) {
      toast.error('Failed to remove item');
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + price * item.quantity;
  }, 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('home.loading')}</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">{t('cart.title')}</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">{t('cart.empty')}</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition"
          >
            {t('cart.continueShopping')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map(item => (
                <div
                  key={item.id}
                  className="bg-white p-3 md:p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4"
                >
                  {item.images[0] && (
                    <img
                      src={item.images[0].startsWith('http') ? item.images[0] : `http://localhost:5000${item.images[0]}`}
                      alt={item.name}
                      className="w-full sm:w-24 sm:h-24 h-40 object-cover rounded"
                    />
                  )}

                  <div className="flex-1">
                    <h3 className="font-semibold text-base md:text-lg">{item.name}</h3>
                    <p className="text-xs md:text-sm text-gray-600">
                      {t('productDetail.size')}: {item.size} | {t('productDetail.color')}: {item.color}
                    </p>
                    <p className="text-base md:text-lg font-bold mt-2">
                      ${(typeof item.price === 'string' ? parseFloat(item.price) : item.price).toFixed(2)}
                    </p>

                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 1)}
                          className="w-12 text-center text-sm px-2 py-1 border border-gray-300 rounded"
                          min="1"
                        />
                        <button
                          onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        {t('cart.remove')}
                      </button>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-base md:text-lg font-bold">
                      ${((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-4 md:p-6 rounded-lg shadow sticky top-20">
              <h2 className="text-lg md:text-xl font-bold mb-4">{t('cart.orderSummary')}</h2>

              <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                <div className="flex justify-between text-sm md:text-base">
                  <span>{t('cart.subtotal')}:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm md:text-base">
                  <span>{t('cart.shipping')}:</span>
                  <span className="text-green-600">{t('cart.free')}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg md:text-xl font-bold mb-6">
                <span>{t('cart.total')}:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition font-semibold text-sm md:text-base"
              >
                {t('cart.checkout')}
              </button>

              <button
                onClick={() => navigate('/products')}
                className="w-full mt-2 border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition text-sm md:text-base"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
