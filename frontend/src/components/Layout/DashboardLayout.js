import Sidebar from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ children }) {
    const { user } = useAuth();

    return (
        <div className="relative flex min-h-screen w-full bg-slate-50 dark:bg-slate-900">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto h-screen">
                {children}
            </main>
        </div>
    );
}
