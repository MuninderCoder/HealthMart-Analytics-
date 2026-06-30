#include "../include/FileParser.h"
#include <iostream>
#include <fstream>
#include <cassert>

void run_parser_tests() {
    std::cout << "Running FileParser tests..." << std::endl;

    // Create temporary CSV file
    {
        std::ofstream csv("test_temp.csv");
        csv << "Fever, Cough, Headache\n";
        csv << "Fever, Cough\n";
        csv << "Headache\n";
        csv.close();

        TransactionDatabase db = FileParser::parseCSV("test_temp.csv");
        assert(db.size() == 3);
        assert(db.getTransactions()[0].items.size() == 3);
        assert(db.getTransactions()[1].items.size() == 2);
        assert(db.getTransactions()[2].items.size() == 1);
        std::remove("test_temp.csv");
    }

    // Create temporary TXT file
    {
        std::ofstream txt("test_temp.txt");
        txt << "Fever Cough Headache\n";
        txt << "Fever Cough\n";
        txt.close();

        TransactionDatabase db = FileParser::parseTXT("test_temp.txt");
        assert(db.size() == 2);
        assert(db.getTransactions()[0].items.size() == 3);
        assert(db.getTransactions()[1].items.size() == 2);
        std::remove("test_temp.txt");
    }

    // Create temporary JSON file
    {
        std::ofstream json("test_temp.json");
        json << "[[\"Fever\", \"Cough\", \"Headache\"], [\"Fever\", \"Cough\"], [\"Headache\"]]\n";
        json.close();

        TransactionDatabase db = FileParser::parseJSON("test_temp.json");
        assert(db.size() == 3);
        assert(db.getTransactions()[0].items.size() == 3);
        assert(db.getTransactions()[1].items.size() == 2);
        assert(db.getTransactions()[2].items.size() == 1);
        assert(db.getTransactions()[0].items[0] == "Fever");
        assert(db.getTransactions()[0].items[1] == "Cough");
        assert(db.getTransactions()[0].items[2] == "Headache");
        std::remove("test_temp.json");
    }

    std::cout << "  -> FileParser tests passed!" << std::endl;
}
