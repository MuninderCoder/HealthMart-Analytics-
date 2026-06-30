#ifndef FREQUENTITEMSET_H
#define FREQUENTITEMSET_H

#include <vector>
#include <string>
#include <iostream>

struct FrequentItemset {
    std::vector<std::string> items;
    int support;

    FrequentItemset() : support(0) {}
    FrequentItemset(const std::vector<std::string>& its, int sup) : items(its), support(sup) {}

    void print() const {
        std::cout << "{";
        for (size_t i = 0; i < items.size(); ++i) {
            if (i > 0) std::cout << ", ";
            std::cout << items[i];
        }
        std::cout << "} | support: " << support << std::endl;
    }
};

#endif
