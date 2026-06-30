#ifndef RULEGENERATOR_H
#define RULEGENERATOR_H

#include <vector>
#include <string>
#include <unordered_map>
#include "AssociationRule.h"
#include "FrequentItemset.h"

class RuleGenerator {
private:
    std::vector<FrequentItemset> itemsets_;
    int totalTransactions_;
    double minConfidence_;
    double minLift_;
    
    std::vector<AssociationRule> rules_;
    std::unordered_map<std::string, int> supportMap_; // Key: serialized itemset, Value: support count

public:
    RuleGenerator(
        const std::vector<FrequentItemset>& itemsets,
        int totalTransactions,
        double minConfidence,
        double minLift = 0.0
    );

    void run();

    const std::vector<AssociationRule>& getRules() const;

private:
    std::string serializeItemset(const std::vector<std::string>& items) const;
    int getSupport(const std::vector<std::string>& items) const;
};

#endif
