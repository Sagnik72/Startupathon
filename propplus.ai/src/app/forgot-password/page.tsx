"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { BuildingOfficeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });

      if (error) {
        setError(error.message);
      } else {
        setSuccess(true);
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-purple-300 mb-2">Reset Password</h1>
          <p className="text-gray-300">Enter your email to receive a reset link</p>
        </div>

        {/* Forgot Password Form */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
          {!success ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              {error && (
                <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Enter your email"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </form>
          ) : (
            <div className="text-center space-y-6">
              <div className="bg-green-500/20 border border-green-500/30 text-green-300 px-4 py-3 rounded-lg text-sm">
                Reset link sent! Check your email for instructions.
              </div>
              <p className="text-gray-300 text-sm">
                We've sent a password reset link to your email address. Please check your inbox and follow the instructions to reset your password.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-blue-400 hover:text-blue-300 font-medium flex items-center justify-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 