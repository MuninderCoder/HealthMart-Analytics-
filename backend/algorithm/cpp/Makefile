CXX = g++
CXXFLAGS = -std=c++14 -O2 -Wall -Wextra -Iinclude

SRCS = src/TransactionDatabase.cpp src/FileParser.cpp src/PPCTreeNode.cpp src/PPCTree.cpp \
       src/TreeTraversal.cpp src/NodeSet.cpp src/NodeSetGenerator.cpp src/DiffNodeSet.cpp \
       src/DiffNodeSetGenerator.cpp src/SupportCalculator.cpp src/MiningEngine.cpp \
       src/FrequentItemsetGenerator.cpp src/RuleGenerator.cpp

TEST_SRCS = tests/test_main.cpp tests/test_parser.cpp tests/test_database.cpp \
            tests/test_tree.cpp tests/test_traversal.cpp tests/test_nodeset.cpp \
            tests/test_diffnodeset.cpp tests/test_mining.cpp

all: mining_engine run_tests

mining_engine: src/main.cpp $(SRCS)
	$(CXX) $(CXXFLAGS) src/main.cpp $(SRCS) -o mining_engine

run_tests: $(TEST_SRCS) $(SRCS)
	$(CXX) $(CXXFLAGS) $(TEST_SRCS) $(SRCS) -o run_tests

test: run_tests
	./run_tests

clean:
	rm -f mining_engine mining_engine.exe run_tests run_tests.exe
