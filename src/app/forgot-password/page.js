'use client';

import { useState } from 'react';
import Link from 'next/link';
import { resetPassword } from '@/services/authService';
import { toast } from 'react-toastify';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      await resetPassword(email);
      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      toast.error(error.message || 'Failed to send reset email');
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
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-base-100 shadow-soft-sm ring-1 ring-base-300/80 mb-3.5">
              <img
                src="/org-logo.png"
                alt="Bangladesh Election Commission"
                className="h-12 w-12 object-contain drop-shadow-sm"
                onError={e => {
                  e.currentTarget.src = '/org-logo.svg';
                  e.currentTarget.onerror = null;
                }}
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Reset Password
            </h1>
            <p className="text-xs sm:text-sm text-base-content/70 mt-1">
              Enter your email to receive recovery instructions
            </p>
          </div>

          {!emailSent ? (
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
                    placeholder="name@example.com"
                    className="input input-bordered w-full pl-10 text-sm rounded-xl focus:border-primary focus:ring-2 focus:ring-primary/20 bg-base-100 transition-all"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
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
                  'Send Reset Instructions'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-success/15 text-success mx-auto flex items-center justify-center">
                <FiCheckCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-base-content">
                  Email Sent!
                </h3>
                <p className="text-xs text-base-content/70 mt-1">
                  Please check your inbox at <span className="font-semibold text-base-content">{email}</span> for instructions to reset your password.
                </p>
              </div>
            </div>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6 pt-4 border-t border-base-300/60">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <FiArrowLeft className="w-3.5 h-3.5" />
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
