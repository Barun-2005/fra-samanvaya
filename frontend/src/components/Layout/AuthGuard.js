import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';

/**
 * AuthGuard - Protects routes from unauthenticated access
 * Redirects to /login if user is not authenticated
 */
export default function AuthGuard({ children }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            // Store the intended destination
            sessionStorage.setItem('redirectAfterLogin', router.asPath);
            router.push('/login');
        }
    }, [user, loading, router]);

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background">
                <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    // Don't render anything if not authenticated (redirect in progress)
    if (!user) {
        return null;
    }

    // User is authenticated, render children
    return <>{children}</>;
}
