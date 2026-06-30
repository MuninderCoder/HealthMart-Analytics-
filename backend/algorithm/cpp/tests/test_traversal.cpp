#include "../include/PPCTree.h"
#include "../include/TreeTraversal.h"
#include <iostream>
#include <cassert>

void run_traversal_tests() {
    std::cout << "Running TreeTraversal tests..." << std::endl;

    TransactionDatabase db;
    db.addTransaction(Transaction(1, {"A", "B", "C"}));
    db.addTransaction(Transaction(2, {"A", "B"}));
    db.buildFrequencyTable();
    db.sortByFrequency();

    PPCTree tree;
    tree.buildTree(db, 2);
    TreeTraversal::assignNumbers(tree);

    PPCTreeNode* root = tree.getRoot();
    PPCTreeNode* a = root->children[0].get();
    PPCTreeNode* b = a->children[0].get();

    // Verify preorder numbering order: root -> A -> B
    assert(root->preOrder < a->preOrder);
    assert(a->preOrder < b->preOrder);

    // Verify postorder numbering order: B -> A -> root
    assert(b->postOrder < a->postOrder);
    assert(a->postOrder < root->postOrder);

    // Ancestor tests: root is ancestor of A and B; A is ancestor of B
    assert(root->preOrder < a->preOrder && root->postOrder > a->postOrder);
    assert(root->preOrder < b->preOrder && root->postOrder > b->postOrder);
    assert(a->preOrder < b->preOrder && a->postOrder > b->postOrder);
    
    // B is not ancestor of A
    assert(!(b->preOrder < a->preOrder && b->postOrder > a->postOrder));

    std::cout << "  -> TreeTraversal tests passed!" << std::endl;
}
