#ifndef CANDIDATEPAIR_H
#define CANDIDATEPAIR_H

#include <vector>
#include <string>

struct CandidatePair {
    std::vector<std::string> itemset;
    int parentSupport;

    CandidatePair() : parentSupport(0) {}
    CandidatePair(const std::vector<std::string>& items, int parentSup)
        : itemset(items), parentSupport(parentSup) {}
};

#endif
