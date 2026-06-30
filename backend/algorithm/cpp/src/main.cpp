#include <iostream>
#include <string>
#include <cstdlib>
#include "../include/MiningEngine.h"

int main(int argc, char* argv[]) {
    if (argc < 4) {
        std::cerr << "Usage: mining_engine <input_file> <min_support_pct> <min_confidence>" << std::endl;
        std::cerr << "  input_file: path to CSV, TXT, or JSON transaction file" << std::endl;
        std::cerr << "  min_support_pct: minimum support percentage (double, e.g. 0.2)" << std::endl;
        std::cerr << "  min_confidence: minimum confidence (double, e.g. 0.6)" << std::endl;
        return 1;
    }

    std::string inputPath = argv[1];
    double minSupportPct = std::atof(argv[2]);
    double minConfidence = std::atof(argv[3]);

    if (minSupportPct <= 0.0 || minSupportPct > 1.0) {
        std::cerr << "Error: min_support_pct must be in (0, 1]" << std::endl;
        return 1;
    }

    if (minConfidence <= 0.0 || minConfidence > 1.0) {
        std::cerr << "Error: min_confidence must be in (0, 1]" << std::endl;
        return 1;
    }

    try {
        MiningEngine engine;
        std::string jsonResult = engine.run(inputPath, minSupportPct, minConfidence);

        // Output JSON result to stdout for the FastAPI wrapper to capture
        std::cout << jsonResult << std::endl;
        
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "Fatal Error in C++ Mining Engine: " << e.what() << std::endl;
        return 1;
    }
}
