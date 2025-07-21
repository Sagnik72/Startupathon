import Link from 'next/link';
import { 
  BuildingOfficeIcon, 
  ArrowTrendingUpIcon, 
  CalculatorIcon, 
  UsersIcon,
  PlayIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon
} from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6">
        <div className="flex items-center space-x-3">
          <BuildingOfficeIcon className="h-8 w-8 text-blue-400" />
          <div className="text-xl font-bold text-purple-300">PropPulse AI</div>
        </div>
        <div className="flex items-center space-x-4">
          <Link 
            href="/signup"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Create Account
          </Link>
          <Link 
            href="/login"
            className="text-gray-300 hover:text-white transition-colors"
          >
            Sign In
          </Link>
          <Link 
            href="/demo"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Demo
          </Link>
        </div>
      </header>

      {/* Hero Section */}
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

        {/* Call to Action Buttons */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/signup"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <UsersIcon className="h-5 w-5 mr-2" />
            Create Account
          </Link>
          <Link
            href="/demo"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <PlayIcon className="h-5 w-5 mr-2" />
            Try Demo
          </Link>
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

        {/* Additional Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl w-full mt-12">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <ChartBarIcon className="h-6 w-6 text-blue-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Advanced Analytics</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Comprehensive financial modeling with sensitivity analysis and scenario planning
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <DocumentTextIcon className="h-6 w-6 text-green-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Document Processing</h3>
            </div>
            <p className="text-gray-300 text-sm">
              AI-powered parsing of T12 statements, rent rolls, and financial documents
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <CogIcon className="h-6 w-6 text-purple-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Custom Workflows</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Tailored analysis criteria and investment parameters for your strategy
            </p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center mb-4">
              <UsersIcon className="h-6 w-6 text-orange-400 mr-3" />
              <h3 className="text-lg font-semibold text-white">Team Collaboration</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Share analyses, export reports, and collaborate with your investment team
            </p>
          </div>
        </div>

        {/* Tagline */}
        <div className="text-white font-bold text-lg mt-8">
          From property address to investment decision
        </div>
      </main>
    </div>
  );
}
