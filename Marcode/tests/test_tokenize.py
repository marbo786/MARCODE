"""
Tests for tokenization module
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from parser.tokenize import detect_language, tokenize_code, tokenize_python, tokenize_cpp


def test_detect_language_python():
    """Test Python language detection"""
    code = """
def add(x, y):
    return x + y

if __name__ == '__main__':
    print(add(1, 2))
"""
    assert detect_language(code) == "python"
    
    # Simple Python code
    code = "x = 5\nprint(x)"
    assert detect_language(code) == "python"


def test_detect_language_cpp():
    """Test C++ language detection"""
    code = """
#include <iostream>
using namespace std;

int main() {
    cout << "Hello" << endl;
    return 0;
}
"""
    assert detect_language(code) == "cpp"
    
    # Simple C++ code
    code = "int x = 5;\nstd::cout << x;"
    assert detect_language(code) == "cpp"


def test_tokenize_python():
    """Test Python code tokenization"""
    code = "def func_1(var_1, var_2):\n    return var_1 + var_2"
    tokens = tokenize_python(code)
    
    # Should contain key tokens
    assert "def" in tokens
    assert "func_1" in tokens
    assert "(" in tokens
    assert "var_1" in tokens
    assert "return" in tokens
    assert "+" in tokens
    
    # Should be a list of strings
    assert isinstance(tokens, list)
    assert all(isinstance(t, str) for t in tokens)


def test_tokenize_cpp():
    """Test C++ code tokenization"""
    code = "int var_1 = 5;\nreturn var_1;"
    tokens = tokenize_cpp(code)
    
    # Should contain key tokens
    assert "int" in tokens
    assert "var_1" in tokens
    assert "=" in tokens
    assert "5" in tokens
    assert ";" in tokens
    assert "return" in tokens
    
    # Should be a list of strings
    assert isinstance(tokens, list)
    assert all(isinstance(t, str) for t in tokens)


def test_tokenize_code_python():
    """Test tokenize_code with Python"""
    code = "def add(x, y):\n    return x + y"
    tokens = tokenize_code(code, "python")
    
    assert isinstance(tokens, list)
    assert len(tokens) > 0
    assert "def" in tokens


def test_tokenize_code_cpp():
    """Test tokenize_code with C++"""
    code = "int main() {\n    return 0;\n}"
    tokens = tokenize_code(code, "cpp")
    
    assert isinstance(tokens, list)
    assert len(tokens) > 0
    assert "int" in tokens or "main" in tokens


def test_tokenize_with_operators():
    """Test tokenization with various operators"""
    # Python
    code = "result = a + b * c - d / e"
    tokens = tokenize_python(code)
    assert "+" in tokens
    assert "*" in tokens
    assert "-" in tokens
    assert "/" in tokens
    
    # C++
    code = "result = a + b * c - d / e;"
    tokens = tokenize_cpp(code)
    assert "+" in tokens
    assert "*" in tokens
    assert "-" in tokens
    assert "/" in tokens


def test_tokenize_expected_output():
    """Test that tokenization produces expected output format"""
    # Example from requirements
    code = "def add(x, y):\n    return x + y"
    tokens = tokenize_code(code, "python")
    
    # Should produce tokens like: ["def", "add", "(", "x", ",", "y", ")", ":", "return", "x", "+", "y"]
    assert isinstance(tokens, list)
    assert all(isinstance(t, str) for t in tokens)
    
    # Check for expected tokens
    expected_tokens = ["def", "(", ",", ")", ":", "return", "+"]
    found_tokens = [t for t in tokens if t in expected_tokens]
    assert len(found_tokens) > 0, "Expected tokens not found in output"


if __name__ == "__main__":
    # Run basic tests
    test_detect_language_python()
    print("✓ test_detect_language_python passed")
    
    test_detect_language_cpp()
    print("✓ test_detect_language_cpp passed")
    
    test_tokenize_python()
    print("✓ test_tokenize_python passed")
    
    test_tokenize_cpp()
    print("✓ test_tokenize_cpp passed")
    
    test_tokenize_code_python()
    print("✓ test_tokenize_code_python passed")
    
    test_tokenize_code_cpp()
    print("✓ test_tokenize_code_cpp passed")
    
    test_tokenize_with_operators()
    print("✓ test_tokenize_with_operators passed")
    
    test_tokenize_expected_output()
    print("✓ test_tokenize_expected_output passed")
    
    print("\nAll tokenization tests passed! ✓")

