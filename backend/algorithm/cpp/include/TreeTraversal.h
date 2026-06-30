#ifndef TREETRAVERSAL_H
#define TREETRAVERSAL_H

#include "PPCTree.h"

class TreeTraversal {
public:
    static void assignNumbers(PPCTree& tree);
    static void printTraversal(const PPCTree& tree);

private:
    static void preorderDFS(PPCTreeNode* node, int& preCounter);
    static void postorderDFS(PPCTreeNode* node, int& postCounter);
    static void collectTraversalData(const PPCTreeNode* node, std::vector<const PPCTreeNode*>& result);
};

#endif
