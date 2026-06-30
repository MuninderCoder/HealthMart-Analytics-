#include "../include/FrequentItemsetGenerator.h"
#include "../include/DiffNodeSetGenerator.h"
#include "../include/SupportCalculator.h"
#include <algorithm>
#include <iostream>

FrequentItemsetGenerator::FrequentItemsetGenerator(
    const std::unordered_map<std::string, NodeSet>& nodeSets,
    const std::vector<std::string>& frequentItems,
    int minSupport,
    int totalTransactions
) : nodeSets_(nodeSets), frequentItems_(frequentItems), minSupport_(minSupport), totalTransactions_(totalTransactions) {}

void FrequentItemsetGenerator::run() {
    auto startTime = std::chrono::high_resolution_clock::now();
    
    // Clear old results
    frequentItemsets_.clear();
    stats_ = MiningStats();
    stats_.maxLevel = 1;

    // 1. Add 1-itemsets (these are already frequent)
    for (const auto& item : frequentItems_) {
        auto it = nodeSets_.find(item);
        if (it != nodeSets_.end()) {
            frequentItemsets_.push_back(FrequentItemset({item}, it->second.support()));
            stats_.totalFrequent++;
        }
    }

    // 2. Generate 2-itemsets and group by prefix
    // For each frequent item e_i, we keep a list of suffix items e_j that form frequent 2-itemsets
    std::unordered_map<std::string, std::vector<SuffixItem>> equivalenceClasses;
    
    for (size_t i = 0; i < frequentItems_.size(); ++i) {
        const std::string& itemX = frequentItems_[i];
        auto itX = nodeSets_.find(itemX);
        if (itX == nodeSets_.end()) continue;
        int supportX = itX->second.support();

        for (size_t j = i + 1; j < frequentItems_.size(); ++j) {
            const std::string& itemY = frequentItems_[j];
            auto itY = nodeSets_.find(itemY);
            if (itY == nodeSets_.end()) continue;

            stats_.totalCandidates++;
            
            // Generate 2-itemset DiffNodeSet
            DiffNodeSet dns = DiffNodeSetGenerator::generate2Itemset(itemX, itemY, itX->second, itY->second, supportX);
            int sup = dns.getSupport();

            if (SupportCalculator::isFrequent(sup, minSupport_)) {
                frequentItemsets_.push_back(FrequentItemset({itemX, itemY}, sup));
                stats_.totalFrequent++;
                
                // Group under itemX as prefix
                SuffixItem suffix;
                suffix.item = itemY;
                suffix.diffNodeSet = dns;
                suffix.support = sup;
                equivalenceClasses[itemX].push_back(suffix);
                
                stats_.maxLevel = std::max(stats_.maxLevel, 2);
            } else {
                stats_.prunedCandidates++;
            }
        }
    }

    // 3. Recursive mining for k >= 3
    for (const auto& item : frequentItems_) {
        auto it = equivalenceClasses.find(item);
        if (it != equivalenceClasses.end()) {
            // Suffix items must be sorted by frequency-descending order to remain consistent.
            // Since frequentItems_ is sorted, suffixes are naturally in this order because we iterated j from i+1.
            mineRec({item}, it->second, 2);
        }
    }

    auto endTime = std::chrono::high_resolution_clock::now();
    stats_.miningTimeMs = std::chrono::duration<double, std::milli>(endTime - startTime).count();
}

void FrequentItemsetGenerator::mineRec(
    const std::vector<std::string>& prefix,
    const std::vector<SuffixItem>& suffixItems,
    int level
) {
    if (suffixItems.size() < 2) return;

    for (size_t i = 0; i < suffixItems.size() - 1; ++i) {
        const auto& suffixI = suffixItems[i];
        std::vector<SuffixItem> nextSuffixes;

        for (size_t j = i + 1; j < suffixItems.size(); ++j) {
            const auto& suffixJ = suffixItems[j];
            
            // Build candidate itemset
            std::vector<std::string> candItemset = prefix;
            candItemset.push_back(suffixI.item);
            candItemset.push_back(suffixJ.item);
            
            // Canonical sorting
            std::sort(candItemset.begin(), candItemset.end());

            stats_.totalCandidates++;

            // Join DiffNodeSets
            // First parent: prefix U {suffixI.item}
            // Second parent: prefix U {suffixJ.item}
            DiffNodeSet dns = DiffNodeSetGenerator::generateKItemset(
                candItemset,
                suffixI.diffNodeSet,
                suffixJ.diffNodeSet,
                suffixI.support
            );
            
            int sup = dns.getSupport();

            if (SupportCalculator::isFrequent(sup, minSupport_)) {
                frequentItemsets_.push_back(FrequentItemset(candItemset, sup));
                stats_.totalFrequent++;

                SuffixItem nextSuffix;
                nextSuffix.item = suffixJ.item;
                nextSuffix.diffNodeSet = dns;
                nextSuffix.support = sup;
                nextSuffixes.push_back(nextSuffix);
                
                stats_.maxLevel = std::max(stats_.maxLevel, level + 1);
            } else {
                stats_.prunedCandidates++;
            }
        }

        if (!nextSuffixes.empty()) {
            std::vector<std::string> nextPrefix = prefix;
            nextPrefix.push_back(suffixI.item);
            mineRec(nextPrefix, nextSuffixes, level + 1);
        }
    }
}

const std::vector<FrequentItemset>& FrequentItemsetGenerator::getFrequentItemsets() const {
    return frequentItemsets_;
}

const MiningStats& FrequentItemsetGenerator::getStats() const {
    return stats_;
}
