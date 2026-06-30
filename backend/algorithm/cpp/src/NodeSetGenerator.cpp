#include "../include/NodeSetGenerator.h"
#include <algorithm>
#include <iostream>

std::unordered_map<std::string, NodeSet> NodeSetGenerator::generateNodeSets(const PPCTree& tree) {
    std::unordered_map<std::string, NodeSet> nodeSets;
    const auto& headerTable = tree.getHeaderTable();

    for (const auto& pair : headerTable) {
        const std::string& item = pair.first;
        const auto& nodeList = pair.second;
        
        NodeSet ns(item);
        for (const auto* node : nodeList) {
            ns.addEntry(node->preOrder, node->postOrder, node->count);
        }
        
        // Sort entries by preOrder ascending for efficiency in ancestor checking
        auto& entries = const_cast<std::vector<NodeSetEntry>&>(ns.getEntries());
        std::sort(entries.begin(), entries.end(), [](const NodeSetEntry& a, const NodeSetEntry& b) {
            return a.preOrder < b.preOrder;
        });

        nodeSets[item] = ns;
    }
    
    return nodeSets;
}

void NodeSetGenerator::printAllNodeSets(const std::unordered_map<std::string, NodeSet>& nodeSets) {
    std::cout << "\n--- Generated NodeSets ---" << std::endl;
    for (const auto& pair : nodeSets) {
        pair.second.print();
    }
    std::cout << "--------------------------\n" << std::endl;
}
