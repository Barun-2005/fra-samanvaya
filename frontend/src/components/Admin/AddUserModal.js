import { useState } from 'react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

export default function AddUserModal({ onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'VerificationOfficer',
        district: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/users', formData);
            toast.success('User created successfully');
            onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-card p-6 rounded-xl w-full max-w-md border border-border shadow-lg animate-in fade-in zoom-in-95">
                <h2 className="text-xl font-bold mb-4 text-foreground">Add New Officer</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Full Name</label>
                        <input
                            name="name"
                            required
                            className="w-full p-2 rounded-md border border-input bg-background text-foreground"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Email</label>
                        <input
                            name="email"
                            type="email"
                            required
                            className="w-full p-2 rounded-md border border-input bg-background text-foreground"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Password</label>
                        <input
                            name="password"
                            type="password"
                            required
                            className="w-full p-2 rounded-md border border-input bg-background text-foreground"
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">Role</label>
                        <select
                            name="role"
                            className="w-full p-2 rounded-md border border-input bg-background text-foreground"
                            onChange={handleChange}
                            value={formData.role}
                        >
                            <option value="DataEntry">Data Entry Operator</option>
                            <option value="VerificationOfficer">Verification Officer</option>
                            <option value="ApprovingAuthority">Approving Authority</option>
                            <option value="SchemeAdmin">Scheme Admin</option>
                            <option value="NGOViewer">NGO Viewer</option>
                            <option value="SuperAdmin">Super Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1 text-foreground">District</label>
                        <input
                            name="district"
                            required
                            className="w-full p-2 rounded-md border border-input bg-background text-foreground"
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-foreground"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            {loading ? 'Creating...' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
