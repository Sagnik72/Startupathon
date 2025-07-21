"use client";

import { useState, useRef } from 'react';
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
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import {
  cleanupUploadedFiles,
  validateFile,
  formatFileSize,
  getFileIcon,
  createUploadedFile,
  simulateFileProcessing,
  removeFile,
  type FileStorage
} from '@/utils/fileCleanup';

export default function Analysis() {
  const [currentStep, setCurrentStep] = useState(3); // Financials step
  const [uploadedFiles, setUploadedFiles] = useState<FileStorage>({
    t12: null,
    rentRoll: null
  });
  const [processingStatus, setProcessingStatus] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRefs = useRef<{ t12: HTMLInputElement | null; rentRoll: HTMLInputElement | null }>({
    t12: null,
    rentRoll: null
  });
  const router = useRouter();

  const steps = [
    { name: 'Welcome', icon: CheckCircleIcon, status: 'completed' },
    { name: 'Property', icon: CheckCircleIcon, status: 'completed' },
    { name: 'Financials', icon: CheckCircleIcon, status: 'current' },
    { name: 'Buy Box', icon: BuildingOfficeIcon, status: 'upcoming' },
    { name: 'Results', icon: ChartBarIcon, status: 'upcoming' }
  ];

  const handleContinue = () => {
    // Clean up uploaded files before proceeding
    cleanupUploadedFiles(setUploadedFiles, setProcessingStatus, setIsProcessing, fileInputRefs);
    router.push('/buybox');
  };

  const handleBack = () => {
    // Clean up uploaded files when going back
    cleanupUploadedFiles(setUploadedFiles, setProcessingStatus, setIsProcessing, fileInputRefs);
    router.push('/demo');
  };

  const handleFileUpload = (type: 't12' | 'rentRoll', event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    const uploadedFile = createUploadedFile(file, type);

    setUploadedFiles(prev => ({
      ...prev,
      [type]: uploadedFile
    }));

    // Simulate processing
    simulateFileProcessing(type, uploadedFile, setProcessingStatus, setIsProcessing);
  };

  const handleRemoveFile = (type: 't12' | 'rentRoll') => {
    removeFile(type, setUploadedFiles, fileInputRefs);
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
            <h1 className="text-3xl font-bold text-white mb-2">Financials</h1>
            <p className="text-gray-300">Upload your financial documents for AI analysis</p>
          </div>

          {/* Financial Documents Form */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* T12 Statement */}
              <div className="border-2 border-dashed border-gray-400 rounded-xl p-6 text-center">
                <DocumentTextIcon className="h-12 w-12 text-blue-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">T12 Statement</h3>
                
                {uploadedFiles.t12 ? (
                  <div className="space-y-3">
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getFileIcon(uploadedFiles.t12.type)}</span>
                          <div className="text-left">
                            <div className="text-white font-medium text-sm truncate">
                              {uploadedFiles.t12.name}
                            </div>
                            <div className="text-gray-300 text-xs">
                              {formatFileSize(uploadedFiles.t12.size)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile('t12')}
                          className="text-red-400 hover:text-red-300"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm mb-4">Upload PDF, Excel, or CSV file</p>
                    <input
                      ref={el => fileInputRefs.current.t12 = el}
                      type="file"
                      accept=".pdf,.xlsx,.xls,.csv"
                      onChange={(e) => handleFileUpload('t12', e)}
                      className="hidden"
                      id="t12-upload"
                    />
                    <label
                      htmlFor="t12-upload"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm cursor-pointer inline-block"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>

              {/* Rent Roll */}
              <div className="border-2 border-dashed border-gray-400 rounded-xl p-6 text-center">
                <DocumentTextIcon className="h-12 w-12 text-green-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Rent Roll</h3>
                
                {uploadedFiles.rentRoll ? (
                  <div className="space-y-3">
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getFileIcon(uploadedFiles.rentRoll.type)}</span>
                          <div className="text-left">
                            <div className="text-white font-medium text-sm truncate">
                              {uploadedFiles.rentRoll.name}
                            </div>
                            <div className="text-gray-300 text-xs">
                              {formatFileSize(uploadedFiles.rentRoll.size)}
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => handleRemoveFile('rentRoll')}
                          className="text-red-400 hover:text-red-300"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-gray-300 text-sm mb-4">Upload PDF, Excel, or CSV file</p>
                    <input
                      ref={el => fileInputRefs.current.rentRoll = el}
                      type="file"
                      accept=".pdf,.xlsx,.xls,.csv"
                      onChange={(e) => handleFileUpload('rentRoll', e)}
                      className="hidden"
                      id="rentroll-upload"
                    />
                    <label
                      htmlFor="rentroll-upload"
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm cursor-pointer inline-block"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* AI Processing Status */}
            {processingStatus.length > 0 && (
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-semibold text-yellow-300 mb-4">AI Processing Status</h3>
                <div className="space-y-3">
                  {processingStatus.map((status, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <CheckCircleIcon className="h-5 w-5 text-green-400" />
                      <span className="text-white">{status}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                disabled={!uploadedFiles.t12 || !uploadedFiles.rentRoll || isProcessing}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                <span>Continue to Buy Box</span>
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 