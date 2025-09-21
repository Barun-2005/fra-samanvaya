import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import api from '../src/lib/api';
import Link from 'next/link';

// Layout & Reusable Components
import AvatarDropdown from '../src/components/Layout/AvatarDropdown';
import styles from '../src/styles/dashboard.module.css';
import RecentClaimsTable from '../src/components/Dashboard/RecentClaimsTable';
import NotificationsPanel from '../src/components/Dashboard/NotificationsPanel';

// Role-Specific Dashboard Components
import DashboardDataEntry from '../src/components/Dashboard/RoleDashboards/DashboardDataEntry';
import DashboardVerifier from '../src/components/Dashboard/RoleDashboards/DashboardVerifier';
import DashboardApprover from '../src/components/Dashboard/RoleDashboards/DashboardApprover';
import DashboardSchemeAdmin from '../src/components/Dashboard/RoleDashboards/DashboardSchemeAdmin';
import DashboardNGOViewer from '../src/components/Dashboard/RoleDashboards/DashboardNGOViewer';
import DashboardSuperAdmin from '../src/components/Dashboard/RoleDashboards/DashboardSuperAdmin';

const MapPreview = dynamic(() => import('../src/components/Dashboard/MapPreview'), { ssr: false });

const DashboardSkeleton = () => (
    <div className={styles.skeleton}>
        <div className={`${styles.skeletonItem} ${styles.hero}`}></div>
        <div className={`${styles.skeletonItem} ${styles.longCard}`} style={{ height: '150px' }}></div>
        <div className={`${styles.skeletonItem} ${styles.longCard}`}></div>
    </div>
);

const RoleDashboardWrapper = ({ user, stats }) => {
    const role = user?.roles[0]; // Assuming one primary role for the dashboard view

    switch (role) {
        case 'Data Entry Officer':
            return <DashboardDataEntry user={user} stats={stats} />;
        case 'Verification Officer':
            return <DashboardVerifier user={user} stats={stats} />;
        case 'Approving Authority':
            return <DashboardApprover user={user} stats={stats} />;
        case 'Scheme Admin':
            return <DashboardSchemeAdmin user={user} stats={stats} />;
        case 'NGO Viewer':
            return <DashboardNGOViewer user={user} stats={stats} />;
        case 'Super Admin':
            return <DashboardSuperAdmin user={user} stats={stats} />;
        default:
            return <div className="text-center p-8 bg-card rounded-2xl shadow-soft"><p>No dashboard available for role: {role}</p></div>;
    }
};

export default function Dashboard() {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [recentClaims, setRecentClaims] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                const userRes = await api.get('/users/me');
                const userData = userRes.data;
                setUser(userData);

                const [statsRes, claimsRes, notifRes] = await Promise.all([
                    api.get(`/claims/stats`),
                    api.get(`/claims?limit=6&sort=latest`),
                    api.get(`/claims?assignedTo=${userData._id}&status=Pending`) // Fallback for notifications
                ]);
                
                setStats(statsRes.data);
                setRecentClaims(claimsRes.data);
                setNotifications(notifRes.data);

            } catch (err) {
                if (err.response?.status === 401) {
                    router.push('/login');
                } else {
                    setError('Failed to fetch dashboard data. Please try again.');
                    console.error(err);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [router]);

    return (
        <div className="flex min-h-screen w-full font-display bg-background text-foreground">
            {/* Sidebar */}
            <aside className="w-64 flex-col bg-card p-6 border-r border-border hidden lg:flex">
                <div className="flex items-center gap-3 mb-8">
                    <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                        <svg fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <h1 className="text-xl font-bold text-card-foreground">FRA Claims</h1>
                </div>
                <nav className="flex flex-col gap-2 flex-1">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold">
                         <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                        <span>Dashboard</span>
                    </Link>
                    <Link href="/claims" className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors">
                        <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        <span>Claims</span>
                    </Link>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-6 lg:p-10">
                <header className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-foreground">Dashboard</h2>
                        {user && <p className="text-muted-foreground">Welcome back, {user.fullName}!</p>}
                    </div>
                    {user && <AvatarDropdown user={user} />}
                </header>

                {loading && <DashboardSkeleton />}
                {error && <div className="text-red-500 text-center p-8">{error}</div>}
                {!loading && !error && user &&
                    <div className="space-y-6">
                        <RoleDashboardWrapper user={user} stats={stats} />
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2">
                                <MapPreview claims={recentClaims} />
                            </div>
                            <NotificationsPanel notifications={notifications} />
                        </div>
                    </div>
                }
            </main>
        </div>
    );
}
