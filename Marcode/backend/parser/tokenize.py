"""
Tokenization Module
Converts normalized code into token lists for comparison.
Supports Python and C++ code files.
"""

import re
import tokenize
import io
from typing import List


def detect_language(code: str) -> str:
    """
    Detect programming language based on code heuristics.
    
    Checks for Python and C++ specific patterns to determine language.
    
    Args:
        code: Source code to analyze
        
    Returns:
        Language identifier: 'python' or 'cpp'
        
    Example:
        >>> detect_language("def add(x, y):\\n    return x + y")
        'python'
        >>> detect_language("#include <iostream>\\nint main() {}")
        'cpp'
    """
    # Remove leading/trailing whitespace for analysis
    code_stripped = code.strip()
    
    # Check for C++ specific patterns
    cpp_indicators = [
        r'#include\s*[<"]',  # #include directives
        r'using\s+namespace',  # using namespace
        r'std::',  # std:: namespace
        r'cout\s*<<',  # cout usage
        r'cin\s*>>',  # cin usage
        r'int\s+main\s*\(',  # int main()
        r'void\s+main\s*\(',  # void main()
        r'#define\s+',  # #define macros
        r'class\s+\w+\s*\{',  # C++ class syntax
        r'new\s+\w+',  # new operator
        r'delete\s+',  # delete operator
        r'->',  # pointer member access
        r'::',  # scope resolution
    ]
    
    # Check for Python specific patterns
    python_indicators = [
        r'def\s+\w+\s*\(',  # def keyword
        r'class\s+\w+\s*\(',  # class with parentheses (inheritance)
        r'print\s*\(',  # print() function
        r'if\s+\w+\s*:',  # if statement with colon
        r'elif\s+',  # elif keyword
        r'lambda\s+',  # lambda keyword
        r'import\s+\w+',  # import statement
        r'from\s+\w+\s+import',  # from import
        r'\.\.\.',  # ellipsis
        r'pass\s*$',  # pass statement
        r'if\s+__name__\s*==',  # __name__ == '__main__'
    ]
    
    cpp_score = 0
    python_score = 0
    
    # Check C++ indicators
    for pattern in cpp_indicators:
        if re.search(pattern, code_stripped):
            cpp_score += 1
    
    # Check Python indicators
    for pattern in python_indicators:
        if re.search(pattern, code_stripped):
            python_score += 1
    
    # Additional heuristics
    # Python uses indentation, C++ uses braces
    brace_count = code_stripped.count('{') + code_stripped.count('}')
    colon_count = code_stripped.count(':')
    
    if brace_count > 2 and cpp_score > 0:
        cpp_score += 1
    if colon_count > brace_count and python_score > 0:
        python_score += 1
    
    # Default to Python if both scores are equal and no clear indicators
    if cpp_score > python_score:
        return 'cpp'
    else:
        return 'python'


def tokenize_code(code: str, lang: str) -> List[str]:
    """
    Convert code into tokens (keywords, operators, identifiers, literals, delimiters).
    
    Uses Python's tokenize module for Python code and regex-based tokenizer for C++.
    
    Args:
        code: Normalized source code
        lang: Language identifier ('python' or 'cpp')
        
    Returns:
        List of tokens as strings
        
    Example:
        >>> code = "def add(x, y):\\n    return x + y"
        >>> tokenize_code(code, "python")
        ['def', 'add', '(', 'x', ',', 'y', ')', ':', 'return', 'x', '+', 'y']
    """
    if lang == "python":
        return tokenize_python(code)
    elif lang == "cpp":
        return tokenize_cpp(code)
    else:
        raise ValueError(f"Unsupported language: {lang}")


def tokenize_python(code: str) -> List[str]:
    """
    Tokenize normalized Python code into a list of tokens.
    
    Uses Python's built-in tokenize module to extract all tokens.
    
    Args:
        code: Normalized Python source code
        
    Returns:
        List of tokens
        
    Example:
        >>> tokenize_python("def func_1(var_1, var_2):\\n    return var_1 + var_2")
        ['def', 'func_1', '(', 'var_1', ',', 'var_2', ')', ':', 'return', 'var_1', '+', 'var_2']
    """
    tokens = []
    
    try:
        # Use Python's tokenize module
        token_stream = tokenize.generate_tokens(io.StringIO(code).readline)
        
        for tok in token_stream:
            token_type = tok.type
            token_string = tok.string
            
            # Skip comments and newlines (they should be removed in normalization)
            if token_type == tokenize.COMMENT or token_type == tokenize.NL:
                continue
            
            # Skip ENDMARKER
            if token_type == tokenize.ENDMARKER:
                continue
            
            # Add token to list
            tokens.append(token_string)
            
    except tokenize.TokenError:
        # If tokenization fails, fall back to simple word splitting
        # This handles edge cases with malformed code
        tokens = re.findall(r'\b\w+\b|[^\s\w]', code)
        tokens = [t for t in tokens if t.strip()]
    
    return tokens


def tokenize_cpp(code: str) -> List[str]:
    """
    Tokenize normalized C++ code into a list of tokens.
    
    Uses regex-based tokenizer to extract keywords, identifiers, operators, etc.
    
    Args:
        code: Normalized C++ source code
        
    Returns:
        List of tokens
        
    Example:
        >>> tokenize_cpp("int var_1 = 5;\\nreturn var_1;")
        ['int', 'var_1', '=', '5', ';', 'return', 'var_1', ';']
    """
    tokens = []
    i = 0
    n = len(code)
    
    # Patterns for different token types
    identifier_pattern = r'[a-zA-Z_][a-zA-Z0-9_]*'
    number_pattern = r'\d+\.?\d*[eE][+-]?\d+|\d+\.\d+|\d+'
    string_pattern = r'"[^"\\]*(\\.[^"\\]*)*"|\'[^\'\\]*(\\.[^\'\\]*)*\''
    
    # Operators and punctuation
    operators = {
        '++', '--', '==', '!=', '<=', '>=', '&&', '||', '<<', '>>',
        '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '->', '::',
        '.*', '->*'
    }
    
    while i < n:
        # Skip whitespace
        if code[i].isspace():
            i += 1
            continue
        
        # Try to match operators (longest first)
        matched = False
        for op in sorted(operators, key=len, reverse=True):
            if code[i:i+len(op)] == op:
                tokens.append(op)
                i += len(op)
                matched = True
                break
        
        if matched:
            continue
        
        # Try to match string literal
        if code[i] in ['"', "'"]:
            quote = code[i]
            string_start = i
            i += 1
            while i < n:
                if code[i] == '\\' and i + 1 < n:
                    i += 2  # Skip escaped character
                elif code[i] == quote:
                    i += 1
                    break
                else:
                    i += 1
            tokens.append(code[string_start:i])
            continue
        
        # Try to match number
        number_match = re.match(number_pattern, code[i:])
        if number_match:
            tokens.append(number_match.group(0))
            i += len(number_match.group(0))
            continue
        
        # Try to match identifier
        identifier_match = re.match(identifier_pattern, code[i:])
        if identifier_match:
            tokens.append(identifier_match.group(0))
            i += len(identifier_match.group(0))
            continue
        
        # Single character (punctuation, operators not matched above)
        tokens.append(code[i])
        i += 1
    
    # Filter out empty tokens
    tokens = [t for t in tokens if t]
    
    return tokens

