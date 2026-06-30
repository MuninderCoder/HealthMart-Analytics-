#include "../include/PPCTree.h"
#include <iostream>
#include <cassert>

void run_tree_tests() {
    std::cout << "Running PPCTree tests..." << std::endl;

    TransactionDatabase db;
    db.addTransaction(Transaction(1, {"A", "B", "C"}));
    db.addTransaction(Transaction(2, {"A", "B"}));
    db.buildFrequencyTable();
    db.sortByFrequency();

    PPCTree tree;
    tree.buildTree(db, 2); // MinSupport=2

    // Frequent items are A (freq 2) and B (freq 2). C is pruned.
    // T1 filtered & sorted: {A, B}
    // T2 filtered & sorted: {A, B}
    // Tree path: root -> A (count 2) -> B (count 2)
    // Total nodes: root, A, B = 3 nodes
    assert(tree.getNodeCount() == 3);
    assert(tree.getDepth() == 3); // root (depth 0), A (depth 1), B (depth 2) => calculateDepth counts 1 + max child depth = 3.
    
    PPCTreeNode* root = tree.getRoot();
    assert(root != nullptr);
    assert(root->children.size() == 1);
    assert(root->children[0]->item == "A");
    assert(root->children[0]->count == 2);
    assert(root->children[0]->children.size() == 1);
    assert(root->children[0]->children[0]->item == "B");
    assert(root->children[0]->children[0]->count == 2);

    std::cout << "  -> PPCTree tests passed!" << std::endl;
}
