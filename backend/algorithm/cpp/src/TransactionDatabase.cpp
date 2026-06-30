#include "../include/TransactionDatabase.h"
#include <algorithm>
#include <iostream>

void TransactionDatabase::addTransaction(const Transaction& tx) {
    transactions_.push_back(tx);
}

void TransactionDatabase::buildFrequencyTable() {
    frequency_.clear();
    for (const auto& tx : transactions_) {
        for (const auto& item : tx.items) {
            frequency_[item]++;
        }
    }
}

void TransactionDatabase::sortByFrequency() {
    sortedItems_.clear();
    for (const auto& pair : frequency_) {
        sortedItems_.push_back(pair);
    }
    
    // Sort descending by frequency, then alphabetically to break ties
    std::sort(sortedItems_.begin(), sortedItems_.end(), 
              [](const std::pair<std::string, int>& a, const std::pair<std::string, int>& b) {
                  if (a.second != b.second) {
                      return a.second > b.second;
                  }
                  return a.first < b.first;
              });
}

std::vector<std::string> TransactionDatabase::getFrequentItems(int minSupport) const {
    std::vector<std::string> frequent;
    // Iterate over sortedItems_ so they remain in frequency-descending order
    for (const auto& pair : sortedItems_) {
        if (pair.second >= minSupport) {
            frequent.push_back(pair.first);
        }
    }
    return frequent;
}

int TransactionDatabase::getFrequency(const std::string& item) const {
    auto it = frequency_.find(item);
    if (it != frequency_.end()) {
        return it->second;
    }
    return 0;
}

const std::vector<Transaction>& TransactionDatabase::getTransactions() const {
    return transactions_;
}

std::vector<std::string> TransactionDatabase::sortItems(const std::vector<std::string>& items) const {
    std::vector<std::string> sorted = items;
    
    std::sort(sorted.begin(), sorted.end(), [this](const std::string& a, const std::string& b) {
        int freqA = this->getFrequency(a);
        int freqB = this->getFrequency(b);
        if (freqA != freqB) {
            return freqA > freqB;
        }
        return a < b;
    });
    
    return sorted;
}

size_t TransactionDatabase::size() const {
    return transactions_.size();
}

void TransactionDatabase::print() const {
    std::cout << "Transaction Database (" << size() << " transactions):" << std::endl;
    for (const auto& tx : transactions_) {
        tx.print();
    }
    std::cout << "Frequencies:" << std::endl;
    for (const auto& pair : sortedItems_) {
        std::cout << "  " << pair.first << ": " << pair.second << std::endl;
    }
}
