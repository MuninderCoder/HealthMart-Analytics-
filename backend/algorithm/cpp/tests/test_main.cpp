#include <iostream>

extern void run_parser_tests();
extern void run_database_tests();
extern void run_tree_tests();
extern void run_traversal_tests();
extern void run_nodeset_tests();
extern void run_diffnodeset_tests();
extern void run_boundary_tests();
extern void run_mining_tests();
extern void run_mining_edge_cases();

int main() {
    std::cout << "=== RUNNING C++ MINING ENGINE UNIT TESTS ===" << std::endl;
    
    try {
        run_parser_tests();
        run_database_tests();
        run_tree_tests();
        run_traversal_tests();
        run_nodeset_tests();
        run_diffnodeset_tests();
        run_boundary_tests();
        run_mining_tests();
        run_mining_edge_cases();

        
        std::cout << "\n==========================================" << std::endl;
        std::cout << "🎉 ALL C++ UNIT TESTS PASSED SUCCESSFULLY!" << std::endl;
        std::cout << "==========================================" << std::endl;
        return 0;
    } catch (const std::exception& e) {
        std::cerr << "\n❌ TEST SUITE FAILED: " << e.what() << std::endl;
        return 1;
    }
}
