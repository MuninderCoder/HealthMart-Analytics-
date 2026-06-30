#ifndef DIFFNODESET_H
#define DIFFNODESET_H

#include <vector>
#include <string>
#include <iostream>
#include <numeric>

struct DiffNode {
    int preOrder;
    int postOrder;
    int count;

    DiffNode() : preOrder(0), postOrder(0), count(0) {}
    DiffNode(int pre, int post, int cnt) : preOrder(pre), postOrder(post), count(cnt) {}
};

class DiffNodeSet {
private:
    std::vector<std::string> itemset_;
    std::vector<DiffNode> entries_;
    int support_;

public:
    DiffNodeSet();
    explicit DiffNodeSet(const std::vector<std::string>& itemset, int support = 0);

    void addEntry(int pre, int post, int count);
    void addEntry(const DiffNode& node);

    const std::vector<std::string>& getItemset() const;
    std::string getItemsetString() const;
    const std::vector<DiffNode>& getEntries() const;
    int getSupport() const;
    void setSupport(int sup);
    size_t size() const;
    int diffCount() const;

    void print() const;
};

#endif
