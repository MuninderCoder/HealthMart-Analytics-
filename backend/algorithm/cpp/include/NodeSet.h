#ifndef NODESET_H
#define NODESET_H

#include <string>
#include <vector>

struct NodeSetEntry {
    int preOrder;
    int postOrder;
    int count;

    NodeSetEntry() : preOrder(0), postOrder(0), count(0) {}
    NodeSetEntry(int pre, int post, int cnt) : preOrder(pre), postOrder(post), count(cnt) {}
};

class NodeSet {
private:
    std::string item_;
    std::vector<NodeSetEntry> entries_;

public:
    NodeSet() = default;
    explicit NodeSet(const std::string& item);

    void addEntry(int pre, int post, int count);
    void addEntry(const NodeSetEntry& entry);

    const std::string& getItem() const;
    const std::vector<NodeSetEntry>& getEntries() const;
    
    int support() const;
    size_t size() const;
    void print() const;
};

#endif
