// Explore a string with dot methods
// Lecture: 1-3_Objects_and_Classes.pdf, pages 4–40
// Try: Type name. on a new line to explore editor suggestions. Try name.empty() or name.at(0).
#include <iostream>
#include <string>
int main() {
    std::string name = "Ada Lovelace";
    std::cout << name << '\n' << name.length() << '\n';
    auto space = name.find(" ");
    if (space != std::string::npos) {
        std::cout << name.substr(0, space) << '\n';
        name.replace(space + 1, name.length() - space - 1, "Byron");
    }
    std::cout << name << '\n';
}
