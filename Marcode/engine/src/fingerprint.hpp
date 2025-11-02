/**
 * Fingerprinting Header
 * Declares functions for k-gram generation, winnowing, and fingerprint comparison.
 */

#ifndef FINGERPRINT_HPP
#define FINGERPRINT_HPP

#include <string>
#include <vector>
#include <utility>

/**
 * Generate k-gram hashes from token sequence.
 * 
 * @param tokens Token sequence
 * @param k Size of k-grams
 * @return Vector of k-gram hash values
 */
std::vector<int> generateKGrams(const std::vector<std::string>& tokens, int k);

/**
 * Apply winnowing algorithm to select fingerprints.
 * 
 * @param hashes Vector of k-gram hashes
 * @param windowSize Size of winnowing window
 * @return Vector of fingerprint pairs (hash, index)
 */
std::vector<std::pair<int, int>> winnow(const std::vector<int>& hashes, int windowSize);

/**
 * Calculate fingerprint similarity between two token sequences.
 * 
 * @param tokensA First token sequence
 * @param tokensB Second token sequence
 * @param k K-gram size (default: 5)
 * @param windowSize Winnowing window size (default: 4)
 * @return Similarity percentage (0-100)
 */
double fingerprintSimilarity(
    const std::vector<std::string>& tokensA,
    const std::vector<std::string>& tokensB,
    int k = 5,
    int windowSize = 4
);

#endif // FINGERPRINT_HPP

