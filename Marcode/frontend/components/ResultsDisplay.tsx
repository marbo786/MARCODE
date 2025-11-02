/**
 * Results Display Component
 * Shows similarity scores with breakdown and actions.
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import ScoreCard from './ScoreCard';
import ReportExport from './ReportExport';
import CodeDiffViewer from './CodeDiffViewer';
import Tooltip from './Tooltip';
import { mapMatchesToLines } from '../utils/matchMapper';

interface ComparisonResults {
  fingerprint: number;
  lcs: number;
  levenshtein: number;
  structural: number;
  finalScore: number;
}

interface ResultsDisplayProps {
  results: ComparisonResults;
  code1: string;
  code2: string;
  filename1: string;
  filename2: string;
  tokens1: string[];
  tokens2: string[];
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({
  results,
  code1,
  code2,
  filename1,
  filename2,
  tokens1,
  tokens2
}) => {
  const router = useRouter();
  const [showCodeDiff, setShowCodeDiff] = useState(false);

  // Calculate matches for visualization
  const matches = mapMatchesToLines(tokens1, tokens2, code1, code2);

  const getRiskLevel = (score: number): string => {
    if (score >= 80) return 'High Risk of Plagiarism';
    if (score >= 50) return 'Medium Risk of Plagiarism';
    return 'Low Risk of Plagiarism';
  };

  const getRiskColor = (score: number): string => {
    if (score >= 80) return 'text-red-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Similarity Scores</h2>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="space-y-4">
          <div>
            <Tooltip text="Fingerprint similarity uses k-grams and winnowing algorithm to detect copied code patterns">
              <ScoreCard label="Fingerprint" value={results.fingerprint} />
            </Tooltip>
          </div>
          <div>
            <Tooltip text="LCS (Longest Common Subsequence) measures the longest sequence of matching tokens">
              <ScoreCard label="LCS" value={results.lcs} />
            </Tooltip>
          </div>
          <div>
            <Tooltip text="Levenshtein distance measures edit distance - how many changes needed to transform one code into another">
              <ScoreCard label="Levenshtein" value={results.levenshtein} />
            </Tooltip>
          </div>
          <div>
            <Tooltip text="Structural similarity compares code patterns, keywords, and operator usage">
              <ScoreCard label="Structural" value={results.structural} />
            </Tooltip>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <ScoreCard label="FINAL SCORE" value={results.finalScore} isFinal={true} />
          
          {/* Risk Assessment */}
          <div className="mt-4 text-center">
            <p className={`text-lg font-semibold ${getRiskColor(results.finalScore)}`}>
              {getRiskLevel(results.finalScore)}
            </p>
          </div>
        </div>
      </div>

      {/* Score Breakdown Info */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600 mb-6">
        <p className="font-medium mb-2">Score Calculation:</p>
        <p>
          Final = 0.4×Fingerprint + 0.3×LCS + 0.2×Levenshtein + 0.1×Structural
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setShowCodeDiff(!showCodeDiff)}
          className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
            />
          </svg>
          {showCodeDiff ? 'Hide Code Matches' : 'View Code Matches'}
        </button>
        
        <ReportExport
          results={results}
          code1={code1}
          code2={code2}
          filename1={filename1}
          filename2={filename2}
          matches={matches}
        />

        <button
          onClick={() => router.push('/compare')}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Compare Again
        </button>
      </div>

      {/* Code Diff Viewer */}
      {showCodeDiff && (
        <div className="mt-6">
          <CodeDiffViewer
            codeA={code1}
            codeB={code2}
            matches={matches}
          />
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;

