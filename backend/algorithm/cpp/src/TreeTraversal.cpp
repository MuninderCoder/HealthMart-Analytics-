#include "../include/TreeTraversal.h"
#include <iostream>

void TreeTraversal::assignNumbers(PPCTree& tree) {
    int preCounter = 1;
    int postCounter = 1;
    preorderDFS(tree.getRoot(), preCounter);
    postorderDFS(tree.getRoot(), postCounter);
}

void TreeTraversal::preorderDFS(PPCTreeNode* node, int& preCounter) {
    if (!node) return;
    node->preOrder = preCounter++;
    for (const auto& child : node->children) {
        preorderDFS(child.get(), preCounter);
    }
}

void TreeTraversal::postorderDFS(PPCTreeNode* node, int& postCounter) {
    if (!node) return;
    for (const auto& child : node->children) {
        postorderDFS(child.get(), postCounter);
    }
    node->postOrder = postCounter++;
}

void TreeTraversal::collectTraversalData(const PPCTreeNode* node, std::vector<const PPCTreeNode*>& result) {
    if (!node) return;
    result.push_back(node);
    for (const auto& child : node->children) {
        collectTraversalData(child.get(), result);
    }
}

void TreeTraversal::printTraversal(const PPCTree& tree) {
    std::vector<const PPCTreeNode*> nodes;
    collectTraversalData(tree.getRoot(), nodes);
    
    std::cout << "\n--- Tree Numbering Traversal Debug ---" << std::endl;
    for (const auto* node : nodes) {
        std::cout << "Node: " << (node->item.empty() ? "{root}" : node->item)
                  << " | Count: " << node->count
                  << " | Preorder: " << node->preOrder
                  << " | Postorder: " << node->postOrder
                  << " | Depth: " << node->depth
                  << " | Parent: " << (node->parent ? (node->parent->item.empty() ? "{root}" : node->parent->item) : "NULL")
                  << std::endl;
    }
    std::cout << "--------------------------------------\n" << std::endl;
}
