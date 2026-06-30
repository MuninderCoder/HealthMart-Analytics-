#ifndef ASSOCIATIONRULE_H
#define ASSOCIATIONRULE_H

#include <vector>
#include <string>
#include <iostream>

struct AssociationRule {
    std::vector<std::string> antecedent;
    std::vector<std::string> consequent;
    
    int supportCount;
    double support;
    double confidence;
    double lift;
    double leverage;
    double conviction;

    AssociationRule() 
        : supportCount(0), support(0.0), confidence(0.0), lift(0.0), leverage(0.0), conviction(0.0) {}

    void print() const {
        std::cout << "{";
        for (size_t i = 0; i < antecedent.size(); ++i) {
            if (i > 0) std::cout << ", ";
            std::cout << antecedent[i];
        }
        std::cout << "} -> {";
        for (size_t i = 0; i < consequent.size(); ++i) {
            if (i > 0) std::cout << ", ";
            std::cout << consequent[i];
        }
        std::cout << "} | sup: " << support 
                  << ", conf: " << confidence 
                  << ", lift: " << lift 
                  << ", lev: " << leverage 
                  << ", conv: " << conviction << std::endl;
    }
};

#endif
