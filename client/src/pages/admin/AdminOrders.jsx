import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services';

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders({ 
        status: statusFilter,
        limit: 100 
      });
      setOrders(response.data.orders);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, { status: newStatus });
      toast.success('Order status updated');
      fetchOrders();
      setSelectedOrder(null);
    } catch (error) {
      toast.error('Failed to update status');
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

  const statuses = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Orders Management</h1>

      {/* Status Filter */}
      <div className="mb-6 flex gap-2 flex-wrap">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded transition ${
              statusFilter === status
                ? 'bg-gray-900 text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Orders List */}
        <div className="lg:col-span-2">
          {loading ? (
            <div className="text-center py-12">Loading...</div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left py-3 px-4">Order ID</th>
                    <th className="text-left py-3 px-4">Customer</th>
                    <th className="text-left py-3 px-4">Total</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr
                      key={order.id}
                      onClick={() => setSelectedOrder(order)}
                      className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                        selectedOrder?.id === order.id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-semibold">#{order.id}</td>
                      <td className="py-3 px-4">{order.customerName}</td>
                      <td className="py-3 px-4">TND {(parseFloat(order.total_price) || 0).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Order Details */}
        <div className="lg:col-span-1">
          {selectedOrder ? (
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-bold mb-4">Order #{selectedOrder.id}</h2>

              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-gray-600 text-sm">Customer</p>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Email</p>
                  <p className="font-semibold">{selectedOrder.customerEmail}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Total Amount</p>
                  <p className="font-semibold text-lg">
                    TND {(parseFloat(selectedOrder.total_price) || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Shipping Address</p>
                  <p className="text-sm">{selectedOrder.shipping_address}</p>
                  <p className="text-sm">{selectedOrder.wilaya}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Phone</p>
                  <p className="font-semibold">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm font-semibold mb-2">Items Ordered ({selectedOrder.itemsCount})</p>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedOrder.items?.map((item, idx) => (
                      <div key={idx} className="text-sm bg-gray-50 p-2 rounded">
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-gray-600">Qty: {item.quantity} × TND {parseFloat(item.price).toFixed(2)}</p>
                        {(item.size || item.color) && (
                          <p className="text-gray-500 text-xs">
                            {item.size && `Size: ${item.size}`} {item.color && `Color: ${item.color}`}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mb-6 pb-6 border-b border-gray-200">
                <label className="block text-sm font-semibold mb-2">Update Status</label>
                <select
                  value={selectedOrder.status}
                  onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">Select an order to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
