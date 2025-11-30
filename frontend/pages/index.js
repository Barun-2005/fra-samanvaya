import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // If user is logged in, redirect to the dashboard
      router.replace('/dashboard');
    } else {
      // If user is not logged in, redirect to the login page
      router.replace('/login');
    }
  }, [router]);

  // Render a loading state or null while redirecting
  return null;
}
