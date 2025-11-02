/**
 * Similarity Calculation Header
 * Declares functions for calculating text-based and structural similarity.
 */

#ifndef SIMILARITY_HPP
#define SIMILARITY_HPP

#include <string>
#include <vector>

/**
 * Calculate Levenshtein similarity between two token sequences.
 * 
 * @param A First token sequence
 * @param B Second token sequence
 * @return Similarity percentage (0-100)
 */
double levenshteinSimilarity(const std::vector<std::string>& A, const std::vector<std::string>& B);

/**
 * Calculate Longest Common Subsequence (LCS) similarity between two token sequences.
 * 
 * @param A First token sequence
 * @param B Second token sequence
 * @return Similarity percentage (0-100)
 */
double lcsSimilarity(const std::vector<std::string>& A, const std::vector<std::string>& B);

/**
 * Calculate structural similarity between two token sequences.
 * Compares token patterns, keyword frequency, and operator patterns.
 * 
 * @param A First token sequence
 * @param B Second token sequence
 * @return Similarity percentage (0-100)
 */
double structuralSimilarity(const std::vector<std::string>& A, const std::vector<std::string>& B);

#endif // SIMILARITY_HPP

