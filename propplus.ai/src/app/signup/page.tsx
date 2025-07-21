"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { BuildingOfficeIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    symbol: false
  });
  const router = useRouter();

  // Password validation function
  const validatePassword = (password: string) => {
    const validation = {
      length: password.length >= 9,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[@#$%!&*^]/.test(password)
    };
    setPasswordValidation(validation);
    return Object.values(validation).every(Boolean);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('📝 Form submitted');
    console.log('🔘 Button clicked - form submission triggered');
    setLoading(true);
    setError('');

    console.log('🔐 Starting signup process...');
    console.log('📊 Form data:', { email, password, confirmPassword });
    console.log('🔍 Password validation:', passwordValidation);

    // Basic validation
    if (!email || !username || !password || !confirmPassword) {
      console.log('❌ Missing required fields');
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    // Username validation
    if (username.length < 3) {
      console.log('❌ Username too short');
      setError('Username must be at least 3 characters long');
      setLoading(false);
      return;
    }

    if (username.length > 20) {
      console.log('❌ Username too long');
      setError('Username must be less than 20 characters');
      setLoading(false);
      return;
    }

    // Check for valid username characters (alphanumeric and underscore only)
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      console.log('❌ Invalid username characters');
      setError('Username can only contain letters, numbers, and underscores');
      setLoading(false);
      return;
    }

    // Validate password requirements
    if (!validatePassword(password)) {
      console.log('❌ Password validation failed');
      setError('Password does not meet security requirements');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match');
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    console.log('✅ All validations passed, proceeding with Supabase signup');

    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_KEY) {
      console.error('❌ Supabase environment variables not configured');
      setError('Account creation is currently unavailable. Please try again later.');
      setLoading(false);
      return;
    }

    try {
      console.log('📧 Attempting to create account with Supabase for:', email);
      console.log('👤 Username:', username);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            username: username
          }
        }
      });

      console.log('📊 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        setError(error.message);
        setLoading(false);
        return;
      }

      if (data.user && !data.user.email_confirmed_at) {
        console.log('✅ Account created successfully, email verification required');
        setError(''); // Clear any previous errors
        
        // Show success message and redirect to login
        setTimeout(() => {
          setLoading(false);
          alert('Account created successfully! Please check your email for verification link before signing in.');
          router.push('/login');
        }, 1000);
      } else {
        console.log('✅ Account created and verified');
        setLoading(false);
        router.push('/login');
      }

    } catch (err) {
      console.error('❌ Unexpected error during signup:', err);
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
      // For demo purposes, allow signup to proceed
      setTimeout(() => {
        router.push('/dashboard');
      }, 1000);
      return;
    }

    try {
      console.log('📧 Attempting to create account for:', email);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log('📊 Supabase response:', { data, error });

      if (error) {
        console.error('❌ Supabase error:', error);
        setError(error.message);
      } else {
        console.log('✅ Account created successfully');
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('❌ Unexpected error during signup:', err);
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
          <h1 className="text-3xl font-bold text-purple-300 mb-2">Create Account</h1>
          <p className="text-gray-300">Join PropPulse AI to start analyzing deals</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8">
          <form onSubmit={handleSignup} className="space-y-6" noValidate>
            {error && (
              <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your username"
              />
              <p className="text-xs text-gray-400 mt-1">
                Username must be 3-20 characters, letters, numbers, and underscores only
              </p>
            </div>

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
                  onChange={handlePasswordChange}
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
              
              {/* Password Requirements */}
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-400">Password requirements:</p>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  <div className={`flex items-center space-x-2 ${passwordValidation.length ? 'text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.length ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    <span>At least 9 characters</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.uppercase ? 'text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.uppercase ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    <span>One uppercase letter (A-Z)</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.lowercase ? 'text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.lowercase ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    <span>One lowercase letter (a-z)</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.number ? 'text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.number ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    <span>One number (0-9)</span>
                  </div>
                  <div className={`flex items-center space-x-2 ${passwordValidation.symbol ? 'text-green-400' : 'text-gray-500'}`}>
                    <div className={`w-2 h-2 rounded-full ${passwordValidation.symbol ? 'bg-green-400' : 'bg-gray-500'}`}></div>
                    <span>One symbol (@#$%!&*^)</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all pr-12"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showConfirmPassword ? (
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
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400 text-sm">
              Already have an account?{' '}
              <button
                onClick={() => router.push('/login')}
                className="text-blue-400 hover:text-blue-300 font-medium"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 