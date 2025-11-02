/**
 * API Client
 * Handles communication with the Python backend API.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

/**
 * Detect language from code content
 */
export function detectLanguage(code: string): 'python' | 'cpp' {
  const codeLower = code.toLowerCase().trim();
  
  // C++ indicators
  const cppIndicators = [
    /#include\s*[<"]/,
    /using\s+namespace/,
    /std::/,
    /cout\s*<</,
    /cin\s*>>/,
    /int\s+main\s*\(/,
    /void\s+main\s*\(/,
    /#define\s+/,
    /class\s+\w+\s*\{/,
    /new\s+\w+/,
    /delete\s+/,
    /->/,
    /::/
  ];
  
  // Python indicators
  const pythonIndicators = [
    /^def\s+\w+\s*\(/m,
    /^class\s+\w+\s*\(/m,
    /print\s*\(/,
    /if\s+\w+\s*:/m,
    /elif\s+/,
    /lambda\s+/,
    /import\s+\w+/,
    /from\s+\w+\s+import/,
    /\.\.\./,
    /^pass\s*$/m,
    /if\s+__name__\s*==/
  ];
  
  let cppScore = 0;
  let pythonScore = 0;
  
  cppIndicators.forEach(pattern => {
    if (pattern.test(codeLower)) cppScore++;
  });
  
  pythonIndicators.forEach(pattern => {
    if (pattern.test(codeLower)) pythonScore++;
  });
  
  return cppScore > pythonScore ? 'cpp' : 'python';
}

/**
 * Normalize code by removing comments and normalizing identifiers
 */
export async function normalizeCode(code: string, language: 'python' | 'cpp'): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/normalize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language }),
    });
    
    if (!response.ok) {
      throw new Error('Normalization failed');
    }
    
    const data = await response.json();
    return data.normalized || code;
  } catch (error) {
    // Fallback: return code as-is if API is not available
    console.warn('Normalization API not available, using fallback');
    return code;
  }
}

/**
 * Tokenize normalized code into token array
 */
export async function tokenizeCode(code: string, language: 'python' | 'cpp'): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/tokenize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code, language }),
    });
    
    if (!response.ok) {
      throw new Error('Tokenization failed');
    }
    
    const data = await response.json();
    return data.tokens || [];
  } catch (error) {
    // Fallback: simple tokenization
    console.warn('Tokenization API not available, using fallback');
    return code.split(/\s+/).filter(t => t.length > 0);
  }
}

/**
 * Compare two code files via API
 * Note: Currently not used - comparison is handled client-side via WASM
 * Available for future server-side API integration
 */
export async function compareCodes(
  code1: string,
  code2: string,
  lang1: 'python' | 'cpp',
  lang2: 'python' | 'cpp'
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code1, code2, lang1, lang2 }),
    });
    
    if (!response.ok) {
      throw new Error('Comparison failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Comparison error:', error);
    return null;
  }
}

