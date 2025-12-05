import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';

export default function DashboardRouter() {
    const router = useRouter();
    const { user, loading } = useAuth();

    useEffect(() => {
        if (!loading && user) {
            // Route based on primary role
            const primaryRole = user.roles[0];

            switch (primaryRole) {
                case 'Citizen':
                    router.replace('/dashboard/citizen');
                    break;
                case 'Data Entry Officer':
                    router.replace('/dashboard/data-entry');
                    break;
                case 'Verification Officer':
                    router.replace('/dashboard/verification');
                    break;
                case 'Approving Authority':
                    router.replace('/dashboard/approving');
                    break;
                case 'Scheme Admin':
                    router.replace('/dashboard/scheme-admin');
                    break;
                case 'NGO Viewer':
                    router.replace('/dashboard/ngo');
                    break;
                case 'Super Admin':
                    router.replace('/dashboard/super-admin');
                    break;
                case 'Field Worker':
                    router.replace('/dashboard/field-worker');
                    break;
                default:
                    // Fallback to citizen dashboard
                    router.replace('/dashboard/citizen');
            }
        }
    }, [user, loading, router]);

    // Show loading state while redirecting
    return (
        <div className="flex min-h-screen items-center justify-center bg-background-light dark:bg-background-dark">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
                <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                    Loading your dashboard...
                </p>
            </div>
        </div>
    );
}
