#include "../include/SupportCalculator.h"

int SupportCalculator::calculateSupport(int parentSupport, const DiffNodeSet& diffNodeSet) {
    return parentSupport - diffNodeSet.diffCount();
}

bool SupportCalculator::isFrequent(int support, int minSupport) {
    return support >= minSupport;
}
