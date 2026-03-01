import { useNavigate, Routes, Route } from 'react-router-dom';
import { AdminDashboard } from './AdminDashboard';
import { AdminProducts } from './AdminProducts';
import { AdminOrders } from './AdminOrders';
import { AdminCustomers } from './AdminCustomers';

export function AdminLayout() {
  const navigate = useNavigate();
  const [activeMenu, setActiveMenu] = React.useState('dashboard');

  return (
    <div className="flex gap-8">
      {/* Sidebar */}
      <aside className="w-64 bg-white rounded-lg shadow p-6 h-fit sticky top-8">
        <nav className="space-y-2">
          {[
            { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard' },
            { id: 'products', label: 'Products', path: '/admin/products' },
            { id: 'orders', label: 'Orders', path: '/admin/orders' },
            { id: 'customers', label: 'Customers', path: '/admin/customers' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveMenu(item.id);
                navigate(item.path);
              }}
              className={`w-full text-left px-4 py-2 rounded transition ${
                activeMenu === item.id
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/products" element={<AdminProducts />} />
          <Route path="/orders" element={<AdminOrders />} />
          <Route path="/customers" element={<AdminCustomers />} />
        </Routes>
      </main>
    </div>
  );
}

import React from 'react';
