import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

/**
 * RoleGuard - Restricts access based on user roles
 * Shows "Access Denied" message if user doesn't have required role
 * 
 * @param {Array<string>} allowedRoles - Array of roles that can access this content
 * @param {ReactNode} children - Content to render if authorized
 */
export default function RoleGuard({ allowedRoles, children }) {
    const { user, hasRole } = useAuth();

    // Check if user has any of the allowed roles
    const isAuthorized = hasRole(allowedRoles);

    if (!isAuthorized) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background p-6">
                <div className="max-w-md w-full bg-card rounded-2xl shadow-soft border border-border p-8 text-center">
                    {/* Access Denied Icon */}
                    <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                        <svg
                            className="w-8 h-8 text-red-600 dark:text-red-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                            />
                        </svg>
                    </div>

                    {/* Message */}
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                        Access Denied
                    </h2>
                    <p className="text-muted-foreground mb-6">
                        You don't have permission to access this page.
                        {user && (
                            <span className="block mt-2 text-sm">
                                Current role: <span className="font-semibold text-foreground">{user.roles?.[0] || 'Unknown'}</span>
                            </span>
                        )}
                    </p>

                    {/* Required Roles */}
                    <div className="bg-muted rounded-lg p-4 mb-6">
                        <p className="text-sm text-muted-foreground mb-2">Required roles:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                            {allowedRoles.map(role => (
                                <span
                                    key={role}
                                    className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium"
                                >
                                    {role}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <Link
                            href="/dashboard"
                            className="block w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                        >
                            Go to Dashboard
                        </Link>
                        <Link
                            href="/login"
                            className="block w-full px-4 py-2 border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
                        >
                            Switch Account
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // User is authorized, render children
    return <>{children}</>;
}
