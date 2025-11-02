"""
API Endpoint for Code Comparison

This module provides a serverless API function for code comparison.
Note: Currently, comparison is handled client-side via WASM.
This module is kept for future server-side API integration.

For current implementation, see:
- frontend/utils/wasmLoader.ts (WASM engine integration)
- frontend/pages/compare.tsx (Client-side comparison logic)
"""

def compare_codes(code1: str, code2: str, lang1: str, lang2: str) -> dict:
    """
    Compare two code files and return similarity metrics.
    
    Note: This is a placeholder for future server-side implementation.
    Currently, all comparison is done client-side using WebAssembly.
    
    Args:
        code1: First code file content
        code2: Second code file content
        lang1: Language of first file ('python' or 'cpp')
        lang2: Language of second file ('python' or 'cpp')
        
    Returns:
        Dictionary containing similarity scores and metrics
        
    Raises:
        NotImplementedError: This function is not yet implemented
    """
    raise NotImplementedError(
        "Server-side comparison is not yet implemented. "
        "Use the client-side WASM engine instead."
    )

