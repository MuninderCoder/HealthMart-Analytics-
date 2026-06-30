#include "../include/MiningEngine.h"
#include "../include/FileParser.h"
#include "../include/TreeTraversal.h"
#include "../include/NodeSetGenerator.h"
#include "../include/DiffNodeSetGenerator.h"
#include "../include/RuleGenerator.h"
#include <chrono>
#include <iostream>
#include <sstream>
#include <iomanip>
#include <cmath>

MiningEngine::MiningEngine() : minSupportPct_(0.0), minSupport_(1), minConfidence_(0.0) {}

std::string MiningEngine::run(const std::string& inputPath, double minSupportPct, double minConfidence) {
    minSupportPct_ = minSupportPct;
    minConfidence_ = minConfidence;
    
    auto startTotal = std::chrono::high_resolution_clock::now();
    
    // 1. Parse Input
    auto start = std::chrono::high_resolution_clock::now();
    parseInput(inputPath);
    auto end = std::chrono::high_resolution_clock::now();
    stats_.parseTimeMs = std::chrono::duration<double, std::milli>(end - start).count();

    // Calculate actual min support count (integer)
    minSupport_ = std::max(1, static_cast<int>(std::ceil(minSupportPct_ * db_.size())));

    // 2. Build PPC Tree & Number Nodes
    start = std::chrono::high_resolution_clock::now();
    buildPPCTree();
    end = std::chrono::high_resolution_clock::now();
    stats_.treeTimeMs = std::chrono::duration<double, std::milli>(end - start).count();

    // 3. Generate 1-Itemset NodeSets
    start = std::chrono::high_resolution_clock::now();
    generateNodeSets();
    end = std::chrono::high_resolution_clock::now();
    stats_.nodeSetTimeMs = std::chrono::duration<double, std::milli>(end - start).count();

    // 4. Generate 2-Itemset DiffNodeSets (for local headerTable-level debug)
    start = std::chrono::high_resolution_clock::now();
    generateDiffNodeSets();
    end = std::chrono::high_resolution_clock::now();
    stats_.diffNodeSetTimeMs = std::chrono::duration<double, std::milli>(end - start).count();
    
    // 5. Recursive Frequent Itemset Mining
    runFrequentItemsetMining();

    // 6. Association Rule Generation
    runAssociationRuleGeneration();

    auto endTotal = std::chrono::high_resolution_clock::now();
    stats_.totalTimeMs = std::chrono::duration<double, std::milli>(endTotal - startTotal).count();

    return toJSON();
}

void MiningEngine::parseInput(const std::string& inputPath) {
    db_ = FileParser::parseFile(inputPath);
    db_.buildFrequencyTable();
    db_.sortByFrequency();
    
    stats_.transactionCount = static_cast<int>(db_.size());
}

void MiningEngine::buildPPCTree() {
    tree_.buildTree(db_, minSupport_);
    TreeTraversal::assignNumbers(tree_);
    
    stats_.treeNodeCount = tree_.getNodeCount();
    stats_.treeDepth = tree_.getDepth();
}

void MiningEngine::generateNodeSets() {
    nodeSets_ = NodeSetGenerator::generateNodeSets(tree_);
    stats_.nodeSetCount = static_cast<int>(nodeSets_.size());
    stats_.frequentItems = static_cast<int>(nodeSets_.size());
}

void MiningEngine::generateDiffNodeSets() {
    std::vector<std::string> frequentItems = db_.getFrequentItems(minSupport_);
    diffNodeSets_ = DiffNodeSetGenerator::generateAll2Itemsets(frequentItems, nodeSets_, minSupport_);
    stats_.diffNodeSetCount = static_cast<int>(diffNodeSets_.size());
}

void MiningEngine::runFrequentItemsetMining() {
    std::vector<std::string> frequentItems = db_.getFrequentItems(minSupport_);
    FrequentItemsetGenerator gen(nodeSets_, frequentItems, minSupport_, stats_.transactionCount);
    gen.run();
    
    frequentItemsets_ = gen.getFrequentItemsets();
    miningStats_ = gen.getStats();
}

