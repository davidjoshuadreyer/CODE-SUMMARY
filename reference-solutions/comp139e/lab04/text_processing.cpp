#include "text_processing.hpp"
#include <istream>
#include <ostream>
#include <string>
#include <cctype>
#include <stdexcept>
void lab04::processText(std::istream& input,std::ostream& output) {
    while(input >> std::ws && input.peek()!=std::char_traits<char>::eof()) {
        const int first=input.peek(); // Only this one character classifies the token.
        if(std::isdigit(static_cast<unsigned char>(first)) || first=='+' || first=='-') {
            int number;
            if(!(input>>number)) throw std::runtime_error("Integer outside int range or malformed input");
            output<<"Found an integer: "<<number<<'\n';
        } else {
            std::string word; input>>word;
            output<<"Found a "<<word.size()<<" character word: "<<word<<'\n';
        }
    }
    if(input.bad()||!output) throw std::runtime_error("File I/O failed");
}
