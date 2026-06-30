#ifndef TRANSACTION_H
#define TRANSACTION_H

#include <vector>
#include <string>
#include <iostream>

struct Transaction {
    int id;
    std::vector<std::string> items;

    Transaction() : id(0) {}
    Transaction(int id, const std::vector<std::string>& items) : id(id), items(items) {}

    void print() const {
        std::cout << "T" << id << ": {";
        for (size_t i = 0; i < items.size(); ++i) {
            if (i > 0) std::cout << ", ";
            std::cout << items[i];
        }
        std::cout << "}" << std::endl;
    }
};

#endif
