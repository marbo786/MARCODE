/**
 * Compare Page
 * Upload 2 files, choose language, run comparison.
 */

import { useState } from 'react';
import type { NextPage } from 'next';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import ResultsDisplay from '../components/ResultsDisplay';
import ProgressIndicator from '../components/ProgressIndicator';
import ErrorBoundary from '../components/ErrorBoundary';
import { normalizeCode, tokenizeCode, detectLanguage } from '../utils/apiClient';
import { 
  loadSimilarityEngine,
  calculateTextSimilarity,
  calculateFingerprintMatch,
  calculateStructuralSimilarity,
  calculateFinalScore
} from '../utils/wasmLoader';
import { getCachedTokens, cacheTokens } from '../utils/tokenCache';
import { validateFile, areFilesIdentical } from '../utils/fileValidator';

interface ComparisonResults {
  fingerprint: number;
  lcs: number;
  levenshtein: number;
  structural: number;
  finalScore: number;
}

const Compare: NextPage = () => {
  const [file1, setFile1] = useState<File | null>(null);
  const [file2, setFile2] = useState<File | null>(null);
  const [lang1, setLang1] = useState<'python' | 'cpp'>('python');
  const [lang2, setLang2] = useState<'python' | 'cpp'>('python');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ComparisonResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code1Content, setCode1Content] = useState<string>('');
  const [code2Content, setCode2Content] = useState<string>('');
  const [tokens1, setTokens1] = useState<string[]>([]);
  const [tokens2, setTokens2] = useState<string[]>([]);
  const [progressStage, setProgressStage] = useState<'normalizing' | 'tokenizing' | 'comparing' | 'complete'>('normalizing');
  const [timeElapsed, setTimeElapsed] = useState<number>(0);
  const [warnings, setWarnings] = useState<string[]>([]);

  const handleFile1Select = async (file: File) => {
    setFile1(file);
    setError(null);
    setWarnings([]);
    setResults(null);
    
    try {
      const content = await file.text();
      
      // Validate file
      const validation = validateFile(file, content);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        setFile1(null);
        return;
      }
      
      if (validation.warning) {
        setWarnings(prev => [...prev, `File A: ${validation.warning}`]);
      }
      
      // Auto-detect language
      const detected = detectLanguage(content);
      if (detected === 'python' || detected === 'cpp') {
        setLang1(detected);
      }
    } catch (err: any) {
      setError(`Failed to read file: ${err.message}`);
      setFile1(null);
    }
  };

  const handleFile2Select = async (file: File) => {
    setFile2(file);
    setError(null);
    setWarnings([]);
    setResults(null);
    
    try {
      const content = await file.text();
      
      // Validate file
      const validation = validateFile(file, content);
      if (!validation.valid) {
        setError(validation.error || 'Invalid file');
        setFile2(null);
        return;
      }
      
      if (validation.warning) {
        setWarnings(prev => [...prev, `File B: ${validation.warning}`]);
      }
      
      // Auto-detect language
      const detected = detectLanguage(content);
      if (detected === 'python' || detected === 'cpp') {
        setLang2(detected);
      }
    } catch (err: any) {
      setError(`Failed to read file: ${err.message}`);
      setFile2(null);
    }
  };

  const handleCompare = async () => {
    if (!file1 || !file2) {
      setError('Please upload both files');
      return;
    }

    const startTime = Date.now();
    setLoading(true);
    setError(null);
    setResults(null);
    setWarnings([]);
    setProgressStage('normalizing');

    try {
      // Read file contents
      const content1 = await file1.text();
      const content2 = await file2.text();

      // Check if files are identical
      if (areFilesIdentical(content1, content2)) {
        setResults({
          fingerprint: 100,
          lcs: 100,
          levenshtein: 100,
          structural: 100,
          finalScore: 100
        });
        setCode1Content(content1);
        setCode2Content(content2);
        setTokens1([]);
        setTokens2([]);
        setProgressStage('complete');
        setTimeElapsed((Date.now() - startTime) / 1000);
        setLoading(false);
        return;
      }

      // Step 1: Normalize code (with caching)
      setProgressStage('normalizing');
      let normalized1: string;
      let normalized2: string;
      let tokenized1: string[];
      let tokenized2: string[];

      const cached1 = getCachedTokens(content1, lang1);
      if (cached1) {
        normalized1 = cached1.normalized;
        tokenized1 = cached1.tokens;
      } else {
        normalized1 = await normalizeCode(content1, lang1);
        tokenized1 = await tokenizeCode(normalized1, lang1);
        cacheTokens(content1, lang1, normalized1, tokenized1);
      }

      const cached2 = getCachedTokens(content2, lang2);
      if (cached2) {
        normalized2 = cached2.normalized;
        tokenized2 = cached2.tokens;
      } else {
        normalized2 = await normalizeCode(content2, lang2);
        tokenized2 = await tokenizeCode(normalized2, lang2);
        cacheTokens(content2, lang2, normalized2, tokenized2);
      }

      // Store code content and tokens for visualization
      setProgressStage('tokenizing');
      setCode1Content(content1);
      setCode2Content(content2);
      setTokens1(tokenized1);
      setTokens2(tokenized2);

      // Step 2: Load WASM engine and calculate similarities
      setProgressStage('comparing');
      const wasmModule = await loadSimilarityEngine();
      if (!wasmModule) {
        throw new Error('Failed to load WASM similarity engine');
      }

      // Step 3: Calculate similarities (batch)
      const tokenStr1 = tokenized1.join(' ');
      const tokenStr2 = tokenized2.join(' ');

      // Calculate all similarities in parallel for better performance
      const [fingerprint, lcs, levenshtein, structural] = await Promise.all([
        calculateFingerprintMatch(tokenStr1, tokenStr2),
        calculateTextSimilarity(tokenStr1, tokenStr2),
        calculateTextSimilarity(tokenStr1, tokenStr2), // Using LCS as approximation
        calculateStructuralSimilarity(tokenStr1, tokenStr2)
      ]);

      // Step 4: Calculate final score
      const finalScore = await calculateFinalScore(fingerprint, lcs, levenshtein, structural);

      // Check for very low similarity
      if (finalScore < 20) {
        setWarnings(prev => [...prev, 'No significant similarity detected between files.']);
      }

      setResults({
        fingerprint,
        lcs,
        levenshtein,
        structural,
        finalScore
      });

      setProgressStage('complete');
      setTimeElapsed((Date.now() - startTime) / 1000);
    } catch (err: any) {
      setError(err.message || 'An error occurred during comparison');
      console.error('Comparison error:', err);
      setProgressStage('complete');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Compare Code</h1>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-6">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    {warnings.map((warning, index) => (
                      <p key={index}>{warning}</p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Progress Indicator */}
            {loading && (
              <ProgressIndicator stage={progressStage} timeElapsed={timeElapsed} />
            )}

          {/* File Upload Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* File A */}
            <div>
              <FileUpload
                label="File A"
                onFileSelect={handleFile1Select}
                acceptedTypes=".py,.cpp,.h,.hpp"
                selectedFile={file1}
              />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={lang1}
                  onChange={(e) => setLang1(e.target.value as 'python' | 'cpp')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
            </div>

            {/* File B */}
            <div>
              <FileUpload
                label="File B"
                onFileSelect={handleFile2Select}
                acceptedTypes=".py,.cpp,.h,.hpp"
                selectedFile={file2}
              />
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={lang2}
                  onChange={(e) => setLang2(e.target.value as 'python' | 'cpp')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                </select>
              </div>
            </div>
          </div>

          {/* Compare Button */}
          <div className="mb-8">
            <button
              onClick={handleCompare}
              disabled={loading || !file1 || !file2}
              className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              {loading ? 'Comparing...' : 'Compare Code'}
            </button>
          </div>

          {/* Results */}
          {results && (
            <ResultsDisplay
              results={results}
              code1={code1Content}
              code2={code2Content}
              filename1={file1?.name || 'file1'}
              filename2={file2?.name || 'file2'}
              tokens1={tokens1}
              tokens2={tokens2}
            />
          )}
        </div>
      </main>
    </div>
    </ErrorBoundary>
  );
};

export default Compare;

