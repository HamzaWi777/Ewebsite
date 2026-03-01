import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { userService } from '../../services';

export function AdminCustomers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getAllUsers({ limit: 50 });
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadge = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      client: 'bg-blue-100 text-blue-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Customers Management</h1>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Email</th>
                <th className="text-left py-3 px-4">Phone</th>
                <th className="text-left py-3 px-4">Wilaya</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-3 px-4 font-semibold">{user.full_name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4">{user.phone}</td>
                  <td className="py-3 px-4">{user.wilaya}</td>
                  <td className="py-3 px-4">
                    <span className={`px-3 py-1 rounded text-sm font-semibold ${getRoleBadge(user.role)}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="text-center py-8 text-gray-600">No customers found</div>
          )}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(page => (
            <button
              key={page}
              className={`px-4 py-2 rounded ${
                pagination.page === page
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-200 text-gray-800'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
