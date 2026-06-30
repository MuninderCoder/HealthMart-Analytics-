cmake_minimum_required(VERSION 3.10)
project(HealthMart_Mining_Engine CXX)

set(CMAKE_CXX_STANDARD 14)
set(CMAKE_CXX_STANDARD_REQUIRED ON)

include_directories(include)

# Executable for mining engine
add_executable(mining_engine
    src/main.cpp
    src/TransactionDatabase.cpp
    src/FileParser.cpp
    src/PPCTreeNode.cpp
    src/PPCTree.cpp
    src/TreeTraversal.cpp
    src/NodeSet.cpp
    src/NodeSetGenerator.cpp
    src/DiffNodeSet.cpp
    src/DiffNodeSetGenerator.cpp
    src/SupportCalculator.cpp
    src/MiningEngine.cpp
    src/FrequentItemsetGenerator.cpp
    src/RuleGenerator.cpp
)

# Executable for unit tests
add_executable(run_tests
    tests/test_main.cpp
    tests/test_parser.cpp
    tests/test_database.cpp
    tests/test_tree.cpp
    tests/test_traversal.cpp
    tests/test_nodeset.cpp
    tests/test_diffnodeset.cpp
    src/TransactionDatabase.cpp
    src/FileParser.cpp
    src/PPCTreeNode.cpp
    src/PPCTree.cpp
    src/TreeTraversal.cpp
    src/NodeSet.cpp
    src/NodeSetGenerator.cpp
    src/DiffNodeSet.cpp
    src/DiffNodeSetGenerator.cpp
    src/SupportCalculator.cpp
    src/MiningEngine.cpp
    src/FrequentItemsetGenerator.cpp
    src/RuleGenerator.cpp
)
