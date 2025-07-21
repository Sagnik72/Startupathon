 
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabaseClient';
import { 
  BuildingOfficeIcon, 
  ArrowTrendingUpIcon, 
  CalculatorIcon, 
  UsersIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    console.log('🔄 Dashboard loading - checking authentication');
    
    // Check if Supabase is configured
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_KEY) {
      console.error('❌ Supabase environment variables not configured');
      // Fallback to demo mode
      const demoUser = {
        email: 'demo@proppulse.ai',
        id: 'demo-user-id'
      };
      setUser(demoUser);
      // Demo mode: load from localStorage
      const demoHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
      console.log('[DASHBOARD] Loaded demo history from localStorage:', demoHistory);
      setHistory(demoHistory);
      if (demoHistory.length === 0) console.log('[DASHBOARD] No analysis history found in localStorage.');
      setLoading(false);
      return;
    }

    // Use real Supabase authentication
    supabase.auth.getUser().then(({ data, error }) => {
      console.log('📊 Supabase auth response:', { data, error });
      
      if (error) {
        console.error('❌ Supabase auth error:', error);
        router.push('/login');
        return;
      }

      if (data.user) {
        console.log('✅ Authenticated user found:', data.user.email);
        setUser(data.user);
        setLoading(false);
        // Fetch analysis history from Supabase
        (async () => {
          try {
            const { data: historyData, error: historyError } = await supabase
              .from('analysis_history')
              .select('*')
              .eq('user_id', data.user.id)
              .order('created_at', { ascending: false });
            if (historyError) {
              console.error('[DASHBOARD] Error fetching history from Supabase:', historyError);
              setHistory([]);
            } else {
              console.log('[DASHBOARD] Loaded history from Supabase:', historyData);
              setHistory(historyData || []);
              if (!historyData || historyData.length === 0) console.log('[DASHBOARD] No analysis history found in Supabase.');
            }
          } catch (err) {
            console.error('[DASHBOARD] Unexpected error fetching history:', err);
            setHistory([]);
          }
        })();
      } else {
        console.log('❌ No authenticated user found, redirecting to login');
        router.push('/login');
      }
    });
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center">
        <p className="text-gray-300">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-300 mb-4">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  const handleDeleteHistory = async (item: any, idx: number) => {
    console.log('[DASHBOARD] Deleting history item:', item, idx);
    if (!window.confirm('Are you sure you want to delete this analysis from your history?')) return;
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_KEY) {
      // Demo mode: localStorage
      const demoHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
      demoHistory.splice(idx, 1);
      localStorage.setItem('analysisHistory', JSON.stringify(demoHistory));
      setHistory([...demoHistory]);
      console.log('[DASHBOARD] Deleted from localStorage. New history:', demoHistory);
    } else {
      // Supabase
      if (!item.id) return;
      const { error } = await supabase.from('analysis_history').delete().eq('id', item.id);
      if (!error) {
        setHistory(history.filter((h) => h.id !== item.id));
        console.log('[DASHBOARD] Deleted from Supabase.');
      } else {
        alert('Failed to delete analysis.');
        console.error('[DASHBOARD] Failed to delete from Supabase:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6">
        <div className="flex items-center space-x-3">
          <BuildingOfficeIcon className="h-8 w-8 text-blue-400" />
          <div className="text-xl font-bold text-purple-300">PropPulse AI</div>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-300">Welcome, {user.user_metadata?.username || user.email}</span>
          <button 
            onClick={async () => {
              console.log('🚪 Sign out clicked');
              
              // Use real Supabase sign out
              if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_KEY) {
                try {
                  const { error } = await supabase.auth.signOut();
                  if (error) {
                    console.error('❌ Sign out error:', error);
                  } else {
                    console.log('✅ Sign out successful');
                  }
                } catch (err) {
                  console.error('❌ Unexpected sign out error:', err);
                }
              }
              
              // Clear local state and redirect
              setUser(null);
              router.push('/login');
            }}
            className="bg-gray-800 border border-gray-600 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 hover:border-gray-500 transition-colors font-medium text-sm"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex flex-1 flex-col items-center justify-center text-center px-4 py-12">
        {/* Icon and Title */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-400 flex items-center justify-center">
              <BuildingOfficeIcon className="h-8 w-8 text-blue-400" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-purple-300 leading-tight">
            PropPulse AI
          </h1>
          <p className="text-lg sm:text-xl text-white mb-8 max-w-3xl mx-auto">
            Underwrite any commercial real estate deal in 30 seconds. AI-powered analysis that saves thousands of hours and democratizes CRE investing.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-4xl w-full">
          {/* 100x Faster Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center">
                <ArrowTrendingUpIcon className="h-6 w-6 text-green-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">100x Faster</h3>
            <p className="text-gray-300 text-sm">
              Transform hours of manual work into 30-second analyses
            </p>
          </div>

          {/* AI-Powered Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <CalculatorIcon className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">AI-Powered</h3>
            <p className="text-gray-300 text-sm">
              Advanced algorithms analyze deals like top-tier analysts
            </p>
          </div>

          {/* Democratized Card */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-all duration-300">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <UsersIcon className="h-6 w-6 text-blue-400" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Democratized</h3>
            <p className="text-gray-300 text-sm">
              Compete with institutional firms using the same tools
            </p>
          </div>
        </div>

        {/* Call to Action Button */}
        <div className="mb-8">
          <a
            href="/demo"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            Start New Deal Analysis
          </a>
        </div>

        {/* Stats */}
        <div className="flex flex-row gap-8 justify-center mb-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">Faster</div>
            <div className="text-gray-400 text-sm">than traditional underwriting</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">Accurate</div>
            <div className="text-gray-400 text-sm">AI-powered analysis</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-white">Comprehensive</div>
            <div className="text-gray-400 text-sm">Deal analysis</div>
          </div>
        </div>

        {/* Tagline */}
        <div className="text-white font-bold text-lg mb-8">
          From property address to investment decision
        </div>

        {/* Analysis History Section */}
        <div className="w-full max-w-3xl mx-auto bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 mt-4">
          <h2 className="text-xl font-bold text-white mb-4 text-left">Analysis History</h2>
          {history.length === 0 ? (
            <div className="text-gray-300 text-center py-8">No analyses yet. Start a new deal analysis above!</div>
          ) : (
            <ul className="divide-y divide-white/10">
              {history.map((item, idx) => (
                <li key={item.id || idx} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div className="flex-1 text-left">
                    <div className="font-semibold text-white text-base">
                      {item.property_address || item.propertyInfo?.address || 'Unknown Property'}
                    </div>
                    <div className="text-gray-300 text-xs">
                      {item.created_at ? new Date(item.created_at).toLocaleString() : (item.date || '')}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-semibold">
                      Confidence: {item.confidenceScore || (item.geminiAnalysis?.confidenceScore ?? '--')}%
                    </span>
                    <Link href={item.resultUrl || `/results?id=${item.id || idx}`}
                      className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs font-medium transition">
                      View Results
                    </Link>
                    <button
                      onClick={() => handleDeleteHistory(item, idx)}
                      className="inline-block px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-xs font-medium transition"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
} 