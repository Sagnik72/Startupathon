// File cleanup utility for managing uploaded files

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
  uploadedAt: Date;
}

export interface FileStorage {
  t12: UploadedFile | null;
  rentRoll: UploadedFile | null;
}

/**
 * Clean up uploaded files from memory and reset file inputs
 */
export const cleanupUploadedFiles = (
  setUploadedFiles: React.Dispatch<React.SetStateAction<FileStorage>>,
  setProcessingStatus: React.Dispatch<React.SetStateAction<string[]>>,
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  fileInputRefs: React.MutableRefObject<{ t12: HTMLInputElement | null; rentRoll: HTMLInputElement | null }>
) => {
  // Clear uploaded files from state
  setUploadedFiles({
    t12: null,
    rentRoll: null
  });
  
  // Clear processing status
  setProcessingStatus([]);
  setIsProcessing(false);
  
  // Clear file input values
  if (fileInputRefs.current.t12) {
    fileInputRefs.current.t12.value = '';
  }
  if (fileInputRefs.current.rentRoll) {
    fileInputRefs.current.rentRoll.value = '';
  }
  
  console.log('✅ Uploaded files cleaned up successfully');
};

/**
 * Validate uploaded file
 */
export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Check file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-excel',
    'text/csv'
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Please upload a PDF, Excel, or CSV file.'
    };
  }

  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: 'File size must be less than 10MB.'
    };
  }

  return { isValid: true };
};

/**
 * Format file size for display
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get appropriate file icon based on file type
 */
export const getFileIcon = (type: string): string => {
  if (type.includes('pdf')) return '📄';
  if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
  if (type.includes('csv')) return '📋';
  return '📄';
};

/**
 * Create uploaded file object
 */
export const createUploadedFile = (file: File, type: 't12' | 'rentRoll'): UploadedFile => {
  return {
    id: `${type}-${Date.now()}`,
    name: file.name,
    size: file.size,
    type: file.type,
    file: file,
    uploadedAt: new Date()
  };
};

/**
 * Simulate file processing with cleanup
 */
export const simulateFileProcessing = async (
  type: 't12' | 'rentRoll',
  file: UploadedFile,
  setProcessingStatus: React.Dispatch<React.SetStateAction<string[]>>,
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> => {
  setIsProcessing(true);
  setProcessingStatus([]);

  const steps = [
    `Processing ${type === 't12' ? 'T12 Statement' : 'Rent Roll'}...`,
    'Extracting financial data...',
    'Validating document structure...',
    'Mapping line items...',
    `${type === 't12' ? 'T12 Statement' : 'Rent Roll'} processed successfully`
  ];

  for (let i = 0; i < steps.length; i++) {
    setProcessingStatus(prev => [...prev, steps[i]]);
    await new Promise(resolve => setTimeout(resolve, 800));
  }

  setIsProcessing(false);
};

/**
 * Remove specific file and clean up
 */
export const removeFile = (
  type: 't12' | 'rentRoll',
  setUploadedFiles: React.Dispatch<React.SetStateAction<FileStorage>>,
  fileInputRefs: React.MutableRefObject<{ t12: HTMLInputElement | null; rentRoll: HTMLInputElement | null }>
) => {
  setUploadedFiles(prev => ({
    ...prev,
    [type]: null
  }));
  
  // Clear file input
  if (fileInputRefs.current[type]) {
    fileInputRefs.current[type]!.value = '';
  }
  
  console.log(`🗑️ ${type === 't12' ? 'T12 Statement' : 'Rent Roll'} file removed`);
}; 