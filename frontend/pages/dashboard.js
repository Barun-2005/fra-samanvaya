import { useAuth } from '../src/context/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import CitizenDashboard from '../src/components/Dashboard/CitizenDashboard';
import DataEntryDashboard from '../src/components/Dashboard/DataEntryDashboard';
import VerificationDashboard from '../src/components/Dashboard/VerificationDashboard';
import ApprovalDashboard from '../src/components/Dashboard/ApprovalDashboard';
import SchemeAdminDashboard from '../src/components/Dashboard/SchemeAdminDashboard';
import NGOViewerDashboard from '../src/components/Dashboard/NGOViewerDashboard';
import AuthGuard from '../src/components/Layout/AuthGuard';

const Dashboard = () => {
    const { user, loading } = useAuth();
    const router = useRouter();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Render dashboard based on role
    const renderDashboard = () => {
        if (!user) return null;

        if (user.roles.includes('Citizen')) {
            return <CitizenDashboard />;
        }

        if (user.roles.includes('Data Entry Officer')) {
            return <DataEntryDashboard />;
        }

        if (user.roles.includes('Verification Officer')) {
            return <VerificationDashboard />;
        }

        if (user.roles.includes('Approving Authority') || user.roles.includes('Super Admin')) {
            return <ApprovalDashboard />;
        }

        if (user.roles.includes('Scheme Admin')) {
            return <SchemeAdminDashboard />;
        }

        if (user.roles.includes('NGO Viewer')) {
            return <NGOViewerDashboard />;
        }

        // Default fallback (shouldn't happen with proper roles)
        return (
            <div className="p-8 text-center">
                <h1 className="text-2xl font-bold">Welcome, {user.fullName}</h1>
                <p className="mt-2">Your role does not have a specific dashboard yet.</p>
            </div>
        );
    };

    return (
        <AuthGuard>
            {renderDashboard()}
        </AuthGuard>
    );
};

export default Dashboard;
