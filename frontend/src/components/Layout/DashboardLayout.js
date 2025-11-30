import Sidebar from './Sidebar';

export default function DashboardLayout({ children }) {
    return (
        <div className="flex min-h-screen bg-background">
            <Sidebar />
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    );
}
