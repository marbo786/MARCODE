# Marcode — A Hybrid Code Plagiarism Detector

A web-based code plagiarism detection system that compares Python and C++ code files using a hybrid approach combining text-based similarity, fingerprinting, and structural analysis.

![Marcode](https://img.shields.io/badge/Marcode-Plagiarism%20Detector-teal)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Python](https://img.shields.io/badge/Python-3.9+-green)
![C++](https://img.shields.io/badge/C++-WASM-orange)

> **Implementation note:** The browser currently uses a token-overlap fallback for several similarity metrics. The C++ engine is included separately; its WebAssembly integration is unfinished. Scores should be treated as exploratory signals.

## ✨ Features

- **Multiple Similarity Algorithms**: Fingerprint matching, LCS, Levenshtein distance, and structural analysis
- **Side-by-Side Code Comparison**: Visual diff viewer with highlighted matching sections
- **PDF Report Export**: Generate comprehensive plagiarism reports with code snippets
- **Performance Optimized**: Token caching, parallel computation, file size validation
- **User-Friendly UI**: Clean, minimal interface with progress indicators and tooltips
- **Error Handling**: Comprehensive validation and error boundaries
- **Language Support**: Python and C++ code files

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ File Upload  │→ │ Normalization│→ │ Tokenization │       │
│  └──────────────┘  └──────────────┘  └──────────────┘       │
│                              ↓                              │
│                    ┌──────────────────┐                     │
│                    │  WASM Engine     │                     │
│                    │ (Similarity Calc)│                     │
│                    └──────────────────┘                     │
│                              ↓                              │
│              ┌──────────────────────────────┐               │
│              │Results Display+ Visualization│               │
│              └──────────────────────────────┘               │
└─────────────────────────────────────────────────────────────┘
                              ↑
                    ┌──────────────────┐
                    │  Python Backend  │
                    │ (Normalizer/API) │
                    └──────────────────┘
```

### Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 14 + React + TypeScript | UI/UX and user interaction |
| **Styling** | TailwindCSS | Modern, responsive design |
| **Similarity Engine** | C++ → WebAssembly | High-performance similarity calculations |
| **Normalization** | Python 3.9+ | Code parsing and tokenization |
| **PDF Export** | jsPDF | Client-side report generation |
| **Hosting** | Vercel | Serverless deployment |

## 📂 Project Structure

```
marcode/
 ├─ frontend/              # Next.js application
 │   ├─ pages/            # Next.js pages (index, compare)
 │   ├─ components/       # React components
 │   │   ├─ CodeDiffViewer.tsx
 │   │   ├─ FileUpload.tsx
 │   │   ├─ ResultsDisplay.tsx
 │   │   ├─ ReportExport.tsx
 │   │   ├─ ProgressIndicator.tsx
 │   │   ├─ ErrorBoundary.tsx
 │   │   └─ ...
 │   ├─ utils/           # Utility functions
 │   │   ├─ apiClient.ts
 │   │   ├─ wasmLoader.ts
 │   │   ├─ tokenCache.ts
 │   │   ├─ fileValidator.ts
 │   │   └─ matchMapper.ts
 │   ├─ public/wasm/     # WASM build outputs
 │   └─ styles/          # Global styles
 ├─ backend/             # Python backend
 │   ├─ parser/          # Code parsing & normalization
 │   │   ├─ normalize.py
 │   │   └─ tokenize.py
 │   └─ api/             # Serverless API endpoints
 │       └─ compare.py
 ├─ engine/              # C++ similarity engine
 │   ├─ src/            # C++ source files
 │   │   ├─ main.cpp
 │   │   ├─ similarity.cpp/hpp
 │   │   ├─ fingerprint.cpp/hpp
 │   │   └─ utils.hpp
 │   ├─ build.sh        # Emscripten build script
 │   └─ Makefile        # Local build system
 ├─ examples/            # Example files and usage demos
 │   ├─ example_usage.py
 │   ├─ example_tokens1.json
 │   ├─ example_tokens2.json
 │   └─ README.md
 ├─ tests/              # Test files
 │   ├─ test_normalize.py
 │   ├─ test_tokenize.py
 │   ├─ test_similarity.cpp
 │   └─ test_fingerprint.cpp
 ├─ vercel.json         # Vercel deployment config
 ├─ .gitignore          # Git ignore rules
 └─ README.md
```

## 🔥 Plagiarism Detection Algorithms

### 1. Preprocessing & Normalization
- Remove comments (`#`, `//`, `/* */`, docstrings)
- Normalize variable/function/class names (`var_1`, `func_1`, `class_1`)
- Trim whitespace and formatting

### 2. Text-Based Similarity
- **Levenshtein Distance**: Edit distance between token sequences
- **LCS (Longest Common Subsequence)**: Longest matching token sequence

### 3. Fingerprinting + Hashing
- **K-gram Generation**: Convert tokens to k-grams (default k=5)
- **Rolling Hash**: Rabin-Karp style hash for k-grams
- **Winnowing Algorithm**: Select representative fingerprints (window size=4)

### 4. Code Structural Similarity
- Keyword frequency comparison
- Token bigram pattern matching
- Operator/pattern analysis

### 5. Final Score Calculation
```
Final Score = 0.4×Fingerprint + 0.3×LCS + 0.2×Levenshtein + 0.1×Structural
```

**Risk Levels:**
- **High Risk (≥80%)**: Likely plagiarism detected
- **Medium Risk (50-79%)**: Moderate similarity
- **Low Risk (<50%)**: Minimal or no similarity

## 📝 Usage

1. **Upload Files**: Select two Python or C++ files to compare
2. **Auto-Detection**: Language is automatically detected (can be manually changed)
3. **Compare**: Click "Compare Code" button
4. **View Results**: 
   - Similarity scores for each algorithm
   - Final weighted score with risk assessment
   - Side-by-side code diff viewer
   - PDF report export

### File Limits
- **Warning**: Files > 300 lines (processing may take longer)
- **Maximum**: 1500 lines per file
- **Supported Types**: `.py`, `.cpp`, `.h`, `.hpp`

## 📊 Performance Optimizations

- **Token Caching**: Avoids re-processing unchanged files (5-minute TTL)
- **Parallel Computation**: Similarity calculations run in parallel
- **File Size Validation**: Rejects files > 1500 lines
- **Lazy Loading**: Components loaded on-demand
- **Batch Operations**: WASM calls batched for efficiency

## 🛡️ Error Handling

- **File Validation**: Checks file type, size, and content
- **Error Boundaries**: React error boundaries catch UI errors
- **Empty File Detection**: Warns user about empty files
- **WASM Fallbacks**: Graceful degradation if WASM fails to load
- **API Error Handling**: Comprehensive try-catch with user-friendly messages

## 📄 License

[To be determined]

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For questions or issues, please open an issue on GitHub.

---

**Built with ❤️ using Next.js, WebAssembly, and Python**
