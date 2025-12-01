import Sidebar from './Sidebar';
import FraBot from '../Assistant/FraBot';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ children }) {
    const { user } = useAuth();

    return (
        <div className="relative flex min-h-screen w-full bg-background-light dark:bg-background-dark">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>

            {/* FraBot FAB - Fixed Bottom Right */}
            <div className="fixed bottom-6 right-6 z-50">
                <FraBot />
            </div>
        </div>
    );
}
