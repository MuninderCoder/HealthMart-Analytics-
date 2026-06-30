#include "../include/DiffNodeSetGenerator.h"
#include "../include/SupportCalculator.h"
#include <algorithm>
#include <iostream>

bool DiffNodeSetGenerator::isAncestor(const NodeSetEntry& a, const NodeSetEntry& b) {
    return a.preOrder < b.preOrder && a.postOrder > b.postOrder;
}

bool DiffNodeSetGenerator::isAncestor(const DiffNode& a, const DiffNode& b) {
    return a.preOrder < b.preOrder && a.postOrder > b.postOrder;
}

DiffNodeSet DiffNodeSetGenerator::generate2Itemset(
    const std::string& itemX,
    const std::string& itemY,
    const NodeSet& nodeSetX,
    const NodeSet& nodeSetY,
    int supportX
) {
    std::vector<std::string> itemset = {itemX, itemY};
    std::sort(itemset.begin(), itemset.end());
    
    DiffNodeSet dns(itemset);
    const auto& entriesX = nodeSetX.getEntries();
    const auto& entriesY = nodeSetY.getEntries();

    for (const auto& eX : entriesX) {
        int descendantSum = 0;
        
        // Find descendants of eX in entriesY
        auto it = std::lower_bound(entriesY.begin(), entriesY.end(), eX.preOrder,
            [](const NodeSetEntry& entry, int val) {
                return entry.preOrder < val;
            });
            
        for (; it != entriesY.end(); ++it) {
            if (isAncestor(eX, *it)) {
                descendantSum += it->count;
            }
        }
        
        if (descendantSum < eX.count) {
            dns.addEntry(eX.preOrder, eX.postOrder, eX.count - descendantSum);
        }
    }

    dns.setSupport(supportX - dns.diffCount());
    return dns;
}

DiffNodeSet DiffNodeSetGenerator::generateKItemset(
    const std::vector<std::string>& mergedItemset,
    const DiffNodeSet& diffNodeSetX,
    const DiffNodeSet& diffNodeSetY,
    int supportX
) {
    DiffNodeSet dns(mergedItemset);
    const auto& entriesX = diffNodeSetX.getEntries();
    const auto& entriesY = diffNodeSetY.getEntries();

    for (const auto& eY : entriesY) {
        int ancestorSum = 0;
        
        // Find ancestors of eY in entriesX
        // Since entriesX are sorted by preOrder ascending, we only scan up to eY's preOrder
        for (const auto& eX : entriesX) {
            if (eX.preOrder >= eY.preOrder) {
                break;
            }
            if (isAncestor(eX, eY)) {
                ancestorSum += eX.count;
            }
        }
        
        if (ancestorSum < eY.count) {
            dns.addEntry(eY.preOrder, eY.postOrder, eY.count - ancestorSum);
        }
    }

    dns.setSupport(supportX - dns.diffCount());
    return dns;
}

std::vector<DiffNodeSet> DiffNodeSetGenerator::generateAll2Itemsets(
    const std::vector<std::string>& frequentItems,
    const std::unordered_map<std::string, NodeSet>& nodeSets,
    int minSupport
) {
    std::vector<DiffNodeSet> result;
    
    for (size_t i = 0; i < frequentItems.size(); ++i) {
        const std::string& itemX = frequentItems[i];
        auto itX = nodeSets.find(itemX);
        if (itX == nodeSets.end()) continue;
        
        for (size_t j = i + 1; j < frequentItems.size(); ++j) {
            const std::string& itemY = frequentItems[j];
            auto itY = nodeSets.find(itemY);
            if (itY == nodeSets.end()) continue;
            
            // X is more frequent than Y, so support(X) is the parentSupport
            int supportX = itX->second.support();
            
            DiffNodeSet dns = generate2Itemset(itemX, itemY, itX->second, itY->second, supportX);
            
            if (SupportCalculator::isFrequent(dns.getSupport(), minSupport)) {
                result.push_back(dns);
            }
        }
    }
    
    return result;
}
