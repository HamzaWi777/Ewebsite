import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { cartService, orderService } from '../services';
import { useAuth } from '../context/AuthContext';
import { governorates } from '../constants/governorates';

function CheckoutPageContent() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isGuest = !user;
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    shipping_address: user?.address || '',
    phone: user?.phone || '',
    wilaya: user?.wilaya || '',
    notes: '',
    // Guest fields
    ...(isGuest && {
      full_name: '',
      email: '',
    }),
  });

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    setLoading(true);
    try {
      if (isGuest) {
        // For guests, cart would be stored in localStorage or via session ID
        const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]');
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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderData = {
        ...formData,
        // Add guest info and cart items if guest
        ...(isGuest && {
          guest_name: formData.full_name,
          guest_email: formData.email,
          cartItems: cartItems, // Send cart items in request body for guests
        }),
      };

      const response = await orderService.createOrder(orderData);
      toast.success('Order placed successfully!');
      
      // Clear guest cart
      if (isGuest) {
        localStorage.removeItem('guestCart');
        localStorage.removeItem('guestSessionId');
      }
      
      navigate(`/`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const totalPrice = cartItems.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + price * item.quantity;
  }, 0);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p className="text-gray-600 mb-4">Your cart is empty</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4">
              {cartItems.map(item => (
                <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0">
                  {item.images?.[0] && (
                    <img
                      src={`http://localhost:5000${item.images[0]}`}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      {item.size} | {item.color} | Qty: {item.quantity}
                    </p>
                  </div>
                  <p className="text-right">
                    TND {((typeof item.price === 'string' ? parseFloat(item.price) : item.price) * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 mt-6">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>TND {totalPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span className="text-green-600">8.00 TND</span>
              </div>
              <div className="flex justify-between text-xl font-bold pt-2 border-t border-gray-200">
                <span>Total:</span>
                <span>TND {(totalPrice + 8.00).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Checkout Form */}
        <div className="bg-white p-6 rounded-lg shadow h-fit">
          <h2 className="text-2xl font-bold mb-6">Shipping Information</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isGuest ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={user?.full_name || ''}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <textarea
                name="shipping_address"
                value={formData.shipping_address}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Governorate *
              </label>
              <select
                name="wilaya"
                value={formData.wilaya}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              >
                <option value="">Select Governorate</option>
                {governorates.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                placeholder="Special instructions, delivery preferences, etc."
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-gray-900 text-white py-3 rounded-lg hover:bg-gray-800 transition disabled:opacity-50 font-semibold text-lg"
            >
              {submitting ? 'Placing Order...' : 'Confirm Order'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="w-full border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition"
            >
              Back to Cart
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPageContent;

