'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { loginUser } from '@/services/authService';
import { toast } from 'react-toastify';
import { FiMail, FiLock, FiLogIn, FiShield } from 'react-icons/fi';
import GuestGuard from '@/components/auth/GuestGuard';

export default function LoginPage() {
  return (
    <GuestGuard>
      <LoginForm />
    </GuestGuard>
  );
}

function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      await loginUser(formData.email, formData.password);
      toast.success('Login successful! Welcome back.');
      router.push('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid login credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200 bg-mesh-light relative overflow-hidden px-3 sm:px-4 py-6 sm:py-8">
      {/* Decorative background glow orbs */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-accent/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-9 shadow-soft-lg border border-base-300/80 bg-base-100/90 backdrop-blur-xl">
          {/* Brand Header */}
          <div className="text-center mb-5 sm:mb-7">
            <div className="inline-flex items-center justify-center p-2.5 sm:p-3 rounded-2xl bg-base-100 shadow-soft-sm ring-1 ring-base-300/80 mb-2.5 sm:mb-3.5">
              <img
                src="/org-logo.png"
                alt="Bangladesh Election Commission"
                className="h-11 w-11 sm:h-14 sm:w-14 object-contain drop-shadow-sm"
                onError={e => {
                  e.currentTarget.src = '/org-logo.svg';
                  e.currentTarget.onerror = null;
                }}
              />
            </div>
            <h1 className="text-lg xs:text-xl sm:text-2xl font-black bg-gradient-to-r from-primary via-indigo-600 to-accent bg-clip-text text-transparent">
              IDEA PROJECT (2nd Phase)
            </h1>
            <p className="text-xs sm:text-sm font-semibold text-base-content/70 mt-0.5">
              Bangladesh Election Commission
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold">
              <FiShield className="w-3 h-3" /> Task Management Portal
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Input */}
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Email Address
                </span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-base-content/40">
                  <FiMail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className="input input-bordered w-full pl-10 text-sm rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 bg-base-100 transition-all"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="form-control">
              <div className="flex items-center justify-between py-1">
                <span className="label-text text-xs font-semibold text-base-content/80">
                  Password
                </span>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary font-medium hover:underline transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-base-content/40">
                  <FiLock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="input input-bordered w-full pl-10 text-sm rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 bg-base-100 transition-all"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full rounded-xl text-white font-semibold shadow-lg shadow-primary/25 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/95 hover:to-indigo-600/95 border-none mt-2 transition-all"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <FiLogIn className="w-4 h-4 mr-1.5" />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          {/* Secure Footer Notice */}
          <div className="text-center mt-6 pt-4 border-t border-base-300/60">
            <p className="text-[11px] text-base-content/50 flex items-center justify-center gap-1.5">
              <span>🔒 Authorized personnel access only</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
