# HealthMart Mining Engine Foundation (DiffNodeset)

This directory contains the C++ implementation of the core transactional structures, PPC Tree, Pre/Post-order tree traversal numbering, NodeSet generation, and DiffNodeSet construction as specified by the DiffNodeset mining algorithm paper.

## Directory Structure

- `include/`: Header files for all modules.
- `src/`: Core implementation files.
- `tests/`: Extensive unit tests.
- `Makefile`: Build instructions for g++ and mingw32-make.
- `CMakeLists.txt`: Build instructions for CMake.

## Classes Implemented

1. **Transaction & TransactionDatabase**: Efficient representation and sorting of transactions.
2. **FileParser**: CSV, TXT, and custom JSON parsers.
3. **PPCTreeNode & PPCTree**: Construction of the PPC Tree.
4. **TreeTraversal**: Preorder and postorder numbering of the tree.
5. **NodeSet & NodeSetGenerator**: Extraction of NodeSets for frequent 1-itemsets.
6. **DiffNodeSet & DiffNodeSetGenerator**: Optimized ancestor-relation checking and generation of DiffNodeSets for 2-itemsets and candidate k-itemsets.
7. **SupportCalculator**: Support calculation formula from DiffNodeSets.
8. **MiningEngine**: Pipeline orchestrator and JSON output serializer.

## Build and Run

```bash
# Build the binaries (mining_engine.exe and run_tests.exe)
mingw32-make -C backend/algorithm/cpp all

# Run unit tests
mingw32-make -C backend/algorithm/cpp test
```

## JSON Output Structure

The `mining_engine` writes the generated stats and DiffNodeSets directly to standard output as a structured JSON object.
