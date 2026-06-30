#include "../include/PPCTree.h"
#include "../include/TreeTraversal.h"
#include "../include/NodeSetGenerator.h"
#include "../include/DiffNodeSetGenerator.h"
#include "../include/SupportCalculator.h"
#include <iostream>
#include <cassert>

void run_diffnodeset_tests() {
    std::cout << "Running DiffNodeSet tests..." << std::endl;

    TransactionDatabase db;
    // T1: A, B, C
    // T2: A, B
    // T3: A, C
    db.addTransaction(Transaction(1, {"A", "B", "C"}));
    db.addTransaction(Transaction(2, {"A", "B"}));
    db.addTransaction(Transaction(3, {"A", "C"}));
    db.buildFrequencyTable();
    db.sortByFrequency();

    PPCTree tree;
    tree.buildTree(db, 2);
    TreeTraversal::assignNumbers(tree);

    auto nodeSets = NodeSetGenerator::generateNodeSets(tree);
    
    // A support: 3, B support: 2, C support: 2
    assert(nodeSets["A"].support() == 3);
    assert(nodeSets["B"].support() == 2);
    assert(nodeSets["C"].support() == 2);

    // 2-itemsets DiffNodeSets
    std::vector<std::string> freqItems = {"A", "B", "C"};
    auto diffNodeSets = DiffNodeSetGenerator::generateAll2Itemsets(freqItems, nodeSets, 2);

    // DiffNodeSets generated: {A, B} support 2, {A, C} support 2
    // Let's verify
    bool foundAB = false;
    bool foundAC = false;
    for (const auto& dns : diffNodeSets) {
        std::string s = dns.getItemsetString();
        if (s == "A,B") {
            foundAB = true;
            assert(dns.getSupport() == 2);
            assert(SupportCalculator::calculateSupport(nodeSets["A"].support(), dns) == 2);
        } else if (s == "A,C") {
            foundAC = true;
            assert(dns.getSupport() == 2);
            assert(SupportCalculator::calculateSupport(nodeSets["A"].support(), dns) == 2);
        }
    }
    assert(foundAB);
    assert(foundAC);

    std::cout << "  -> DiffNodeSet tests passed!" << std::endl;
}

void run_boundary_tests() {
    std::cout << "Running Boundary case tests..." << std::endl;

    // 1. Single transaction
    {
        TransactionDatabase db;
        db.addTransaction(Transaction(1, {"A", "B"}));
        db.buildFrequencyTable();
        db.sortByFrequency();

        PPCTree tree;
        tree.buildTree(db, 1);
        TreeTraversal::assignNumbers(tree);

        auto nodeSets = NodeSetGenerator::generateNodeSets(tree);
        assert(nodeSets["A"].support() == 1);
        assert(nodeSets["B"].support() == 1);

        auto diffNodeSets = DiffNodeSetGenerator::generateAll2Itemsets({"A", "B"}, nodeSets, 1);
        assert(diffNodeSets.size() == 1);
        assert(diffNodeSets[0].getSupport() == 1);
    }

    // 2. Duplicate transactions
    {
        TransactionDatabase db;
        db.addTransaction(Transaction(1, {"A", "B"}));
        db.addTransaction(Transaction(2, {"A", "B"}));
        db.addTransaction(Transaction(3, {"A", "B"}));
        db.buildFrequencyTable();
        db.sortByFrequency();

        PPCTree tree;
        tree.buildTree(db, 2);
        TreeTraversal::assignNumbers(tree);

        auto nodeSets = NodeSetGenerator::generateNodeSets(tree);
        assert(nodeSets["A"].support() == 3);
        assert(nodeSets["B"].support() == 3);

        auto diffNodeSets = DiffNodeSetGenerator::generateAll2Itemsets({"A", "B"}, nodeSets, 2);
        assert(diffNodeSets.size() == 1);
        assert(diffNodeSets[0].getSupport() == 3);
    }

    // 3. Large transaction set
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
        assert(nodeSets["A"].support() == 500);

        auto diffNodeSets = DiffNodeSetGenerator::generateAll2Itemsets({"A", "B", "C"}, nodeSets, 100);
        assert(diffNodeSets.size() == 3); // AB, AC, BC
        for (const auto& dns : diffNodeSets) {
            assert(dns.getSupport() == 500);
        }
    }

    std::cout << "  -> Boundary case tests passed!" << std::endl;
}
