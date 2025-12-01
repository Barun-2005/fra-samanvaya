import { useState } from 'react';
import { useRouter } from 'next/router';
import api from '../src/lib/api';

export default function TwoFactorAuthPage() {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/auth/verify-2fa', { token: otp });
      router.push('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred during 2FA verification.');
    }
  };

  const handleResend = async () => {
    // Implement resend logic here if needed
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-foreground-light dark:text-foreground-dark">
      <div className="flex min-h-screen flex-col">
        <header className="border-b border-border-light dark:border-border-dark px-6 py-4">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="h-8 w-8 text-primary" fill="none" viewBox="0 0 48 " xmlns="http://www.w3.org/2000/svg">
                <path d="M36.7273 44C33.9891 44 31.6043 39.8386 30.3636 33.69C29.123 39.8386 26.7382 44 24 44C21.2618 44 18.877 39.8386 17.6364 33.69C16.3957 39.8386 14.0109 44 11.2727 44C7.25611 44 4 35.0457 4 24C4 12.9543 7.25611 4 11.2727 4C14.0109 4 16.3957 8.16144 17.6364 14.31C18.877 8.16144 21.2618 4 24 4C26.7382 4 29.123 8.16144 30.3636 14.31C31.6043 8.16144 33.9891 4 36.7273 4C40.7439 4 44 12.9543 44 24C44 35.0457 40.7439 44 36.7273 44Z" fill="currentColor"></path>
              </svg>
              <h1 className="text-xl font-bold text-foreground-light dark:text-foreground-dark">FRA Samanvaya Portal</h1>
            </div>
          </div>
        </header>
        <main className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="w-full max-w-md">
            <div className="rounded-xl bg-input-light dark:bg-input-dark shadow-soft border border-border-light dark:border-border-dark p-8 md:p-12">
              <h2 className="text-center text-2xl font-bold text-foreground-light dark:text-foreground-dark">Two-Factor Authentication</h2>
              <p className="mt-2 text-center text-sm text-placeholder-light dark:text-placeholder-dark">Enter the code from your authenticator app.</p>
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div>
                  <label className="sr-only" htmlFor="otp">OTP</label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="form-input block w-full rounded-lg border-border-light bg-background-light p-4 text-center text-2xl tracking-[0.5em] text-foreground-light placeholder-placeholder-light focus:ring-primary dark:border-border-dark dark:bg-background-dark dark:text-foreground-dark dark:placeholder-placeholder-dark"
                    id="otp"
                    name="otp"
                    placeholder="------"
                    type="text"
                    required
                  />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button className="w-full rounded-lg bg-accent-success-light py-3 px-4 font-semibold text-white hover:bg-accent-success-light/90 dark:bg-accent-success-dark dark:text-background-dark dark:hover:bg-accent-success-dark/90" type="submit">
                  Verify
                </button>
                <button onClick={handleResend} className="w-full text-center text-sm text-primary hover:text-primary/80" type="button">Resend Code</button>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
