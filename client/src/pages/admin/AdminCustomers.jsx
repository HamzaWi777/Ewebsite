import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../../services';

export function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers({ limit: 50 });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => ({
    admin: 'bg-purple-100 text-purple-800',
    client: 'bg-blue-100 text-blue-800',
  }[role] || 'bg-gray-100 text-gray-800');

  return (
    <div>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">Customers</h1>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  {['Name', 'Email', 'Phone', 'Wilaya', 'Role', 'Joined'].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-sm">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="py-3 px-4 font-semibold">{user.full_name}</td>
                    <td className="py-3 px-4 text-sm">{user.email}</td>
                    <td className="py-3 px-4 text-sm">{user.phone}</td>
                    <td className="py-3 px-4 text-sm">{user.wilaya}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${getRoleBadge(user.role)}`}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {users.length === 0 && <div className="text-center py-8 text-gray-600">No customers found</div>}
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {users.length === 0 ? (
              <p className="text-center text-gray-600 py-8">No customers found</p>
            ) : users.map(user => (
              <div key={user.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold">{user.full_name}</p>
                  <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getRoleBadge(user.role)}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-1">{user.email}</p>
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{user.phone} {user.wilaya ? `· ${user.wilaya}` : ''}</span>
                  <span>{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center flex-wrap gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button key={page}
              className={`px-3 py-2 rounded text-sm ${pagination.page === page ? 'bg-gray-900 text-white' : 'bg-gray-200 text-gray-800'}`}>
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}