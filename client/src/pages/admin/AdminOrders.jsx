import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services';

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders({ status: statusFilter, limit: 100 });
      setOrders(response.data.orders);
    } catch {
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
    } catch {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => ({
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800');

  const statuses = ['all', 'pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

  const OrderDetailPanel = ({ order, onClose }) => (
    <div className="bg-white rounded-lg shadow p-5">
      <h2 className="text-xl font-bold mb-4">Order #{order.id}</h2>
      <div className="space-y-3 mb-6">
        {[
          { label: 'Customer', value: order.customerName },
          { label: 'Email', value: order.customerEmail },
          { label: 'Phone', value: order.phone },
          { label: 'Wilaya', value: order.wilaya },
          { label: 'Shipping Address', value: order.shipping_address },
        ].map(f => f.value && (
          <div key={f.label}>
            <p className="text-gray-500 text-xs">{f.label}</p>
            <p className="font-medium text-sm">{f.value}</p>
          </div>
        ))}
        <div>
          <p className="text-gray-500 text-xs">Total Amount</p>
          <p className="font-bold text-base">TND {(parseFloat(order.total_price) || 0).toFixed(2)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-xs font-semibold mb-2">Items ({order.itemsCount})</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {order.items?.map((item, idx) => (
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

      <div className="mb-4 pb-4 border-b border-gray-200">
        <label className="block text-sm font-semibold mb-2">Update Status</label>
        <select
          value={order.status}
          onChange={(e) => handleStatusChange(order.id, e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
        >
          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      <button onClick={onClose} className="w-full px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition text-sm">
        Close
      </button>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Orders Management</h1>

      {/* Status filter — scrollable on mobile */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {statuses.map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 md:px-4 py-2 rounded transition text-sm whitespace-nowrap flex-shrink-0 ${
              statusFilter === status ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Orders list */}
          <div className="lg:col-span-2">
            {/* Desktop table */}
            <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
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
                      className={`border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${selectedOrder?.id === order.id ? 'bg-gray-100' : ''}`}
                    >
                      <td className="py-3 px-4 font-semibold">#{order.id}</td>
                      <td className="py-3 px-4">{order.customerName}</td>
                      <td className="py-3 px-4">TND {(parseFloat(order.total_price) || 0).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {orders.map(order => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white border rounded-lg p-4 cursor-pointer transition ${
                    selectedOrder?.id === order.id ? 'border-gray-900' : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold">#{order.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm font-medium">{order.customerName}</p>
                  <div className="flex justify-between mt-2">
                    <span className="font-bold text-sm">TND {(parseFloat(order.total_price) || 0).toFixed(2)}</span>
                    <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Tap to manage →</p>
                </div>
              ))}
              {orders.length === 0 && <p className="text-center text-gray-600 py-8">No orders found</p>}
            </div>
          </div>

          {/* Desktop: sidebar panel */}
          <div className="hidden lg:block lg:col-span-1">
            {selectedOrder
              ? <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} />
              : <div className="text-center py-12 bg-white rounded-lg shadow"><p className="text-gray-600">Select an order to view details</p></div>
            }
          </div>
        </div>
      )}

      {/* Mobile: full-screen modal */}
      {selectedOrder && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[90vh] overflow-y-auto p-4">
            <div className="w-10 h-1 bg-gray-300 rounded mx-auto mb-4" />
            <OrderDetailPanel order={selectedOrder} onClose={() => setSelectedOrder(null)} />
          </div>
        </div>
      )}
    </div>
  );
}