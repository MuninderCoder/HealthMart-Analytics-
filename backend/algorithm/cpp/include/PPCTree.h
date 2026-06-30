#ifndef PPCTREE_H
#define PPCTREE_H

#include <memory>
#include <unordered_map>
#include <vector>
#include "PPCTreeNode.h"
#include "TransactionDatabase.h"

class PPCTree {
private:
    std::unique_ptr<PPCTreeNode> root_;
    std::unordered_map<std::string, std::vector<PPCTreeNode*>> headerTable_;
    int nodeCount_;

public:
    PPCTree();

    void insertTransaction(const std::vector<std::string>& sortedItems);
    void buildTree(const TransactionDatabase& db, int minSupport);

    PPCTreeNode* getRoot() const;
    const std::unordered_map<std::string, std::vector<PPCTreeNode*>>& getHeaderTable() const;
    int getNodeCount() const;
    int getDepth() const;
    
    void print() const;
    
private:
    int calculateDepth(const PPCTreeNode* node) const;
};

#endif
