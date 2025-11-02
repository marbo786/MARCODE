/**
 * Similarity Calculation Module
 * Implements Levenshtein distance, LCS, and other similarity metrics.
 */

#include "similarity.hpp"
#include <algorithm>
#include <cmath>
#include <map>
#include <set>

/**
 * Calculate Levenshtein (edit) distance between two token sequences.
 * 
 * @param A First token sequence
 * @param B Second token sequence
 * @return Edit distance (number of operations needed)
 */
int levenshteinDistance(const std::vector<std::string>& A, const std::vector<std::string>& B) {
    int m = A.size();
    int n = B.size();
    
    // Create DP table
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));
    
    // Initialize base cases
    for (int i = 0; i <= m; i++) {
        dp[i][0] = i;
    }
    for (int j = 0; j <= n; j++) {
        dp[0][j] = j;
    }
    
    // Fill DP table
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (A[i - 1] == B[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];  // No operation needed
            } else {
                dp[i][j] = 1 + std::min({
                    dp[i - 1][j],      // Delete from A
                    dp[i][j - 1],      // Insert into A
                    dp[i - 1][j - 1]   // Replace
                });
            }
        }
    }
    
    return dp[m][n];
}

/**
 * Calculate Levenshtein similarity between two token sequences.
 * 
 * @param A First token sequence
 * @param B Second token sequence
 * @return Similarity percentage (0-100)
 */
double levenshteinSimilarity(const std::vector<std::string>& A, const std::vector<std::string>& B) {
    if (A.empty() && B.empty()) {
        return 100.0;
    }
    if (A.empty() || B.empty()) {
        return 0.0;
    }
    
    int distance = levenshteinDistance(A, B);
    int maxLen = std::max(A.size(), B.size());
    
    // Convert distance to similarity percentage
    double similarity = (1.0 - static_cast<double>(distance) / maxLen) * 100.0;
    
    return std::max(0.0, std::min(100.0, similarity));
}

/**
 * Calculate Longest Common Subsequence (LCS) length between two token sequences.
 * 
 * @param A First token sequence
 * @param B Second token sequence
 * @return Length of LCS
 */
int lcsLength(const std::vector<std::string>& A, const std::vector<std::string>& B) {
    int m = A.size();
    int n = B.size();
    
    // Create DP table
    std::vector<std::vector<int>> dp(m + 1, std::vector<int>(n + 1, 0));
    
    // Fill DP table
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (A[i - 1] == B[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = std::max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}

/**
 * Calculate LCS similarity between two token sequences.
 * 
 * @param A First token sequence
 * @param B Second token sequence
 * @return Similarity percentage (0-100)
 */
double lcsSimilarity(const std::vector<std::string>& A, const std::vector<std::string>& B) {
    if (A.empty() && B.empty()) {
        return 100.0;
    }
    if (A.empty() || B.empty()) {
        return 0.0;
    }
    
    int lcsLen = lcsLength(A, B);
    int maxLen = std::max(A.size(), B.size());
    
    // Convert LCS length to similarity percentage
    double similarity = (static_cast<double>(lcsLen) / maxLen) * 100.0;
    
    return std::max(0.0, std::min(100.0, similarity));
}

/**
 * Calculate structural similarity between two token sequences.
 * Compares token patterns, keyword frequency, and operator patterns.
 * 
 * @param A First token sequence
 * @param B Second token sequence
 * @return Similarity percentage (0-100)
 */
double structuralSimilarity(const std::vector<std::string>& A, const std::vector<std::string>& B) {
    if (A.empty() && B.empty()) {
        return 100.0;
    }
    if (A.empty() || B.empty()) {
        return 0.0;
    }
    
    // Common keywords/operators to analyze
    std::set<std::string> keywords = {
        "if", "else", "for", "while", "return", "def", "class",
        "int", "float", "double", "char", "void", "bool",
        "=", "+", "-", "*", "/", "%", "==", "!=", "<", ">",
        "<=", ">=", "&&", "||", "!", "(", ")", "{", "}", "[", "]"
    };
    
    // Count keyword frequencies
    std::map<std::string, int> freqA, freqB;
    
    for (const auto& token : A) {
        if (keywords.find(token) != keywords.end()) {
            freqA[token]++;
        }
    }
    
    for (const auto& token : B) {
        if (keywords.find(token) != keywords.end()) {
            freqB[token]++;
        }
    }
    
    // Calculate keyword frequency similarity
    std::set<std::string> allKeywords;
    for (const auto& pair : freqA) {
        allKeywords.insert(pair.first);
    }
    for (const auto& pair : freqB) {
        allKeywords.insert(pair.first);
    }
    
    if (allKeywords.empty()) {
        // No keywords found, return basic token count similarity
        double sizeRatio = static_cast<double>(std::min(A.size(), B.size())) / 
                          std::max(A.size(), B.size());
        return sizeRatio * 100.0;
    }
    
    // Calculate frequency similarity
    double freqSim = 0.0;
    int commonCount = 0;
    
    for (const auto& keyword : allKeywords) {
        int countA = freqA[keyword];
        int countB = freqB[keyword];
        
        if (countA > 0 && countB > 0) {
            commonCount++;
            int maxCount = std::max(countA, countB);
            int minCount = std::min(countA, countB);
            freqSim += static_cast<double>(minCount) / maxCount;
        }
    }
    
    // Average frequency similarity
    if (commonCount > 0) {
        freqSim = (freqSim / commonCount) * 100.0;
    } else {
        freqSim = 0.0;
    }
    
    // Token position pattern similarity (simplified)
    // Compare token bigrams (adjacent pairs)
    std::map<std::pair<std::string, std::string>, int> bigramsA, bigramsB;
    
    for (size_t i = 0; i < A.size() - 1; i++) {
        bigramsA[{A[i], A[i + 1]}]++;
    }
    
    for (size_t i = 0; i < B.size() - 1; i++) {
        bigramsB[{B[i], B[i + 1]}]++;
    }
    
    // Calculate bigram similarity
    int commonBigrams = 0;
    int totalBigrams = std::max(bigramsA.size(), bigramsB.size());
    
    for (const auto& pair : bigramsA) {
        if (bigramsB.find(pair.first) != bigramsB.end()) {
            commonBigrams++;
        }
    }
    
    double bigramSim = totalBigrams > 0 ? 
        (static_cast<double>(commonBigrams) / totalBigrams) * 100.0 : 0.0;
    
    // Combine frequency and bigram similarities
    double structuralSim = (freqSim * 0.6) + (bigramSim * 0.4);
    
    return std::max(0.0, std::min(100.0, structuralSim));
}
