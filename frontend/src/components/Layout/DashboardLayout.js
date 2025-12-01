import Sidebar from './Sidebar';
import FraBot from '../Assistant/FraBot';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ children }) {
    const { user } = useAuth();

    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                {children}
            </div>
            <FraBot />
        </div>
    );
}
