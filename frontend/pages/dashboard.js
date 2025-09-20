import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import api from '../src/lib/api';
import Link from 'next/link';

// Import Components
import RoleHero from '../src/components/Dashboard/RoleHero';
import StatCard from '../src/components/Dashboard/StatCard';
import QuickActions from '../src/components/Dashboard/QuickActions';
import RecentClaimsTable from '../src/components/Dashboard/RecentClaimsTable';
import NotificationsPanel from '../src/components/Dashboard/NotificationsPanel';
import styles from '../src/styles/dashboard.module.css';

// Dynamically import MapPreview to prevent SSR issues with Leaflet
const MapPreview = dynamic(() => import('../src/components/Dashboard/MapPreview'), { ssr: false });

const DashboardSkeleton = () => (
    <div className={styles.skeleton}>
        <div className={`${styles.skeletonItem} ${styles.hero}`}></div>
        <div className={styles.grid}>
            <div className={`${styles.skeletonItem} ${styles.card}`}></div>
            <div className={`${styles.skeletonItem} ${styles.card}`}></div>
            <div className={`${styles.skeletonItem} ${styles.card}`}></div>
            <div className={`${styles.skeletonItem} ${styles.card}`}></div>
        </div>
         <div className={`${styles.skeletonItem} ${styles.longCard}`}></div>
    </div>
);


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [recentClaims, setRecentClaims] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [heatClaims, setHeatClaims] = useState([]);
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

        const [statsRes, claimsRes, heatRes] = await Promise.all([
          api.get(`/claims/stats?state=${userData.state}&district=${userData.district}`),
          api.get(`/claims?limit=6&sort=latest&state=${userData.state}&district=${userData.district}`),
          // Fallback for notifications
          api.get(`/claims?assignedTo=${userData._id}&status=Pending`),
          // For map
          api.get(`/claims?limit=50&state=${userData.state}`) 
        ]);
        
        setStats(statsRes.data);
        setRecentClaims(claimsRes.data);
        setNotifications(heatRes.data) // Using assigned claims as notifications
        setHeatClaims(claimsRes.data.filter(c => c.geojson));


      } catch (err) {
        if (err.response?.status === 401) {
          router.push('/login');
        } else {
          setError('Failed to fetch dashboard data. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [router]);

  if (loading) {
    return (
        <main className="flex-1 p-6 lg:p-10 bg-background">
            <DashboardSkeleton/>
        </main>
    )
  }

  if (error) {
    return <div className="text-red-500 text-center p-8">{error}</div>;
  }
  
  const hasRole = (role) => user?.roles?.includes(role);

  return (
    <div className="flex min-h-screen w-full font-display bg-background text-foreground">
      <aside className="w-64 flex-col bg-card p-6 border-r border-border hidden lg:flex">
        {/* Sidebar content from stitch */}
        <div className="flex items-center gap-3 mb-8">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                <svg className="feather feather-shield" fill="none" height="24" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
            </div>
            <h1 className="text-xl font-bold text-card-foreground">FRA Claims</h1>
        </div>
        <nav className="flex flex-col gap-2 flex-1">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-semibold">
                <svg className="feather feather-home" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                <span>Dashboard</span>
            </Link>
            <Link href="/claims" className="flex items-center gap-3 px-4 py-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-secondary-foreground transition-colors">
                 <svg className="feather feather-file-text" fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" x2="8" y1="13" y2="13"></line><line x1="16" x2="8" y1="17" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                <span>Claims</span>
            </Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 lg:p-10">
        <RoleHero user={user} />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            <StatCard title="Total Claims" value={stats?.total || 0} />
            <StatCard title="Pending" value={stats?.pending || 0} />
            <StatCard title="Under Verification" value={stats?.underVerification || 0} />
            <StatCard title="Approved" value={stats?.approved || 0} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            <div className="lg:col-span-2 space-y-6">
                <QuickActions roles={user?.roles || []} stats={stats}/>
                <RecentClaimsTable claims={recentClaims} />
            </div>
            <div className="space-y-6">
                <MapPreview claims={heatClaims} />
                <NotificationsPanel notifications={notifications} />
            </div>
        </div>
      </main>
    </div>
  );
}
