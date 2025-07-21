"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { BuildingOfficeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔐 Login form submitted');
    console.log('📧 Email:', email);
    console.log('🔑 Password length:', password.length);
    
    setLoading(true);
    setError('');

    console.log('🔐 Starting login process...');

    // Basic validation
    if (!email || !password) {
      console.log('❌ Missing email or password');
      setError('Please enter both email and password');
      setLoading(false);
      return;
    }

    console.log('✅ Basic validation passed');

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_KEY) {
      console.error('❌ Supabase environment variables not configured');
      setError('Login is currently unavailable. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      console.log('📧 Attempting to sign in with Supabase:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📊 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        console.log('✅ Authentication successful for:', data.user.email);
        
        // Store the logged-in user information
        try {
          const userData = {
            email: data.user.email,
            id: data.user.id,
            username: data.user.user_metadata?.username || data.user.email
          };
          sessionStorage.setItem('lastLoginUser', JSON.stringify(userData));
          console.log('💾 Logged-in user stored:', userData);
        } catch (error) {
          console.log('⚠️ Could not store login user data');
        }

        // Redirect to dashboard
        console.log('✅ Login successful, redirecting to dashboard');
        setLoading(false);
        router.push('/dashboard');
      } else {
        console.log('❌ No user data returned');
        setError('Login failed. Please try again.');
        setLoading(false);
      }

    } catch (err) {
      console.error('❌ Unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }

    return;

    // Original Supabase code (commented out for demo)
    /*
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_KEY) {
      console.error('❌ Supabase environment variables not configured');
      console.log('🔄 Using demo mode - redirecting to dashboard');
      // For demo purposes, allow login to proceed
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      return;
    }

    try {
      console.log('📧 Attempting to sign in:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('📊 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        setError(error.message);
      } else {
        console.log('✅ Login successful');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('❌ Unexpected error during login:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
    */
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
          <h1 className="text-3xl font-bold text-purple-300 mb-2">Welcome Back</h1>
          <p className="text-gray-300">Sign in to your PropPulse AI account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
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

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Enter your password"
              />
              <button
                type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
              >
                {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
              {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Don't have an account?{' '}
              <button
                onClick={() => router.push('/signup')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Create Account
              </button>
            </p>
          </div>
        </div>

        {/* Demo Info */}
        <div className="mt-6 text-center">
          <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
            <h3 className="text-blue-300 font-semibold mb-2">Get Started</h3>
            <p className="text-gray-300 text-sm">
              Enter your credentials to access PropPulse AI
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}