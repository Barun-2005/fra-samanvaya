import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.requires2FA) {
        router.push('/2fa');
      } else {
        // Check if there was a redirect target
        const redirectTo = sessionStorage.getItem('redirectAfterLogin') || '/dashboard';
        sessionStorage.removeItem('redirectAfterLogin');
        router.push(redirectTo);
      }
    } catch (err) {
      setError(err.message || 'An error occurred during login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-foreground-light dark:text-foreground-dark">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-border-light dark:border-border-dark px-6 py-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
              </svg>
              <h1 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">FRA Samanvaya Portal</h1>
            </div>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-lg space-y-8">
            <div className="rounded-xl bg-input-light dark:bg-input-dark shadow-soft border border-border-light dark:border-border-dark p-8 md:p-12">
              <div className="text-center">
                <h2 className="text-3xl font-bold tracking-tight text-foreground-light dark:text-foreground-dark">Secure Login</h2>
                <p className="mt-2 text-sm text-placeholder-light dark:text-placeholder-dark">Welcome back, please enter your credentials.</p>
              </div>
              <form onSubmit={handleSubmit} className="mt-8 space-y-6" suppressHydrationWarning>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground-light dark:text-foreground-dark" htmlFor="username">Username</label>
                    <input
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      autoComplete="username"
                      className="form-input mt-1 block w-full rounded-lg border-border-light bg-background-light p-4 text-foreground-light placeholder-placeholder-light focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark dark:placeholder-placeholder-dark dark:focus:ring-primary"
                      id="username"
                      name="username"
                      placeholder="Enter your username"
                      required
                      type="text"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground-light dark:text-foreground-dark" htmlFor="password">Password</label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      className="form-input mt-1 block w-full rounded-lg border-border-light bg-background-light p-4 text-foreground-light placeholder-placeholder-light focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark dark:placeholder-placeholder-dark dark:focus:ring-primary"
                      id="password"
                      name="password"
                      placeholder="Enter your password"
                      required
                      type="password"
                    />
                  </div>
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <a className="font-medium text-primary hover:text-primary/80" href="#"> Forgot your password? </a>
                  </div>
                </div>
                <div>
                  <button
                    className="group relative flex w-full justify-center rounded-lg border border-transparent bg-primary py-3 px-4 text-sm font-semibold text-white hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-background-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </button>
                </div>
              </form>
            </div>
            <div className="space-y-4">
              <h3 className="text-center text-lg font-semibold text-foreground-light dark:text-foreground-dark">Security & Compliance</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center justify-center rounded-xl border border-border-light bg-input-light p-4 shadow-soft dark:border-border-dark dark:bg-input-dark">
                  <img alt="Security Badge 1" className="h-24 object-contain" src="/assets/security-badge-1.png" />
                </div>
                <div className="flex items-center justify-center rounded-xl border border-border-light bg-input-light p-4 shadow-soft dark:border-border-dark dark:bg-input-dark">
                  <img alt="Security Badge 2" className="h-24 object-contain" src="/assets/security-badge-2.png" />
                </div>
              </div>
            </div>
            <p className="mt-8 text-center text-xs text-placeholder-light dark:text-placeholder-dark">
              © 2024 FRA Samanvaya Portal. All rights reserved.<br />
              Disclaimer: This system is for authorized use only. Unauthorized access or use may result in disciplinary action and/or legal prosecution.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
