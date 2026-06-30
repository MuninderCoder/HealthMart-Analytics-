#ifndef SUPPORTCALCULATOR_H
#define SUPPORTCALCULATOR_H

#include "DiffNodeSet.h"

class SupportCalculator {
public:
    static int calculateSupport(int parentSupport, const DiffNodeSet& diffNodeSet);
    static bool isFrequent(int support, int minSupport);
};

#endif
