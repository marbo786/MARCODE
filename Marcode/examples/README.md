# Examples

This directory contains example files for testing and understanding the Marcode plagiarism detection system.

## Files

- **example_usage.py**: Demonstrates how to use the normalization and tokenization modules
- **example_tokens1.json**: Sample token file 1 for testing the similarity engine
- **example_tokens2.json**: Sample token file 2 for testing the similarity engine

## Usage

### Running the example script

```bash
# From the project root
cd examples
python example_usage.py
```

### Testing the similarity engine with example tokens

```bash
# From the engine directory (if you've built the C++ engine)
cd ../engine
make
./build/similarity_engine ../examples/example_tokens1.json ../examples/example_tokens2.json
```