void MiningEngine::runAssociationRuleGeneration() {
    RuleGenerator gen(frequentItemsets_, stats_.transactionCount, minConfidence_);
    gen.run();
    
    rules_ = gen.getRules();
}

const EngineStats& MiningEngine::getStats() const {
    return stats_;
}

const MiningStats& MiningEngine::getMiningStats() const {
    return miningStats_;
}

const std::vector<DiffNodeSet>& MiningEngine::getDiffNodeSets() const {
    return diffNodeSets_;
}

const std::vector<FrequentItemset>& MiningEngine::getFrequentItemsets() const {
    return frequentItemsets_;
}

const std::vector<AssociationRule>& MiningEngine::getRules() const {
    return rules_;
}

std::string MiningEngine::toJSON() const {
    std::stringstream ss;
    ss << std::fixed << std::setprecision(4);
    
    ss << "{\n";
    ss << "  \"status\": \"completed\",\n";
    ss << "  \"algorithm\": \"DiffNodeset\",\n";
    ss << "  \"executionTime\": \"" << stats_.totalTimeMs << " ms\",\n";
    
    // Estimate memory usage (portable, realistic calculation of C++ data structures)
    size_t memoryBytes = 0;
    
    // Transactions database memory
    for (const auto& tx : db_.getTransactions()) {
        memoryBytes += sizeof(Transaction) + tx.items.size() * sizeof(std::string);
        for (const auto& item : tx.items) {
            memoryBytes += item.capacity();
        }
    }
    
    // PPC Tree memory
    memoryBytes += stats_.treeNodeCount * sizeof(PPCTreeNode);
    
    // NodeSets memory
    for (const auto& pair : nodeSets_) {
        memoryBytes += pair.first.capacity() + sizeof(NodeSet) + pair.second.size() * sizeof(NodeSetEntry);
    }
    
    // DiffNodeSets memory
    for (const auto& dns : diffNodeSets_) {
        memoryBytes += sizeof(DiffNodeSet) + dns.getItemset().size() * sizeof(std::string) + dns.size() * sizeof(DiffNode);
    }
    
    // Frequent itemsets and rules memory
    memoryBytes += frequentItemsets_.size() * sizeof(FrequentItemset);
    memoryBytes += rules_.size() * sizeof(AssociationRule);
    
    double memoryKB = static_cast<double>(memoryBytes) / 1024.0;
    ss << "  \"memoryUsage\": \"" << memoryKB << " KB\",\n";
    
    ss << "  \"totalFrequentItemsets\": " << frequentItemsets_.size() << ",\n";
    ss << "  \"totalRules\": " << rules_.size() << ",\n";
    
    // Stats details
    ss << "  \"stats\": {\n";
    ss << "    \"transactionCount\": " << stats_.transactionCount << ",\n";
    ss << "    \"frequentItems\": " << stats_.frequentItems << ",\n";
    ss << "    \"treeNodeCount\": " << stats_.treeNodeCount << ",\n";
    ss << "    \"treeDepth\": " << stats_.treeDepth << ",\n";
    ss << "    \"nodeSetCount\": " << stats_.nodeSetCount << ",\n";
    ss << "    \"diffNodeSetCount\": " << stats_.diffNodeSetCount << ",\n";
    ss << "    \"candidatesCount\": " << miningStats_.totalCandidates << ",\n";
    ss << "    \"prunedCount\": " << miningStats_.prunedCandidates << ",\n";
    ss << "    \"maxLevel\": " << miningStats_.maxLevel << ",\n";
    ss << "    \"parseTimeMs\": " << stats_.parseTimeMs << ",\n";
    ss << "    \"treeTimeMs\": " << stats_.treeTimeMs << ",\n";
    ss << "    \"nodeSetTimeMs\": " << stats_.nodeSetTimeMs << ",\n";
    ss << "    \"diffNodeSetTimeMs\": " << stats_.diffNodeSetTimeMs << ",\n";
    ss << "    \"miningTimeMs\": " << miningStats_.miningTimeMs << ",\n";
    ss << "    \"totalTimeMs\": " << stats_.totalTimeMs << "\n";
    ss << "  },\n";

    // Itemsets list
    ss << "  \"itemsets\": [\n";
    for (size_t i = 0; i < frequentItemsets_.size(); ++i) {
        const auto& fi = frequentItemsets_[i];
        if (i > 0) ss << ",\n";
        ss << "    {\n";
        ss << "      \"itemset\": [";
        for (size_t j = 0; j < fi.items.size(); ++j) {
            if (j > 0) ss << ", ";
            ss << "\"" << fi.items[j] << "\"";
        }
        ss << "],\n";
        ss << "      \"support\": " << fi.support << ",\n";
        
        double pct = (stats_.transactionCount > 0) ? (static_cast<double>(fi.support) / stats_.transactionCount) : 0.0;
        ss << "      \"supportPct\": " << pct << ",\n";
        ss << "      \"level\": " << fi.items.size() << "\n";
        ss << "    }";
    }
    ss << "\n  ],\n";

    // Association rules list
    ss << "  \"associationRules\": [\n";
    for (size_t i = 0; i < rules_.size(); ++i) {
        const auto& rule = rules_[i];
        if (i > 0) ss << ",\n";
        ss << "    {\n";
        ss << "      \"antecedent\": [";
        for (size_t j = 0; j < rule.antecedent.size(); ++j) {
            if (j > 0) ss << ", ";
            ss << "\"" << rule.antecedent[j] << "\"";
        }
        ss << "],\n";
        
        ss << "      \"consequent\": [";
        for (size_t j = 0; j < rule.consequent.size(); ++j) {
            if (j > 0) ss << ", ";
            ss << "\"" << rule.consequent[j] << "\"";
        }
        ss << "],\n";
        
        ss << "      \"supportCount\": " << rule.supportCount << ",\n";
        ss << "      \"support\": " << rule.support << ",\n";
        ss << "      \"confidence\": " << rule.confidence << ",\n";
        ss << "      \"lift\": " << rule.lift << ",\n";
        ss << "      \"leverage\": " << rule.leverage << ",\n";
        ss << "      \"conviction\": " << rule.conviction << "\n";
        ss << "    }";
    }
    ss << "\n  ]\n";
    ss << "}";
    
    return ss.str();
}

