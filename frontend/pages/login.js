import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../src/context/AuthContext';
import { Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.username, formData.password);
      toast.success('Login successful!');
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Invalid credentials';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background-light p-4 overflow-hidden">
      {/* Background Image with Blur */}
      <div className="absolute inset-0 z-0">
        <img
          className="h-full w-full object-cover object-center blur-sm saturate-50"
          src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2560&auto=format&fit=crop"
          alt="Lush green forest"
        />
        <div className="absolute inset-0 bg-background-light/50"></div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 flex w-full max-w-[500px] flex-col rounded-xl border border-gray-200/50 bg-background-light/80 p-6 sm:p-10 backdrop-blur-md shadow-2xl">
        {/* Logo & Title */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-[#0d101b] tracking-light text-[32px] font-bold leading-tight">
              FRA Samanvay
            </h1>
          </div>
          <h2 className="text-[#0d101b] text-[22px] font-bold leading-tight tracking-[-0.015em] pt-6 pb-4">
            Sign in to your Account
          </h2>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 pt-4">
          {/* Username Field */}
          <label className="flex flex-col w-full">
            <p className="text-[#0d101b] text-base font-medium leading-normal pb-2">
              Username
            </p>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d101b] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#cfd4e7] bg-background-light focus:border-primary h-14 placeholder:text-[#4c5b9a] p-[15px] text-base font-normal leading-normal"
              placeholder="Enter your username"
              required
              disabled={loading}
            />
          </label>

          {/* Password Field */}
          <label className="flex flex-col w-full">
            <p className="text-[#0d101b] text-base font-medium leading-normal pb-2">
              Password
            </p>
            <div className="relative flex w-full items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#0d101b] focus:outline-0 focus:ring-2 focus:ring-primary/50 border border-[#cfd4e7] bg-background-light focus:border-primary h-14 placeholder:text-[#4c5b9a] p-[15px] pr-12 text-base font-normal leading-normal"
                placeholder="Enter your password"
                required
                disabled={loading}
              />
              <div className="absolute right-0 flex h-full items-center pr-4">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[#4c5b9a] cursor-pointer hover:text-primary transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </label>

          {/* Submit Button */}
          <div className="flex flex-col gap-4 pt-6">
            <button
              type="submit"
              disabled={loading}
              className="flex min-w-[84px] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-background-light transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Logging in...</span>
                </div>
              ) : (
                <span className="truncate">Login</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-gray-200/80">
          <p className="text-center text-xs text-gray-500">
            This is an official government portal. For authorized use only.
          </p>
        </div>
      </div>
    </div>
  );
}
