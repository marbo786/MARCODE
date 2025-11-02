"""
Example usage of normalization and tokenization modules
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from parser.normalize import normalize_code
from parser.tokenize import detect_language, tokenize_code

# Example Python code
python_code = """
# This is a comment
def add(x, y):
    # Another comment
    result = x + y
    return result
"""

# Example C++ code
cpp_code = """
// This is a comment
int calculate(int a, int b) {
    /* Block comment */
    int result = a + b;
    return result;
}
"""

print("=" * 60)
print("Python Code Normalization & Tokenization")
print("=" * 60)

# Detect language
lang = detect_language(python_code)
print(f"\nDetected language: {lang}")

# Normalize
normalized = normalize_code(python_code.strip(), lang)
print(f"\nNormalized code:\n{normalized}")

# Tokenize
tokens = tokenize_code(normalized, lang)
print(f"\nTokens: {tokens}")
print(f"Token count: {len(tokens)}")

print("\n" + "=" * 60)
print("C++ Code Normalization & Tokenization")
print("=" * 60)

# Detect language
lang = detect_language(cpp_code)
print(f"\nDetected language: {lang}")

# Normalize
normalized = normalize_code(cpp_code.strip(), lang)
print(f"\nNormalized code:\n{normalized}")

# Tokenize
tokens = tokenize_code(normalized, lang)
print(f"\nTokens: {tokens}")
print(f"Token count: {len(tokens)}")

print("\n" + "=" * 60)

