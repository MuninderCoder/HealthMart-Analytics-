#ifndef NODESETGENERATOR_H
#define NODESETGENERATOR_H

#include <unordered_map>
#include <string>
#include "NodeSet.h"
#include "PPCTree.h"

class NodeSetGenerator {
public:
    static std::unordered_map<std::string, NodeSet> generateNodeSets(const PPCTree& tree);
    static void printAllNodeSets(const std::unordered_map<std::string, NodeSet>& nodeSets);
};

#endif
