/**
 * File Validation Utility
 * Validates file size, type, and content.
 */

const MAX_FILE_LINES = 1500;
const WARN_FILE_LINES = 300;
const SUPPORTED_EXTENSIONS = ['.py', '.cpp', '.h', '.hpp'];

export interface FileValidationResult {
  valid: boolean;
  warning?: string;
  error?: string;
  lineCount: number;
}

/**
 * Validate file size and type
 */
export function validateFile(file: File, content: string): FileValidationResult {
  const lineCount = content.split('\n').length;
  
  // Check file extension
  const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported file type: ${extension}. Supported types: ${SUPPORTED_EXTENSIONS.join(', ')}`,
      lineCount
    };
  }
  
  // Check if file is empty
  if (content.trim().length === 0) {
    return {
      valid: false,
      error: 'File is empty. Please upload a file with code content.',
      lineCount
    };
  }
  
  // Check file size (lines)
  if (lineCount > MAX_FILE_LINES) {
    return {
      valid: false,
      error: `File too large: ${lineCount} lines. Maximum allowed: ${MAX_FILE_LINES} lines.`,
      lineCount
    };
  }
  
  // Warning for large files
  if (lineCount > WARN_FILE_LINES) {
    return {
      valid: true,
      warning: `Large file detected (${lineCount} lines). Processing may take longer.`,
      lineCount
    };
  }
  
  return {
    valid: true,
    lineCount
  };
}

/**
 * Check if two files are identical
 */
export function areFilesIdentical(content1: string, content2: string): boolean {
  return content1.trim() === content2.trim();
}


