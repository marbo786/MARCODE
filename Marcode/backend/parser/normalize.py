"""
Code Normalization Module
Strips comments, normalizes identifiers, and prepares code for tokenization.
Supports Python and C++ code files.
"""

import re
import keyword
from typing import Dict


def remove_comments(code: str, lang: str) -> str:
    """
    Remove comments from code based on language.
    
    For Python: Removes # comments and multi-line docstrings (""", ''')
    For C++: Removes // comments and /* ... */ block comments
    
    Args:
        code: Raw source code
        lang: Language identifier ('python' or 'cpp')
        
    Returns:
        Code with comments removed
        
    Example:
        >>> remove_comments("# This is a comment\\nprint('hello')", "python")
        "\\nprint('hello')"
        >>> remove_comments("int x = 5; // comment", "cpp")
        "int x = 5; "
    """
    if lang == "python":
        return _remove_python_comments(code)
    elif lang == "cpp":
        return _remove_cpp_comments(code)
    else:
        raise ValueError(f"Unsupported language: {lang}")


def _remove_python_comments(code: str) -> str:
    """Remove Python comments (#) and docstrings (triple quotes)."""
    lines = code.split('\n')
    result = []
    in_triple_quotes = None  # Track if we're inside triple quotes
    
    for line in lines:
        if in_triple_quotes:
            # Check if this line ends the triple-quoted string
            end_pos = line.find(in_triple_quotes)
            if end_pos != -1:
                in_triple_quotes = None
                # Keep only part after the closing quotes
                line = line[end_pos + 3:]
            else:
                continue  # Skip entire line if still in docstring
        
        # Check for triple-quoted strings at start of line
        triple_match = re.match(r'^(\s*)("""|\'\'\')', line)
        if triple_match:
            in_triple_quotes = triple_match.group(2)
            continue  # Skip docstring start
        
        # Remove inline comments (#) but preserve strings
        # Simple approach: split on # and check if it's inside a string
        comment_pos = line.find('#')
        if comment_pos != -1:
            # Check if # is inside a string
            before_comment = line[:comment_pos]
            quote_count_single = before_comment.count("'") - before_comment.count("\\'")
            quote_count_double = before_comment.count('"') - before_comment.count('\\"')
            
            # If odd number of unescaped quotes, # is inside string, keep it
            if quote_count_single % 2 == 0 and quote_count_double % 2 == 0:
                line = line[:comment_pos]
        
        result.append(line)
    
    return '\n'.join(result)


def _remove_cpp_comments(code: str) -> str:
    """Remove C++ comments (// and /* ... */)."""
    result = []
    i = 0
    n = len(code)
    
    while i < n:
        # Check for single-line comment (//) - but not inside string
        if i < n - 1 and code[i:i+2] == '//':
            # Check if we're inside a string
            # Simple heuristic: count quotes before this position
            before = code[:i]
            quote_count_double = before.count('"') - before.count('\\"')
            quote_count_single = before.count("'") - before.count("\\'")
            
            # If inside string, preserve it
            if quote_count_double % 2 == 1 or quote_count_single % 2 == 1:
                result.append(code[i])
                i += 1
            else:
                # Single-line comment: skip to end of line, but keep newline
                while i < n and code[i] != '\n':
                    i += 1
                if i < n:
                    result.append(code[i])  # Preserve newline
                    i += 1
        elif i < n - 1 and code[i:i+2] == '/*':
            # Block comment: skip to */
            # Check if inside string first
            before = code[:i]
            quote_count_double = before.count('"') - before.count('\\"')
            quote_count_single = before.count("'") - before.count("\\'")
            
            if quote_count_double % 2 == 1 or quote_count_single % 2 == 1:
                result.append(code[i])
                i += 1
            else:
                i += 2  # Skip /*
                while i < n - 1 and code[i:i+2] != '*/':
                    i += 1
                if i < n - 1:
                    i += 2  # Skip */
        else:
            # Regular character - check if we're inside a string
            if code[i] in ['"', "'"]:
                quote = code[i]
                result.append(code[i])
                i += 1
                # Skip escaped characters and find closing quote
                while i < n:
                    if code[i] == '\\' and i + 1 < n:
                        result.append(code[i])
                        result.append(code[i + 1])
                        i += 2
                    elif code[i] == quote:
                        result.append(code[i])
                        i += 1
                        break
                    else:
                        result.append(code[i])
                        i += 1
            else:
                result.append(code[i])
                i += 1
    
    return ''.join(result)


def normalize_identifiers(code: str, lang: str) -> str:
    """
    Normalize variable, function, and class names to generic identifiers.
    
    Renames identifiers to: var_1, var_2, ... for variables
                            func_1, func_2, ... for functions
                            class_1, class_2, ... for classes
    
    Args:
        code: Code with comments removed
        lang: Language identifier ('python' or 'cpp')
        
    Returns:
        Code with normalized identifiers
        
    Example:
        >>> normalize_identifiers("def add(x, y):\\n    return x + y", "python")
        "def func_1(var_1, var_2):\\n    return var_1 + var_2"
    """
    if lang == "python":
        return _normalize_python_identifiers(code)
    elif lang == "cpp":
        return _normalize_cpp_identifiers(code)
    else:
        raise ValueError(f"Unsupported language: {lang}")


def _normalize_python_identifiers(code: str) -> str:
    """Normalize Python identifiers."""
    import tokenize
    import io
    
    # Track identifiers to rename
    identifier_map: Dict[str, str] = {}
    var_counter = 1
    func_counter = 1
    class_counter = 1
    
    tokens = []
    try:
        # Tokenize the code
        for tok in tokenize.generate_tokens(io.StringIO(code).readline):
            tokens.append(tok)
    except tokenize.TokenError:
        # If tokenization fails, return original code
        return code
    
    # First pass: identify and map all identifiers
    for i, tok in enumerate(tokens):
        if tok.type == tokenize.NAME:
            name = tok.string
            
            # Skip Python keywords and built-ins
            if name in keyword.kwlist or (name.startswith('__') and name.endswith('__')):
                continue
            
            # Determine if it's a function, class, or variable
            # Check previous tokens to see if 'def' or 'class' keyword precedes
            is_function = False
            is_class = False
            
            # Look back for 'def' or 'class' keywords
            for j in range(max(0, i - 3), i):
                if j < len(tokens) and tokens[j].type == tokenize.NAME:
                    if tokens[j].string == 'def':
                        is_function = True
                        break
                    elif tokens[j].string == 'class':
                        is_class = True
                        break
            
            if is_function:
                # Function definition
                if name not in identifier_map:
                    identifier_map[name] = f"func_{func_counter}"
                    func_counter += 1
            elif is_class:
                # Class definition
                if name not in identifier_map:
                    identifier_map[name] = f"class_{class_counter}"
                    class_counter += 1
            else:
                # Variable or other identifier
                if name not in identifier_map:
                    identifier_map[name] = f"var_{var_counter}"
                    var_counter += 1
    
    # Second pass: replace identifiers in code
    # Sort tokens by position (reverse order) to replace from end to start
    tokens_to_replace = [
        (token, identifier_map[token.string])
        for token in tokens
        if token.type == tokenize.NAME and token.string in identifier_map
    ]
    
    # Sort by line (descending) and column (descending) to replace backwards
    tokens_to_replace.sort(key=lambda x: (x[0].start[0], x[0].start[1]), reverse=True)
    
    result_lines = code.split('\n')
    for token, replacement in tokens_to_replace:
        line_num = token.start[0] - 1
        if 0 <= line_num < len(result_lines):
            line = result_lines[line_num]
            col_start = token.start[1]
            col_end = token.end[1]
            result_lines[line_num] = (
                line[:col_start] + 
                replacement + 
                line[col_end:]
            )
    
    return '\n'.join(result_lines)


def _normalize_cpp_identifiers(code: str) -> str:
    """Normalize C++ identifiers."""
    # C++ keywords and common types
    cpp_keywords = {
        'int', 'float', 'double', 'char', 'bool', 'void', 'auto', 'const',
        'static', 'public', 'private', 'protected', 'class', 'struct',
        'namespace', 'using', 'typedef', 'if', 'else', 'for', 'while',
        'do', 'switch', 'case', 'break', 'continue', 'return', 'new',
        'delete', 'true', 'false', 'nullptr', 'NULL', 'include', 'define',
        'short', 'long', 'unsigned', 'signed', 'template', 'typename',
        'virtual', 'override', 'final', 'try', 'catch', 'throw', 'except'
    }
    
    identifier_map: Dict[str, str] = {}
    var_counter = 1
    func_counter = 1
    class_counter = 1
    
    # Track identifiers found and their positions
    identifier_positions = []
    
    # Parse code character by character, tracking strings and identifiers
    i = 0
    n = len(code)
    in_string = False
    
    while i < n:
        # Handle strings
        if code[i] in ['"', "'"]:
            if i == 0 or code[i-1] != '\\':
                in_string = not in_string
            i += 1
            continue
        
        if in_string:
            # Skip string content
            if code[i] == '\\' and i + 1 < n:
                i += 2  # Skip escaped character
            else:
                i += 1
            continue
        
        # Check for identifier
        if re.match(r'[a-zA-Z_]', code[i]):
            # Extract identifier
            match = re.match(r'[a-zA-Z0-9_]*', code[i:])
            if match:
                identifier = match.group(0)
                
                # Skip keywords and empty matches
                if identifier and identifier not in cpp_keywords:
                    # Check context to determine type
                    before_start = max(0, i - 100)
                    before_context = code[before_start:i]
                    after_context = code[i:i+100]
                    
                    # Check if it's a class/struct definition
                    if re.search(r'\b(class|struct)\s+' + re.escape(identifier) + r'[^a-zA-Z0-9_]', before_context + identifier):
                        if identifier not in identifier_map:
                            identifier_map[identifier] = f"class_{class_counter}"
                            class_counter += 1
                        identifier_positions.append((i, identifier, identifier_map[identifier]))
                    # Check if it's a function (identifier followed by '(')
                    elif re.match(r'[a-zA-Z_][a-zA-Z0-9_]*\s*\(', after_context):
                        if identifier not in identifier_map:
                            identifier_map[identifier] = f"func_{func_counter}"
                            func_counter += 1
                        identifier_positions.append((i, identifier, identifier_map[identifier]))
                    else:
                        # Variable
                        if identifier not in identifier_map:
                            identifier_map[identifier] = f"var_{var_counter}"
                            var_counter += 1
                        identifier_positions.append((i, identifier, identifier_map[identifier]))
                
                i += len(identifier)
            else:
                i += 1
        else:
            i += 1
    
    # Replace identifiers from end to start to preserve positions
    identifier_positions.sort(reverse=True)
    result = list(code)
    
    for pos, original, replacement in identifier_positions:
        # Replace the identifier with normalized version
        result[pos:pos+len(original)] = list(replacement)
    
    return ''.join(result)


def normalize_code(code: str, lang: str) -> str:
    """
    Full normalization pipeline: remove comments → normalize identifiers → trim whitespace.
    
    Args:
        code: Raw source code
        lang: Language identifier ('python' or 'cpp')
        
    Returns:
        Fully normalized code string
        
    Example:
        >>> code = "# Comment\\ndef add(x, y):\\n    return x + y"
        >>> normalize_code(code, "python")
        "def func_1(var_1, var_2):\\n    return var_1 + var_2"
    """
    # Step 1: Remove comments
    code = remove_comments(code, lang)
    
    # Step 2: Normalize identifiers
    code = normalize_identifiers(code, lang)
    
    # Step 3: Normalize whitespace (replace multiple spaces/newlines with single)
    code = re.sub(r'[ \t]+', ' ', code)  # Multiple spaces/tabs to single space
    code = re.sub(r'\n\s*\n', '\n', code)  # Multiple newlines to single
    code = code.strip()  # Remove leading/trailing whitespace
    
    return code

