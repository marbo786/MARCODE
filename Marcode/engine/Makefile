# Makefile for building the similarity engine

CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -O2

# Directories
SRC_DIR = src
TEST_DIR = ../tests
BUILD_DIR = build

# Source files
SIMILARITY_SRC = $(SRC_DIR)/similarity.cpp
FINGERPRINT_SRC = $(SRC_DIR)/fingerprint.cpp
MAIN_SRC = $(SRC_DIR)/main.cpp

# Object files
SIMILARITY_OBJ = $(BUILD_DIR)/similarity.o
FINGERPRINT_OBJ = $(BUILD_DIR)/fingerprint.o
MAIN_OBJ = $(BUILD_DIR)/main.o

# Targets
all: $(BUILD_DIR)/similarity_engine

# Main executable
$(BUILD_DIR)/similarity_engine: $(BUILD_DIR) $(SIMILARITY_OBJ) $(FINGERPRINT_OBJ) $(MAIN_OBJ)
	$(CXX) $(CXXFLAGS) -o $@ $(SIMILARITY_OBJ) $(FINGERPRINT_OBJ) $(MAIN_OBJ)

# Object files
$(BUILD_DIR)/similarity.o: $(SIMILARITY_SRC) $(SRC_DIR)/similarity.hpp
	$(CXX) $(CXXFLAGS) -c -o $@ $(SIMILARITY_SRC)

$(BUILD_DIR)/fingerprint.o: $(FINGERPRINT_SRC) $(SRC_DIR)/fingerprint.hpp
	$(CXX) $(CXXFLAGS) -c -o $@ $(FINGERPRINT_SRC)

$(BUILD_DIR)/main.o: $(MAIN_SRC) $(SRC_DIR)/similarity.hpp $(SRC_DIR)/fingerprint.hpp
	$(CXX) $(CXXFLAGS) -c -o $@ $(MAIN_SRC)

# Create build directory
$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

# Test targets
test-similarity: $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -o $(BUILD_DIR)/test_similarity $(TEST_DIR)/test_similarity.cpp $(SIMILARITY_SRC)
	$(BUILD_DIR)/test_similarity

test-fingerprint: $(BUILD_DIR)
	$(CXX) $(CXXFLAGS) -o $(BUILD_DIR)/test_fingerprint $(TEST_DIR)/test_fingerprint.cpp $(FINGERPRINT_SRC)
	$(BUILD_DIR)/test_fingerprint

test: test-similarity test-fingerprint

# Clean
clean:
	rm -rf $(BUILD_DIR)

.PHONY: all test test-similarity test-fingerprint clean

