#include "../include/RuleGenerator.h"
#include <algorithm>
#include <iostream>
#include <sstream>
#include <cmath>


RuleGenerator::RuleGenerator(
    const std::vector<FrequentItemset>& itemsets,
    int totalTransactions,
    double minConfidence,
    double minLift
) : itemsets_(itemsets), totalTransactions_(totalTransactions), minConfidence_(minConfidence), minLift_(minLift) {
    // Populate the support lookup map
    for (const auto& itemset : itemsets_) {
        supportMap_[serializeItemset(itemset.items)] = itemset.support;
    }
}

std::string RuleGenerator::serializeItemset(const std::vector<std::string>& items) const {
    std::vector<std::string> sorted = items;
    std::sort(sorted.begin(), sorted.end());
    std::stringstream ss;
    for (size_t i = 0; i < sorted.size(); ++i) {
        if (i > 0) ss << ",";
        ss << sorted[i];
    }
    return ss.str();
}

int RuleGenerator::getSupport(const std::vector<std::string>& items) const {
    auto it = supportMap_.find(serializeItemset(items));
    if (it != supportMap_.end()) {
        return it->second;
    }
    return 0;
}

void RuleGenerator::run() {
    rules_.clear();
    if (totalTransactions_ <= 0) return;

    for (const auto& itemset : itemsets_) {
        const auto& items = itemset.items;
        size_t n = items.size();
        if (n < 2) continue;

        int supportY = itemset.support;
        double supportY_frac = static_cast<double>(supportY) / totalTransactions_;

        // Loop through all non-empty proper subsets of Y
        // Y has size n, proper subsets correspond to bitmasks from 1 to (2^n - 2)
        int numSubsets = (1 << n);
        for (int mask = 1; mask < numSubsets - 1; ++mask) {
            std::vector<std::string> antecedent;
            std::vector<std::string> consequent;

            for (size_t b = 0; b < n; ++b) {
                if ((mask & (1 << b)) != 0) {
                    antecedent.push_back(items[b]);
                } else {
                    consequent.push_back(items[b]);
                }
            }

            int supportA = getSupport(antecedent);
            int supportC = getSupport(consequent);

            if (supportA == 0) continue; // Avoid divide by zero

            double confidence = static_cast<double>(supportY) / supportA;

            if (confidence >= minConfidence_) {
                double supportA_frac = static_cast<double>(supportA) / totalTransactions_;
                double supportC_frac = static_cast<double>(supportC) / totalTransactions_;

                double lift = (supportC_frac > 0) ? (confidence / supportC_frac) : 0.0;
                double leverage = supportY_frac - (supportA_frac * supportC_frac);
                double conviction = (1.0 - confidence < 1e-9) ? 999.0 : ((1.0 - supportC_frac) / (1.0 - confidence));

                if (lift >= minLift_) {
                    AssociationRule rule;
                    rule.antecedent = antecedent;
                    rule.consequent = consequent;
                    rule.supportCount = supportY;
                    rule.support = supportY_frac;
                    rule.confidence = confidence;
                    rule.lift = lift;
                    rule.leverage = leverage;
                    rule.conviction = conviction;

                    rules_.push_back(rule);
                }
            }
        }
    }

    // Sort rules by confidence descending, then support descending, then lift descending
    std::sort(rules_.begin(), rules_.end(), [](const AssociationRule& a, const AssociationRule& b) {
        if (std::abs(a.confidence - b.confidence) > 1e-6) {
            return a.confidence > b.confidence;
        }
        if (std::abs(a.support - b.support) > 1e-6) {
            return a.support > b.support;
        }
        return a.lift > b.lift;
    });
}

const std::vector<AssociationRule>& RuleGenerator::getRules() const {
    return rules_;
}
