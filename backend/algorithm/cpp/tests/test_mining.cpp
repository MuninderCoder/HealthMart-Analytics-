#include "../include/FrequentItemsetGenerator.h"
#include "../include/RuleGenerator.h"
#include "../include/PPCTree.h"
#include "../include/TreeTraversal.h"
#include "../include/NodeSetGenerator.h"
#include <iostream>
#include <cassert>
#include <cmath>

static bool doubleEquals(double a, double b, double epsilon = 1e-4) {
    return std::abs(a - b) < epsilon;
}

void run_mining_tests() {
    std::cout << "Running FrequentItemset and AssociationRule tests..." << std::endl;

    // Dataset:
    // T1: A, B, C
    // T2: A, B
    // T3: A, C
    TransactionDatabase db;
    db.addTransaction(Transaction(1, {"A", "B", "C"}));
    db.addTransaction(Transaction(2, {"A", "B"}));
    db.addTransaction(Transaction(3, {"A", "C"}));
    db.buildFrequencyTable();
    db.sortByFrequency();

    PPCTree tree;
    tree.buildTree(db, 2); // minSupportCount = 2
    TreeTraversal::assignNumbers(tree);

    auto nodeSets = NodeSetGenerator::generateNodeSets(tree);
    std::vector<std::string> freqItems = {"A", "B", "C"};

    // 1. Test Frequent Itemset Mining
    FrequentItemsetGenerator gen(nodeSets, freqItems, 2, 3);
    gen.run();

    const auto& itemsets = gen.getFrequentItemsets();
    // Frequent itemsets should be:
    // {A} (support 3)
    // {B} (support 2)
    // {C} (support 2)
    // {A, B} (support 2)
    // {A, C} (support 2)
    assert(itemsets.size() == 5);

    bool foundAB = false;
    bool foundAC = false;
    for (const auto& fi : itemsets) {
        if (fi.items.size() == 2) {
            if (fi.items[0] == "A" && fi.items[1] == "B") {
                foundAB = true;
                assert(fi.support == 2);
            } else if (fi.items[0] == "A" && fi.items[1] == "C") {
                foundAC = true;
                assert(fi.support == 2);
            }
        }
    }
    assert(foundAB);
    assert(foundAC);

    // 2. Test Rule Generation
    // Rules from {A, B} support 2, {A, C} support 2
    // Potential rules:
    // A -> B: conf = support(AB)/support(A) = 2/3 = 66.6%
    // B -> A: conf = support(AB)/support(B) = 2/2 = 100%
    // A -> C: conf = support(AC)/support(A) = 2/3 = 66.6%
    // C -> A: conf = support(AC)/support(C) = 2/2 = 100%
    
    // Test with minConfidence = 0.70
    RuleGenerator ruleGen(itemsets, 3, 0.70);
    ruleGen.run();
    const auto& rules = ruleGen.getRules();
    
    // Only B -> A and C -> A should pass (conf = 100% >= 70%)
    // A -> B and A -> C (conf = 66.6% < 70%) are filtered out
    assert(rules.size() == 2);

    bool foundBtoA = false;
    bool foundCtoA = false;
    for (const auto& rule : rules) {
        if (rule.antecedent.size() == 1 && rule.consequent.size() == 1) {
            if (rule.antecedent[0] == "B" && rule.consequent[0] == "A") {
                foundBtoA = true;
                assert(doubleEquals(rule.confidence, 1.0));
                // lift = conf / support(A)_frac = 1.0 / (3/3) = 1.0
                assert(doubleEquals(rule.lift, 1.0));
                // leverage = support(AB)_frac - support(A)_frac * support(B)_frac
                //          = 2/3 - (3/3 * 2/3) = 0
                assert(doubleEquals(rule.leverage, 0.0));
            } else if (rule.antecedent[0] == "C" && rule.consequent[0] == "A") {
                foundCtoA = true;
                assert(doubleEquals(rule.confidence, 1.0));
                assert(doubleEquals(rule.lift, 1.0));
                assert(doubleEquals(rule.leverage, 0.0));
            }
        }
    }
    assert(foundBtoA);
    assert(foundCtoA);

    std::cout << "  -> FrequentItemset and AssociationRule tests passed!" << std::endl;
}

void run_mining_edge_cases() {
    std::cout << "Running Edge Case tests..." << std::endl;

    // 1. Single Transaction
    {
        TransactionDatabase db;
        db.addTransaction(Transaction(1, {"A", "B"}));
        db.buildFrequencyTable();
        db.sortByFrequency();

        PPCTree tree;
        tree.buildTree(db, 1);
        TreeTraversal::assignNumbers(tree);

        auto nodeSets = NodeSetGenerator::generateNodeSets(tree);
        std::vector<std::string> freq = {"A", "B"};
        
        FrequentItemsetGenerator gen(nodeSets, freq, 1, 1);
        gen.run();
        assert(gen.getFrequentItemsets().size() == 3); // A (1), B (1), AB (1)

        RuleGenerator ruleGen(gen.getFrequentItemsets(), 1, 0.50);
        ruleGen.run();
        // Rules: A -> B (conf 100%), B -> A (conf 100%)
        assert(ruleGen.getRules().size() == 2);
    }

    // 2. Large Dataset (500 identical transactions)
    {
        TransactionDatabase db;
        for (int i = 0; i < 500; ++i) {
            db.addTransaction(Transaction(i + 1, {"A", "B", "C"}));
        }
        db.buildFrequencyTable();
        db.sortByFrequency();

        PPCTree tree;
        tree.buildTree(db, 100);
        TreeTraversal::assignNumbers(tree);

        auto nodeSets = NodeSetGenerator::generateNodeSets(tree);
        std::vector<std::string> freq = {"A", "B", "C"};

        FrequentItemsetGenerator gen(nodeSets, freq, 100, 500);
        gen.run();
        
        // Frequent itemsets: A, B, C, AB, AC, BC, ABC => total 7 itemsets
        assert(gen.getFrequentItemsets().size() == 7);

        RuleGenerator ruleGen(gen.getFrequentItemsets(), 500, 0.90);
        ruleGen.run();
        // Since all transactions are identical, confidence of all generated rules is 100%
        // Antecedents and consequents of combinations:
        // A->B, B->A, A->C, C->A, B->C, C->B
        // AB->C, AC->B, BC->A, A->BC, B->AC, C->AB
        // total proper subsets for 2-itemsets: 3 * 2 = 6 rules
        // for 3-itemsets (ABC):proper subsets size 2^3 - 2 = 6 rules.
        // total rules = 12 rules.
        assert(ruleGen.getRules().size() == 12);
    }

    std::cout << "  -> Edge Case tests passed!" << std::endl;
}
