#include "../include/DiffNodeSet.h"
#include <iostream>
#include <sstream>

DiffNodeSet::DiffNodeSet() : support_(0) {}

DiffNodeSet::DiffNodeSet(const std::vector<std::string>& itemset, int support)
    : itemset_(itemset), support_(support) {}

void DiffNodeSet::addEntry(int pre, int post, int count) {
    entries_.push_back(DiffNode(pre, post, count));
}

void DiffNodeSet::addEntry(const DiffNode& node) {
    entries_.push_back(node);
}

const std::vector<std::string>& DiffNodeSet::getItemset() const {
    return itemset_;
}

std::string DiffNodeSet::getItemsetString() const {
    std::stringstream ss;
    for (size_t i = 0; i < itemset_.size(); ++i) {
        if (i > 0) ss << ",";
        ss << itemset_[i];
    }
    return ss.str();
}

const std::vector<DiffNode>& DiffNodeSet::getEntries() const {
    return entries_;
}

int DiffNodeSet::getSupport() const {
    return support_;
}

void DiffNodeSet::setSupport(int sup) {
    support_ = sup;
}

size_t DiffNodeSet::size() const {
    return entries_.size();
}

int DiffNodeSet::diffCount() const {
    int total = 0;
    for (const auto& entry : entries_) {
        total += entry.count;
    }
    return total;
}

void DiffNodeSet::print() const {
    std::cout << "DiffNodeSet{" << getItemsetString() << "} support: " << support_
              << ", diff entries: " << size() << ", diff count: " << diffCount() << std::endl;
    for (const auto& entry : entries_) {
        std::cout << "  [pre: " << entry.preOrder 
                  << ", post: " << entry.postOrder 
                  << ", count: " << entry.count << "]" << std::endl;
    }
}
