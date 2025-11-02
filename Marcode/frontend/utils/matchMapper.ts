/**
 * Match Mapper Utility
 * Maps matching token indices to code line ranges for visualization.
 */

export interface MatchRange {
  fromA: {
    start: number;
    end: number;
  };
  fromB: {
    start: number;
    end: number;
  };
  score: number;
  tokens: string[];
}

/**
 * Convert tokens to line mappings
 */
function tokensToLines(tokens: string[], originalCode: string): Map<number, number[]> {
  const tokenToLines = new Map<number, number[]>();
  const lines = originalCode.split('\n');
  let currentTokenIndex = 0;
  
  for (let lineNum = 0; lineNum < lines.length; lineNum++) {
    const line = lines[lineNum];
    const lineTokens = line.trim().split(/\s+/).filter(t => t.length > 0);
    
    for (let i = 0; i < lineTokens.length && currentTokenIndex < tokens.length; i++) {
      if (!tokenToLines.has(currentTokenIndex)) {
        tokenToLines.set(currentTokenIndex, []);
      }
      tokenToLines.get(currentTokenIndex)!.push(lineNum);
      currentTokenIndex++;
    }
  }
  
  return tokenToLines;
}

/**
 * Find matching token sequences between two token arrays
 */
function findMatchingSequences(
  tokensA: string[],
  tokensB: string[],
  minLength: number = 3
): Array<{ startA: number; endA: number; startB: number; endB: number; length: number }> {
  const matches: Array<{ startA: number; endA: number; startB: number; endB: number; length: number }> = [];
  
  // Simple approach: find common subsequences
  // Use a sliding window approach
  for (let i = 0; i < tokensA.length; i++) {
    for (let j = 0; j < tokensB.length; j++) {
      let length = 0;
      let endA = i;
      let endB = j;
      
      // Find matching sequence starting at i, j
      while (
        endA < tokensA.length &&
        endB < tokensB.length &&
        tokensA[endA] === tokensB[endB]
      ) {
        length++;
        endA++;
        endB++;
      }
      
      // Only include matches of minimum length
      if (length >= minLength) {
        matches.push({
          startA: i,
          endA: endA - 1,
          startB: j,
          endB: endB - 1,
          length
        });
      }
    }
  }
  
  // Remove overlapping matches (keep longest)
  const filteredMatches: Array<{ startA: number; endA: number; startB: number; endB: number; length: number }> = [];
  const usedA = new Set<number>();
  const usedB = new Set<number>();
  
  // Sort by length (longest first)
  matches.sort((a, b) => b.length - a.length);
  
  for (const match of matches) {
    let overlap = false;
    
    // Check if this match overlaps with already selected matches
    for (let i = match.startA; i <= match.endA; i++) {
      if (usedA.has(i)) {
        overlap = true;
        break;
      }
    }
    
    if (!overlap) {
      for (let i = match.startB; i <= match.endB; i++) {
        if (usedB.has(i)) {
          overlap = true;
          break;
        }
      }
    }
    
    if (!overlap) {
      // Mark tokens as used
      for (let i = match.startA; i <= match.endA; i++) {
        usedA.add(i);
      }
      for (let i = match.startB; i <= match.endB; i++) {
        usedB.add(i);
      }
      
      filteredMatches.push(match);
    }
  }
  
  return filteredMatches;
}

/**
 * Map matching tokens to code line ranges
 * 
 * @param tokensA Token array from file A
 * @param tokensB Token array from file B
 * @param originalCodeA Original code from file A (for line mapping)
 * @param originalCodeB Original code from file B (for line mapping)
 * @param matchingFingerprintIndices Optional: specific fingerprint indices to highlight
 * @returns Array of match ranges with line numbers and scores
 */
export function mapMatchesToLines(
  tokensA: string[],
  tokensB: string[],
  originalCodeA: string,
  originalCodeB: string,
  matchingFingerprintIndices?: number[]
): MatchRange[] {
  const matches: MatchRange[] = [];
  
  // Find matching sequences
  const sequences = findMatchingSequences(tokensA, tokensB, 3);
  
  // Convert token indices to line numbers
  const tokenToLinesA = tokensToLines(tokensA, originalCodeA);
  const tokenToLinesB = tokensToLines(tokensB, originalCodeB);
  
  for (const seq of sequences) {
    // Get line numbers for this sequence
    const linesA = new Set<number>();
    const linesB = new Set<number>();
    
    for (let i = seq.startA; i <= seq.endA; i++) {
      const lineNums = tokenToLinesA.get(i) || [];
      lineNums.forEach(line => linesA.add(line));
    }
    
    for (let i = seq.startB; i <= seq.endB; i++) {
      const lineNums = tokenToLinesB.get(i) || [];
      lineNums.forEach(line => linesB.add(line));
    }
    
    if (linesA.size > 0 && linesB.size > 0) {
      const startLineA = Math.min(...Array.from(linesA));
      const endLineA = Math.max(...Array.from(linesA));
      const startLineB = Math.min(...Array.from(linesB));
      const endLineB = Math.max(...Array.from(linesB));
      
      // Extract matching tokens
      const matchingTokens = tokensA.slice(seq.startA, seq.endA + 1);
      
      // Calculate score based on length and position
      const score = Math.min(100, (seq.length / Math.max(tokensA.length, tokensB.length)) * 100);
      
      matches.push({
        fromA: {
          start: startLineA,
          end: endLineA
        },
        fromB: {
          start: startLineB,
          end: endLineB
        },
        score,
        tokens: matchingTokens
      });
    }
  }
  
  return matches;
}


