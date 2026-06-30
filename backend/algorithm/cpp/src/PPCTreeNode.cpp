#include "../include/PPCTreeNode.h"
#include <iostream>

PPCTreeNode::PPCTreeNode(const std::string& itemVal, int countVal, PPCTreeNode* parentNode, int depthVal)
    : item(itemVal), count(countVal), parent(parentNode), preOrder(0), postOrder(0), depth(depthVal) {}

PPCTreeNode* PPCTreeNode::addChild(const std::string& childItem) {
    children.push_back(std::make_unique<PPCTreeNode>(childItem, 1, this, this->depth + 1));
    return children.back().get();
}

PPCTreeNode* PPCTreeNode::findChild(const std::string& childItem) const {
    for (const auto& child : children) {
        if (child->item == childItem) {
            return child.get();
        }
    }
    return nullptr;
}

bool PPCTreeNode::isLeaf() const {
    return children.empty();
}

void PPCTreeNode::print(int indent) const {
    for (int i = 0; i < indent; ++i) {
        std::cout << "  ";
    }
    std::cout << (item.empty() ? "{root}" : item) 
              << " (cnt: " << count 
              << ", pre: " << preOrder 
              << ", post: " << postOrder 
              << ", d: " << depth << ")" << std::endl;
              
    for (const auto& child : children) {
        child->print(indent + 1);
    }
}
