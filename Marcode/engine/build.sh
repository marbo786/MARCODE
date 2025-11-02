#!/bin/bash

# Build script for compiling C++ similarity engine to WebAssembly
# Requires Emscripten SDK to be installed and configured

echo "Building Marcode Similarity Engine for WebAssembly..."

# Set Emscripten environment (adjust path if needed)
# source ~/emsdk/emsdk_env.sh

# Compile to WASM
emcc \
    engine/src/main.cpp \
    engine/src/fingerprint.cpp \
    engine/src/similarity.cpp \
    -O3 \
    -s WASM=1 \
    -s EXPORTED_FUNCTIONS='["_calculate_text_similarity","_calculate_fingerprint_match","_calculate_structural_similarity","_calculate_final_score","_malloc","_free"]' \
    -s EXPORTED_RUNTIME_METHODS='["ccall","cwrap"]' \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="createSimilarityModule" \
    -o frontend/public/wasm/similarity_engine.js

echo "Build complete! Output: frontend/public/wasm/similarity_engine.js"
echo "Note: Adjust emsdk path in build.sh before running"

