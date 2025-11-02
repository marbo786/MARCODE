/**
 * Tests for similarity calculation module
 */

#include "../engine/src/similarity.hpp"
#include <iostream>
#include <vector>
#include <string>
#include <cassert>
#include <cmath>

/**
 * Test Levenshtein similarity
 */
void testLevenshteinSimilarity() {
    std::vector<std::string> A = {"def", "func_1", "(", "var_1", ")", ":", "return", "var_1"};
    std::vector<std::string> B = {"def", "func_1", "(", "var_1", ")", ":", "return", "var_1"};
    
    double sim = levenshteinSimilarity(A, B);
    assert(std::abs(sim - 100.0) < 0.1);
    
    // Different sequences
    std::vector<std::string> C = {"def", "func_2", "(", "var_2", ")"};
    double sim2 = levenshteinSimilarity(A, C);
    assert(sim2 >= 0.0 && sim2 <= 100.0);
    
    // Empty sequences
    std::vector<std::string> empty;
    double sim3 = levenshteinSimilarity(empty, empty);
    assert(std::abs(sim3 - 100.0) < 0.1);
    
    std::cout << "✓ testLevenshteinSimilarity passed" << std::endl;
}

/**
 * Test LCS similarity
 */
void testLcsSimilarity() {
    std::vector<std::string> A = {"def", "func_1", "(", "var_1", ")", ":", "return", "var_1"};
    std::vector<std::string> B = {"def", "func_1", "(", "var_1", ")", ":", "return", "var_1"};
    
    double sim = lcsSimilarity(A, B);
    assert(std::abs(sim - 100.0) < 0.1);
    
    // Partial match
    std::vector<std::string> C = {"def", "func_1", "(", "var_2", ")"};
    double sim2 = lcsSimilarity(A, C);
    assert(sim2 >= 0.0 && sim2 <= 100.0);
    assert(sim2 > 0.0);  // Should have some similarity
    
    std::cout << "✓ testLcsSimilarity passed" << std::endl;
}

/**
 * Test structural similarity
 */
void testStructuralSimilarity() {
    std::vector<std::string> A = {"def", "func_1", "(", "var_1", ")", ":", "return", "var_1"};
    std::vector<std::string> B = {"def", "func_1", "(", "var_1", ")", ":", "return", "var_1"};
    
    double sim = structuralSimilarity(A, B);
    assert(std::abs(sim - 100.0) < 0.1);
    
    // Similar structure but different tokens
    std::vector<std::string> C = {"def", "func_2", "(", "var_2", ")", ":", "return", "var_2"};
    double sim2 = structuralSimilarity(A, C);
    assert(sim2 >= 0.0 && sim2 <= 100.0);
    assert(sim2 > 50.0);  // Should have high structural similarity
    
    std::cout << "✓ testStructuralSimilarity passed" << std::endl;
}

/**
 * Test edge cases
 */
void testEdgeCases() {
    // Empty sequences
    std::vector<std::string> empty;
    double sim1 = levenshteinSimilarity(empty, empty);
    assert(std::abs(sim1 - 100.0) < 0.1);
    
    double sim2 = lcsSimilarity(empty, empty);
    assert(std::abs(sim2 - 100.0) < 0.1);
    
    double sim3 = structuralSimilarity(empty, empty);
    assert(std::abs(sim3 - 100.0) < 0.1);
    
    // One empty sequence
    std::vector<std::string> A = {"def", "func_1"};
    double sim4 = levenshteinSimilarity(empty, A);
    assert(std::abs(sim4 - 0.0) < 0.1);
    
    std::cout << "✓ testEdgeCases passed" << std::endl;
}

int main() {
    std::cout << "Running similarity tests..." << std::endl;
    
    testLevenshteinSimilarity();
    testLcsSimilarity();
    testStructuralSimilarity();
    testEdgeCases();
    
    std::cout << "\nAll similarity tests passed! ✓" << std::endl;
    
    return 0;
}

