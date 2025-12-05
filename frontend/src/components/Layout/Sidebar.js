import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import { Trees, LayoutDashboard, FolderCheck, UserCircle, HelpCircle, LogOut } from 'lucide-react';

export default function Sidebar() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const menuItems = {
        'Citizen': [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: FolderCheck, label: 'My Claims', href: '/claims' },
            { icon: HelpCircle, label: 'Help', href: '/help' },
        ],
        'Data Entry Officer': [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: FolderCheck, label: 'All Claims', href: '/claims' },
        ],
        'Verification Officer': [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: FolderCheck, label: 'Verification Queue', href: '/claims' },
        ],
        'Approving Authority': [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: FolderCheck, label: 'Approval Queue', href: '/claims' },
        ],
        'Super Admin': [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: FolderCheck, label: 'All Claims', href: '/claims' },
        ],
        'Field Worker': [
            { icon: LayoutDashboard, label: 'Field Dashboard', href: '/dashboard' },
            { icon: FolderCheck, label: 'My Tasks', href: '/claims' },
        ]
    };

    const role = user?.roles[0] || 'Citizen';
    const items = menuItems[role] || menuItems['Citizen'];

    const isActive = (href) => router.pathname === href || router.pathname.startsWith(href + '/');

    return (
        <aside className="sticky top-0 h-screen flex flex-col w-64 bg-white dark:bg-background-dark shadow-sm shrink-0">
            <div className="flex h-full min-h-0 flex-col justify-between p-4">
                {/* Top Section */}
                <div className="flex flex-col gap-4">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-3">
                        <Trees className="text-primary text-3xl w-8 h-8" />
                        <h1 className="text-[#0c101d] dark:text-white text-lg font-bold">
                            FRA Samanvay
                        </h1>
                    </div>

                    {/* Navigation */}
                    <div className="flex flex-col gap-2 pt-4">
                        {items.map((item) => {
                            const Icon = item.icon;
                            const active = isActive(item.href);

                            return (
                                <Link key={item.href} href={item.href}>
                                    <div
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors cursor-pointer ${active
                                            ? 'bg-primary/10 dark:bg-primary/20'
                                            : 'hover:bg-black/5 dark:hover:bg-white/5'
                                            }`}
                                    >
                                        <Icon
                                            className={`w-6 h-6 ${active
                                                ? 'text-primary'
                                                : 'text-[#0c101d] dark:text-gray-300'
                                                }`}
                                        />
                                        <p
                                            className={`text-sm font-medium leading-normal ${active
                                                ? 'text-primary'
                                                : 'text-[#0c101d] dark:text-gray-300'
                                                }`}
                                        >
                                            {item.label}
                                        </p>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="flex flex-col gap-4">
                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <div className="relative group cursor-pointer">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                id="avatar-upload"
                                onChange={async (e) => {
                                    const file = e.target.files[0];
                                    if (!file) return;

                                    // Helper to compress image
                                    const compressImage = (file) => {
                                        return new Promise((resolve) => {
                                            const reader = new FileReader();
                                            reader.readAsDataURL(file);
                                            reader.onload = (event) => {
                                                const img = new Image();
                                                img.src = event.target.result;
                                                img.onload = () => {
                                                    const canvas = document.createElement('canvas');
                                                    const MAX_WIDTH = 800;
                                                    const MAX_HEIGHT = 800;
                                                    let width = img.width;
                                                    let height = img.height;

                                                    if (width > height) {
                                                        if (width > MAX_WIDTH) {
                                                            height *= MAX_WIDTH / width;
                                                            width = MAX_WIDTH;
                                                        }
                                                    } else {
                                                        if (height > MAX_HEIGHT) {
                                                            width *= MAX_HEIGHT / height;
                                                            height = MAX_HEIGHT;
                                                        }
                                                    }

                                                    canvas.width = width;
                                                    canvas.height = height;
                                                    const ctx = canvas.getContext('2d');
                                                    ctx.drawImage(img, 0, 0, width, height);
                                                    // Compress to JPEG at 0.7 quality
                                                    resolve(canvas.toDataURL('image/jpeg', 0.7));
                                                };
                                            };
                                        });
                                    };

                                    try {
                                        const compressedBase64 = await compressImage(file);

                                        // Call API to update avatar
                                        const api = require('../../lib/api').default;
                                        await api.put('/users/me/avatar', { avatarUrl: compressedBase64 });
                                        // Reload user to update context
                                        window.location.reload();
                                    } catch (err) {
                                        console.error('Failed to upload avatar', err);
                                        alert('Failed to upload avatar');
                                    }
                                }}
                            />
                            <label htmlFor="avatar-upload" className="cursor-pointer">
                                {user?.avatarUrl ? (
                                    <img
                                        src={user.avatarUrl}
                                        alt="Profile"
                                        className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                                    />
                                ) : (
                                    <div
                                        className="bg-primary bg-center bg-no-repeat bg-cover rounded-full size-10 flex items-center justify-center text-white font-bold"
                                    >
                                        {user?.fullName?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-white text-[10px] font-bold">EDIT</span>
                                </div>
                            </label>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-[#0c101d] dark:text-white text-base font-medium leading-normal truncate">
                                {user?.fullName || 'User'}
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-normal leading-normal">
                                {role}
                            </p>
                        </div>
                    </div>

                    {/* Logout */}
                    <div className="flex flex-col gap-1">
                        <button
                            onClick={logout}
                            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 group transition-colors w-full"
                        >
                            <LogOut className="text-[#0c101d] dark:text-gray-300 group-hover:text-red-500 w-6 h-6" />
                            <p className="text-[#0c101d] dark:text-gray-300 group-hover:text-red-500 text-sm font-medium leading-normal">
                                Logout
                            </p>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
}
