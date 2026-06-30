#ifndef FILEPARSER_H
#define FILEPARSER_H

#include <string>
#include "TransactionDatabase.h"

class FileParser {
public:
    static TransactionDatabase parseCSV(const std::string& filepath);
    static TransactionDatabase parseTXT(const std::string& filepath);
    static TransactionDatabase parseJSON(const std::string& filepath);
    
    // Auto-detect file format based on extension and parse
    static TransactionDatabase parseFile(const std::string& filepath);
};

#endif
