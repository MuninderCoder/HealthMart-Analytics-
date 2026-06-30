#ifndef PPCTREENODE_H
#define PPCTREENODE_H

#include <string>
#include <vector>
#include <memory>

class PPCTreeNode {
public:
    std::string item;
    int count;
    PPCTreeNode* parent;
    std::vector<std::unique_ptr<PPCTreeNode>> children;
    
    int preOrder;
    int postOrder;
    int depth;

    PPCTreeNode(const std::string& itemVal, int countVal, PPCTreeNode* parentNode, int depthVal);

    PPCTreeNode* addChild(const std::string& childItem);
    PPCTreeNode* findChild(const std::string& childItem) const;
    bool isLeaf() const;
    void print(int indent = 0) const;
};

#endif
