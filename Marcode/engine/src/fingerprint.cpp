/**
 * Fingerprinting Module
 * Implements K-gram tokenization, rolling hash, and winnowing algorithm.
 */

#include "fingerprint.hpp"
#include <algorithm>
#include <cmath>
#include <sstream>
#include <functional>
#include <set>

/**
 * Calculate rolling hash (Rabin-Karp style) for a token sequence.
 * 
 * @param tokens Token sequence (k-gram)
 * @return Hash value
 */
unsigned long long rollingHash(const std::vector<std::string>& tokens) {
    const unsigned long long BASE = 256;
    const unsigned long long MOD = 1000000007;  // Large prime
    
    unsigned long long hash = 0;
    
    for (const auto& token : tokens) {
        for (char c : token) {
            hash = (hash * BASE + static_cast<unsigned long long>(c)) % MOD;
        }
        // Add separator
        hash = (hash * BASE + 31) % MOD;  // 31 is ASCII code for separator
    }
    
    return hash;
}

/**
 * Generate k-gram hashes from token sequence.
 * 
 * @param tokens Token sequence
 * @param k Size of k-grams
 * @return Vector of k-gram hash values
 */
std::vector<int> generateKGrams(const std::vector<std::string>& tokens, int k) {
    std::vector<int> hashes;
    
    if (tokens.size() < static_cast<size_t>(k)) {
        return hashes;
    }
    
    // Generate k-grams and compute hashes
    for (size_t i = 0; i <= tokens.size() - k; i++) {
        std::vector<std::string> kgram(tokens.begin() + i, tokens.begin() + i + k);
        unsigned long long hash = rollingHash(kgram);
        
        // Convert to int (take lower 32 bits to avoid overflow issues)
        int hashInt = static_cast<int>(hash & 0x7FFFFFFF);
        hashes.push_back(hashInt);
    }
    
    return hashes;
}

/**
 * Apply winnowing algorithm to select fingerprints.
 * 
 * The winnowing algorithm selects the minimum hash in each window.
 * 
 * @param hashes Vector of k-gram hashes
 * @param windowSize Size of winnowing window
 * @return Vector of fingerprint pairs (hash, index)
 */
std::vector<std::pair<int, int>> winnow(const std::vector<int>& hashes, int windowSize) {
    std::vector<std::pair<int, int>> fingerprints;
    
    if (hashes.empty() || windowSize <= 0) {
        return fingerprints;
    }
    
    if (static_cast<int>(hashes.size()) <= windowSize) {
        // If sequence is shorter than window, select minimum
        auto minIt = std::min_element(hashes.begin(), hashes.end());
        if (minIt != hashes.end()) {
            int index = std::distance(hashes.begin(), minIt);
            fingerprints.push_back({*minIt, index});
        }
        return fingerprints;
    }
    
    // Winnowing algorithm: select minimum hash in each window
    // Only select if it's different from the previous selection
    int prevMinIndex = -1;
    
    for (size_t i = 0; i <= hashes.size() - windowSize; i++) {
        // Find minimum in current window
        auto windowStart = hashes.begin() + i;
        auto windowEnd = hashes.begin() + i + windowSize;
        auto minIt = std::min_element(windowStart, windowEnd);
        
        int minIndex = std::distance(hashes.begin(), minIt);
        int minValue = *minIt;
        
        // Only add if this is a new position (or same position but different value)
        if (prevMinIndex != minIndex) {
            fingerprints.push_back({minValue, minIndex});
            prevMinIndex = minIndex;
        }
    }
    
    // Ensure we have at least one fingerprint
    if (fingerprints.empty() && !hashes.empty()) {
        auto minIt = std::min_element(hashes.begin(), hashes.end());
        int index = std::distance(hashes.begin(), minIt);
        fingerprints.push_back({*minIt, index});
    }
    
    return fingerprints;
}

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
    int k,
    int windowSize
) {
    if (tokensA.empty() && tokensB.empty()) {
        return 100.0;
    }
    if (tokensA.empty() || tokensB.empty()) {
        return 0.0;
    }
    
    // Generate k-grams and hashes
    std::vector<int> hashesA = generateKGrams(tokensA, k);
    std::vector<int> hashesB = generateKGrams(tokensB, k);
    
    if (hashesA.empty() && hashesB.empty()) {
        return 100.0;
    }
    if (hashesA.empty() || hashesB.empty()) {
        return 0.0;
    }
    
    // Apply winnowing to get fingerprints
    std::vector<std::pair<int, int>> fingerprintsA = winnow(hashesA, windowSize);
    std::vector<std::pair<int, int>> fingerprintsB = winnow(hashesB, windowSize);
    
    if (fingerprintsA.empty() && fingerprintsB.empty()) {
        return 100.0;
    }
    if (fingerprintsA.empty() || fingerprintsB.empty()) {
        return 0.0;
    }
    
    // Create sets of fingerprint hashes for comparison
    std::set<int> setA, setB;
    
    for (const auto& fp : fingerprintsA) {
        setA.insert(fp.first);
    }
    
    for (const auto& fp : fingerprintsB) {
        setB.insert(fp.first);
    }
    
    // Count common fingerprints
    int commonCount = 0;
    for (int hash : setA) {
        if (setB.find(hash) != setB.end()) {
            commonCount++;
        }
    }
    
    // Calculate Jaccard similarity (intersection / union)
    int unionSize = setA.size() + setB.size() - commonCount;
    
    if (unionSize == 0) {
        return 100.0;
    }
    
    double similarity = (static_cast<double>(commonCount) / unionSize) * 100.0;
    
    return std::max(0.0, std::min(100.0, similarity));
}
