#include "../include/FileParser.h"
#include <fstream>
#include <sstream>
#include <algorithm>
#include <iostream>
#include <stdexcept>

// Helper to trim whitespace
static std::string trim(const std::string& str) {
    size_t first = str.find_first_not_of(" \t\r\n");
    if (first == std::string::npos) return "";
    size_t last = str.find_last_not_of(" \t\r\n");
    return str.substr(first, (last - first + 1));
}

TransactionDatabase FileParser::parseCSV(const std::string& filepath) {
    TransactionDatabase db;
    std::ifstream infile(filepath);
    if (!infile.is_open()) {
        throw std::runtime_error("Could not open file: " + filepath);
    }

    std::string line;
    int txId = 1;
    while (std::getline(infile, line)) {
        line = trim(line);
        if (line.empty()) continue;

        std::vector<std::string> items;
        std::stringstream ss(line);
        std::string item;
        
        // Support both comma and semicolon
        char delim = (line.find(';') != std::string::npos) ? ';' : ',';
        
        while (std::getline(ss, item, delim)) {
            item = trim(item);
            if (!item.empty()) {
                items.push_back(item);
            }
        }
        
        if (!items.empty()) {
            db.addTransaction(Transaction(txId++, items));
        }
    }
    return db;
}

TransactionDatabase FileParser::parseTXT(const std::string& filepath) {
    TransactionDatabase db;
    std::ifstream infile(filepath);
    if (!infile.is_open()) {
        throw std::runtime_error("Could not open file: " + filepath);
    }

    std::string line;
    int txId = 1;
    while (std::getline(infile, line)) {
        line = trim(line);
        if (line.empty()) continue;

        std::vector<std::string> items;
        std::stringstream ss(line);
        std::string item;
        while (ss >> item) {
            item = trim(item);
            if (!item.empty()) {
                items.push_back(item);
            }
        }
        if (!items.empty()) {
            db.addTransaction(Transaction(txId++, items));
        }
    }
    return db;
}

TransactionDatabase FileParser::parseJSON(const std::string& filepath) {
    TransactionDatabase db;
    std::ifstream infile(filepath);
    if (!infile.is_open()) {
        throw std::runtime_error("Could not open file: " + filepath);
    }

    // Read the whole file into a string
    std::stringstream buffer;
    buffer << infile.rdbuf();
    std::string content = buffer.str();

    int depth = 0;
    bool inString = false;
    bool escaped = false;
    std::string currentItem;
    std::vector<std::string> currentItems;
    int txId = 1;

    for (size_t i = 0; i < content.size(); ++i) {
        char c = content[i];

        if (escaped) {
            currentItem += c;
            escaped = false;
            continue;
        }

        if (c == '\\') {
            if (inString) {
                escaped = true;
            }
            continue;
        }

        if (c == '"') {
            inString = !inString;
            if (!inString) {
                // Just finished reading a string item
                std::string trimmed = trim(currentItem);
                if (!trimmed.empty()) {
                    currentItems.push_back(trimmed);
                }
                currentItem.clear();
            }
            continue;
        }

        if (inString) {
            currentItem += c;
        } else {
            if (c == '[') {
                depth++;
                if (depth == 2) {
                    currentItems.clear();
                }
            } else if (c == ']') {
                if (depth == 2) {
                    if (!currentItems.empty()) {
                        db.addTransaction(Transaction(txId++, currentItems));
                        currentItems.clear();
                    }
                }
                depth--;
            }
        }
    }

    return db;
}

TransactionDatabase FileParser::parseFile(const std::string& filepath) {
    size_t dotPos = filepath.find_last_of('.');
    if (dotPos == std::string::npos) {
        // Default to TXT if no extension
        return parseTXT(filepath);
    }
    
    std::string ext = filepath.substr(dotPos + 1);
    std::transform(ext.begin(), ext.end(), ext.begin(), ::tolower);
    
    if (ext == "csv") {
        return parseCSV(filepath);
    } else if (ext == "json") {
        return parseJSON(filepath);
    } else {
        return parseTXT(filepath);
    }
}
