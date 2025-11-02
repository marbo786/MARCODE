# C++ Similarity Engine

This directory contains the C++ similarity engine for code plagiarism detection.

## Building

### Requirements
- C++17 compatible compiler (g++, clang++)
- Make

### Build Commands

```bash
# Build the main similarity engine
make

# Run tests
make test

# Clean build files
make clean
```

## Usage

The similarity engine can be run with JSON token files:

```bash
./build/similarity_engine file1_tokens.json file2_tokens.json
```

### Input Format

The JSON files should contain token arrays in the following format:

```json
["def", "func_1", "(", "var_1", ")", ":", "return", "var_1"]
```

### Output

The engine outputs similarity percentages:

```
Levenshtein: 83.2%
LCS: 79.4%
Fingerprint: 91.7%
Structural: 68.5%
Final Score: 81.4%
```

## Final Score Formula

```
final = 0.4*Fingerprint + 0.3*LCS + 0.2*Levenshtein + 0.1*Structural
```

## Modules

- **similarity.cpp/hpp**: Levenshtein distance, LCS, and structural similarity
- **fingerprint.cpp/hpp**: K-gram generation, winnowing, and fingerprint comparison
- **main.cpp**: CLI interface for testing

## Testing

Run individual test suites:

```bash
make test-similarity
make test-fingerprint
```

