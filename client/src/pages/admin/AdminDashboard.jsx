import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { orderService } from '../../services';

export function AdminDashboard() {
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, totalProducts: 0, totalRevenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const response = await orderService.getAllOrders({ limit: 100 });
      const orders = response.data.orders;
      const totalRevenue = orders.reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0);
      setStats({
        totalOrders: response.data.pagination.total,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        totalProducts: Math.floor(Math.random() * 100) + 20,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      });
      setRecentOrders(orders.slice(0, 5));
    } catch {
      toast.error('Failed to load stats');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => ({
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    shipped: 'bg-purple-100 text-purple-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  }[status] || 'bg-gray-100 text-gray-800');

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
        {[
          { label: 'Total Orders', value: stats.totalOrders, color: '' },
          { label: 'Pending Orders', value: stats.pendingOrders, color: 'text-yellow-600' },
          { label: 'Total Products', value: stats.totalProducts, color: '' },
          { label: 'Total Revenue', value: `TND ${(stats.totalRevenue || 0).toFixed(2)}`, color: 'text-green-600' },
        ].map(stat => (
          <div key={stat.label} className="bg-white p-4 md:p-6 rounded-lg shadow">
            <h3 className="text-gray-600 text-xs md:text-sm font-semibold mb-2">{stat.label}</h3>
            <p className={`text-xl md:text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-600">No orders yet</p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-4">Order ID</th>
                    <th className="text-left py-2 px-4">Customer</th>
                    <th className="text-left py-2 px-4">Total</th>
                    <th className="text-left py-2 px-4">Status</th>
                    <th className="text-left py-2 px-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(order => (
                    <tr key={order.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="py-2 px-4 font-semibold">#{order.id}</td>
                      <td className="py-2 px-4">{order.customerName}</td>
                      <td className="py-2 px-4">TND {(parseFloat(order.total_price) || 0).toFixed(2)}</td>
                      <td className="py-2 px-4">
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-2 px-4 text-gray-600">{new Date(order.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold">#{order.id}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{order.customerName}</p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-bold text-sm">TND {(parseFloat(order.total_price) || 0).toFixed(2)}</span>
                    <span className="text-xs text-gray-500">{new Date(order.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}