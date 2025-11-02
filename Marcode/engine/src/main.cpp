/**
 * Main Entry Point for Local Testing
 * CLI tool to test similarity calculations with JSON token files.
 */

#include "similarity.hpp"
#include "fingerprint.hpp"
#include <iostream>
#include <fstream>
#include <sstream>
#include <vector>
#include <string>

/**
 * Simple JSON token parser for reading token arrays from JSON files.
 * Expected format: ["token1", "token2", "token3"]
 */
std::vector<std::string> parseJsonTokens(const std::string& filename) {
    std::vector<std::string> tokens;
    std::ifstream file(filename);
    
    if (!file.is_open()) {
        std::cerr << "Error: Could not open file " << filename << std::endl;
        return tokens;
    }
    
    std::string line;
    std::string content;
    while (std::getline(file, line)) {
        content += line;
    }
    file.close();
    
    // Simple JSON array parser
    // Remove whitespace and brackets
    size_t start = content.find('[');
    size_t end = content.rfind(']');
    
    if (start == std::string::npos || end == std::string::npos) {
        std::cerr << "Error: Invalid JSON format in " << filename << std::endl;
        return tokens;
    }
    
    std::string arrayContent = content.substr(start + 1, end - start - 1);
    
    // Parse tokens (simple: split by comma and remove quotes)
    std::stringstream ss(arrayContent);
    std::string token;
    
    while (std::getline(ss, token, ',')) {
        // Remove quotes and whitespace
        size_t first = token.find('"');
        size_t last = token.rfind('"');
        
        if (first != std::string::npos && last != std::string::npos && last > first) {
            std::string cleanToken = token.substr(first + 1, last - first - 1);
            // Remove escaped quotes
            size_t pos = 0;
            while ((pos = cleanToken.find("\\\"", pos)) != std::string::npos) {
                cleanToken.replace(pos, 2, "\"");
                pos += 1;
            }
            tokens.push_back(cleanToken);
        }
    }
    
    return tokens;
}

/**
 * Calculate weighted final score.
 * Formula: 0.4*Fingerprint + 0.3*LCS + 0.2*Levenshtein + 0.1*Structural
 */
double calculateFinalScore(
    double fingerprint,
    double lcs,
    double levenshtein,
    double structural
) {
    return 0.4 * fingerprint + 0.3 * lcs + 0.2 * levenshtein + 0.1 * structural;
}

int main(int argc, char* argv[]) {
    if (argc != 3) {
        std::cerr << "Usage: " << argv[0] << " <file1_tokens.json> <file2_tokens.json>" << std::endl;
        std::cerr << "Example: " << argv[0] << " file1_tokens.json file2_tokens.json" << std::endl;
        return 1;
    }
    
    std::string file1 = argv[1];
    std::string file2 = argv[2];
    
    // Parse JSON token files
    std::vector<std::string> tokens1 = parseJsonTokens(file1);
    std::vector<std::string> tokens2 = parseJsonTokens(file2);
    
    if (tokens1.empty() || tokens2.empty()) {
        std::cerr << "Error: Failed to parse token files or files are empty" << std::endl;
        return 1;
    }
    
    // Calculate similarity metrics
    double levenshtein = levenshteinSimilarity(tokens1, tokens2);
    double lcs = lcsSimilarity(tokens1, tokens2);
    double structural = structuralSimilarity(tokens1, tokens2);
    double fingerprint = fingerprintSimilarity(tokens1, tokens2, 5, 4);
    
    // Calculate final weighted score
    double finalScore = calculateFinalScore(fingerprint, lcs, levenshtein, structural);
    
    // Print results
    std::cout << std::fixed;
    std::cout.precision(1);
    std::cout << "Levenshtein: " << levenshtein << "%" << std::endl;
    std::cout << "LCS: " << lcs << "%" << std::endl;
    std::cout << "Fingerprint: " << fingerprint << "%" << std::endl;
    std::cout << "Structural: " << structural << "%" << std::endl;
    std::cout << "Final Score: " << finalScore << "%" << std::endl;
    
    return 0;
}

