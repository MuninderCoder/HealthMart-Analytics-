#ifndef MININGENGINE_H
#define MININGENGINE_H

#include <string>
#include <vector>
#include <unordered_map>
#include "TransactionDatabase.h"
#include "PPCTree.h"
#include "NodeSet.h"
#include "DiffNodeSet.h"

struct EngineStats {
    int transactionCount = 0;
    int uniqueItems = 0;
    int frequentItems = 0;
    int treeNodeCount = 0;
    int treeDepth = 0;
    int nodeSetCount = 0;
    int diffNodeSetCount = 0;
    
    double parseTimeMs = 0.0;
    double treeTimeMs = 0.0;
    double nodeSetTimeMs = 0.0;
    double diffNodeSetTimeMs = 0.0;
    double totalTimeMs = 0.0;
};

#include "FrequentItemset.h"
#include "AssociationRule.h"
#include "FrequentItemsetGenerator.h"

class MiningEngine {
private:
    TransactionDatabase db_;
    PPCTree tree_;
    std::unordered_map<std::string, NodeSet> nodeSets_;
    std::vector<DiffNodeSet> diffNodeSets_;
    
    // Mined results
    std::vector<FrequentItemset> frequentItemsets_;
    std::vector<AssociationRule> rules_;
    
    double minSupportPct_;
    int minSupport_;
    double minConfidence_;
    
    EngineStats stats_;
    MiningStats miningStats_;

public:
    MiningEngine();

    // Run the full pipeline with percentage support and confidence
    std::string run(const std::string& inputPath, double minSupportPct, double minConfidence);

    // Get statistics
    const EngineStats& getStats() const;
    const MiningStats& getMiningStats() const;

    // Get results
    const std::vector<DiffNodeSet>& getDiffNodeSets() const;
    const std::vector<FrequentItemset>& getFrequentItemsets() const;
    const std::vector<AssociationRule>& getRules() const;

    // Print readable console output
    void printResults() const;

private:
    void parseInput(const std::string& inputPath);
    void buildPPCTree();
    void generateNodeSets();
    void generateDiffNodeSets();
    void runFrequentItemsetMining();
    void runAssociationRuleGeneration();
    
    // Manual JSON serialization to stdout/string
    std::string toJSON() const;
};


#endif
