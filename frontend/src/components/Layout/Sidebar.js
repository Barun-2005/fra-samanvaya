import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

export default function Sidebar() {
    const router = useRouter();
    const { user, logout } = useAuth();

    const menuItems = {
        'Citizen': [
            { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
            { icon: '📝', label: 'Submit Claim', href: '/create-claim' },
            { icon: '📋', label: 'My Claims', href: '/claims' },
        ],
        'Data Entry Officer': [
            { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
            { icon: '➕', label: 'Create Claim', href: '/create-claim' },
            { icon: '📋', label: 'All Claims', href: '/claims' },
        ],
        'Verification Officer': [
            { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
            { icon: '✅', label: 'Verification Queue', href: '/claims' },
            { icon: '📋', label: 'All Claims', href: '/claims' },
        ],
        'Approving Authority': [
            { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
            { icon: '👔', label: 'Approval Queue', href: '/claims' },
            { icon: '📋', label: 'All Claims', href: '/claims' },
        ],
        'Super Admin': [
            { icon: '🏠', label: 'Dashboard', href: '/dashboard' },
            { icon: '📋', label: 'All Claims', href: '/claims' },
            { icon: '➕', label: 'Create Claim', href: '/create-claim' },
        ]
    };

    const role = user?.roles[0] || 'Citizen';
    const items = menuItems[role] || menuItems['Citizen'];

    const isActive = (href) => router.pathname === href;

    return (
        <div className="w-64 h-screen bg-card border-r border-border flex flex-col">
            {/* Logo */}
            <div className="p-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                        FR
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-foreground">FRA Samanvaya</h1>
                        <p className="text-xs text-muted-foreground">{role}</p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                {items.map((item) => (
                    <Link key={item.href + item.label} href={item.href}>
                        <div
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${isActive(item.href)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'hover:bg-muted text-foreground'
                                }`}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span className="font-medium">{item.label}</span>
                        </div>
                    </Link>
                ))}
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-border">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-secondary-foreground font-semibold">
                        {user?.fullName?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-foreground truncate">
                            {user?.fullName || 'User'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                            {user?.email || 'user@example.com'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
