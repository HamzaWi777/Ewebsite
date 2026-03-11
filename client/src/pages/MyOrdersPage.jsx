import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderService } from '../services';
import { PrivateRoute } from '../components/ProtectedRoute';

function MyOrdersPageContent() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getUserOrders();
      setOrders(response.data);
      if (orderId) {
        const order = response.data.find(o => o.id === parseInt(orderId));
        if (order) {
          fetchOrderDetails(order.id);
        }
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (id) => {
    try {
      const response = await orderService.getOrderDetails(id);
      setSelectedOrder(response.data);
    } catch (error) {
      toast.error('Failed to load order details');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      shipped: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">You haven't placed any orders yet</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gray-900 text-white px-6 py-2 rounded hover:bg-gray-800 transition"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Orders List */}
          <div className="lg:col-span-1 bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-4">Orders</h2>
              <div className="space-y-2">
                {orders.map(order => (
                  <button
                    key={order.id}
                    onClick={() => fetchOrderDetails(order.id)}
                    className={`w-full p-4 rounded text-left transition ${
                      selectedOrder?.id === order.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <p className="font-semibold">Order #{order.id}</p>
                    <p className="text-sm opacity-75">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                    <p className={`text-sm font-semibold mt-2 ${selectedOrder?.id === order.id ? '' : 'text-gray-600'}`}>
                      TND{(parseFloat(order.total_price) || 0).toFixed(2)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">Order #{selectedOrder.id}</h2>

                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold mb-2">Order Status</h3>
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Date</h3>
                    <p>{new Date(selectedOrder.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mb-6 pb-6 border-b border-gray-200">
                  <h3 className="font-semibold mb-3">Shipping Information</h3>
                  <p className="text-gray-600 mb-2">{selectedOrder.shipping_address}</p>
                  <p className="text-gray-600">{selectedOrder.wilaya} | {selectedOrder.phone}</p>
                </div>

                {selectedOrder.notes && (
                  <div className="mb-6 pb-6 border-b border-gray-200">
                    <h3 className="font-semibold mb-2">Notes</h3>
                    <p className="text-gray-600">{selectedOrder.notes}</p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold mb-4">Order Items</h3>
                  <div className="space-y-4 mb-6">
                    {selectedOrder.items?.map(item => (
                      <div
                        key={item.id}
                        className="flex gap-4 pb-4 border-b border-gray-200 last:border-b-0"
                      >
                        {item.images[0] && (
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
                        <div className="text-right">
                          <p className="font-semibold">
                            TND{(parseFloat(item.price) || 0).toFixed(2)} each
                          </p>
                          <p className="text-gray-600">
                            Subtotal: TND{((parseFloat(item.price) || 0) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total:</span>
                      <span>TND{(parseFloat(selectedOrder.total_price) || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-600">Select an order to view details</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyOrdersPage() {
  return (
    <PrivateRoute>
      <MyOrdersPageContent />
    </PrivateRoute>
  );
}
