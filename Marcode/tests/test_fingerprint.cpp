/**
 * Tests for fingerprinting module
 */

#include "../engine/src/fingerprint.hpp"
#include <iostream>
#include <vector>
#include <string>
#include <cassert>
#include <cmath>

/**
 * Test k-gram generation
 */
void testGenerateKGrams() {
    std::vector<std::string> tokens = {"def", "func_1", "(", "var_1", ")", ":", "return", "var_1"};
    
    std::vector<int> hashes = generateKGrams(tokens, 3);
    
    // Should generate (tokens.size() - k + 1) k-grams
    assert(hashes.size() == tokens.size() - 3 + 1);
    assert(hashes.size() > 0);
    
    // Test with k larger than tokens
    std::vector<std::string> small = {"def", "func_1"};
    std::vector<int> hashes2 = generateKGrams(small, 5);
    assert(hashes2.empty());
    
    std::cout << "✓ testGenerateKGrams passed" << std::endl;
}

/**
 * Test winnowing algorithm
 */
void testWinnow() {
    std::vector<int> hashes = {10, 5, 8, 3, 12, 7, 9, 4};
    
    std::vector<std::pair<int, int>> fingerprints = winnow(hashes, 4);
    
    // Should have at least one fingerprint
    assert(!fingerprints.empty());
    
    // All fingerprints should be valid indices
    for (const auto& fp : fingerprints) {
        assert(fp.second >= 0 && fp.second < static_cast<int>(hashes.size()));
    }
    
    std::cout << "✓ testWinnow passed" << std::endl;
}

/**
 * Test fingerprint similarity
 */
void testFingerprintSimilarity() {
    std::vector<std::string> A = {"def", "func_1", "(", "var_1", ")", ":", "return", "var_1"};
    std::vector<std::string> B = {"def", "func_1", "(", "var_1", ")", ":", "return", "var_1"};
    
    double sim = fingerprintSimilarity(A, B, 5, 4);
    assert(std::abs(sim - 100.0) < 0.1);
    
    // Different sequences
    std::vector<std::string> C = {"def", "func_2", "(", "var_2", ")", ":", "return", "var_2"};
    double sim2 = fingerprintSimilarity(A, C, 5, 4);
    assert(sim2 >= 0.0 && sim2 <= 100.0);
    
    // Empty sequences
    std::vector<std::string> empty;
    double sim3 = fingerprintSimilarity(empty, empty, 5, 4);
    assert(std::abs(sim3 - 100.0) < 0.1);
    
    std::cout << "✓ testFingerprintSimilarity passed" << std::endl;
}

/**
 * Test edge cases
 */
void testFingerprintEdgeCases() {
    // Empty sequences
    std::vector<std::string> empty;
    double sim1 = fingerprintSimilarity(empty, empty, 5, 4);
    assert(std::abs(sim1 - 100.0) < 0.1);
    
    // One empty sequence
    std::vector<std::string> A = {"def", "func_1"};
    double sim2 = fingerprintSimilarity(empty, A, 5, 4);
    assert(std::abs(sim2 - 0.0) < 0.1);
    
    // Sequences shorter than k
    std::vector<std::string> shortSeq = {"def", "func_1"};
    double sim3 = fingerprintSimilarity(shortSeq, shortSeq, 5, 4);
    // Should handle gracefully
    assert(sim3 >= 0.0 && sim3 <= 100.0);
    
    std::cout << "✓ testFingerprintEdgeCases passed" << std::endl;
}

int main() {
    std::cout << "Running fingerprint tests..." << std::endl;
    
    testGenerateKGrams();
    testWinnow();
    testFingerprintSimilarity();
    testFingerprintEdgeCases();
    
    std::cout << "\nAll fingerprint tests passed! ✓" << std::endl;
    
    return 0;
}

