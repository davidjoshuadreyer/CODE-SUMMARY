#include "lab.hpp"
#include "text_processing.hpp"
#include <fstream>
#include <iostream>
#include <stdexcept>
int lab04::run(int argc,char* argv[]) {
    if(argc!=3) {std::cerr<<"Usage: lab04 input.txt output.txt\n";return 1;}
    std::ifstream input(argv[1]);std::ofstream output(argv[2],std::ios::app);
    if(!input||!output) throw std::runtime_error("Cannot open input or output");
    processText(input,output);return 0;
}
