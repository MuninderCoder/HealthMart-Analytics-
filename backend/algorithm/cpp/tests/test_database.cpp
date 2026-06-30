#include "../include/TransactionDatabase.h"
#include <iostream>
#include <cassert>

void run_database_tests() {
    std::cout << "Running TransactionDatabase tests..." << std::endl;

    TransactionDatabase db;
    db.addTransaction(Transaction(1, {"A", "B", "C"}));
    db.addTransaction(Transaction(2, {"A", "B"}));
    db.addTransaction(Transaction(3, {"A"}));

    db.buildFrequencyTable();
    db.sortByFrequency();

    assert(db.size() == 3);
    assert(db.getFrequency("A") == 3);
    assert(db.getFrequency("B") == 2);
    assert(db.getFrequency("C") == 1);
    assert(db.getFrequency("D") == 0);

    std::vector<std::string> frequent = db.getFrequentItems(2);
    assert(frequent.size() == 2);
    assert(frequent[0] == "A");
    assert(frequent[1] == "B");

    // Sorting items according to frequency descending
    std::vector<std::string> items = {"C", "A", "B"};
    std::vector<std::string> sorted = db.sortItems(items);
    assert(sorted.size() == 3);
    assert(sorted[0] == "A");
    assert(sorted[1] == "B");
    assert(sorted[2] == "C");

    std::cout << "  -> TransactionDatabase tests passed!" << std::endl;
}