void MiningEngine::printResults() const {
    std::cerr << "\n=============================================" << std::endl;
    std::cerr << "         MINING ENGINE EXECUTION SUMMARY      " << std::endl;
    std::cerr << "=============================================" << std::endl;
    std::cerr << "Transactions:      " << stats_.transactionCount << std::endl;
    std::cerr << "Frequent 1-items:  " << stats_.frequentItems << std::endl;
    std::cerr << "PPC Tree Nodes:    " << stats_.treeNodeCount << std::endl;
    std::cerr << "PPC Tree Depth:    " << stats_.treeDepth << std::endl;
    std::cerr << "Frequent Itemsets: " << frequentItemsets_.size() << std::endl;
    std::cerr << "Association Rules: " << rules_.size() << std::endl;
    std::cerr << "Max level reached: " << miningStats_.maxLevel << std::endl;
    std::cerr << "Candidates Gen:    " << miningStats_.totalCandidates << std::endl;
    std::cerr << "Candidates Pruned: " << miningStats_.prunedCandidates << std::endl;
    std::cerr << "---------------------------------------------" << std::endl;
    std::cerr << "Parse Time:        " << stats_.parseTimeMs << " ms" << std::endl;
    std::cerr << "Tree Build Time:   " << stats_.treeTimeMs << " ms" << std::endl;
    std::cerr << "NodeSet Gen Time:  " << stats_.nodeSetTimeMs << " ms" << std::endl;
    std::cerr << "Frequent Gen Time: " << miningStats_.miningTimeMs << " ms" << std::endl;
    std::cerr << "Total Time:        " << stats_.totalTimeMs << " ms" << std::endl;
    std::cerr << "=============================================\n" << std::endl;
}
