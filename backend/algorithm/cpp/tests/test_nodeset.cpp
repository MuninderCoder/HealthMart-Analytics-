#include "../include/PPCTree.h"
#include "../include/TreeTraversal.h"
#include "../include/NodeSetGenerator.h"
#include <iostream>
#include <cassert>

void run_nodeset_tests() {
    std::cout << "Running NodeSet tests..." << std::endl;

    TransactionDatabase db;
    db.addTransaction(Transaction(1, {"A", "B", "C"}));
    db.addTransaction(Transaction(2, {"A", "B"}));
    db.buildFrequencyTable();
    db.sortByFrequency();

    PPCTree tree;
    tree.buildTree(db, 2);
    TreeTraversal::assignNumbers(tree);

    auto nodeSets = NodeSetGenerator::generateNodeSets(tree);
    
    assert(nodeSets.size() == 2); // A and B are frequent
    assert(nodeSets.find("A") != nodeSets.end());
    assert(nodeSets.find("B") != nodeSets.end());
    assert(nodeSets.find("C") == nodeSets.end()); // C was pruned

    const auto& nsA = nodeSets["A"];
    assert(nsA.support() == 2);
    assert(nsA.size() == 1);

    const auto& nsB = nodeSets["B"];
    assert(nsB.support() == 2);
    assert(nsB.size() == 1);

    std::cout << "  -> NodeSet tests passed!" << std::endl;
}
