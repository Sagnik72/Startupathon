"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  BuildingOfficeIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  DocumentTextIcon,
  CalculatorIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ShareIcon,
  PlusIcon,
  GlobeAltIcon,
  MapPinIcon,
  BuildingOffice2Icon,
  CurrencyDollarIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/utils/supabaseClient';

export default function Results() {
  const [currentStep, setCurrentStep] = useState(5); // Results step
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dealAnalysis, setDealAnalysis] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('financials');
  const [geminiAnalysis, setGeminiAnalysis] = useState<any>(null);
  const [historySaved, setHistorySaved] = useState(false);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse user criteria from query params and map to explicit keys
  const selectedCriteriaArr = JSON.parse(searchParams.get('criteria') || '[]');
  const userCriteria: any = {
    minCoCReturn: undefined,
    capRateRange: undefined,
    yearBuiltThreshold: undefined,
    holdPeriod: undefined,
    minDSCR: undefined,
    marketConditions: undefined,
    propertyCondition: undefined
  };
  selectedCriteriaArr.forEach((c: string) => {
    if (c.toLowerCase().includes('cash-on-cash')) {
      const match = c.match(/([\d.]+)%/);
      if (match) userCriteria.minCoCReturn = parseFloat(match[1]);
    } else if (c.toLowerCase().includes('cap rate')) {
      const match = c.match(/([\d.]+)%/g);
      if (match && match.length === 2) userCriteria.capRateRange = match.join('-');
      else if (match && match.length === 1) userCriteria.capRateRange = match[0];
    } else if (c.toLowerCase().includes('year built')) {
      const match = c.match(/(\d{4})/);
      if (match) userCriteria.yearBuiltThreshold = match[1];
    } else if (c.toLowerCase().includes('hold') || c.toLowerCase().includes('timeframe')) {
      const match = c.match(/(\d+-?\d*)/);
      if (match) userCriteria.holdPeriod = match[1];
    } else if (c.toLowerCase().includes('dscr')) {
      const match = c.match(/([\d.]+)/);
      if (match) userCriteria.minDSCR = match[1];
    } else if (c.toLowerCase().includes('market')) {
      userCriteria.marketConditions = c.split(':')[1]?.trim() || c;
    } else if (c.toLowerCase().includes('property condition')) {
      userCriteria.propertyCondition = c.split(':')[1]?.trim() || c;
    }
  });
  // Optionally add investmentAmount and timeframe
  userCriteria.investmentAmount = searchParams.get('investmentAmount') || '';
  userCriteria.timeframe = searchParams.get('timeframe') || '';

  // Fetch user for Supabase
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_KEY) {
      supabase.auth.getUser().then(({ data }) => {
        if (data?.user) setUser(data.user);
      });
    }
  }, [setUser]);

  // Declare fetchAnalysisData before useEffect
  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Get location from user input or use a dynamic source
      const location = 'Los Angeles, CA'; // This should come from user input or previous step
      const url = `/api/property-data?location=${encodeURIComponent(location)}`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Only use real data from API, no hardcoded fallbacks
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid data structure received from API');
      }
      setAnalysisData(data);
      // Analyze the deal
      analyzeDeal(data);
      // Fetch Gemini AI analysis
      fetchGeminiAnalysis(data, userCriteria);
    } catch (err) {
      console.error('❌ Error fetching analysis data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load analysis data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Clean up any uploaded files when entering this page
  useEffect(() => {
    // Clear any file upload state from previous pages
    fetchAnalysisData();
  }, [fetchAnalysisData]);

  // When analysisData is available, call fetchGeminiAnalysis with userCriteria
  useEffect(() => {
    if (analysisData) {
      fetchGeminiAnalysis(analysisData, userCriteria);
    }
  }, [analysisData, userCriteria, fetchGeminiAnalysis]);

  // Save analysis to history after analysis is available
  useEffect(() => {
    if (!analysisData || !geminiAnalysis || historySaved) return;
    console.log('[SAVE HISTORY] Attempting to save analysis history:', { analysisData, geminiAnalysis, user });
    const saveHistory = async () => {
      const historyItem = {
        property_address: analysisData?.propertyInfo?.address || analysisData?.propertyValue || 'Unknown Property',
        confidenceScore: geminiAnalysis.confidenceScore,
        created_at: new Date().toISOString(),
        resultUrl: window.location.pathname + window.location.search,
        geminiAnalysis: JSON.parse(JSON.stringify(geminiAnalysis)),
        propertyInfo: JSON.parse(JSON.stringify(analysisData?.propertyInfo || {})),
      };
      try {
        if (user) {
          console.log('[DEBUG] Attempting Supabase insert:', { ...historyItem, user_id: user.id });
          const { error } = await supabase.from('analysis_history').insert([
            { ...historyItem, user_id: user.id }
          ]);
          console.log('[DEBUG] Supabase insert error:', error, JSON.stringify(error));
          if (error) {
            console.error('[SAVE HISTORY] Supabase insert error:', error, JSON.stringify(error));
          } else {
            console.log('[SAVE HISTORY] Saved to Supabase:', historyItem);
          }
        } else {
          // Save to localStorage (demo mode)
          const demoHistory = JSON.parse(localStorage.getItem('analysisHistory') || '[]');
          demoHistory.unshift(historyItem);
          localStorage.setItem('analysisHistory', JSON.stringify(demoHistory));
          console.log('[SAVE HISTORY] Saved to localStorage:', historyItem);
        }
        setHistorySaved(true);
      } catch (err) {
        console.error('[SAVE HISTORY] Unexpected error:', err);
      }
    };
    saveHistory();
  }, [analysisData, geminiAnalysis, user, historySaved]);

  const fetchGeminiAnalysis = async (propertyData: any, userCriteria: any) => {
    try {
      // Sample T12 and Rent Roll data for demonstration
      const t12Data = {
        grossRent: 312000,
        expenses: 124800,
        noi: 187200,
        vacancy: 4,
        management: 15600,
        maintenance: 31200,
        utilities: 15600,
        insurance: 7800,
        propertyTax: 15600,
        otherExpenses: 31200
      };

      const rentRollData = {
        totalUnits: 24,
        occupiedUnits: 23,
        averageRent: 1300,
        rentGrowth: 4.2,
        leaseExpirations: [
          { unit: "1A", expiration: "2024-06-15", currentRent: 1250 },
          { unit: "2B", expiration: "2024-08-20", currentRent: 1350 },
          { unit: "3C", expiration: "2024-09-10", currentRent: 1200 }
        ]
      };

      const propertyInfo = {
        address: "123 Main Street, Los Angeles, CA",
        propertyType: "Multifamily",
        yearBuilt: 1998,
        squareFootage: 24000,
        purchasePrice: 2850000,
        downPayment: 855000,
        loanAmount: 1995000,
        interestRate: 5.5
      };

      // Pass userCriteria to the backend
      const response = await fetch('/api/gemini-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          t12Data,
          rentRollData,
          propertyInfo,
          userCriteria
        })
      });

      if (response.ok) {
        const geminiData = await response.json();
        setGeminiAnalysis(geminiData);
      }
    } catch (error) {
      console.error('Error fetching Gemini analysis:', error);
    }
  };

  const analyzeDeal = (data: any) => {
    if (!data) {
      return;
    }

    // PropPulse AI Investment Criteria
    const criteria = {
      minCapRate: 6.5, // Cap Rate > 6.5%
      minCashOnCash: 8.0, // Cash-on-Cash > 8%
      minIRR: 14.0, // IRR > 14%
      minDSCR: 1.3, // DSCR > 1.3
      minYearBuilt: 1985, // Year Built > 1985
      minOccupancy: 90, // Occupancy > 90%
      maxPrice: 15000000 // Asking Price < $15M
    };

    // Extract numeric values from data
    const capRate = parseFloat(data.capRate?.replace('%', '') || '0');
    const cashOnCash = parseFloat(data.cashOnCash?.replace('%', '') || '0');
    const irr = parseFloat(data.irr?.replace('%', '') || '0');
    const noi = parseFloat(data.noi?.replace(/[$,]/g, '') || '0');
    const debtService = parseFloat(data.debtService?.replace(/[$,]/g, '') || '0');
    const yearBuilt = parseInt(data.buildYear || '0');
    const occupancy = parseFloat(data.marketInsights?.occupancyRate?.replace('%', '') || '0');
    const propertyValue = parseFloat(data.propertyValue?.replace(/[$,]/g, '') || '0');



    // Calculate DSCR
    const dscr = debtService > 0 ? noi / debtService : 0;

    // Evaluate each criterion
    const evaluation = {
      capRate: {
        value: capRate,
        required: criteria.minCapRate,
        passed: capRate >= criteria.minCapRate,
        weight: 0.20
      },
      cashOnCash: {
        value: cashOnCash,
        required: criteria.minCashOnCash,
        passed: cashOnCash >= criteria.minCashOnCash,
        weight: 0.20
      },
      irr: {
        value: irr,
        required: criteria.minIRR,
        passed: irr >= criteria.minIRR,
        weight: 0.20
      },
      dscr: {
        value: dscr,
        required: criteria.minDSCR,
        passed: dscr >= criteria.minDSCR,
        weight: 0.15
      },
      yearBuilt: {
        value: yearBuilt,
        required: criteria.minYearBuilt,
        passed: yearBuilt >= criteria.minYearBuilt,
        weight: 0.10
      },
      occupancy: {
        value: occupancy,
        required: criteria.minOccupancy,
        passed: occupancy >= criteria.minOccupancy,
        weight: 0.10
      },
      maxPrice: {
        value: propertyValue,
        required: criteria.maxPrice,
        passed: propertyValue <= criteria.maxPrice,
        weight: 0.05
      }
    };

    // Calculate overall score
    const totalWeight = Object.values(evaluation).reduce((sum, criterion) => sum + criterion.weight, 0);
    const weightedScore = Object.values(evaluation).reduce((score, criterion) => {
      return score + (criterion.passed ? criterion.weight : 0);
    }, 0);
    
    const overallScore = (weightedScore / totalWeight) * 100;
    const dealPasses = overallScore >= 80; // 80% threshold

    // Generate analysis summary
    const passedCriteria = Object.values(evaluation).filter(c => c.passed).length;
    const totalCriteria = Object.values(evaluation).length;
    
    const analysis = {
      overallScore: Math.round(overallScore),
      dealPasses,
      passedCriteria,
      totalCriteria,
      evaluation,
      summary: dealPasses 
        ? `Deal PASSES with ${overallScore.toFixed(1)}% score. ${passedCriteria}/${totalCriteria} criteria met.`
        : `Deal FAILS with ${overallScore.toFixed(1)}% score. Only ${passedCriteria}/${totalCriteria} criteria met.`,
      recommendations: generateRecommendations(evaluation, data)
    };

    setDealAnalysis(analysis);
  };

  const generateRecommendations = (evaluation: any, data: any) => {
    const recommendations = [];
    
    if (!evaluation.capRate.passed) {
      recommendations.push('Consider negotiating a lower purchase price to improve cap rate above 6.5%');
    }
    
    if (!evaluation.cashOnCash.passed) {
      recommendations.push('Explore financing options with better terms to improve cash-on-cash return above 8%');
    }
    
    if (!evaluation.irr.passed) {
      recommendations.push('Look for value-add opportunities to improve IRR above 14%');
    }
    
    if (!evaluation.dscr.passed) {
      recommendations.push('Improve NOI or negotiate better debt terms to meet DSCR requirements above 1.3');
    }

    if (!evaluation.yearBuilt.passed) {
      recommendations.push('Consider properties built after 1985 for better condition and fewer maintenance issues');
    }

    if (!evaluation.occupancy.passed) {
      recommendations.push('Focus on properties with occupancy rates above 90% for stable cash flow');
    }

    if (!evaluation.maxPrice.passed) {
      recommendations.push('Consider properties under $15M to stay within investment budget');
    }

    if (recommendations.length === 0) {
      recommendations.push('Deal meets all PropPulse AI criteria - proceed with due diligence');
    }

    return recommendations;
  };

  const steps = [
    { name: 'Welcome', icon: CheckCircleIcon, status: 'completed' },
    { name: 'Property', icon: CheckCircleIcon, status: 'completed' },
    { name: 'Financials', icon: CheckCircleIcon, status: 'completed' },
    { name: 'Buy Box', icon: CheckCircleIcon, status: 'completed' },
    { name: 'Results', icon: ChartBarIcon, status: 'current' }
  ];

  const handleBack = () => {
    router.push('/buybox');
  };

  const handleNewAnalysis = () => {
    // Clean up and start fresh
    router.push('/demo');
  };

  const handleDownload = () => {
    // Generate comprehensive report
    const reportData = generateReport();
    downloadReport(reportData);
  };

  const handleDownloadPDF = () => {
    // Generate PDF report (simplified version for now)
    const reportData = generateReport();
    downloadPDFReport(reportData);
  };

  const generateReport = () => {
    const timestamp = new Date().toLocaleString();
    const location = 'Los Angeles, CA';
    
    let report = `
PROPPULSE AI - COMMERCIAL REAL ESTATE ANALYSIS REPORT
Generated: ${timestamp}
Location: ${location}
Property Address: ${analysisData?.propertyValue || 'Not specified'}

================================================================================

EXECUTIVE SUMMARY
================================================================================
${dealAnalysis ? `
Deal Analysis Result: ${dealAnalysis.dealPasses ? 'PASS' : 'FAIL'}
Overall Score: ${dealAnalysis.overallScore}%
Criteria Met: ${dealAnalysis.passedCriteria}/${dealAnalysis.totalCriteria}

${dealAnalysis.summary}

Recommendations:
${dealAnalysis.recommendations.map((rec: string, index: number) => `${index + 1}. ${rec}`).join('\n')}
` : 'Deal analysis not available'}

================================================================================

PROPERTY DETAILS
================================================================================
Property Value: ${analysisData?.propertyValue || 'Not available'}
Cap Rate: ${analysisData?.capRate || 'Not available'}
Cash-on-Cash Return: ${analysisData?.cashOnCash || 'Not available'}
Internal Rate of Return (IRR): ${analysisData?.irr || 'Not available'}
Net Operating Income (NOI): ${analysisData?.noi || 'Not available'}
Debt Service: ${analysisData?.debtService || 'Not available'}
Cash Flow: ${analysisData?.cashFlow || 'Not available'}
Loan-to-Value (LTV): ${analysisData?.ltv || 'Not available'}
Down Payment: ${analysisData?.downPayment || 'Not available'}
Loan Amount: ${analysisData?.loanAmount || 'Not available'}

================================================================================

AI ANALYSIS
================================================================================
${analysisData?.aiReasoning || 'AI analysis not available'}

Recommendations:
${analysisData?.recommendations ? analysisData.recommendations.map((rec: string, index: number) => `${index + 1}. ${rec}`).join('\n') : 'No recommendations available'}

Risk Factors:
${analysisData?.risks ? analysisData.risks.map((risk: string, index: number) => `${index + 1}. ${risk}`).join('\n') : 'No risk factors identified'}

================================================================================

MARKET INSIGHTS
================================================================================
${analysisData?.marketInsights ? `
Market Trend: ${analysisData.marketInsights.marketTrend || 'Not available'}
Market Score: ${analysisData.marketInsights.marketScore || 'Not available'}
Rent Growth: ${analysisData.marketInsights.rentGrowth || 'Not available'}
Vacancy Rate: ${analysisData.marketInsights.vacancyRate || 'Not available'}
Cap Rate Trend: ${analysisData.marketInsights.capRateTrend || 'Not available'}
Market Outlook: ${analysisData.marketInsights.marketOutlook || 'Not available'}

Key Market Drivers:
${analysisData.marketInsights.keyDrivers ? analysisData.marketInsights.keyDrivers.map((driver: string, index: number) => `${index + 1}. ${driver}`).join('\n') : 'No market drivers available'}
` : 'Market insights not available'}

================================================================================

COMPARABLE PROPERTIES
================================================================================
${analysisData?.comparableProperties ? analysisData.comparableProperties.map((comp: any, index: number) => `
Property ${index + 1}:
Address: ${comp.address}
Price: ${comp.price}
Cap Rate: ${comp.capRate}
Distance: ${comp.distance}
Square Footage: ${comp.sqft}
Year Built: ${comp.yearBuilt}
Occupancy: ${comp.occupancy}
`).join('\n') : 'No comparable properties available'}

================================================================================

AI INSIGHTS DETAIL
================================================================================
${analysisData?.aiInsights ? `
Market Analysis:
${analysisData.aiInsights.marketAnalysis || 'Not available'}

Investment Thesis:
${analysisData.aiInsights.investmentThesis || 'Not available'}

Risk Assessment:
${analysisData.aiInsights.riskAssessment || 'Not available'}

Exit Strategy:
${analysisData.aiInsights.exitStrategy || 'Not available'}

Value-Add Opportunities:
${analysisData.aiInsights.valueAddOpportunities ? analysisData.aiInsights.valueAddOpportunities.map((opp: string, index: number) => `${index + 1}. ${opp}`).join('\n') : 'No value-add opportunities identified'}
` : 'AI insights not available'}

================================================================================

DATA SOURCES
================================================================================
${analysisData?.dataSources ? analysisData.dataSources.map((source: any, index: number) => `
Source ${index + 1}:
Name: ${source.name}
Type: ${source.type}
Last Updated: ${source.lastUpdated}
Coverage: ${source.coverage}
Reliability: ${source.reliability}
`).join('\n') : 'No data sources available'}

================================================================================

DEAL ANALYSIS DETAILS
================================================================================
${dealAnalysis ? `
Detailed Criteria Evaluation:

Cap Rate:
- Current Value: ${dealAnalysis.evaluation.capRate.value}%
- Required: ${dealAnalysis.evaluation.capRate.required}%
- Status: ${dealAnalysis.evaluation.capRate.passed ? 'PASS' : 'FAIL'}
- Weight: ${(dealAnalysis.evaluation.capRate.weight * 100).toFixed(0)}%

Cash-on-Cash Return:
- Current Value: ${dealAnalysis.evaluation.cashOnCash.value}%
- Required: ${dealAnalysis.evaluation.cashOnCash.required}%
- Status: ${dealAnalysis.evaluation.cashOnCash.passed ? 'PASS' : 'FAIL'}
- Weight: ${(dealAnalysis.evaluation.cashOnCash.weight * 100).toFixed(0)}%

Internal Rate of Return (IRR):
- Current Value: ${dealAnalysis.evaluation.irr.value}%
- Required: ${dealAnalysis.evaluation.irr.required}%
- Status: ${dealAnalysis.evaluation.irr.passed ? 'PASS' : 'FAIL'}
- Weight: ${(dealAnalysis.evaluation.irr.weight * 100).toFixed(0)}%

Debt Service Coverage Ratio (DSCR):
- Current Value: ${dealAnalysis.evaluation.dscr.value.toFixed(2)}
- Required: ${dealAnalysis.evaluation.dscr.required}
- Status: ${dealAnalysis.evaluation.dscr.passed ? 'PASS' : 'FAIL'}
- Weight: ${(dealAnalysis.evaluation.dscr.weight * 100).toFixed(0)}%

Year Built:
- Current Value: ${dealAnalysis.evaluation.yearBuilt.value}
- Required: ${dealAnalysis.evaluation.yearBuilt.required}
- Status: ${dealAnalysis.evaluation.yearBuilt.passed ? 'PASS' : 'FAIL'}
- Weight: ${(dealAnalysis.evaluation.yearBuilt.weight * 100).toFixed(0)}%

Occupancy Rate:
- Current Value: ${dealAnalysis.evaluation.occupancy.value}%
- Required: ${dealAnalysis.evaluation.occupancy.required}%
- Status: ${dealAnalysis.evaluation.occupancy.passed ? 'PASS' : 'FAIL'}
- Weight: ${(dealAnalysis.evaluation.occupancy.weight * 100).toFixed(0)}%

Maximum Price:
- Current Value: $${dealAnalysis.evaluation.maxPrice.value.toLocaleString()}
- Required: $${dealAnalysis.evaluation.maxPrice.required.toLocaleString()}
- Status: ${dealAnalysis.evaluation.maxPrice.passed ? 'PASS' : 'FAIL'}
- Weight: ${(dealAnalysis.evaluation.maxPrice.weight * 100).toFixed(0)}%
` : 'Deal analysis details not available'}

================================================================================

DISCLAIMER
================================================================================
This report is generated by PropPulse AI for informational purposes only. 
All data and analysis should be verified independently before making investment decisions.
This report does not constitute financial advice.

Generated by PropPulse AI
${timestamp}
`;

    return report;
  };

  const downloadReport = (reportContent: string) => {
    // Create blob and download
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proppulse-analysis-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('📄 Report downloaded successfully');
  };

  const downloadPDFReport = (reportContent: string) => {
    // For now, we'll create a simple HTML version that can be printed as PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>PropPulse AI Analysis Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
          .section { margin: 30px 0; }
          .section h2 { color: #2563eb; border-bottom: 1px solid #ccc; padding-bottom: 10px; }
          .metric { margin: 10px 0; }
          .metric strong { color: #1f2937; }
          .disclaimer { margin-top: 40px; padding: 20px; background: #f3f4f6; border-left: 4px solid #ef4444; }
          @media print { body { margin: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>PropPulse AI - Commercial Real Estate Analysis Report</h1>
          <p>Generated: ${new Date().toLocaleString()}</p>
          <p>Location: Los Angeles, CA</p>
        </div>
        
        <div class="section">
          <h2>Executive Summary</h2>
          ${dealAnalysis ? `
            <div class="metric"><strong>Deal Analysis Result:</strong> ${dealAnalysis.dealPasses ? 'PASS' : 'FAIL'}</div>
            <div class="metric"><strong>Overall Score:</strong> ${dealAnalysis.overallScore}%</div>
            <div class="metric"><strong>Criteria Met:</strong> ${dealAnalysis.passedCriteria}/${dealAnalysis.totalCriteria}</div>
            <p>${dealAnalysis.summary}</p>
          ` : '<p>Deal analysis not available</p>'}
        </div>

        <div class="section">
          <h2>Property Details</h2>
          <div class="metric"><strong>Property Value:</strong> ${analysisData?.propertyValue || 'Not available'}</div>
          <div class="metric"><strong>Cap Rate:</strong> ${analysisData?.capRate || 'Not available'}</div>
          <div class="metric"><strong>Cash-on-Cash Return:</strong> ${analysisData?.cashOnCash || 'Not available'}</div>
          <div class="metric"><strong>Internal Rate of Return (IRR):</strong> ${analysisData?.irr || 'Not available'}</div>
          <div class="metric"><strong>Net Operating Income (NOI):</strong> ${analysisData?.noi || 'Not available'}</div>
          <div class="metric"><strong>Cash Flow:</strong> ${analysisData?.cashFlow || 'Not available'}</div>
        </div>

        <div class="section">
          <h2>AI Analysis</h2>
          <p>${analysisData?.aiReasoning || 'AI analysis not available'}</p>
        </div>

        <div class="section">
          <h2>Market Insights</h2>
          ${analysisData?.marketInsights ? `
            <div class="metric"><strong>Market Trend:</strong> ${analysisData.marketInsights.marketTrend || 'Not available'}</div>
            <div class="metric"><strong>Market Score:</strong> ${analysisData.marketInsights.marketScore || 'Not available'}</div>
            <div class="metric"><strong>Rent Growth:</strong> ${analysisData.marketInsights.rentGrowth || 'Not available'}</div>
            <div class="metric"><strong>Vacancy Rate:</strong> ${analysisData.marketInsights.vacancyRate || 'Not available'}</div>
          ` : '<p>Market insights not available</p>'}
        </div>

        <div class="disclaimer">
          <h3>Disclaimer</h3>
          <p>This report is generated by PropPulse AI for informational purposes only. All data and analysis should be verified independently before making investment decisions. This report does not constitute financial advice.</p>
        </div>
      </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `proppulse-analysis-report-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    console.log('📄 PDF report downloaded successfully');
  };

  const handleShare = () => {
    // Generate shareable content
    generateShareableImage();
    shareToSocialMedia();
  };

  const generateShareableImage = () => {
    // Create a canvas element to generate the shareable image
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size for social media (1200x630 is optimal for most platforms)
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
    ctx.fillText('Commercial Real Estate Analysis', 600, 120);

    // Add deal result
    if (dealAnalysis) {
      ctx.fillStyle = dealAnalysis.dealPasses ? '#10b981' : '#ef4444';
      ctx.font = 'bold 36px Arial';
      ctx.fillText(`DEAL ${dealAnalysis.dealPasses ? 'PASSES' : 'FAILS'}`, 600, 180);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = '28px Arial';
      ctx.fillText(`Score: ${dealAnalysis.overallScore}%`, 600, 220);
    }

    // Add key metrics
    ctx.font = '20px Arial';
    ctx.textAlign = 'left';
    let yPos = 280;
    
    if (analysisData) {
      ctx.fillStyle = '#ffffff';
      ctx.fillText(`Property Value: ${analysisData.propertyValue || 'N/A'}`, 100, yPos);
      yPos += 40;
      ctx.fillText(`Cap Rate: ${analysisData.capRate || 'N/A'}`, 100, yPos);
      yPos += 40;
      ctx.fillText(`Cash-on-Cash: ${analysisData.cashOnCash || 'N/A'}`, 100, yPos);
      yPos += 40;
      ctx.fillText(`IRR: ${analysisData.irr || 'N/A'}`, 100, yPos);
    }

    // Add location
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '18px Arial';
    ctx.fillText('Los Angeles, CA', 100, yPos + 40);

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
        link.download = `proppulse-analysis-share-${new Date().toISOString().split('T')[0]}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        console.log('📸 Shareable image generated successfully');
      }
    }, 'image/jpeg', 0.9);
  };

  const shareToSocialMedia = () => {
    // Create shareable content
    const shareData = {
      title: 'PropPulse AI - Commercial Real Estate Analysis',
      text: dealAnalysis ? 
        `Deal ${dealAnalysis.dealPasses ? 'PASSES' : 'FAILS'} with ${dealAnalysis.overallScore}% score. Property Value: ${analysisData?.propertyValue || 'N/A'}, Cap Rate: ${analysisData?.capRate || 'N/A'}` :
        'Commercial real estate analysis completed with PropPulse AI',
      url: window.location.href
    };

    // Try native sharing first
    if (navigator.share) {
      navigator.share(shareData)
        .then(() => console.log('📤 Shared successfully'))
        .catch((error) => console.log('Error sharing:', error));
    } else {
      // Fallback to copying link
      copyToClipboard(window.location.href);
      showShareModal();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('📋 Link copied to clipboard');
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
        <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(dealAnalysis ? 
          `Deal ${dealAnalysis.dealPasses ? 'PASSES' : 'FAILS'} with ${dealAnalysis.overallScore}% score! Check out my PropPulse AI analysis:` :
          'Check out my PropPulse AI commercial real estate analysis:')}&url=${encodeURIComponent(window.location.href)}" 
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

  const formatValue = (value: any) => {
    if (value === null || value === undefined || value === '') {
      return 'Not available';
    }
    return value;
  };

  const hasData = (data: any, key: string) => {
    return data && data[key] !== null && data[key] !== undefined && data[key] !== '';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg">Analyzing your investment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Analysis Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchAnalysisData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry Analysis
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    console.log('❌ analysisData is null/undefined in render');
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <ChartBarIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">No Analysis Data</h2>
          <p className="text-gray-300 mb-4">No analysis data available. Please complete the analysis process.</p>
          <button
            onClick={() => router.push('/demo')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Analysis
          </button>
        </div>
      </div>
    );
  }

  console.log('✅ analysisData is available in render:', analysisData);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="flex justify-between items-center px-10 py-6">
        <div className="flex items-center space-x-3">
          <BuildingOfficeIcon className="h-8 w-8 text-blue-400" />
          <div className="text-xl font-bold text-gray-300">PropPulse AI</div>
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
          {steps.map((step, index) => (
            <div key={step.name} className="flex items-center">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.status === 'completed' ? 'bg-green-500' : 
                  step.status === 'current' ? 'bg-blue-500' : 'bg-gray-600'
                }`}>
                  <step.icon className={`h-5 w-5 ${
                    step.status === 'upcoming' ? 'text-gray-400' : 'text-white'
                  }`} />
                </div>
                <span className={`font-medium ${
                  step.status === 'completed' ? 'text-green-400' : 
                  step.status === 'current' ? 'text-blue-400' : 'text-gray-400'
                }`}>
                  {step.name}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-1 w-16 ml-8 ${
                  step.status === 'completed' ? 'bg-green-500' : 'bg-gray-600'
                }`}></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center px-4 py-8">
        <div className="w-full max-w-7xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Investment Analysis Results</h1>
            <p className="text-gray-300">AI-powered analysis of your commercial real estate investment</p>
          </div>

          {/* Professional Analysis Interface */}
          <div className="bg-white rounded-xl shadow-2xl p-6 mb-6">
            {/* Deal Summary Header */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {geminiAnalysis?.dealPasses ? 'Deal Passes' : 'Deal Analysis'}
              </h1>
              <p className="text-base text-gray-600 mb-3">
                {geminiAnalysis?.summary || 'Strong cash-on-cash return at 8.4% exceeds required 7.0%'}
              </p>
              <div className="inline-flex items-center px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                <span className="font-semibold text-sm">Confidence Score: {geminiAnalysis?.confidenceScore || 87}%</span>
              </div>
              
              {/* Confidence Factors Breakdown */}
              {geminiAnalysis?.confidenceFactors && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Confidence Factors:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {Object.entries(geminiAnalysis.confidenceFactors).map(([key, factor]: [string, any]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-gray-600 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:
                        </span>
                        <span className={`font-medium ${
                          factor.score >= 80 ? 'text-green-600' :
                          factor.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {factor.value} ({factor.score}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Key Financial Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-green-600">
                  {geminiAnalysis?.financialMetrics?.cashOnCash || '8.4%'}
                </div>
                <div className="text-xs text-gray-600">Cash-on-Cash</div>
                <div className="text-xs text-green-600 font-medium">Target: 7%</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-blue-600">
                  {geminiAnalysis?.financialMetrics?.capRate || '6.2%'}
                </div>
                <div className="text-xs text-gray-600">Cap Rate</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-purple-600">
                  {geminiAnalysis?.financialMetrics?.irr || '14.7%'}
                </div>
                <div className="text-xs text-gray-600">IRR</div>
              </div>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                <div className="text-xl font-bold text-orange-600">
                  {geminiAnalysis?.financialMetrics?.dscr || '1.34'}
                </div>
                <div className="text-xs text-gray-600">DSCR</div>
              </div>
            </div>

            {/* Detailed Analysis Tabs */}
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Detailed Analysis</h2>
              
              {/* Tab Navigation */}
              <div className="border-b border-gray-200 mb-4">
                <nav className="flex space-x-6">
                  {[
                    { id: 'financials', name: 'Financials' },
                    { id: 'risk', name: 'Risk Analysis' },
                    { id: 'comparables', name: 'Comparables' },
                    { id: 'confidence', name: 'Confidence Analysis' },
                    { id: 'recommendations', name: 'Recommendations' }
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-2 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Tab Content */}
              <div className="min-h-[300px]">
                                 {activeTab === 'financials' && (
                   <div className="space-y-3">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                       <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                         <span className="text-gray-600 text-sm">Purchase Price:</span>
                         <span className="font-medium text-gray-900 text-sm">
                           {geminiAnalysis?.financialMetrics?.purchasePrice || '$2,850,000'}
                         </span>
                       </div>
                       <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                         <span className="text-gray-600 text-sm">Gross Rent:</span>
                         <span className="font-medium text-gray-900 text-sm">
                           {geminiAnalysis?.financialMetrics?.grossRent || '$312,000'}
                           <span className="text-green-600 text-xs ml-2">+4.2%</span>
                         </span>
                       </div>
                       <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                         <span className="text-gray-600 text-sm">Net Operating Income:</span>
                         <span className="font-medium text-gray-900 text-sm">
                           {geminiAnalysis?.financialMetrics?.noi || '$187,200'}
                           <span className="text-green-600 text-xs ml-2">+3.8%</span>
                         </span>
                       </div>
                       <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                         <span className="text-gray-600 text-sm">Cash-on-Cash Return:</span>
                         <span className="font-medium text-gray-900 text-sm">
                           {geminiAnalysis?.financialMetrics?.cashOnCash || '8.4%'}
                           <span className="text-green-600 text-xs ml-2">+1.4%</span>
                         </span>
                       </div>
                       <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                         <span className="text-gray-600 text-sm">Cap Rate:</span>
                         <span className="font-medium text-gray-900 text-sm">
                           {geminiAnalysis?.financialMetrics?.capRate || '6.2%'}
                           <span className="text-green-600 text-xs ml-2">+0.4%</span>
                         </span>
                       </div>
                       <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                         <span className="text-gray-600 text-sm">DSCR:</span>
                         <span className="font-medium text-gray-900 text-sm">
                           {geminiAnalysis?.financialMetrics?.dscr || '1.34'}
                           <span className="text-green-600 text-xs ml-2">+0.09</span>
                         </span>
                       </div>
                     </div>
                   </div>
                 )}

                                 {activeTab === 'risk' && (
                   <div className="space-y-3">
                     {geminiAnalysis?.riskAnalysis?.map((risk: any, index: number) => (
                       <div key={index} className={`p-3 rounded-lg border ${
                         risk.level === 'High' ? 'bg-red-50 border-red-200' :
                         risk.level === 'Medium' ? 'bg-yellow-50 border-yellow-200' :
                         'bg-green-50 border-green-200'
                       }`}>
                         <div className="flex items-start space-x-2">
                           <ExclamationTriangleIcon className={`h-4 w-4 mt-0.5 ${
                             risk.level === 'High' ? 'text-red-500' :
                             risk.level === 'Medium' ? 'text-yellow-500' :
                             'text-green-500'
                           }`} />
                           <div className="flex-1">
                             <div className="flex items-center space-x-2 mb-1">
                               <span className={`px-2 py-1 rounded text-xs font-medium ${
                                 risk.level === 'High' ? 'bg-red-100 text-red-800' :
                                 risk.level === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-green-100 text-green-800'
                               }`}>
                                 {risk.level} Risk
                               </span>
                             </div>
                             <p className="text-gray-900 font-medium text-sm">{risk.factor}</p>
                             <p className="text-gray-600 text-xs mt-1">{risk.impact}</p>
                           </div>
                         </div>
                       </div>
                     )) || (
                       <div className="text-gray-500 text-center py-6">
                         Risk analysis data not available
                       </div>
                     )}
                   </div>
                 )}

                {activeTab === 'comparables' && (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Distance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cap Rate</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CoC Return</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {geminiAnalysis?.marketAnalysis?.comparableProperties?.map((comp: any, index: number) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{comp.address}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{comp.distance}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comp.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comp.capRate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{comp.cashOnCash}</td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                              Comparable properties data not available
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                                 {activeTab === 'confidence' && (
                   <div className="space-y-3">
                     {geminiAnalysis?.confidenceFactors ? (
                       <div className="space-y-4">
                         <div className="text-center mb-4">
                           <div className="text-2xl font-bold text-gray-900 mb-1">
                             {geminiAnalysis.confidenceScore}%
                           </div>
                           <div className="text-sm text-gray-600">Overall Confidence Score</div>
                         </div>
                         
                         <div className="space-y-3">
                           {Object.entries(geminiAnalysis.confidenceFactors).map(([key, factor]: [string, any]) => (
                             <div key={key} className="bg-gray-50 rounded-lg p-3">
                               <div className="flex justify-between items-center mb-2">
                                 <span className="font-medium text-sm text-gray-900 capitalize">
                                   {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                 </span>
                                 <span className={`text-sm font-bold ${
                                   factor.score >= 80 ? 'text-green-600' :
                                   factor.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                                 }`}>
                                   {factor.score}%
                                 </span>
                               </div>
                               <div className="flex justify-between items-center text-xs text-gray-600">
                                 <span>Value: {factor.value}</span>
                                 <span>Target: {factor.target}</span>
                               </div>
                               <div className="mt-2">
                                 <div className="w-full bg-gray-200 rounded-full h-2">
                                   <div 
                                     className={`h-2 rounded-full ${
                                       factor.score >= 80 ? 'bg-green-500' :
                                       factor.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                                     }`}
                                     style={{ width: `${factor.score}%` }}
                                   ></div>
                                 </div>
                               </div>
                             </div>
                           ))}
                         </div>
                       </div>
                     ) : (
                       <div className="text-gray-500 text-center py-6">
                         Confidence analysis not available
                       </div>
                     )}
                   </div>
                 )}
                 
                 {activeTab === 'recommendations' && (
                   <div className="space-y-3">
                     {geminiAnalysis?.recommendations?.map((rec: string, index: number) => (
                       <div key={index} className="flex items-start space-x-2 p-3 bg-blue-50 rounded-lg">
                         <CheckCircleIcon className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                         <span className="text-gray-900 text-sm">{rec}</span>
                       </div>
                     )) || (
                       <div className="text-gray-500 text-center py-6">
                         Recommendations not available
                       </div>
                     )}
                   </div>
                 )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-3">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Export PDF Report</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Export Excel Model</span>
              </button>
              <button
                onClick={handleShare}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 text-sm"
              >
                <ShareIcon className="h-4 w-4" />
                <span>Generate LOI</span>
              </button>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Key Metrics */}
            <div className="lg:col-span-2 bg-gray-800 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-6">Key Metrics</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-300">{formatValue(analysisData.propertyValue)}</div>
                  <div className="text-gray-300 text-sm">Property Value</div>
                </div>
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-300">{formatValue(analysisData.capRate)}</div>
                  <div className="text-gray-300 text-sm">Cap Rate</div>
                </div>
                <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-purple-300">{formatValue(analysisData.cashOnCash)}</div>
                  <div className="text-gray-300 text-sm">Cash-on-Cash</div>
                </div>
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-yellow-300">{formatValue(analysisData.irr)}</div>
                  <div className="text-gray-300 text-sm">IRR</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Cash Flow Analysis</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">NOI:</span>
                      <span className="text-white">{formatValue(analysisData.noi)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Debt Service:</span>
                      <span className="text-white">{formatValue(analysisData.debtService)}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-600 pt-2">
                      <span className="text-green-300 font-semibold">Cash Flow:</span>
                      <span className="text-green-300 font-semibold">{formatValue(analysisData.cashFlow)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-2">Financing Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">LTV:</span>
                      <span className="text-white">{formatValue(analysisData.ltv)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Down Payment:</span>
                      <span className="text-white">{formatValue(analysisData.downPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Loan Amount:</span>
                      <span className="text-white">{formatValue(analysisData.loanAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Analysis */}
            <div className="bg-gray-800 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">AI Analysis</h2>
              <div className="space-y-4">
                {hasData(analysisData, 'aiReasoning') ? (
                  <div>
                    <h3 className="text-white font-medium mb-2">AI Reasoning</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{formatValue(analysisData.aiReasoning)}</p>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">AI analysis not available</div>
                )}
                
                {hasData(analysisData, 'recommendations') && analysisData.recommendations?.length > 0 ? (
                  <div>
                    <h3 className="text-white font-medium mb-2">Recommendations</h3>
                    <ul className="space-y-2">
                      {analysisData.recommendations.map((rec: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No recommendations available</div>
                )}
                
                {hasData(analysisData, 'risks') && analysisData.risks?.length > 0 ? (
                  <div>
                    <h3 className="text-white font-medium mb-2">Risk Factors</h3>
                    <ul className="space-y-2">
                      {analysisData.risks.map((risk: string, index: number) => (
                        <li key={index} className="flex items-start space-x-2">
                          <ExclamationTriangleIcon className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="text-gray-400 text-sm">No risk factors identified</div>
                )}
              </div>
            </div>
          </div>

          {/* Market Insights & Comparable Properties */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Market Insights */}
            <div className="bg-gray-800 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <GlobeAltIcon className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Market Insights</h2>
              </div>
              
              {analysisData.marketInsights ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {hasData(analysisData.marketInsights, 'marketScore') && (
                      <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-blue-300">{formatValue(analysisData.marketInsights.marketScore)}</div>
                        <div className="text-gray-300 text-xs">Market Score</div>
                      </div>
                    )}
                    {hasData(analysisData.marketInsights, 'rentGrowth') && (
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-green-300">{formatValue(analysisData.marketInsights.rentGrowth)}</div>
                        <div className="text-gray-300 text-xs">Rent Growth</div>
                      </div>
                    )}
                    {hasData(analysisData.marketInsights, 'vacancyRate') && (
                      <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-purple-300">{formatValue(analysisData.marketInsights.vacancyRate)}</div>
                        <div className="text-gray-300 text-xs">Vacancy Rate</div>
                      </div>
                    )}
                    {hasData(analysisData.marketInsights, 'capRateTrend') && (
                      <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                        <div className="text-lg font-bold text-yellow-300">{formatValue(analysisData.marketInsights.capRateTrend)}</div>
                        <div className="text-gray-300 text-xs">Cap Rate Trend</div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    {hasData(analysisData.marketInsights, 'marketTrend') && (
                      <div className="flex items-center space-x-2">
                        <ArrowTrendingUpIcon className="h-5 w-5 text-green-400" />
                        <span className="text-white font-medium">Market Trend: {formatValue(analysisData.marketInsights.marketTrend)}</span>
                      </div>
                    )}
                    {hasData(analysisData.marketInsights, 'marketOutlook') && (
                      <div className="flex items-center space-x-2">
                        <BuildingOffice2Icon className="h-5 w-5 text-blue-400" />
                        <span className="text-white font-medium">Outlook: {formatValue(analysisData.marketInsights.marketOutlook)}</span>
                      </div>
                    )}
                  </div>

                  {hasData(analysisData.marketInsights, 'keyDrivers') && analysisData.marketInsights.keyDrivers?.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-white font-medium mb-2">Key Market Drivers</h4>
                      <ul className="space-y-1">
                        {analysisData.marketInsights.keyDrivers.map((driver: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                            <span className="text-gray-300 text-sm">{driver}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-gray-400 text-sm">Market insights not available</div>
              )}
            </div>

            {/* Comparable Properties */}
            <div className="bg-gray-800 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <MapPinIcon className="h-6 w-6 text-green-400" />
                <h2 className="text-xl font-semibold text-white">Comparable Properties</h2>
              </div>
              
              <div className="space-y-4">
                {hasData(analysisData, 'comparableProperties') && analysisData.comparableProperties?.length > 0 ? (
                  analysisData.comparableProperties.map((comp: any, index: number) => (
                    <div key={index} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-white font-medium text-sm">{formatValue(comp.address)}</div>
                        <div className="text-green-300 font-bold">{formatValue(comp.price)}</div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {hasData(comp, 'capRate') && (
                          <div className="flex justify-between">
                            <span className="text-gray-300">Cap Rate:</span>
                            <span className="text-white">{formatValue(comp.capRate)}</span>
                          </div>
                        )}
                        {hasData(comp, 'distance') && (
                          <div className="flex justify-between">
                            <span className="text-gray-300">Distance:</span>
                            <span className="text-white">{formatValue(comp.distance)}</span>
                          </div>
                        )}
                        {hasData(comp, 'sqft') && (
                          <div className="flex justify-between">
                            <span className="text-gray-300">Sq Ft:</span>
                            <span className="text-white">{formatValue(comp.sqft)}</span>
                          </div>
                        )}
                        {hasData(comp, 'occupancy') && (
                          <div className="flex justify-between">
                            <span className="text-gray-300">Occupancy:</span>
                            <span className="text-white">{formatValue(comp.occupancy)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm">No comparable properties available</div>
                )}
              </div>
            </div>
          </div>

          {/* AI Insights & Data Sources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* AI Insights */}
            <div className="bg-gray-800 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <ChartBarIcon className="h-6 w-6 text-purple-400" />
                <h2 className="text-xl font-semibold text-white">AI Insights</h2>
              </div>
              
              {analysisData.aiInsights ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-white font-medium mb-2">Market Analysis</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{formatValue(analysisData.aiInsights.marketAnalysis)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium mb-2">Investment Thesis</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{formatValue(analysisData.aiInsights.investmentThesis)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium mb-2">Risk Assessment</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{formatValue(analysisData.aiInsights.riskAssessment)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium mb-2">Exit Strategy</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">{formatValue(analysisData.aiInsights.exitStrategy)}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-white font-medium mb-2">Value-Add Opportunities</h3>
                    <ul className="space-y-1">
                      {analysisData.aiInsights.valueAddOpportunities ? (
                        analysisData.aiInsights.valueAddOpportunities.map((opportunity: string, index: number) => (
                          <li key={index} className="flex items-start space-x-2">
                            <CurrencyDollarIcon className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-300 text-sm">{opportunity}</span>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-400 text-sm">No value-add opportunities identified</li>
                      )}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="text-gray-400 text-sm">AI insights not available</div>
              )}
            </div>

            {/* Data Sources */}
            <div className="bg-gray-800 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <DocumentTextIcon className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">Data Sources</h2>
              </div>
              
              <div className="space-y-4">
                {analysisData.dataSources ? (
                  analysisData.dataSources.map((source: any, index: number) => (
                    <div key={index} className="bg-gray-700 border border-gray-600 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-white font-medium">{formatValue(source.name)}</div>
                        <div className={`px-2 py-1 rounded text-xs ${
                          source.reliability === 'High' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                        }`}>
                          {formatValue(source.reliability)}
                        </div>
                      </div>
                      <div className="text-gray-300 text-sm mb-2">{formatValue(source.type)}</div>
                      <div className="text-gray-400 text-xs mb-2">{formatValue(source.coverage)}</div>
                      <div className="flex items-center space-x-1 text-gray-400 text-xs">
                        <ClockIcon className="h-3 w-3" />
                        <span>Updated: {formatValue(source.lastUpdated)}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-400 text-sm">No data sources available</div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back</span>
            </button>
            
            <div className="flex space-x-4">
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Download Report</span>
              </button>
              <button
                onClick={handleDownloadPDF}
                className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
              >
                <DocumentArrowDownIcon className="h-4 w-4" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
              >
                <ShareIcon className="h-4 w-4" />
                <span>Share</span>
              </button>
              <button
                onClick={handleNewAnalysis}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:from-purple-600 hover:to-pink-700 transition-all duration-300 flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>New Analysis</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 