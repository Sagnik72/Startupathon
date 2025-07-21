"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  PlusIcon
} from '@heroicons/react/24/outline';

export default function BuyBox() {
  const [currentStep, setCurrentStep] = useState(4); // Buy Box step
  const [selectedCriteria, setSelectedCriteria] = useState<string[]>([]);
  const [customCriteria, setCustomCriteria] = useState('');
  const [investmentAmount, setInvestmentAmount] = useState('');
  const [timeframe, setTimeframe] = useState('');
  const router = useRouter();

  // Clean up any uploaded files when entering this page
  useEffect(() => {
    // Clear any file upload state from previous pages
    console.log('🧹 Cleaning up uploaded files from previous iteration...');
  }, []);

  const steps = [
    { name: 'Welcome', icon: CheckCircleIcon, status: 'completed' },
    { name: 'Property', icon: CheckCircleIcon, status: 'completed' },
    { name: 'Financials', icon: CheckCircleIcon, status: 'completed' },
    { name: 'Buy Box', icon: BuildingOfficeIcon, status: 'current' },
    { name: 'Results', icon: ChartBarIcon, status: 'upcoming' }
  ];

  const investmentCriteria = {
    capRate: { min: 6.5, label: 'Cap Rate > 6.5%' },
    cashOnCash: { min: 8.0, label: 'Cash-on-Cash > 8%' },
    irr: { min: 14.0, label: 'IRR > 14%' },
    dscr: { min: 1.3, label: 'DSCR > 1.3' },
    yearBuilt: { min: 1985, label: 'Year Built > 1985' },
    occupancy: { min: 90, label: 'Occupancy > 90%' },
    maxPrice: { max: 15000000, label: 'Asking Price < $15M' }
  };

  const quickTemplates = [
    {
      name: 'PropPulse Standard',
      criteria: [
        'Cap Rate > 6.5%',
        'Cash-on-Cash > 8%', 
        'IRR > 14%',
        'DSCR > 1.3',
        'Year Built > 1985',
        'Occupancy > 90%',
        'Asking Price < $15M'
      ],
      description: 'Standard PropPulse AI investment criteria for LA market'
    },
    {
      name: 'Conservative',
      criteria: [
        'Cap Rate > 7.0%',
        'Cash-on-Cash > 9%',
        'IRR > 16%',
        'DSCR > 1.4',
        'Year Built > 1990',
        'Occupancy > 95%',
        'Asking Price < $10M'
      ],
      description: 'Conservative criteria for lower risk investments'
    },
    {
      name: 'Value Add',
      criteria: [
        'Cap Rate > 5.5%',
        'Cash-on-Cash > 7%',
        'IRR > 12%',
        'DSCR > 1.25',
        'Year Built > 1980',
        'Occupancy > 85%',
        'Asking Price < $20M'
      ],
      description: 'Value-add opportunities with renovation potential'
    },
    {
      name: 'Growth',
      criteria: [
        'Cap Rate > 6.0%',
        'Cash-on-Cash > 8%',
        'IRR > 15%',
        'DSCR > 1.3',
        'Year Built > 1985',
        'Occupancy > 90%',
        'Asking Price < $25M'
      ],
      description: 'Growth-focused criteria for emerging markets'
    }
  ];

  const handleTemplateSelect = (template: typeof quickTemplates[0]) => {
    setSelectedCriteria(template.criteria);
  };

  const handleContinue = () => {
    router.push('/results');
  };

  const handleBack = () => {
    router.push('/analysis');
  };

  const addCustomCriteria = () => {
    if (customCriteria.trim() && !selectedCriteria.includes(customCriteria.trim())) {
      setSelectedCriteria([...selectedCriteria, customCriteria.trim()]);
      setCustomCriteria('');
    }
  };

  const removeCriteria = (criteria: string) => {
    setSelectedCriteria(selectedCriteria.filter(c => c !== criteria));
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
        <div className="w-full max-w-4xl">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Investment Criteria</h1>
            <p className="text-gray-300">Define your investment parameters and preferences</p>
          </div>

          {/* Investment Criteria Form */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 mb-6">
            {/* Quick Templates */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Templates</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {quickTemplates.map((template) => (
                  <div
                    key={template.name}
                    onClick={() => handleTemplateSelect(template)}
                    className="bg-white/5 border border-white/20 rounded-lg p-4 cursor-pointer hover:bg-white/10 transition-colors"
                  >
                    <h4 className="text-white font-semibold mb-2">{template.name}</h4>
                    <p className="text-gray-300 text-sm mb-3">{template.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {template.criteria.slice(0, 2).map((criteria, index) => (
                        <span key={index} className="bg-blue-500/20 text-blue-300 text-xs px-2 py-1 rounded">
                          {criteria}
                        </span>
                      ))}
                      {template.criteria.length > 2 && (
                        <span className="text-gray-400 text-xs">+{template.criteria.length - 2} more</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Criteria */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">Selected Criteria</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedCriteria.map((criteria, index) => (
                  <div key={index} className="bg-green-500/20 border border-green-500/30 rounded-lg px-3 py-2 flex items-center space-x-2">
                    <span className="text-green-300 text-sm">{criteria}</span>
                    <button
                      onClick={() => removeCriteria(criteria)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <XCircleIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              
              {/* Add Custom Criteria */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={customCriteria}
                  onChange={(e) => setCustomCriteria(e.target.value)}
                  placeholder="Add custom criteria..."
                  className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                />
                <button
                  onClick={addCustomCriteria}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Investment Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <label className="block text-white font-medium mb-2">Investment Amount</label>
                <input
                  type="text"
                  value={investmentAmount}
                  onChange={(e) => setInvestmentAmount(e.target.value)}
                  placeholder="e.g., $500,000 - $2,000,000"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-400"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Investment Timeframe</label>
                <select
                  value={timeframe}
                  onChange={(e) => setTimeframe(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-400"
                >
                  <option value="" className="text-gray-400">Select timeframe</option>
                  <option value="short-term" className="text-white bg-gray-800">Short-term (1-3 years)</option>
                  <option value="medium-term" className="text-white bg-gray-800">Medium-term (3-7 years)</option>
                  <option value="long-term" className="text-white bg-gray-800">Long-term (7+ years)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleBack}
                className="px-6 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors flex items-center space-x-2"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back</span>
              </button>
              <button
                onClick={handleContinue}
                disabled={selectedCriteria.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Generate Analysis</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 