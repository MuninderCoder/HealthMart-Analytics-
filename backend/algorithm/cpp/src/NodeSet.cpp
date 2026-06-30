#include "../include/NodeSet.h"
#include <iostream>
#include <numeric>

NodeSet::NodeSet(const std::string& item) : item_(item) {}

void NodeSet::addEntry(int pre, int post, int count) {
    entries_.push_back(NodeSetEntry(pre, post, count));
}

void NodeSet::addEntry(const NodeSetEntry& entry) {
    entries_.push_back(entry);
}

const std::string& NodeSet::getItem() const {
    return item_;
}

const std::vector<NodeSetEntry>& NodeSet::getEntries() const {
    return entries_;
}

int NodeSet::support() const {
    int total = 0;
    for (const auto& entry : entries_) {
        total += entry.count;
    }
    return total;
}

size_t NodeSet::size() const {
    return entries_.size();
}

void NodeSet::print() const {
    std::cout << "NodeSet(" << item_ << ") support: " << support() 
              << ", entries count: " << size() << std::endl;
    for (const auto& entry : entries_) {
        std::cout << "  [pre: " << entry.preOrder 
                  << ", post: " << entry.postOrder 
                  << ", count: " << entry.count << "]" << std::endl;
    }
}
