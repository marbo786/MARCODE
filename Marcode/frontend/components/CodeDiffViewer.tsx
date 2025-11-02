/**
 * Code Diff Viewer Component
 * Side-by-side code view with highlighted matching sections.
 */

import { useState, useMemo } from 'react';
import { MatchRange } from '../utils/matchMapper';

interface CodeDiffViewerProps {
  codeA: string;
  codeB: string;
  matches: MatchRange[];
}

const CodeDiffViewer: React.FC<CodeDiffViewerProps> = ({
  codeA,
  codeB,
  matches
}) => {
  const [hideNonMatching, setHideNonMatching] = useState(false);
  const [showPercentages, setShowPercentages] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const linesA = codeA.split('\n');
  const linesB = codeB.split('\n');

  // Create line-to-match mapping
  const lineMatchesA = useMemo(() => {
    const map = new Map<number, MatchRange[]>();
    matches.forEach(match => {
      for (let line = match.fromA.start; line <= match.fromA.end; line++) {
        if (!map.has(line)) {
          map.set(line, []);
        }
        map.get(line)!.push(match);
      }
    });
    return map;
  }, [matches]);

  const lineMatchesB = useMemo(() => {
    const map = new Map<number, MatchRange[]>();
    matches.forEach(match => {
      for (let line = match.fromB.start; line <= match.fromB.end; line++) {
        if (!map.has(line)) {
          map.set(line, []);
        }
        map.get(line)!.push(match);
      }
    });
    return map;
  }, [matches]);

  // Get line highlight color based on match score
  const getLineColor = (matches: MatchRange[]): string => {
    if (matches.length === 0) return '';
    
    const avgScore = matches.reduce((sum, m) => sum + m.score, 0) / matches.length;
    
    if (avgScore >= 80) {
      return darkMode ? 'bg-green-900 bg-opacity-30' : 'bg-green-100';
    } else if (avgScore >= 50) {
      return darkMode ? 'bg-yellow-900 bg-opacity-30' : 'bg-yellow-100';
    } else {
      return darkMode ? 'bg-orange-900 bg-opacity-20' : 'bg-orange-50';
    }
  };

  // Filter lines if hide non-matching is enabled
  const visibleLinesA = hideNonMatching
    ? linesA.filter((_, index) => lineMatchesA.has(index))
    : linesA;

  const visibleLinesB = hideNonMatching
    ? linesB.filter((_, index) => lineMatchesB.has(index))
    : linesB;

  return (
    <div className={`${darkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-lg p-4`}>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={hideNonMatching}
              onChange={(e) => setHideNonMatching(e.target.checked)}
              className="rounded"
            />
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              Hide Non-Matching Code
            </span>
          </label>
          
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showPercentages}
              onChange={(e) => setShowPercentages(e.target.checked)}
              className="rounded"
            />
            <span className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
              Show % per Block
            </span>
          </label>
        </div>
        
        <button
          onClick={() => setDarkMode(!darkMode)}
          className={`px-3 py-1 rounded text-sm ${
            darkMode
              ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          {darkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* Legend */}
      <div className={`mb-4 flex gap-4 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 rounded"></div>
          <span>High Match (≥80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-100 rounded"></div>
          <span>Medium Match (50-79%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-50 rounded"></div>
          <span>Low Match (&lt;50%)</span>
        </div>
      </div>

      {/* Side-by-Side Code View */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* File A */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded border overflow-hidden`}>
          <div className={`px-3 py-2 border-b ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
            <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              File A
            </span>
          </div>
          <div className={`overflow-auto max-h-96 ${darkMode ? 'text-gray-200' : 'text-gray-900'} font-mono text-sm`}>
            {visibleLinesA.map((line, index) => {
              const originalIndex = hideNonMatching
                ? Array.from(lineMatchesA.keys())[index] ?? index
                : index;
              const lineMatches = lineMatchesA.get(originalIndex) || [];
              const bgColor = getLineColor(lineMatches);
              const avgScore = lineMatches.length > 0
                ? Math.round(lineMatches.reduce((sum, m) => sum + m.score, 0) / lineMatches.length)
                : null;

              return (
                <div
                  key={index}
                  className={`px-3 py-1 border-l-4 ${bgColor || 'border-transparent'} ${
                    lineMatches.length > 0 ? 'border-green-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} w-8 shrink-0`}>
                      {originalIndex + 1}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-words">{line || ' '}</span>
                    {showPercentages && avgScore !== null && (
                      <span className={`text-xs font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'} shrink-0`}>
                        {avgScore}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* File B */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded border overflow-hidden`}>
          <div className={`px-3 py-2 border-b ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
            <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              File B
            </span>
          </div>
          <div className={`overflow-auto max-h-96 ${darkMode ? 'text-gray-200' : 'text-gray-900'} font-mono text-sm`}>
            {visibleLinesB.map((line, index) => {
              const originalIndex = hideNonMatching
                ? Array.from(lineMatchesB.keys())[index] ?? index
                : index;
              const lineMatches = lineMatchesB.get(originalIndex) || [];
              const bgColor = getLineColor(lineMatches);
              const avgScore = lineMatches.length > 0
                ? Math.round(lineMatches.reduce((sum, m) => sum + m.score, 0) / lineMatches.length)
                : null;

              return (
                <div
                  key={index}
                  className={`px-3 py-1 border-l-4 ${bgColor || 'border-transparent'} ${
                    lineMatches.length > 0 ? 'border-green-500' : 'border-transparent'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <span className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'} w-8 shrink-0`}>
                      {originalIndex + 1}
                    </span>
                    <span className="flex-1 whitespace-pre-wrap break-words">{line || ' '}</span>
                    {showPercentages && avgScore !== null && (
                      <span className={`text-xs font-semibold ${darkMode ? 'text-green-400' : 'text-green-600'} shrink-0`}>
                        {avgScore}%
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Match Statistics */}
      <div className={`mt-4 p-3 rounded ${darkMode ? 'bg-gray-800' : 'bg-white'} text-sm`}>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Total Matches:</span>
            <span className={`ml-2 font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {matches.length}
            </span>
          </div>
          <div>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Avg Score:</span>
            <span className={`ml-2 font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {matches.length > 0
                ? Math.round(matches.reduce((sum, m) => sum + m.score, 0) / matches.length)
                : 0}%
            </span>
          </div>
          <div>
            <span className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Matching Lines:</span>
            <span className={`ml-2 font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
              {new Set([...matches.map(m => m.fromA.start), ...matches.map(m => m.fromB.start)]).size}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeDiffViewer;

