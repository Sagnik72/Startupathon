"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BuildingOfficeIcon, 
  MapPinIcon, 
  CheckCircleIcon,
  ChevronDownIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface PropertyData {
  propertyValue?: string | null;
  capRate?: string | null;
  cashOnCash?: string | null;
  irr?: string | null;
  noi?: string | null;
  debtService?: string | null;
  cashFlow?: string | null;
  ltv?: string | null;
  downPayment?: string | null;
  loanAmount?: string | null;
  units?: string | null;
  squareFootage?: string | null;
  buildYear?: string | null;
  walkScore?: string | null;
  aiReasoning?: string | null;
  recommendations?: string[] | null;
  risks?: string[] | null;
  marketInsights?: any | null;
  comparableProperties?: any[] | null;
  dataSources?: any[] | null;
  aiInsights?: any | null;
}

export default function Demo() {
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [loading, setLoading] = useState(false);
  const [propertyData, setPropertyData] = useState<PropertyData | null>(null);
  const [error, setError] = useState('');
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const router = useRouter();

  const propertyTypes = ['Multifamily', 'Office', 'Retail', 'Industrial', 'Hotel', 'Mixed Use', 'Student Housing', 'Senior Housing'];

  useEffect(() => {
    if (location && location.length > 5) {
      // Add a small delay to avoid too many API calls while typing
      const timeoutId = setTimeout(() => {
        fetchPropertyData();
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [location]);



  const fetchPropertyData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch(`/api/property-data?location=${encodeURIComponent(location)}`);
      const data = await response.json();
      
      if (response.ok) {
        setPropertyData(data);
        setAnalysisComplete(true);
      } else {
        console.error('❌ API Error:', data);
        
        setError('Failed to fetch property data. Please try again.');
      }
    } catch (err) {
      console.error('❌ Network error:', err);
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    router.push('/analysis');
  };

  const handleDownload = () => {
    if (!propertyData) return;
    
    const timestamp = new Date().toLocaleString();
    const report = `
PROPPULSE AI - INITIAL PROPERTY ANALYSIS REPORT
Generated: ${timestamp}
Location: ${location}
Property Type: ${propertyType}

================================================================================

PROPERTY ANALYSIS SUMMARY
================================================================================
Property Value: ${propertyData.propertyValue || 'Not available'}
Cap Rate: ${propertyData.capRate || 'Not available'}
Cash-on-Cash Return: ${propertyData.cashOnCash || 'Not available'}
Internal Rate of Return (IRR): ${propertyData.irr || 'Not available'}

================================================================================

AI ANALYSIS
================================================================================
${propertyData.aiReasoning || 'AI analysis not available'}

================================================================================

RECOMMENDATIONS
================================================================================
${propertyData.recommendations ? propertyData.recommendations.map((rec: string, index: number) => `${index + 1}. ${rec}`).join('\n') : 'No recommendations available'}

================================================================================

RISK FACTORS
================================================================================
${propertyData.risks ? propertyData.risks.map((risk: string, index: number) => `${index + 1}. ${risk}`).join('\n') : 'No risk factors identified'}

================================================================================

MARKET INSIGHTS
================================================================================
${propertyData.marketInsights ? `
Market Trend: ${propertyData.marketInsights.marketTrend || 'Not available'}
Market Score: ${propertyData.marketInsights.marketScore || 'Not available'}
Rent Growth: ${propertyData.marketInsights.rentGrowth || 'Not available'}
Vacancy Rate: ${propertyData.marketInsights.vacancyRate || 'Not available'}
` : 'Market insights not available'}

================================================================================

DATA SOURCES
================================================================================
${propertyData.dataSources ? `${propertyData.dataSources.length} data sources used for analysis` : 'No data sources available'}

================================================================================

DISCLAIMER
================================================================================
This report is generated by PropPulse AI for informational purposes only. 
All data and analysis should be verified independently before making investment decisions.
This report does not constitute financial advice.

Generated by PropPulse AI
${timestamp}
`;

    const blob = new Blob([report], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proppulse-initial-analysis-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    
  };

  const handleShare = () => {
    if (!propertyData) return;
    
    // Generate shareable image
    generateShareableImage();
    shareToSocialMedia();
  };

  const generateShareableImage = () => {
    // Create a canvas element to generate the shareable image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for social media
    canvas.width = 1200;
    canvas.height = 630;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 1200, 630);
    gradient.addColorStop(0, '#1e3a8a');
    gradient.addColorStop(1, '#7c3aed');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1200, 630);

    // Add logo/brand
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 48px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PropPulse AI', 600, 80);

    // Add subtitle
    ctx.font = '24px Arial';
    ctx.fillText('Property Analysis', 600, 120);

    // Add property details
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    let yPos = 200;
    
    ctx.fillStyle = '#ffffff';
    if (propertyData) {
      ctx.fillText(`Units: ${propertyData.units || 'N/A'}`, 100, yPos);
      yPos += 40;
      ctx.fillText(`Square Footage: ${propertyData.squareFootage || 'N/A'}`, 100, yPos);
      yPos += 40;
      ctx.fillText(`Build Year: ${propertyData.buildYear || 'N/A'}`, 100, yPos);
      yPos += 40;
      ctx.fillText(`Walk Score: ${propertyData.walkScore || 'N/A'}`, 100, yPos);
    } else {
      ctx.fillText('Units: N/A', 100, yPos);
      yPos += 40;
      ctx.fillText('Square Footage: N/A', 100, yPos);
      yPos += 40;
      ctx.fillText('Build Year: N/A', 100, yPos);
      yPos += 40;
      ctx.fillText('Walk Score: N/A', 100, yPos);
    }

    // Add location
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '18px Arial';
    ctx.fillText(`Location: ${location || 'Los Angeles, CA'}`, 100, yPos + 40);

    // Add timestamp
    ctx.fillText(`Generated: ${new Date().toLocaleDateString()}`, 100, yPos + 70);

    // Add website URL
    ctx.fillStyle = '#60a5fa';
    ctx.font = '16px Arial';
    ctx.fillText('proppulse.ai', 100, yPos + 100);

    // Convert canvas to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `proppulse-property-analysis-${new Date().toISOString().split('T')[0]}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
  
      }
    }, 'image/jpeg', 0.9);
  };

  const shareToSocialMedia = () => {
    // Create shareable content
    const shareData = {
      title: 'PropPulse AI - Property Analysis',
      text: `Units: ${propertyData?.units || 'N/A'}, Sq Ft: ${propertyData?.squareFootage || 'N/A'}, Built: ${propertyData?.buildYear || 'N/A'}, Walk Score: ${propertyData?.walkScore || 'N/A'}. Check out my PropPulse AI analysis!`,
      url: window.location.href
    };

    // Try native sharing first
    if (navigator.share) {
      navigator.share(shareData)

    } else {
      // Fallback to copying link
      copyToClipboard(window.location.href);
      showShareModal();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {

    }).catch((err) => {
      console.error('Failed to copy: ', err);
    });
  };

  const showShareModal = () => {
    // Create and show a simple share modal
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
      background: #1f2937;
      padding: 30px;
      border-radius: 12px;
      max-width: 400px;
      text-align: center;
      color: white;
    `;

    content.innerHTML = `
      <h3 style="margin-bottom: 20px; color: #60a5fa;">Share Analysis</h3>
      <p style="margin-bottom: 20px;">Link copied to clipboard!</p>
      <div style="margin-bottom: 20px;">
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(`Units: ${propertyData?.units || 'N/A'}, Sq Ft: ${propertyData?.squareFootage || 'N/A'}, Built: ${propertyData?.buildYear || 'N/A'}, Walk Score: ${propertyData?.walkScore || 'N/A'}. Check out my PropPulse AI analysis!`)}&url=${encodeURIComponent(window.location.href)}" 
          target="_blank" style="background: #1da1f2; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin: 5px;">
          Share on Twitter
        </a>
      </div>
      <div style="margin-bottom: 20px;">
        <a href="https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}" 
          target="_blank" style="background: #0077b5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; margin: 5px;">
          Share on LinkedIn
        </a>
      </div>
      <button onclick="this.parentElement.parentElement.remove()" 
        style="background: #6b7280; color: white; padding: 10px 20px; border-radius: 6px; border: none; cursor: pointer;">
        Close
      </button>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (document.body.contains(modal)) {
        document.body.removeChild(modal);
      }
    }, 5000);
  };

  const formatValue = (value: any, formatter?: (val: any) => string) => {
    if (value === null || value === undefined) {
      return 'Data not available';
    }
    return formatter ? formatter(value) : value.toString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-purple-800">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6">
        <div className="flex items-center space-x-3">
          <BuildingOfficeIcon className="h-8 w-8 text-blue-400" />
          <div className="text-xl font-bold text-purple-300">PropPulse AI</div>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="text-gray-300 hover:text-white transition-colors"
          >
            Dashboard
          </button>
          <button 
            onClick={() => router.push('/login')}
            className="bg-gray-800 border border-gray-600 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-700 hover:border-gray-500 transition-colors font-medium text-sm"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="px-10 mb-8">
        <div className="flex items-center justify-center space-x-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircleIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-green-400 font-medium">Welcome</span>
          </div>
          <div className="h-1 w-16 bg-green-500"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
              <MapPinIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-blue-400 font-medium">Property</span>
          </div>
          <div className="h-1 w-16 bg-gray-600"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <span className="text-gray-400">Financials</span>
          </div>
          <div className="h-1 w-16 bg-gray-600"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <span className="text-gray-400">Buy Box</span>
          </div>
          <div className="h-1 w-16 bg-gray-600"></div>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <span className="text-gray-400">Results</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-4xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Property Analysis</h1>
            <p className="text-gray-300">Enter your property details for AI-powered market analysis</p>
          </div>

          {/* Property Details Form */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 mb-6">
            <div className="space-y-6">
              {/* Property Address */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Property Address *
                </label>
                <div className="relative">
                  <MapPinIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter Los Angeles property address"
                  />
                  {analysisComplete && (
                    <CheckCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-400" />
                  )}
                </div>
                <p className="text-sm text-gray-400 mt-1">
                  AI analysis will begin automatically after you finish typing
                </p>
              </div>

              {/* Property Type */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Property Type
                </label>
                <div className="relative">
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all appearance-none"
                  >
                    {propertyTypes.map((type) => (
                      <option key={type} value={type} className="bg-gray-800 text-white">
                        {type}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>


            </div>

            {/* AI Analysis Results */}
            {loading && (
              <div className="mt-8 p-6 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mr-3"></div>
                  <span className="text-blue-400">Analyzing property data...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-8 p-6 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <span className="text-red-400 font-semibold">Analysis Error</span>
                </div>
                <p className="text-red-300 text-sm">{error}</p>
                <button
                  onClick={() => {
                    setLoading(true);
                    setError('');
                    setAnalysisComplete(false);
                    setPropertyData(null);
                    fetchPropertyData();
                  }}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Retry Analysis
                </button>
              </div>
            )}

            {analysisComplete && propertyData && !loading && !error && (
              <div className="mt-8 p-6 bg-green-500/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                    <span className="text-green-400 font-semibold">AI Property Analysis Complete</span>
                  </div>
                  <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 text-yellow-300 rounded-full text-sm">
                    {propertyData ? 'Data available' : 'No data'}
                  </span>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{formatValue(propertyData.units)}</div>
                    <div className="text-gray-300 text-sm">Units</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{formatValue(propertyData.squareFootage)}</div>
                    <div className="text-gray-300 text-sm">Sq Ft</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{formatValue(propertyData.buildYear)}</div>
                    <div className="text-gray-300 text-sm">Built</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-white">{formatValue(propertyData.walkScore)}</div>
                    <div className="text-gray-300 text-sm">Walk Score</div>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
                  <span className="text-red-300">{error}</span>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="mt-6 p-4 bg-blue-500/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
                  <span className="text-blue-300">Analyzing property data...</span>
                </div>
              </div>
            )}
          </div>


          
          {/* Market Analysis Results */}
          {analysisComplete && propertyData && (
            <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-xl p-8 mb-6">
              <h2 className="text-2xl font-bold text-white mb-6">Market Analysis</h2>
              
              {/* Key Financial Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-300">{formatValue(propertyData.capRate)}</div>
                  <div className="text-gray-300 text-sm">Cap Rate</div>
                  <div className="text-green-200 text-xs mt-1">Annual Return</div>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-300">{formatValue(propertyData.cashOnCash)}</div>
                  <div className="text-gray-300 text-sm">Cash on Cash</div>
                  <div className="text-purple-200 text-xs mt-1">Cash Flow Return</div>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-300">{formatValue(propertyData.irr)}</div>
                  <div className="text-gray-300 text-sm">IRR</div>
                  <div className="text-yellow-200 text-xs mt-1">Total Return</div>
                </div>
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-300">{formatValue(propertyData.propertyValue)}</div>
                  <div className="text-gray-300 text-sm">Property Value</div>
                  <div className="text-blue-200 text-xs mt-1">Market Price</div>
                </div>
              </div>
              
              {/* Detailed Financial Analysis */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Cap Rate:</span>
                  <span className="text-white font-medium">{formatValue(propertyData.capRate)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">Cash on Cash:</span>
                  <span className="text-white font-medium">{formatValue(propertyData.cashOnCash)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg">
                  <span className="text-gray-300">IRR:</span>
                  <span className="text-white font-medium">{formatValue(propertyData.irr)}</span>
                </div>
              </div>

              {/* Market Insights */}
              <div className="mt-6 p-4 bg-blue-600/20 rounded-lg">
                <h3 className="font-semibold text-white mb-2">Market Insights</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="text-blue-200 font-medium">Cap Rate Analysis: </span>
                      <span className="text-blue-200 text-sm">
                        {propertyData.capRate && parseFloat(propertyData.capRate.replace('%', '')) >= 6.5 
                          ? 'Above market average - strong income potential'
                          : 'Below market average - consider negotiation'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="text-blue-200 font-medium">Cash Flow: </span>
                      <span className="text-blue-200 text-sm">
                        {propertyData.cashOnCash && parseFloat(propertyData.cashOnCash.replace('%', '')) >= 8.0
                          ? 'Strong cash-on-cash return - good investment'
                          : 'Moderate cash flow - review financing terms'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                    <div>
                      <span className="text-blue-200 font-medium">Total Return: </span>
                      <span className="text-blue-200 text-sm">
                        {propertyData.irr && parseFloat(propertyData.irr.replace('%', '')) >= 14.0
                          ? 'Excellent IRR - high growth potential'
                          : 'Standard IRR - stable investment'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-600/20 rounded-lg">
                <h3 className="font-semibold text-white mb-2">AI Insights</h3>
                <p className="text-blue-200 text-sm">
                  {formatValue(propertyData.aiReasoning)}
                </p>
              </div>

              <div className="mt-4 flex justify-between items-center">
                <div>
                  <span className="text-gray-300">Data Sources: </span>
                  <span className="text-white">
                    {propertyData.dataSources && propertyData.dataSources.length > 0 
                      ? `${propertyData.dataSources.length} sources` 
                      : 'Not available'}
                  </span>
                </div>
                              <div className="flex space-x-2">
                <button
                  onClick={handleDownload}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Download Report
                </button>
                <button
                  onClick={handleShare}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Share Analysis
                </button>
                <button
                  onClick={() => {
                    setLoading(true);
                    setError('');
                    setAnalysisComplete(false);
                    setPropertyData(null);
                    fetchPropertyData();
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Re-analyze
                </button>

              </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleContinue}
              disabled={!analysisComplete}
              className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>Continue to Financials</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 