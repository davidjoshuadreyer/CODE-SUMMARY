// Write, append, and total a text file
// Lecture: 1-4_Files_and_Exception_Handling.pdf, pages 3–16
// Try: Append another number. Then append a word to see the non-numeric-data error.
#include <fstream>
#include <iostream>
int main() {
    {
        std::ofstream output("scores.txt");
        if (!output) return 1;
        output << "10 20\n";
        output.close();
        if (!output) return 1;
    }
    {
        std::ofstream output("scores.txt", std::ios::app);
        if (!output) return 1;
        output << "30\n";
        output.close();
        if (!output) return 1;
    }
    std::ifstream input("scores.txt");
    if (!input) return 1;
    int value = 0, total = 0;
    while (input >> value) total += value;
    if (input.bad() || !input.eof()) {
        std::cout << "Read error or non-numeric data.\n";
        return 1;
    }
    std::cout << "Total: " << total << "\nEOF: " << input.eof() << '\n';
}
