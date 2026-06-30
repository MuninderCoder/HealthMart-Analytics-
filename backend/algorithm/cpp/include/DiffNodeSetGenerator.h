#ifndef DIFFNODESETGENERATOR_H
#define DIFFNODESETGENERATOR_H

#include <vector>
#include <string>
#include <unordered_map>
#include "NodeSet.h"
#include "DiffNodeSet.h"

class DiffNodeSetGenerator {
public:
    static DiffNodeSet generate2Itemset(
        const std::string& itemX,
        const std::string& itemY,
        const NodeSet& nodeSetX,
        const NodeSet& nodeSetY,
        int supportX
    );

    static DiffNodeSet generateKItemset(
        const std::vector<std::string>& mergedItemset,
        const DiffNodeSet& diffNodeSetX,
        const DiffNodeSet& diffNodeSetY,
        int supportX
    );

    static std::vector<DiffNodeSet> generateAll2Itemsets(
        const std::vector<std::string>& frequentItems,
        const std::unordered_map<std::string, NodeSet>& nodeSets,
        int minSupport
    );

private:
    static bool isAncestor(const NodeSetEntry& a, const NodeSetEntry& b);
    static bool isAncestor(const DiffNode& a, const DiffNode& b);
};

#endif
