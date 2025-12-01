import { useState, useEffect } from 'react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';
import AddUserModal from './AddUserModal';

export default function UserManagementTable() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            toast.error('Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
        try {
            await api.put(`/users/${userId}/status`, { status: newStatus });
            toast.success(`User marked as ${newStatus}`);
            fetchUsers(); // Refresh list
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleUserAdded = () => {
        fetchUsers();
        setIsModalOpen(false);
    };

    if (loading) return <div className="p-4 text-center">Loading users...</div>;

    return (
        <div>
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2"
                >
                    <span>+</span> Add New Officer
                </button>
            </div>

            <div className="overflow-x-auto border border-border rounded-lg">
                <table className="w-full text-sm text-left">
                    <thead className="bg-muted text-muted-foreground uppercase">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3">District</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.map((user) => (
                            <tr key={user._id} className="bg-card hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 font-medium text-foreground">{user.name || user.email}</td>
                                <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                <td className="px-6 py-4">
                                    {user.role ? (
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.role === 'Super Admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'Citizen' ? 'bg-gray-100 text-gray-800' :
                                                'bg-blue-100 text-blue-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 text-sm">No role assigned</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-muted-foreground">{user.district || 'N/A'}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                        {user.status || 'Active'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    {user.role !== 'SuperAdmin' && (
                                        <button
                                            onClick={() => handleStatusChange(user._id, user.status || 'Active')}
                                            className={`text-xs px-3 py-1 rounded border ${user.status === 'Active'
                                                ? 'border-red-200 text-red-600 hover:bg-red-50'
                                                : 'border-green-200 text-green-600 hover:bg-green-50'
                                                }`}
                                        >
                                            {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <AddUserModal onClose={() => setIsModalOpen(false)} onSuccess={handleUserAdded} />
            )}
        </div>
    );
}
