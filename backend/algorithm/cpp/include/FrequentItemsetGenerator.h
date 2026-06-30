#ifndef FREQUENTITEMSETGENERATOR_H
#define FREQUENTITEMSETGENERATOR_H

#include <vector>
#include <string>
#include <unordered_map>
#include <chrono>
#include "FrequentItemset.h"
#include "NodeSet.h"
#include "DiffNodeSet.h"

struct MiningStats {
    double miningTimeMs = 0.0;
    int totalCandidates = 0;
    int totalFrequent = 0;
    int prunedCandidates = 0;
    int maxLevel = 0;
};

class FrequentItemsetGenerator {
private:
    std::unordered_map<std::string, NodeSet> nodeSets_;
    std::vector<std::string> frequentItems_;
    int minSupport_;
    int totalTransactions_;
    
    std::vector<FrequentItemset> frequentItemsets_;
    MiningStats stats_;

public:
    FrequentItemsetGenerator(
        const std::unordered_map<std::string, NodeSet>& nodeSets,
        const std::vector<std::string>& frequentItems,
        int minSupport,
        int totalTransactions
    );

    void run();

    const std::vector<FrequentItemset>& getFrequentItemsets() const;
    const MiningStats& getStats() const;

private:
    // Suffix representation for recursive classes
    struct SuffixItem {
        std::string item;
        DiffNodeSet diffNodeSet;
        int support;
    };

    void mine2Itemsets(std::vector<SuffixItem>& level2Suffixes);

    void mineRec(
        const std::vector<std::string>& prefix,
        const std::vector<SuffixItem>& suffixItems,
        int level
    );
};

#endif
