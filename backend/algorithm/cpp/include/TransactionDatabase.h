#ifndef TRANSACTIONDATABASE_H
#define TRANSACTIONDATABASE_H

#include <vector>
#include <string>
#include <unordered_map>
#include "Transaction.h"

class TransactionDatabase {
private:
    std::vector<Transaction> transactions_;
    std::unordered_map<std::string, int> frequency_;
    std::vector<std::pair<std::string, int>> sortedItems_; // Items sorted by frequency

public:
    TransactionDatabase() = default;

    void addTransaction(const Transaction& tx);
    void buildFrequencyTable();
    void sortByFrequency();
    
    std::vector<std::string> getFrequentItems(int minSupport) const;
    int getFrequency(const std::string& item) const;
    const std::vector<Transaction>& getTransactions() const;
    
    // Sorts a list of items based on frequency (descending order).
    // If frequencies are equal, sorts alphabetically.
    std::vector<std::string> sortItems(const std::vector<std::string>& items) const;
    
    size_t size() const;
    void print() const;
};

#endif
