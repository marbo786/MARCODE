"""
Tests for code normalization module
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from parser.normalize import remove_comments, normalize_identifiers, normalize_code


def test_remove_comments_python():
    """Test Python comment removal"""
    # Single-line comment
    code = "print('hello')  # This is a comment"
    result = remove_comments(code, "python")
    assert "#" not in result
    assert "print('hello')" in result
    
    # Multi-line comment/docstring
    code = '"""This is a docstring"""\ndef func(): pass'
    result = remove_comments(code, "python")
    assert '"""' not in result
    assert "def func()" in result
    
    # Comment inside string (should be preserved)
    code = "text = '# This is not a comment'"
    result = remove_comments(code, "python")
    assert "'# This is not a comment'" in result


def test_remove_comments_cpp():
    """Test C++ comment removal"""
    # Single-line comment
    code = "int x = 5; // This is a comment"
    result = remove_comments(code, "cpp")
    assert "//" not in result
    assert "int x = 5;" in result
    
    # Block comment
    code = "int x = 5; /* This is a block comment */ int y = 6;"
    result = remove_comments(code, "cpp")
    assert "/*" not in result
    assert "*/" not in result
    assert "int x = 5;" in result
    assert "int y = 6;" in result


def test_normalize_identifiers_python():
    """Test Python identifier normalization"""
    code = """
def add(x, y):
    return x + y
"""
    result = normalize_identifiers(code.strip(), "python")
    # Should normalize 'add' to func_1, 'x' and 'y' to var_1, var_2
    assert "def func_" in result
    assert "var_" in result
    assert "add" not in result or "func_" in result
    
    # Class definition
    code = """
class MyClass:
    def method(self):
        pass
"""
    result = normalize_identifiers(code.strip(), "python")
    assert "class class_" in result
    assert "def func_" in result


def test_normalize_identifiers_cpp():
    """Test C++ identifier normalization"""
    code = """
int calculate(int a, int b) {
    return a + b;
}
"""
    result = normalize_identifiers(code.strip(), "cpp")
    # Should normalize identifiers
    assert "func_" in result or "var_" in result


def test_normalize_code_python():
    """Test full Python normalization pipeline"""
    code = """
# This is a comment
def add_numbers(x, y):
    # Another comment
    result = x + y
    return result
"""
    result = normalize_code(code.strip(), "python")
    # Comments should be removed
    assert "#" not in result
    # Identifiers should be normalized
    assert "func_" in result
    assert "var_" in result


def test_normalize_code_cpp():
    """Test full C++ normalization pipeline"""
    code = """
// Comment
int calculate(int a, int b) {
    /* Block comment */
    return a + b;
}
"""
    result = normalize_code(code.strip(), "cpp")
    # Comments should be removed
    assert "//" not in result
    assert "/*" not in result
    assert "*/" not in result


def test_normalize_preserves_structure():
    """Test that normalization preserves code structure"""
    code = "if x > 5:\n    return True"
    result = normalize_code(code, "python")
    # Structure should be preserved
    assert "if" in result
    assert ":" in result
    assert "return" in result


if __name__ == "__main__":
    # Run basic tests
    test_remove_comments_python()
    print("✓ test_remove_comments_python passed")
    
    test_remove_comments_cpp()
    print("✓ test_remove_comments_cpp passed")
    
    test_normalize_identifiers_python()
    print("✓ test_normalize_identifiers_python passed")
    
    test_normalize_identifiers_cpp()
    print("✓ test_normalize_identifiers_cpp passed")
    
    test_normalize_code_python()
    print("✓ test_normalize_code_python passed")
    
    test_normalize_code_cpp()
    print("✓ test_normalize_code_cpp passed")
    
    test_normalize_preserves_structure()
    print("✓ test_normalize_preserves_structure passed")
    
    print("\nAll normalization tests passed! ✓")

