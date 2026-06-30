#include "../include/PPCTree.h"
#include <algorithm>
#include <iostream>

PPCTree::PPCTree() 
    : root_(std::make_unique<PPCTreeNode>("", 0, nullptr, 0)), nodeCount_(1) {}

void PPCTree::insertTransaction(const std::vector<std::string>& sortedItems) {
    PPCTreeNode* curr = root_.get();
    for (const auto& item : sortedItems) {
        PPCTreeNode* child = curr->findChild(item);
        if (child) {
            child->count++;
            curr = child;
        } else {
            PPCTreeNode* newChild = curr->addChild(item);
            nodeCount_++;
            headerTable_[item].push_back(newChild);
            curr = newChild;
        }
    }
}

void PPCTree::buildTree(const TransactionDatabase& db, int minSupport) {
    // Reset tree
    root_ = std::make_unique<PPCTreeNode>("", 0, nullptr, 0);
    headerTable_.clear();
    nodeCount_ = 1;

    // Retrieve transactions
    const auto& txs = db.getTransactions();
    for (const auto& tx : txs) {
        // Filter frequent items
        std::vector<std::string> frequentItems;
        for (const auto& item : tx.items) {
            if (db.getFrequency(item) >= minSupport) {
                frequentItems.push_back(item);
            }
        }
        
        // Sort frequent items by frequency (descending order)
        std::vector<std::string> sortedItems = db.sortItems(frequentItems);
        
        // Insert into PPC Tree
        insertTransaction(sortedItems);
    }
}

PPCTreeNode* PPCTree::getRoot() const {
    return root_.get();
}

const std::unordered_map<std::string, std::vector<PPCTreeNode*>>& PPCTree::getHeaderTable() const {
    return headerTable_;
}

int PPCTree::getNodeCount() const {
    return nodeCount_;
}

int PPCTree::getDepth() const {
    return calculateDepth(root_.get());
}

int PPCTree::calculateDepth(const PPCTreeNode* node) const {
    if (!node) return 0;
    int maxChildDepth = 0;
    for (const auto& child : node->children) {
        maxChildDepth = std::max(maxChildDepth, calculateDepth(child.get()));
    }
    return maxChildDepth + 1;
}

void PPCTree::print() const {
    std::cout << "PPC Tree Structure (Total Nodes: " << nodeCount_ << ", Depth: " << getDepth() << "):" << std::endl;
    root_->print(0);
}
